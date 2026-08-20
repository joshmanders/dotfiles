import { EventEmitter } from "node:events";
import { readSync, truncateSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { spawn as ptySpawn } from "node-pty";
import type { IPty } from "node-pty";
import { resolveCommand, type CommandConfig } from "./config.js";
import { TerminalEmulator, type StyledLine } from "./terminal.js";

// node-pty wraps the master fd in tty.ReadStream, which Bun's runtime fails
// to read from (EAGAIN → close, no 'data' events ever fire). Workaround:
// nuke the wrapper and poll the raw fd ourselves. The pty itself is fine —
// only the JS-side reader is broken.
interface PtyInternal extends IPty {
  _socket?: { removeAllListeners?: () => void; unref?: () => void };
  _fd?: number;
  // node-pty's Terminal.on delegates to _socket, so this is how the real
  // (code, signal) pair from the native waitpid callback is reached.
  on?: (event: "exit", cb: (code: number, signal?: number) => void) => void;
}

const POLL_INTERVAL_MS = 15;
const READ_BUF_SIZE = 16384;
// Reads per poll tick. A single 16KB read per tick throttles a noisy child to
// ~1MB/s and drops the tail of a burst when the fd closes; draining until
// EAGAIN keeps up without letting one process starve the event loop.
const MAX_READS_PER_TICK = 16;
export const MAX_LINES = 5000;
// node-pty defers its exit event behind a 200ms socket-destroy timer, and
// destroying the socket is what closes our fd. If a poll error beats the exit
// event, wait this long for the real status before finalizing without one.
const EXIT_GRACE_MS = 500;

const DEFAULTS = {
  // One renderer frame. The CLI renderer is created with targetFps: 30, so
  // flushing faster than this only buys React reconciliation passes whose
  // output is thrown away before it reaches the screen.
  flushIntervalMs: 33,
  restartBaseMs: 300,
  restartMaxMs: 30_000,
  restartMaxAttempts: 8,
  restartHealthyMs: 10_000,
};

export interface ProcessManagerOptions {
  // Minimum gap between "change" emissions. Output arrives far faster than
  // any terminal can draw it, so emissions coalesce to roughly one frame.
  flushIntervalMs?: number;
  // First auto-restart delay. Doubles with each consecutive attempt.
  restartBaseMs?: number;
  // Ceiling for the doubling delay.
  restartMaxMs?: number;
  // Consecutive auto-restarts before the process is left failed.
  restartMaxAttempts?: number;
  // Uptime that marks a run healthy, resetting the restart budget.
  restartHealthyMs?: number;
}

// node-pty's default kill sends SIGHUP to the shell's PID. With `bash -lc cmd`,
// signals don't always propagate to the actual command (npm, php, node, etc.) —
// the shell catches/ignores SIGHUP, or the child runs in its own session.
// node-pty puts the child in a new session via setsid, so the pty pid is the
// process-group leader. Sending SIGTERM to -pid hits every process in the
// group, which is what you want when the user hits "stop" or "restart".
function killTree(pty: IPty): void {
  const pid = pty.pid;
  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      pty.kill();
    } catch {}
  }
  // Escalate to SIGKILL if anything is still alive after 2s.
  setTimeout(() => {
    try {
      process.kill(-pid, 0);
      process.kill(-pid, "SIGKILL");
    } catch {
      // ESRCH — group already gone.
    }
  }, 2000);
}

export type ProcStatus = "idle" | "running" | "exited" | "failed";

export interface ProcSnapshot {
  name: string;
  status: ProcStatus;
  pid?: number;
  exitCode?: number;
  startedAt?: number;
  // Visible tail, recomputed from the emulator each flush. Read it, don't
  // mutate it, and don't use its identity to detect change — a redraw can
  // rewrite the region in place, so the array is rebuilt rather than appended
  // to. `revision` is what moves when this process's state or output changes.
  lines: StyledLine[];
  restarts: number;
  spawnError?: string;
  revision: number;
}

interface ProcEntry {
  cfg: CommandConfig;
  pty?: IPty;
  status: ProcStatus;
  pid?: number;
  exitCode?: number;
  startedAt?: number;
  lines: StyledLine[];
  emulator: TerminalEmulator;
  restarts: number;
  manualStop: boolean;
  spawnError?: string;
  pollTimer?: ReturnType<typeof setInterval>;
  // Real exit status from node-pty's native callback, pending finalization.
  pendingExit?: { code: number; signal?: number };
  exitTimer?: ReturnType<typeof setTimeout>;
  restartTimer?: ReturnType<typeof setTimeout>;
  // Consecutive auto-restarts, reset by a healthy run or a manual start.
  restartAttempts: number;
  revision: number;
  snap?: ProcSnapshot;
  // One-shot callback fired after the next exit finalizes (used by restart).
  onNextExit?: () => void;
}

export class ProcessManager extends EventEmitter {
  private procs = new Map<string, ProcEntry>();
  private baseDir: string;
  private opts: Required<ProcessManagerOptions>;
  private snapArray?: ProcSnapshot[];
  private flushTimer?: ReturnType<typeof setTimeout>;
  private flushPending = false;

  constructor(baseDir: string, options: ProcessManagerOptions = {}) {
    super();
    this.baseDir = baseDir;
    this.opts = { ...DEFAULTS, ...options };
  }

  register(cfg: CommandConfig): void {
    const existing = this.procs.get(cfg.name);
    if (existing) {
      existing.cfg = cfg;
      this.invalidate(existing);
      this.emitChange();
      return;
    }
    this.procs.set(cfg.name, {
      cfg,
      status: "idle",
      lines: [],
      emulator: new TerminalEmulator(120, 30, MAX_LINES),
      restarts: 0,
      manualStop: false,
      restartAttempts: 0,
      revision: 0,
    });
    this.invalidate();
    this.emitChange();
  }

  unregister(name: string): void {
    const entry = this.procs.get(name);
    if (!entry) return;
    this.cancelRestart(entry);
    if (entry.pty) {
      entry.manualStop = true;
      killTree(entry.pty);
    }
    this.procs.delete(name);
    this.invalidate();
    this.emitChange();
  }

  start(name: string): void {
    const entry = this.procs.get(name);
    if (!entry) return;
    // An explicit start is the user taking over — clear any crash-loop budget
    // and any restart that was still waiting out its backoff.
    this.cancelRestart(entry);
    entry.restartAttempts = 0;
    this.spawn(entry, name);
  }

  private spawn(entry: ProcEntry, name: string): void {
    if (entry.pty) return;
    const { cfg } = entry;
    const cwd = cfg.cwd
      ? cfg.cwd.startsWith("/")
        ? cfg.cwd
        : `${this.baseDir}/${cfg.cwd}`
      : this.baseDir;
    const env = { ...process.env, ...(cfg.env ?? {}) };
    const shell = process.env.SHELL || "/bin/bash";
    const cmd = resolveCommand(cfg);
    let pty: IPty;
    try {
      pty = ptySpawn(shell, ["-lc", cmd], {
        name: "xterm-256color",
        cols: 120,
        rows: 30,
        cwd,
        env: env as { [k: string]: string },
      });
    } catch (err) {
      entry.status = "failed";
      entry.spawnError = (err as Error).message;
      this.invalidate(entry);
      this.emitChange();
      return;
    }
    entry.pty = pty;
    entry.pid = pty.pid;
    entry.status = "running";
    entry.startedAt = Date.now();
    entry.manualStop = false;
    entry.spawnError = undefined;
    entry.pendingExit = undefined;

    // node-pty's tty.ReadStream wrapper around the master fd doesn't work
    // under Bun (read returns EAGAIN, the stream gives up, no 'data' events
    // ever fire). Workaround: detach the wrapper and poll the raw fd.
    const ptyInternal = pty as PtyInternal;
    try {
      ptyInternal._socket?.removeAllListeners?.();
      ptyInternal._socket?.unref?.();
    } catch {}

    // Detaching the wrapper also drops node-pty's own 'exit' forwarder, which
    // is why `pty.onExit` never fires. The native waitpid callback still
    // delivers the real (code, signal) — re-attach a listener and take it.
    try {
      ptyInternal.on?.("exit", (code: number, signal?: number) => {
        if (entry.pty !== pty) return;
        entry.pendingExit = { code, signal };
        this.finalizeExit(entry, name);
      });
    } catch {}

    const fd = ptyInternal._fd;
    if (typeof fd === "number") {
      const buf = Buffer.alloc(READ_BUF_SIZE);
      entry.pollTimer = setInterval(() => {
        let chunk = "";
        for (let i = 0; i < MAX_READS_PER_TICK; i++) {
          let n: number;
          try {
            n = readSync(fd, buf, 0, buf.length, null);
          } catch (err) {
            const code = (err as NodeJS.ErrnoException).code;
            // EAGAIN — nothing more this tick. Anything else means the fd is
            // gone, which means the process is gone.
            if (code !== "EAGAIN") this.handleFdLoss(entry, name);
            break;
          }
          if (n <= 0) break;
          chunk += buf.toString("utf8", 0, n);
        }
        if (chunk.length > 0) this.appendOutput(entry, chunk);
      }, POLL_INTERVAL_MS);
    }

    this.invalidate(entry);
    this.emitChange();
  }

  // The fd died before node-pty reported a status. It destroys the socket
  // (closing our fd) immediately before emitting the exit event, so the real
  // status is usually already in flight — hold briefly for it rather than
  // finalizing with an unknown code.
  private handleFdLoss(entry: ProcEntry, name: string): void {
    this.stopPolling(entry);
    if (entry.exitTimer) return;
    entry.exitTimer = setTimeout(
      () => this.finalizeExit(entry, name),
      EXIT_GRACE_MS,
    );
  }

  private stopPolling(entry: ProcEntry): void {
    if (!entry.pollTimer) return;
    clearInterval(entry.pollTimer);
    entry.pollTimer = undefined;
  }

  // Cleans up a dead process, records its exit status, and routes to either an
  // explicit one-shot callback (restart), an auto-restart per the config
  // policy, or just leaves it stopped.
  private finalizeExit(entry: ProcEntry, name: string): void {
    if (entry.exitTimer) {
      clearTimeout(entry.exitTimer);
      entry.exitTimer = undefined;
    }
    if (!entry.pty) return;
    this.stopPolling(entry);
    entry.pty = undefined;
    entry.pid = undefined;
    const wasManual = entry.manualStop;
    entry.manualStop = false;
    const info = entry.pendingExit;
    entry.pendingExit = undefined;

    // A signal death reports exitCode 0, so encode it shell-style to keep
    // "non-zero means failure" true. The signal we sent to stop the process
    // ourselves is a clean stop, not a failure. No status at all (node-pty
    // never reported one) stays undefined and renders as unknown.
    if (info) {
      entry.exitCode = info.signal
        ? wasManual
          ? 0
          : 128 + info.signal
        : info.code;
    } else {
      entry.exitCode = wasManual ? 0 : undefined;
    }
    entry.status = wasManual || entry.exitCode === 0 ? "exited" : "failed";
    this.invalidate(entry);
    this.emitChange();

    if (entry.onNextExit) {
      const cb = entry.onNextExit;
      entry.onNextExit = undefined;
      cb();
      return;
    }

    if (wasManual) return;
    const policy = entry.cfg.restart ?? "never";
    const shouldRestart =
      policy === "always" ||
      (policy === "on-fail" && entry.status === "failed");
    if (shouldRestart) this.scheduleRestart(entry, name);
  }

  // Exponential backoff with a hard attempt cap. Without both, a command that
  // exits immediately respawns a login shell several times a second forever.
  private scheduleRestart(entry: ProcEntry, name: string): void {
    // A run that stayed up long enough is evidence the command works; the cap
    // exists for crash loops, not for one death after hours of clean running.
    const ranFor = entry.startedAt ? Date.now() - entry.startedAt : 0;
    if (ranFor >= this.opts.restartHealthyMs) entry.restartAttempts = 0;

    if (entry.restartAttempts >= this.opts.restartMaxAttempts) {
      entry.status = "failed";
      this.note(
        entry,
        `solo: giving up after ${entry.restartAttempts} restart attempts`,
      );
      this.invalidate(entry);
      this.emitChange();
      return;
    }

    const delay = Math.min(
      this.opts.restartMaxMs,
      this.opts.restartBaseMs * 2 ** entry.restartAttempts,
    );
    entry.restartAttempts++;
    entry.restarts++;
    this.note(
      entry,
      `solo: restarting in ${(delay / 1000).toFixed(1)}s (attempt ${entry.restartAttempts}/${this.opts.restartMaxAttempts})`,
    );
    this.invalidate(entry);
    this.emitChange();
    entry.restartTimer = setTimeout(() => {
      entry.restartTimer = undefined;
      this.spawn(entry, name);
    }, delay);
  }

  private cancelRestart(entry: ProcEntry): boolean {
    if (!entry.restartTimer) return false;
    clearTimeout(entry.restartTimer);
    entry.restartTimer = undefined;
    return true;
  }

  stop(name: string): void {
    const entry = this.procs.get(name);
    if (!entry) return;
    const wasWaiting = this.cancelRestart(entry);
    if (!entry.pty) {
      // Stopping during a backoff window means the user doesn't want it back.
      if (wasWaiting) {
        entry.status = "exited";
        this.invalidate(entry);
        this.emitChange();
      }
      return;
    }
    entry.manualStop = true;
    killTree(entry.pty);
  }

  restart(name: string): void {
    const entry = this.procs.get(name);
    if (!entry) return;
    this.cancelRestart(entry);
    entry.restartAttempts = 0;
    // Wipe scrollback immediately so the user sees a fresh buffer instead of
    // old output mixed with new on the next run.
    this.resetBuffer(entry);
    if (!entry.pty) {
      this.spawn(entry, name);
      return;
    }
    entry.manualStop = true;
    entry.onNextExit = () => this.spawn(entry, name);
    killTree(entry.pty);
  }

  writeStdin(name: string, data: string): void {
    const entry = this.procs.get(name);
    if (!entry?.pty) return;
    entry.pty.write(data);
  }

  resize(name: string, cols: number, rows: number): void {
    const entry = this.procs.get(name);
    if (!entry?.pty) return;
    try {
      entry.pty.resize(cols, rows);
      // Match the emulator's grid to the pty so wrapping and redraws line up.
      entry.emulator.resize(cols, rows);
      entry.lines = entry.emulator.renderTail(MAX_LINES);
      this.invalidate(entry);
      this.scheduleChange();
    } catch {}
  }

  clear(name: string): void {
    const entry = this.procs.get(name);
    if (!entry) return;
    // For tail-typed processes, "clear" means clear the log file itself —
    // truncating it lets `tail -f` keep its fd and show fresh output. The
    // buffer is also cleared.
    if (entry.cfg.tail) {
      const target = this.resolveTailPath(entry.cfg);
      try {
        truncateSync(target, 0);
      } catch {
        // File may not exist (with retry) or be unreadable; the buffer wipe
        // still gives the user a fresh view.
      }
    }
    this.resetBuffer(entry);
    this.invalidate(entry);
    this.emitChange();
  }

  // Snapshots are cached per entry and per manager. Nothing changed means the
  // same array and the same objects come back, so subscribers can bail out
  // without diffing — and the buffers are handed over by reference instead of
  // being copied on every chunk of output.
  snapshot(): ProcSnapshot[] {
    if (this.snapArray) return this.snapArray;
    const out: ProcSnapshot[] = [];
    for (const entry of this.procs.values())
      out.push(this.entrySnapshot(entry));
    this.snapArray = out;
    return out;
  }

  get(name: string): ProcSnapshot | undefined {
    const entry = this.procs.get(name);
    return entry ? this.entrySnapshot(entry) : undefined;
  }

  runningCount(): number {
    let n = 0;
    for (const entry of this.procs.values()) {
      if (entry.status === "running") n++;
    }
    return n;
  }

  shutdown(): Promise<void> {
    for (const entry of this.procs.values()) this.cancelRestart(entry);
    const live = Array.from(this.procs.values()).filter((e) => e.pty);
    if (live.length === 0) return Promise.resolve();
    return new Promise((resolve) => {
      let remaining = live.length;
      const done = () => {
        if (--remaining <= 0) resolve();
      };
      for (const entry of live) {
        entry.manualStop = true;
        entry.onNextExit = done;
        killTree(entry.pty!);
      }
      // Backstop in case finalizeExit doesn't fire for one of them.
      setTimeout(resolve, 2000);
    });
  }

  private entrySnapshot(entry: ProcEntry): ProcSnapshot {
    if (entry.snap) return entry.snap;
    entry.snap = {
      name: entry.cfg.name,
      status: entry.status,
      pid: entry.pid,
      exitCode: entry.exitCode,
      startedAt: entry.startedAt,
      lines: entry.lines,
      restarts: entry.restarts,
      spawnError: entry.spawnError,
      revision: entry.revision,
    };
    return entry.snap;
  }

  private invalidate(entry?: ProcEntry): void {
    if (entry) {
      entry.revision++;
      entry.snap = undefined;
    }
    this.snapArray = undefined;
  }

  // Lifecycle transitions are rare and worth showing right away, so they skip
  // the coalescing window and cancel any flush already queued behind them.
  private emitChange(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }
    this.flushPending = false;
    this.emit("change");
  }

  // Output arrives faster than any terminal can draw it. Emit on the leading
  // edge, then at most once per window — the trailing emit guarantees the last
  // chunk of a burst still reaches subscribers.
  private scheduleChange(): void {
    if (this.flushTimer) {
      this.flushPending = true;
      return;
    }
    this.emit("change");
    this.flushTimer = setTimeout(() => {
      this.flushTimer = undefined;
      if (!this.flushPending) return;
      this.flushPending = false;
      this.scheduleChange();
    }, this.opts.flushIntervalMs);
  }

  // Resolve a tail target's absolute path, mirroring how `spawn` resolves the
  // process cwd: absolute paths win; relative paths resolve against the
  // entry's cwd, which itself resolves against the manager's baseDir.
  private resolveTailPath(cfg: CommandConfig): string {
    const file = cfg.tail!.file;
    if (isAbsolute(file)) return file;
    const cwd = cfg.cwd
      ? isAbsolute(cfg.cwd)
        ? cfg.cwd
        : join(this.baseDir, cfg.cwd)
      : this.baseDir;
    return join(cwd, file);
  }

  private resetBuffer(entry: ProcEntry): void {
    entry.emulator.reset();
    entry.lines = [];
  }

  // Surface a manager-level message in the process's own scrollback — that's
  // where the user is already looking when a command misbehaves. It's written
  // into the emulator rather than spliced into `entry.lines`, because that
  // array is recomputed from the emulator on the next flush and would wipe a
  // line inserted straight into it. Dim truecolor #FFAA00 matches the old
  // note color, on its own line.
  private note(entry: ProcEntry, text: string): void {
    entry.emulator.write(`\r\n\x1b[2;38;2;255;170;0m${text}\x1b[0m\r\n`);
    entry.lines = entry.emulator.renderTail(MAX_LINES);
  }

  private appendOutput(entry: ProcEntry, data: string): void {
    // Feed the emulator, then re-read the visible tail: a redraw can rewrite
    // the region in place, so the tail is rebuilt every flush rather than
    // appended to. The emulator's scrollback cap bounds this to MAX_LINES.
    entry.emulator.write(data);
    entry.lines = entry.emulator.renderTail(MAX_LINES);
    this.invalidate(entry);
    this.scheduleChange();
  }
}
