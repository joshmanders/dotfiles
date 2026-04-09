# Lazygit

TUI git client. Manages staging, committing, branching, rebasing, and more from a terminal interface.

## Files

| File         | Description                                          |
| ------------ | ---------------------------------------------------- |
| `config.yml` | Config (symlinked to ~/Library/Application Support/) |
| `install.sh` | Symlinks config                                      |

## Installation

```bash
bash lazygit/install.sh
```

## Opening

```bash
lazygit              # from any git repo
```

Or from neovim: `<leader>lg`

## Panels

Lazygit has 5 panels. Switch between them with number keys or arrow keys.

| Key | Panel    | What it shows                  |
| --- | -------- | ------------------------------ |
| `1` | Status   | Current branch, repo status    |
| `2` | Files    | Changed files (staged/unstaged)|
| `3` | Branches | Local and remote branches      |
| `4` | Commits  | Commit history                 |
| `5` | Stash    | Stashed changes                |

## Daily Workflow

### Stage and commit

1. Open lazygit in your repo
2. You're in the Files panel — arrow keys to select files
3. `space` to stage/unstage a file, `a` to stage all
4. `c` to commit — type your message, `Enter` to confirm

### Push and pull

- `P` (shift+p) — push to remote
- `p` — pull from remote

### Create a branch

1. Go to Branches panel (`3`)
2. `n` — type branch name, `Enter`

### Switch branches

1. Go to Branches panel (`3`)
2. Arrow to the branch, `space` to checkout

### Undo

- `z` — undo last action (works for most operations)

## Key Bindings — Files Panel

| Key     | Action                              |
| ------- | ----------------------------------- |
| `space` | Stage/unstage file                  |
| `a`     | Stage/unstage all                   |
| `enter` | Line-by-line staging                |
| `c`     | Commit                              |
| `A`     | Amend last commit                   |
| `d`     | Discard changes                     |
| `s`     | Stash all                           |
| `S`     | Stash options (staged, unstaged)    |
| `e`     | Edit file in $EDITOR                |
| `o`     | Open file in default app            |
| `i`     | Add to .gitignore                   |
| `f`     | Fetch from remote                   |
| `` ` `` | Toggle flat/tree file view          |

## Key Bindings — Line Staging (inside a file)

| Key     | Action                              |
| ------- | ----------------------------------- |
| `space` | Stage/unstage line(s)               |
| `d`     | Discard line(s)                     |
| `a`     | Toggle hunk/line mode               |
| `v`     | Select range                        |
| `tab`   | Switch staged/unstaged view         |
| `esc`   | Return to files panel               |

## Key Bindings — Branches Panel

| Key     | Action                              |
| ------- | ----------------------------------- |
| `space` | Checkout branch                     |
| `n`     | New branch                          |
| `d`     | Delete branch                       |
| `M`     | Merge into current branch           |
| `r`     | Rebase current branch onto selected |
| `f`     | Fast-forward from upstream          |
| `R`     | Rename branch                       |
| `u`     | Upstream options (set/unset/reset)  |

## Key Bindings — Commits Panel

| Key              | Action                              |
| ---------------- | ----------------------------------- |
| `r`              | Reword commit message               |
| `s`              | Squash into commit below            |
| `f`              | Fixup (squash, drop message)        |
| `F`              | Create `fixup!` commit              |
| `S`              | Autosquash all fixups               |
| `d`              | Drop commit                         |
| `e`              | Edit (interactive rebase from here) |
| `Ctrl+j`/`Ctrl+k`| Move commit up/down                |
| `C`              | Copy (mark for cherry-pick)         |
| `V`              | Paste cherry-picked commits         |
| `t`              | Revert commit                       |
| `g`              | Reset to commit (soft/mixed/hard)   |
| `n`              | New branch from commit              |
| `y`              | Copy hash/URL/message to clipboard  |

## Key Bindings — Stash Panel

| Key     | Action                              |
| ------- | ----------------------------------- |
| `space` | Apply stash (keep in list)          |
| `g`     | Pop stash (apply and remove)        |
| `d`     | Drop stash entry                    |
| `n`     | New branch from stash               |
| `r`     | Rename stash entry                  |

## Key Bindings — General

| Key     | Action                              |
| ------- | ----------------------------------- |
| `P`     | Push                                |
| `p`     | Pull                                |
| `z`/`Z` | Undo/redo last git command          |
| `m`     | Merge/rebase options (abort/continue)|
| `?`     | Help (shows all keybindings)        |
| `q`     | Quit                                |
| `:`     | Execute shell command               |
| `/`     | Filter/search in current panel      |
| `+`/`_` | Cycle screen layout                 |

## Fixup Workflow

The killer feature for trunk-based development:

1. Make your fix, stage it
2. `Ctrl+f` in files panel — auto-detects which commit to fix
3. Or go to commits panel, select the target commit, press `F` to create a `fixup!` commit
4. Press `S` in commits panel to autosquash all fixups before pushing

## Config

The `config.yml` sets:

- `expandFocusedSidePanel: true` — focused panel gets more space
- `showCommandLog: false` — hides the command log at the bottom
- `showBottomLine: false` — cleaner UI without the bottom hint bar
- `showPanelJumps: false` — hides panel number indicators
