import { homedir } from "node:os";
import { join } from "node:path";
import { readdirSync, statSync, readFileSync, rmSync, existsSync } from "node:fs";

export const CLAUDE_DIR = join(homedir(), ".claude");

export const paths = {
  root: CLAUDE_DIR,
  plans: join(CLAUDE_DIR, "plans"),
  sessions: join(CLAUDE_DIR, "sessions"),
  projects: join(CLAUDE_DIR, "projects"),
  history: join(CLAUDE_DIR, "history.jsonl"),
  stats: join(CLAUDE_DIR, "stats-cache.json"),
  tasks: join(CLAUDE_DIR, "tasks"),
  backups: join(CLAUDE_DIR, "backups"),
  todos: join(CLAUDE_DIR, "todos"),
  pasteCache: join(CLAUDE_DIR, "paste-cache"),
  shellSnapshots: join(CLAUDE_DIR, "shell-snapshots"),
  telemetry: join(CLAUDE_DIR, "telemetry"),
  settings: join(CLAUDE_DIR, "settings.json"),
  keybindings: join(CLAUDE_DIR, "keybindings.json"),
  claudeMd: join(CLAUDE_DIR, "CLAUDE.md"),
  agents: join(CLAUDE_DIR, "agents"),
  skills: join(CLAUDE_DIR, "skills"),
  rules: join(CLAUDE_DIR, "rules"),
  claudeJson: join(homedir(), ".claude.json"),
};

export interface FileEntry {
  name: string;
  path: string;
  size: number;
  mtimeMs: number;
  isDir: boolean;
}

export function listDir(dir: string, opts: { ext?: string } = {}): FileEntry[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => !opts.ext || n.endsWith(opts.ext))
    .map((name) => {
      const path = join(dir, name);
      try {
        const s = statSync(path);
        return { name, path, size: s.size, mtimeMs: s.mtimeMs, isDir: s.isDirectory() };
      } catch {
        return null;
      }
    })
    .filter((e): e is FileEntry => e !== null)
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
}

export function dirSize(dir: string): number {
  if (!existsSync(dir)) return 0;
  let total = 0;
  const stack: string[] = [dir];
  while (stack.length) {
    const cur = stack.pop()!;
    let entries: string[];
    try {
      entries = readdirSync(cur);
    } catch {
      continue;
    }
    for (const name of entries) {
      const p = join(cur, name);
      try {
        const s = statSync(p);
        if (s.isDirectory()) stack.push(p);
        else total += s.size;
      } catch {}
    }
  }
  return total;
}

export function readText(path: string, maxBytes = 256 * 1024): string {
  try {
    const buf = readFileSync(path);
    if (buf.byteLength > maxBytes) {
      return buf.subarray(0, maxBytes).toString("utf8") + `\n\n… (truncated, ${buf.byteLength} bytes total)`;
    }
    return buf.toString("utf8");
  } catch (e: any) {
    return `(error reading: ${e?.message ?? e})`;
  }
}

export function readJson<T = unknown>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

export function rmPath(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

// True when a Unix PID is reachable. Signal 0 doesn't deliver but errors with
// ESRCH if the process is gone (EPERM means it exists but we lack rights).
export function pidAlive(pid: number | undefined): boolean {
  if (!pid || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e: unknown) {
    return (e as NodeJS.ErrnoException).code === "EPERM";
  }
}

// Subdirectories of ~/.claude that contribute meaningfully to disk usage.
// Used by Dashboard's Disk Usage card.
export const DISK_TARGETS: { name: string; path: string }[] = [
  { name: "projects/", path: paths.projects },
  { name: "telemetry/", path: paths.telemetry },
  { name: "todos/", path: paths.todos },
  { name: "file-history/", path: join(paths.root, "file-history") },
  { name: "sessions/", path: paths.sessions },
  { name: "tasks/", path: paths.tasks },
  { name: "plans/", path: paths.plans },
  { name: "backups/", path: paths.backups },
  { name: "shell-snapshots/", path: paths.shellSnapshots },
  { name: "paste-cache/", path: paths.pasteCache },
  { name: "statsig/", path: join(paths.root, "statsig") },
];

export function projectPathFromKey(key: string): string {
  // ~/.claude/projects entries use "-Users-josh-Code-foo" style keys.
  // A double dash (`--`) encodes a leading dot (hidden file/dir):
  //   `-Users-josh--files` → `/Users/josh/.files`
  if (!key.startsWith("-")) return key;
  const segments = key.slice(1).split("-");
  const out: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]!;
    if (s === "" && i + 1 < segments.length) {
      out.push("." + segments[i + 1]!);
      i++;
    } else if (s) {
      out.push(s);
    }
  }
  return "/" + out.join("/");
}

// Inverse of projectPathFromKey. `/Users/josh/.files` → `-Users-josh--files`.
// Hidden segments (dot-prefixed) become `-<name>`.
export function projectKeyForPath(realPath: string): string {
  const stripped = realPath.replace(/^\//, "");
  const segments = stripped.split("/");
  const encoded = segments.map((s) => (s.startsWith(".") ? "-" + s.slice(1) : s)).join("-");
  return "-" + encoded;
}
