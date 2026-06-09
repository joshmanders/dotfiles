import { EventEmitter } from "node:events";
import { readSync, truncateSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { spawn as ptySpawn } from "node-pty";
import type { IPty } from "node-pty";
import { resolveCommand, type CommandConfig } from "./config.js";
import { AnsiStream, type StyledLine } from "./ansi.js";

// node-pty wraps the master fd in tty.ReadStream, which Bun's runtime fails
// to read from (EAGAIN → close, no 'data' events ever fire). Workaround:
// nuke the wrapper and poll the raw fd ourselves. The pty itself is fine —
// only the JS-side reader is broken.
interface PtyInternal extends IPty {
  _socket?: { removeAllListeners?: () => void; unref?: () => void };
  _fd?: number;
}

const POLL_INTERVAL_MS = 15;
const READ_BUF_SIZE = 16384;
const MAX_LINES = 5000;

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
  lines: StyledLine[];
  restarts: number;
  spawnError?: string;
}

interface ProcEntry {
  cfg: CommandConfig;
  pty?: IPty;
  status: ProcStatus;
  pid?: number;
  exitCode?: number;
  startedAt?: number;
  lines: StyledLine[];
  parser: AnsiStream;
  restarts: number;
  manualStop: boolean;
  spawnError?: string;
  pollTimer?: ReturnType<typeof setInterval>;
  // One-shot callback fired after the next exit finalizes (used by restart).
  onNextExit?: () => void;
}

export class ProcessManager extends EventEmitter {
  private procs = new Map<string, ProcEntry>();
  private baseDir: string;

  constructor(baseDir: string) {
    super();
    this.baseDir = baseDir;
  }

  register(cfg: CommandConfig): void {
    if (this.procs.has(cfg.name)) {
      this.procs.get(cfg.name)!.cfg = cfg;
      this.emit("change");
      return;
    }
    this.procs.set(cfg.name, {
      cfg,
      status: "idle",
      lines: [],
      parser: new AnsiStream(),
      restarts: 0,
      manualStop: false,
    });
    this.emit("change");
  }

  unregister(name: string): void {
    const entry = this.procs.get(name);
    if (!entry) return;
    if (entry.pty) {
      entry.manualStop = true;
      killTree(entry.pty);
    }
    this.procs.delete(name);
    this.emit("change");
  }

  start(name: string): void {
    const entry = this.procs.get(name);
    if (!entry || entry.pty) return;
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
      this.emit("change");
      return;
    }
    entry.pty = pty;
    entry.pid = pty.pid;
    entry.status = "running";
    entry.startedAt = Date.now();
    entry.manualStop = false;
    entry.spawnError = undefined;

    // node-pty's tty.ReadStream wrapper around the master fd doesn't work
    // under Bun (read returns EAGAIN, the stream gives up, no 'data' events
    // ever fire). Workaround: detach the wrapper and poll the raw fd. Side
    // effect — the broken wrapper is also what fires `pty.onExit`, so we
    // detect process death from polling errors (EBADF/EIO) instead.
    const ptyInternal = pty as PtyInternal;
    try {
      ptyInternal._socket?.removeAllListeners?.();
      ptyInternal._socket?.unref?.();
    } catch {}
    const fd = ptyInternal._fd;
    if (typeof fd === "number") {
      const buf = Buffer.alloc(READ_BUF_SIZE);
      entry.pollTimer = setInterval(() => {
        try {
          const n = readSync(fd, buf, 0, buf.length, null);
          if (n > 0) this.appendOutput(entry, buf.toString("utf8", 0, n));
        } catch (err) {
          const code = (err as NodeJS.ErrnoException).code;
          // EAGAIN — no data this tick. Anything else means the fd is gone,
          // which means the process is gone.
          if (code !== "EAGAIN") this.finalizeExit(entry, name);
        }
      }, POLL_INTERVAL_MS);
    }

    this.emit("change");
  }

  // Triggered when polling detects the pty fd is dead. Cleans up the entry,
  // emits state, and routes to either an explicit one-shot callback (restart),
  // an auto-restart per the config policy, or just leaves it stopped.
  private finalizeExit(entry: ProcEntry, name: string): void {
    if (!entry.pty) return;
    if (entry.pollTimer) {
      clearInterval(entry.pollTimer);
      entry.pollTimer = undefined;
    }
    entry.pty = undefined;
    entry.pid = undefined;
    const wasManual = entry.manualStop;
    entry.manualStop = false;
    // We can't read the real exit code from a dead fd, so infer: manual stop
    // counts as clean, anything else is treated as failure.
    entry.exitCode = wasManual ? 0 : 1;
    entry.status = wasManual ? "exited" : "failed";
    this.emit("change");

    if (entry.onNextExit) {
      const cb = entry.onNextExit;
      entry.onNextExit = undefined;
      cb();
      return;
    }

    if (wasManual) return;
    const policy = entry.cfg.restart ?? "never";
    const shouldRestart =
      policy === "always" || (policy === "on-fail" && entry.exitCode !== 0);
    if (shouldRestart) {
      entry.restarts++;
      setTimeout(() => this.start(name), 300);
    }
  }

  stop(name: string): void {
    const entry = this.procs.get(name);
    if (!entry?.pty) return;
    entry.manualStop = true;
    killTree(entry.pty);
  }

  restart(name: string): void {
    const entry = this.procs.get(name);
    if (!entry) return;
    // Wipe scrollback immediately so the user sees a fresh buffer instead of
    // old output mixed with new on the next run.
    entry.lines = [];
    entry.parser = new AnsiStream();
    if (!entry.pty) {
      this.start(name);
      return;
    }
    entry.manualStop = true;
    entry.onNextExit = () => this.start(name);
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
    entry.lines = [];
    entry.parser = new AnsiStream();
    this.emit("change");
  }

  snapshot(): ProcSnapshot[] {
    return Array.from(this.procs.values()).map((e) => {
      const partial = e.parser.partialLine();
      return {
        name: e.cfg.name,
        status: e.status,
        pid: e.pid,
        exitCode: e.exitCode,
        startedAt: e.startedAt,
        lines: partial.length > 0 ? [...e.lines, partial] : e.lines,
        restarts: e.restarts,
        spawnError: e.spawnError,
      };
    });
  }

  get(name: string): ProcSnapshot | undefined {
    return this.snapshot().find((s) => s.name === name);
  }

  shutdown(): Promise<void> {
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

  // Resolve a tail target's absolute path, mirroring how `start` resolves the
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

  private appendOutput(entry: ProcEntry, data: string): void {
    const completed = entry.parser.feed(data);
    if (completed.length > 0) {
      for (const line of completed) entry.lines.push(line);
      if (entry.lines.length > MAX_LINES) {
        entry.lines.splice(0, entry.lines.length - MAX_LINES);
      }
    }
    this.emit("change");
  }
}
