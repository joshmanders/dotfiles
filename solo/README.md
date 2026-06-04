# solo — process-runner TUI

Run a project's long-lived commands (dev server, queue worker, log tail, REPL) in one TUI. Inspired by [soloterm/solo](https://github.com/soloterm/solo) but standalone — works for any project, not just Laravel.

```bash
solo            # in any directory
```

(`~/.files/bin/solo` is a thin wrapper that `exec`s `bun run` against this project.)

---

## Config

`solo` keys configs by cwd. The first run in a new directory drops you into the **Add command** wizard. Each command you add is appended to a YAML file at `~/.config/solo/<sha1(cwd)>.yaml`.

`~/.config/solo` is symlinked from `~/.files/solo/configs/` so the per-project setups live in the dotfiles repo. `solo/install.sh` creates the symlink on a fresh machine.

```yaml
directory: /Users/josh/Code/foo
commands:
  - name: vite
    command: npm run dev
    autostart: true
  - name: queue
    command: php artisan queue:work
    autostart: true
    restart: on-fail
  - name: tinker
    command: php artisan tinker
    interactive: true
```

| Field         | Type                               | Description                                                                                                                          |
| ------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `name`        | `string`                           | Display name. Must be unique within the file.                                                                                        |
| `command`     | `string`                           | Passed to `$SHELL -lc`, so pipes/`&&`/env interpolation work.                                                                        |
| `cwd`         | `string?`                          | Override working directory. Absolute, or relative to `directory`. Defaults to `directory`.                                           |
| `autostart`   | `boolean?`                         | If `true`, spawns immediately on `solo` launch. If `false`/missing, the command is **lazy** — visible in the list, started manually. |
| `env`         | `Record<string, string>?`          | Merged into the command's environment.                                                                                               |
| `restart`     | `"never" \| "on-fail" \| "always"` | Default `never`. `on-fail` restarts only on non-zero exit. Manual stop (`s`) never triggers a restart regardless of policy.          |
| `interactive` | `boolean?`                         | Shows an stdin input below the output pane when the command is selected and running. Lines forward to the pty on enter.              |

Filenames are sha1'd so weird paths (spaces, unicode) work cleanly. The `directory:` field inside the file makes the contents recognizable when you grep `~/.config/solo/`.

If you rename a project on disk, edit the config's `directory:` field to match and then run:

```bash
solo rekey            # rekey every config in ~/.config/solo/
solo rekey <hash>     # rekey just the named file (basename without .yaml)
```

It recomputes the sha1 of each file's `directory:` value and renames any file whose name no longer matches. Files already correct are left alone; collisions (two files claiming the same directory) are flagged and skipped, never overwritten.

---

## Stack

- [Bun](https://bun.sh) (already installed via Brewfile)
- [@opentui/react](https://opentui.com) — React reconciler for terminal UIs
- [node-pty](https://github.com/microsoft/node-pty) — proper PTYs so vite/artisan/etc. render colors and progress bars correctly

---

## Layout

Each command is a **tab** along the top. The active tab's output fills the rest of the screen. Inactive tabs show a colored `•` dot for their process state (green = running, red = failed, gray = idle/exited). Click a tab or `tab`/`S-tab` to cycle.

```
 Vite  •Queue  •Reverb  •Scheduler  •Logs  •Agent
 Running: npm run dev
 ┌──────────────────────────────────────────── 142 lines · Live ─┐
 │   → Local:   http://localhost:5173/                           │
 │   → Network: use --host to expose                             │
 │   …                                                           │
 └───────────────────────────────────────────────────────────────┘
 tab Next  c Clear  s Stop  r Restart  q Quit
```

The scrollback view sticks to the bottom as new output streams in. Scroll up to read history; returning to the bottom re-engages stick.

## Controls

### Dashboard

The bottom bar swaps based on whether the current tab is running.

**When running:**

| Key             | Action                                            |
| --------------- | ------------------------------------------------- |
| `tab` / `S-tab` | Next / previous tab                               |
| `c`             | Clear the output buffer                           |
| `s`             | Stop (SIGTERM; suppresses restart policy)         |
| `r`             | Restart                                           |
| `i`             | Focus the stdin input (interactive commands only) |

**When stopped:**

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
| `y`            | Open the raw YAML config in `$EDITOR` (suspends/resumes the renderer)   |
| `q` / `Ctrl-C` | Quit. If anything is running, confirms first, then SIGTERMs all cleanly |

### Wizard (add/edit command)

| Key             | Action                            |
| --------------- | --------------------------------- |
| `tab` / `S-tab` | Next / previous field             |
| `space`         | Toggle bool / cycle restart       |
| `←` / `→`       | Cycle restart policy              |
| `Ctrl-S`        | Save                              |
| `esc`           | Cancel (quits if no commands yet) |

---

## Architecture

```
~/.files/solo/
├── package.json              bun project
├── tsconfig.json
├── install.sh                bun install + mkdir ~/.config/solo
├── README.md                 you are here
└── src/
    ├── index.tsx             createCliRenderer + signal cleanup
    ├── App.tsx               dashboard/wizard router, pm lifecycle, quit flow
    ├── components/
    │   ├── Header.tsx        tab bar (command names with status dots)
    │   ├── StatusBar.tsx     bottom bindings hint
    │   ├── ConfirmDialog.tsx
    │   └── OutputPane.tsx    scrollback viewer with sticky-to-bottom scrolling
    ├── panels/
    │   ├── Dashboard.tsx     tabs + active-tab output + stdin input
    │   └── Wizard.tsx        add/edit form
    └── lib/
        ├── config.ts         YAML I/O, sha1 path, schema types
        ├── process.ts        ProcessManager — node-pty spawn, restart policy, ring buffer
        ├── format.ts
        └── editor.ts         spawn $EDITOR (suspends/resumes renderer)
```

### ProcessManager

- One pty per command. Spawned via `$SHELL -lc <command>` so shell features work.
- Output is stripped of ANSI escapes and stored as a line buffer (max 5000 lines per process).
- `restart: on-fail` re-spawns after a 300 ms backoff when exit code ≠ 0.
- `restart: always` re-spawns on any exit.
- A user-initiated `stop` sets a `manualStop` flag that suppresses the restart policy for that exit.
- `shutdown()` SIGTERMs all live processes, waits for their exit handlers, with a 2 s hard timeout.

### First-run flow

`App.tsx` reads `~/.config/solo/<sha1(cwd)>.yaml`. If missing or has zero commands, it routes to the Wizard panel. Saving the first command writes the file and switches to the Dashboard. The Wizard's `a` (add) keybind from the Dashboard reuses the same panel — one code path.
