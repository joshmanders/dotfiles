import { EventEmitter } from "node:events";
import { readSync } from "node:fs";
import { spawn as ptySpawn } from "node-pty";
import type { IPty } from "node-pty";
import type { CommandConfig } from "./config.js";
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
      try {
        entry.pty.kill();
      } catch {}
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
    let pty: IPty;
    try {
      pty = ptySpawn(shell, ["-lc", cfg.command], {
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

    // Detach node-pty's broken socket wrapper before it errors and closes
    // the fd. We read the master fd ourselves via fs.readSync polling.
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
          // EAGAIN — no data this tick. EBADF/EIO — fd closed (process gone).
          if (code !== "EAGAIN") {
            if (entry.pollTimer) clearInterval(entry.pollTimer);
            entry.pollTimer = undefined;
          }
        }
      }, POLL_INTERVAL_MS);
    }
    pty.onExit(({ exitCode }) => {
      if (entry.pollTimer) {
        clearInterval(entry.pollTimer);
        entry.pollTimer = undefined;
      }
      entry.exitCode = exitCode;
      entry.pty = undefined;
      entry.pid = undefined;
      const wasManual = entry.manualStop;
      entry.manualStop = false;
      entry.status = exitCode === 0 ? "exited" : "failed";
      this.emit("change");

      if (wasManual) return;
      const policy = entry.cfg.restart ?? "never";
      const shouldRestart =
        policy === "always" || (policy === "on-fail" && exitCode !== 0);
      if (shouldRestart) {
        entry.restarts++;
        setTimeout(() => this.start(name), 300);
      }
    });

    this.emit("change");
  }

  stop(name: string): void {
    const entry = this.procs.get(name);
    if (!entry?.pty) return;
    entry.manualStop = true;
    try {
      entry.pty.kill();
    } catch {}
  }

  restart(name: string): void {
    const entry = this.procs.get(name);
    if (!entry) return;
    if (entry.pty) {
      entry.manualStop = true;
      const once = () => {
        this.off("change", once);
        if (!this.procs.get(name)?.pty) this.start(name);
      };
      this.on("change", once);
      try {
        entry.pty.kill();
      } catch {}
    } else {
      this.start(name);
    }
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
        entry.pty!.onExit(() => done());
        try {
          entry.pty!.kill();
        } catch {
          done();
        }
      }
      setTimeout(resolve, 2000);
    });
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
