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

**Important:** Your terminal must send Option as Meta/Esc+ for the keybindings to work. In Ghostty: `macos-option-as-alt = true` in config.

## Concepts

- **Session** — a group of related projects (e.g. "niftyco", "primcloud")
- **Window** — a tab within a session, one per project (e.g. "app", "api")
- **Pane** — a split within a window (e.g. claude on the left, terminal on the right)

## Daily Workflow

### Opening projects

`mux` groups projects by their parent directory automatically:

```bash
cd ~/Code/niftyco/app
mux                        # session "niftyco", window "app"

cd ~/Code/niftyco/api
mux                        # adds window "api" to "niftyco" session

cd ~/Code/primcloud/platform
mux                        # new session "primcloud", window "platform"
```

Override the session name with an argument:

```bash
cd ~/Code/freelance/client-site
mux freelance              # session "freelance", window "client-site"
```

### Managing sessions

```bash
mux list                          # list all registered sessions
mux show                          # show panes for CWD's session
mux show primcloud:platform       # show panes for a specific session
mux copy primcloud:platform       # copy layout to CWD (panes, no commands)
```

### Pane layout persistence

First time you run `mux` for a directory, you get a clean session. Set up your panes however you want — the layout and running commands are saved automatically.

Next time the tmux server restarts and you run `mux`, your panes are recreated with the same layout and commands re-launched.

Saves happen automatically when you:
- Split or close a pane
- Switch between panes
- Detach from tmux

### Copying layouts between projects

```bash
cd ~/Code/aniftyco/saas-starter
mux copy primcloud:platform       # same pane arrangement, CWD as working dir
mux                               # creates session with copied layout
```

### Switching between project tabs

```
Option + 1/2/3...    Jump to window by number
Option + n           Next window
Option + p           Previous window
```

### Switching between sessions

```
Option + s           Open session picker (arrow keys to select, Enter to switch)
```

### Building your pane layout

Once inside a project window, split it up:

```
Option + |           Split side-by-side
Option + -           Split top/bottom
```

### Moving between panes

```
Option + h           Move left
Option + j           Move down
Option + k           Move up
Option + l           Move right
```

Or click a pane with the mouse.

### Resizing panes

```
Option + Shift + H   Resize left
Option + Shift + J   Resize down
Option + Shift + K   Resize up
Option + Shift + L   Resize right
```

Or drag pane borders with the mouse.

### Pane and window management

```
Option + z           Zoom — toggle a pane fullscreen (again to restore)
Option + w           Close the current pane
Option + t           New empty window (tab) in current session
```

### Leaving and returning

```
Option + d           Detach — leaves everything running in background
mux                  Reattach from the project directory
```

### Scrolling and copying

Scroll up with mouse wheel or trackpad. To copy text:

- **Mouse:** click and drag to select, copies to clipboard automatically
- **Keyboard:** `Ctrl+a [` enters copy mode, vim keys to move, `v` to select, `y` to copy

## Quick Reference

| Binding              | Action                |
| -------------------- | --------------------- |
| `Option + \|`        | Split side-by-side    |
| `Option + -`         | Split top/bottom      |
| `Option + h/j/k/l`  | Navigate panes        |
| `Option + H/J/K/L`  | Resize panes          |
| `Option + z`         | Zoom pane             |
| `Option + w`         | Close pane            |
| `Option + t`         | New window (tab)      |
| `Option + 1-9`       | Jump to window number |
| `Option + n/p`       | Next/previous window  |
| `Option + s`         | Session picker        |
| `Option + d`         | Detach session        |
| `Option + r`         | Reload config         |

## Plugins

- **tmux-resurrect** — saves/restores sessions across tmux server restarts
- **tmux-continuum** — auto-saves every 15 minutes
