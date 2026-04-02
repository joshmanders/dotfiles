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

Or from neovim: `Space lg`

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
| `a`     | Stage all                           |
| `c`     | Commit                              |
| `A`     | Amend last commit                   |
| `d`     | Discard changes (careful!)          |
| `e`     | Edit file in $EDITOR                |
| `o`     | Open file in default app            |
| `i`     | Add to .gitignore                   |
| `S`     | Stash all changes                   |

## Key Bindings — Branches Panel

| Key     | Action                              |
| ------- | ----------------------------------- |
| `space` | Checkout branch                     |
| `n`     | New branch                          |
| `d`     | Delete branch                       |
| `M`     | Merge into current branch           |
| `r`     | Rebase current branch onto selected |
| `R`     | Rename branch                       |

## Key Bindings — Commits Panel

| Key     | Action                              |
| ------- | ----------------------------------- |
| `s`     | Squash commit into previous         |
| `r`     | Reword commit message               |
| `f`     | Fixup (squash, keep previous msg)   |
| `d`     | Drop commit                         |
| `p`     | Pick (cherry-pick)                  |
| `e`     | Edit commit                         |
| `t`     | Tag commit                          |

## Key Bindings — General

| Key     | Action                              |
| ------- | ----------------------------------- |
| `p`     | Pull                                |
| `P`     | Push                                |
| `z`     | Undo                                |
| `?`     | Help (shows all keybindings)        |
| `q`     | Quit                                |
| `@`     | Open command log                    |
| `/`     | Filter/search in current panel      |
| `+`     | Next screen mode (expand panel)     |
| `_`     | Previous screen mode                |

## Config

The `config.yml` sets:

- `expandFocusedSidePanel: true` — focused panel gets more space
- `showCommandLog: false` — hides the command log at the bottom
- `showBottomLine: false` — cleaner UI without the bottom hint bar
- `showPanelJumps: false` — hides panel number indicators
