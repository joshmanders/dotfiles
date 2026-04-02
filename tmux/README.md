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

**Important:** Your terminal must send Option as Meta/Esc+ for the keybindings to work. In iTerm2: Preferences > Profiles > Keys > set "Left Option key" to "Esc+". In Ghostty: `macos-option-as-alt = true` in config.

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

Example — 2 claude instances on top, lazygit + terminal on bottom:

1. You start in a single pane
2. `Option + -` to split top/bottom
3. `Option + |` to split the top pane left/right
4. `Option + j` to move to the bottom pane
5. `Option + |` to split the bottom pane left/right
6. Start `claude` in top-left and top-right, `lazygit` in bottom-left

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

### After a machine restart

Sessions auto-save every 15 minutes. After a restart:

```bash
mux                  # from any project dir — restores session automatically
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
- **tmux-continuum** — auto-saves every 15 minutes, auto-restores on tmux start
