# rig

A per-project process-runner TUI. Define your project's long-lived commands (dev server, queue worker, log tail, REPL) in a YAML file; `rig` runs them in tabs, multiplexes their output into a scrollback view, and gives you keybindings to start/stop/restart/clear/edit individual processes from a single terminal.

Inspired by Aaron Francis's [solo](https://github.com/soloterm/solo). Where `solo` is the soloist, your `rig` is what they play through — and it travels with you to any stack, not just Laravel.

> **Status.** This README describes the project in design. The reference implementation that informs it is a Bun + `@opentui/react` + `node-pty` prototype living in [`~/.files/solo`](https://github.com/joshmanders/.files/tree/master/solo); the "Known limitations" section below documents why it's being rewritten in Rust.

---

## Concept

The unit of organization is a project directory. Each project gets one YAML config that lists the commands `rig` should know about. `rig` is launched from inside the project; it loads that project's config, presents each command as a tab, and manages each command's lifecycle independently.

A command can be:

- **A shell command** (`npm run dev`, `php artisan queue:work`) executed under `$SHELL -lc` so pipes, `&&`, and env interpolation work.
- **A log tail** declared structurally (`tail: { file, lines?, retry? }`) — `rig` builds the `tail -F` invocation. `clear` on a tail truncates the underlying file rather than just the scrollback, so the tail keeps streaming.

Per-command knobs:

| Field         | Type                               | Description                                                                                                                          |
| ------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `name`        | `string`                           | Display name. Unique within the file.                                                                                                |
| `command`     | `string`                           | Shell command. Exactly one of `command` / `tail` is required.                                                                        |
| `tail`        | `object`                           | `{ file, lines?, retry? }`. Exactly one of `command` / `tail` is required.                                                           |
| `cwd`         | `string?`                          | Override working directory. Absolute, or relative to the project root.                                                               |
| `autostart`   | `boolean?`                         | If `true`, spawns immediately on launch. Otherwise the command is **lazy** — visible in the tab list, started manually.              |
| `env`         | `Record<string, string>?`          | Merged into the command's environment.                                                                                               |
| `restart`     | `"never" \| "on-fail" \| "always"` | Default `never`. `on-fail` restarts only on non-zero exit. Manual stop never triggers a restart regardless of policy.                |
| `interactive` | `boolean?`                         | Shows a stdin input when the tab is focused and the process is running. Lines forward to the pty on enter.                           |

### Config location

Per-project config files keyed by the cwd. The reference implementation uses `~/.config/<tool>/<sha1(cwd)>.yaml` with a `directory:` field inside the YAML so the filename can be recomputed if the project moves. A `rekey` subcommand recomputes filenames from each file's `directory:` value.

The sha1 filename keeps weird paths (spaces, unicode) clean on disk; the `directory:` field makes the contents recognizable when you grep the config dir.

---

## UI model

A single terminal window. Top bar lists commands as tabs, each with a status dot (running / failed / idle). The active tab's output fills the rest of the screen. Bottom bar shows context-sensitive keybindings.

```
 vite  •queue  •reverb  •scheduler  •logs  •agent
 Running: npm run dev
 ┌──────────────────────────────────────────── 142 lines · Live ─┐
 │   → Local:   http://localhost:5173/                           │
 │   → Network: use --host to expose                             │
 │   …                                                           │
 └───────────────────────────────────────────────────────────────┘
 tab Next  c Clear  s Stop  r Restart  q Quit
```

The output pane is append-only scrollback with sticky-to-bottom scrolling. Scroll up to read history; returning to the bottom re-engages stick.

### Controls

**When the focused tab is running:**

| Key             | Action                                            |
| --------------- | ------------------------------------------------- |
| `tab` / `S-tab` | Next / previous tab                               |
| `c`             | Clear the output buffer                           |
| `s`             | Stop (SIGTERM; suppresses restart policy)         |
| `r`             | Restart                                           |
| `i`             | Focus the stdin input (interactive commands only) |

**When the focused tab is stopped:**

| Key           | Action                             |
| ------------- | ---------------------------------- |
| `⏎` / `space` | Start the command                  |
| `c`           | Clear the output buffer            |
| `e`           | Edit this command in the wizard    |
| `d`           | Remove this command (with confirm) |
| `a`           | Add a new command                  |

**Always available:**

| Key            | Action                                                                  |
| -------------- | ----------------------------------------------------------------------- |
| `y`            | Open the raw YAML config in `$EDITOR` (suspend/resume the renderer)     |
| `q` / `Ctrl-C` | Quit. If anything is running, confirm first, then SIGTERM all cleanly   |

### First-run flow

If no config exists for the current directory (or the file has zero commands), `rig` routes directly to the **Add command** wizard. Saving the first command writes the file and switches to the dashboard. Adding more commands from the dashboard reuses the same wizard panel.

---

## Process model

One pty per command. The process layer is responsible for:

- **Spawning** via `$SHELL -lc <command>` with the project's cwd and merged env.
- **Streaming output** through an ANSI parser into a per-process line buffer (cap ~5000 lines).
- **Restart policy** (`never` / `on-fail` / `always`) with a short backoff. A user-initiated stop sets a flag that suppresses the policy for that exit.
- **Process-group signals.** With `bash -lc cmd`, signals don't reliably propagate to the actual child. The pty puts the child in a new session (`setsid`), so the pty pid is the process-group leader. Send SIGTERM to `-pid` to hit every process in the group; escalate to SIGKILL after ~2s.
- **Clean shutdown.** On quit, SIGTERM all live processes, wait for exit handlers, hard timeout at 2s.

### ANSI handling

The output pane is append-only scrollback, not a terminal emulator. The parser tracks SGR (color/bold/dim/italic/underline) across chunks and emits styled runs split into lines. Cursor and screen-control escapes are consumed and discarded. `\r` clears the current partial line so progress bars that overwrite with `\r` render correctly.

This is a deliberate simplification — `rig` is not trying to host a full-screen TUI inside a tab. Programs that draw their own UI (`htop`, `vim`) will render as garbage. Anything that streams line-based output with optional color works.

---

## Known limitations of the Bun reference implementation

These are the reasons the Rust rewrite exists. The Rust port should resolve them, not reproduce them.

1. **node-pty + Bun incompatibility.** node-pty wraps the master fd in `tty.ReadStream`. Under Bun, reads return `EAGAIN`, the stream gives up, and no `data` events ever fire. The reference implementation works around this by detaching the wrapper and polling the raw fd at 15ms via `readSync`. This burns CPU on idle processes and adds latency to bursty output. A native Rust pty layer should be event-driven.
2. **Exit status comes out through node-pty's internals.** Detaching the broken wrapper also detaches the listener node-pty uses to fire `pty.onExit`, so the reference implementation re-attaches its own listener to the private `_socket` field to reach the real `(code, signal)` the native waitpid callback delivers. It works, and it reports true exit codes, but it is coupled to node-pty's internal layout and arrives ~200ms late (node-pty defers the event behind a socket-destroy timer). Rust should surface exit status from its own pty layer with no such reach-through.
3. **Append-only scrollback, not a terminal grid.** Cursor motion, screen-clear, alternate-screen, and most non-SGR CSI sequences are discarded. Full-screen TUIs render as garbage. Width is also not measured per grapheme cluster — wide chars and emoji can misalign. A real terminal-cell model (or a clearly-documented "we render plain logs, run TUIs elsewhere" position) would help.
4. **Native-module sprawl.** Ships as `bun install` + node-pty (native) + OpenTUI (Zig native). Not distributable as a single binary; depends on Bun being installed and matching node-pty's prebuild matrix. Rust ships as one static binary.
5. **Cold-start latency.** React reconciler + Bun import graph + native module loading add noticeable startup cost for a tool you launch frequently. A Rust binary with a TUI library (`ratatui` + `crossterm`, or similar) starts in tens of milliseconds.
6. **PTY initial size is hardcoded** at 120×30 until the first resize. Should query the host terminal size at spawn time.
7. **Per-tab line cap is a hard ring buffer.** Once you hit 5000 lines, history scrolls off and there's no spillover to disk. A bounded in-memory window with optional on-disk overflow would let long-running processes keep usable history.
8. **node-pty is pinned to a prerelease.** `1.2.0-beta.14`, not `latest`. On macOS, node-pty's `posix_spawn` path opens a `/dev/ptmx` fd per spawn that the parent never closes, so every restart burns one of the system's `kern.tty.ptmx_max` (511) ptys until nothing on the machine can allocate one. Fixed in [microsoft/node-pty#882](https://github.com/microsoft/node-pty/pull/882), which has only shipped in the 1.2.0 betas — the `latest` tag is still 1.1.0. Don't loosen the pin until 1.2.0 is stable.

---

## Non-goals

- **Replacing a terminal multiplexer.** `rig` is for project process lifecycle, not arbitrary shell windows. If you want tmux, use tmux.
- **Hosting full-screen TUI programs inside a tab.** See limitation 3. Run those programs in their own terminal.
- **Cluster / remote orchestration.** `rig` is one developer, one machine, one project at a time.

---

## Credit

Aaron Francis built [solo](https://github.com/soloterm/solo) for the Laravel ecosystem. The shape of `rig` — per-project YAML, tabbed processes, restart policies, the wizard for first-run — comes directly from using `solo` and wanting it everywhere else. The name and implementation are independent; the gratitude is not.
