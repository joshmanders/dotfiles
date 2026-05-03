import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

// Open a NEW terminal window in `cwd` and run `command`. Returns true on
// success.
//
// Tries the user's current terminal first (via $TERM_PROGRAM), then falls
// back to anything we recognize on macOS. The handlers are deliberately
// minimal — each one shells out via `open -na` or `osascript` rather than
// trying to control the terminal programmatically.
export function spawnTerminal(cwd: string, command: string): { ok: boolean; how: string } {
  const candidates = orderedCandidates();
  for (const c of candidates) {
    if (c.spawn(cwd, command)) return { ok: true, how: c.name };
  }
  return { ok: false, how: "none" };
}

interface Candidate {
  name: string;
  available(): boolean;
  spawn(cwd: string, command: string): boolean;
}

function orderedCandidates(): Candidate[] {
  const handlers: Candidate[] = [ghostty, iterm, terminal];
  const current = (process.env.TERM_PROGRAM ?? "").toLowerCase();
  // Hoist the current terminal to the front if we recognize it.
  handlers.sort((a, b) => {
    const aMatch = current.includes(a.name.toLowerCase()) ? 1 : 0;
    const bMatch = current.includes(b.name.toLowerCase()) ? 1 : 0;
    return bMatch - aMatch;
  });
  return handlers.filter((h) => h.available());
}

function shellEscape(s: string): string {
  // Wrap in single quotes, escape any embedded single quotes.
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

function detached(cmd: string, args: string[]): boolean {
  try {
    const child = spawn(cmd, args, { detached: true, stdio: "ignore" });
    child.unref();
    return true;
  } catch {
    return false;
  }
}

const ghostty: Candidate = {
  name: "Ghostty",
  available: () => existsSync("/Applications/Ghostty.app"),
  spawn(cwd, command) {
    // Ghostty's `-e` runs the program directly via `login`, NOT through a
    // shell — so `cd … && exec …` would be passed as a literal program
    // name. Wrap in `bash -c` so the shell interprets the &&/cd.
    const shell = process.env.SHELL || "/bin/bash";
    const full = `cd ${shellEscape(cwd)} && exec ${command}`;
    return detached("open", ["-na", "Ghostty.app", "--args", "-e", shell, "-c", full]);
  },
};

const iterm: Candidate = {
  name: "iTerm",
  available: () => existsSync("/Applications/iTerm.app"),
  spawn(cwd, command) {
    const full = `cd ${shellEscape(cwd)} && ${command}`;
    const script = `tell application "iTerm"
  create window with default profile
  tell current session of current window to write text ${shellEscape(full)}
end tell`;
    return detached("osascript", ["-e", script]);
  },
};

const terminal: Candidate = {
  name: "Terminal",
  available: () => existsSync("/System/Applications/Utilities/Terminal.app") || existsSync("/Applications/Utilities/Terminal.app"),
  spawn(cwd, command) {
    const full = `cd ${shellEscape(cwd)} && ${command}`;
    const script = `tell application "Terminal" to do script ${shellEscape(full)}`;
    return detached("osascript", ["-e", script]);
  },
};
