# tmux

Terminal multiplexer with session persistence.

## Files

| File             | Description                        |
| ---------------- | ---------------------------------- |
| `tmux.conf`      | Config (symlinked to ~/.tmux.conf) |
| `install.sh`     | Symlinks config, installs TPM      |
| `sessions.json`  | Session registry (gitignored)      |

## Installation

```bash
bash tmux/install.sh
```

Plugins are auto-installed on first tmux start.

**Important:** Your terminal must support the kitty keyboard protocol / CSI-u extended keys for the `Ctrl+;` prefix to reach tmux. Ghostty, iTerm2, kitty, Alacritty, and WezTerm all support this.

## Concepts

- **Session** — one per project directory, named from the parent directory and the directory (e.g. "niftyco-app", "primcloud-platform")
- **Window** — a tab within a session: the project's own window plus any tabs you add
- **Pane** — a split within a window (e.g. claude on the left, terminal on the right)

## Daily Workflow

The prefix is `Ctrl+;`. Press it, release, then press the next key.

### Opening projects

`mux` gives each project directory its own session, named `<parent>-<directory>`:

```bash
cd ~/Code/niftyco/app
mux                        # session "niftyco-app"

cd ~/Code/niftyco/api
mux                        # session "niftyco-api"

cd ~/Code/primcloud/platform
mux                        # session "primcloud-platform"
```

`mux list` shows sessions as `parent:directory` (e.g. `niftyco:app`), and commands that take a session accept either form.

Override the session name with an argument:

```bash
cd ~/Code/freelance/client-site
mux freelance              # session "freelance"
```

Inside a session `mux` manages, running `mux` from another directory opens a tab in that session instead — see [Pane, window, and session management](#pane-window-and-session-management).

### Managing sessions

```bash
mux list                          # list all registered sessions
mux show                          # show panes for CWD's session
mux show primcloud:platform       # show panes for a specific session
mux copy primcloud:platform       # copy layout to CWD (panes, no commands)
mux delete                        # kill CWD's session and remove it from the registry
mux delete primcloud:platform     # same, for a specific session
```

### Pane layout persistence

First time you run `mux` for a directory, you get a clean session. Set up your panes however you want — the layout and running commands are saved automatically.

Next time the tmux server restarts and you run `mux`, your panes are recreated with the same layout and commands re-launched.

Saves happen automatically when:
- You split a pane (saved a few seconds later)
- You close a pane with `Ctrl+; w`
- A pane's shell exits
- You detach from tmux

### Copying layouts between projects

```bash
cd ~/Code/aniftyco/saas-starter
mux copy primcloud:platform       # same pane arrangement, CWD as working dir
mux                               # creates session with copied layout
```

### Switching between project tabs

```
Ctrl+; 1/2/3...      Jump to window by number
Ctrl+; n             Next window
Ctrl+; p             Previous window
```

### Switching between sessions

```
Ctrl+; s             Open session picker (arrow keys to select, Enter to switch)
```

### Building your pane layout

Once inside a project window, split it up:

```
Ctrl+; \             Split side-by-side
Ctrl+; Enter         Split top/bottom
Ctrl+; Left/Right    Split horizontally, before/after current pane
Ctrl+; Up/Down       Split vertically, before/after current pane
```

### Moving between panes

Pane navigation is prefix-free thanks to vim-tmux-navigator — these also jump in and out of Neovim splits:

```
Shift+Left           Move left
Shift+Down           Move down
Shift+Up             Move up
Shift+Right          Move right
```

Or click a pane with the mouse.

### Resizing panes

Hold the prefix once, then repeat the key:

```
Ctrl+; -             Shrink down
Ctrl+; =             Grow up
Ctrl+; [             Shrink left
Ctrl+; ]             Grow right
Ctrl+; Delete        Equalize all panes (tiled layout)
```

Or drag pane borders with the mouse.

### Pane, window, and session management

```
Ctrl+; z             Zoom — toggle a pane fullscreen (again to restore)
Ctrl+; w             Close the current pane (asks first)
Ctrl+; t             Prompt for a tab name, opens it (mux-persisted)
Ctrl+; W             Close the current tab (mux-persisted)
Ctrl+; q             Close the current session (asks first)
```

`Ctrl+; w` and `Ctrl+; q` open a confirmation menu in the center of the screen with No selected: `y` confirms; `n`, `Escape`, or `Enter` cancels.

`Ctrl+; q` runs `mux delete` on the current session: every window and pane is killed and the session is removed from the `mux` registry, so its saved layout and tabs are gone too. It also works on sessions `mux` didn't create. The client detaches.

Tabs created with `Ctrl+; t` are tracked by `mux` — they're restored next time
the tmux server restarts. Running `mux` from another directory inside a
session `mux` manages opens a tab automatically rather than starting a new
session, so `cd` + `mux` from a sibling package lands you in a new tab inside
the existing project.

Inspect or script tabs from the shell:

```
mux tab <name> [path]   Create or switch to a tab in the current session
mux tab:show            List tabs in the current session
mux tab:kill <name>     Remove a tab from the registry (kills it if running)
```

### Leaving and returning

```
Ctrl+; d             Detach — leaves everything running in background
mux                  Reattach from the project directory
```

### Scrolling and copying

Scroll up with mouse wheel or trackpad. To copy text:

- **Mouse:** click and drag to select, copies to clipboard automatically
- **Keyboard:** `Ctrl+; v` enters copy mode, vim keys to move, `v` to select (`V` for line, `Ctrl+v` for block), `y` to copy, `q` to exit

## Quick Reference

| Binding              | Action                |
| -------------------- | --------------------- |
| `Ctrl+; \`             | Split side-by-side                |
| `Ctrl+; Enter`         | Split top/bottom                  |
| `Ctrl+; Left/Right`    | Split horizontal, before/after    |
| `Ctrl+; Up/Down`       | Split vertical, before/after      |
| `Shift+arrows`         | Navigate panes                    |
| `Ctrl+; -/=/[/]`       | Resize panes                      |
| `Ctrl+; Delete`        | Equalize panes                    |
| `Ctrl+; z`             | Zoom pane                         |
| `Ctrl+; w`             | Close pane (confirms)             |
| `Ctrl+; t`             | New tab (mux-persisted, named)    |
| `Ctrl+; W`             | Close tab (mux-persisted)         |
| `Ctrl+; q`             | Close session (confirms)          |
| `Ctrl+; 1-9`           | Jump to window number             |
| `Ctrl+; n/p`           | Next/previous window              |
| `Ctrl+; s`             | Session picker                    |
| `Ctrl+; d`             | Detach session                    |
| `Ctrl+; v`             | Enter copy mode                   |
| `Ctrl+; r`             | Reload config                     |
| `Ctrl+; k`             | Clear screen + scrollback         |

## Plugins

- **tmux-resurrect** — saves/restores sessions across tmux server restarts
- **tmux-continuum** — auto-saves every 15 minutes
- **tmux-better-mouse-mode** — natural scroll-to-exit behavior in copy mode
- **vim-tmux-navigator** — seamless `Shift+arrows` between Neovim splits and tmux panes
