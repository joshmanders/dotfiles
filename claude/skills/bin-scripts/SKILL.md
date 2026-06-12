---
name: bin-scripts
description: Use when performing git operations, running Laravel/Composer commands, managing local dev sites, or killing processes on ports. Custom scripts in your PATH provide shortcuts for common workflows.
user-invocable: false
---

# Bin Scripts

Custom shell scripts available on your PATH for common development workflows.

## Committing

| Script      | Usage                            | Purpose                                             |
| ----------- | -------------------------------- | --------------------------------------------------- |
| `git-save`  | `git save file1 file2 "message"` | Commit specific files with message                  |
| `git-save`  | `git save "message"`             | Commit all changes with message (`-a`)              |
| `git-amend` | `git amend`                      | Amend last commit, no edit (`-a --amend --no-edit`) |
| `git-empty` | `git empty`                      | Create empty commit                                 |

## Undoing

| Script        | Usage                | Purpose                                              |
| ------------- | -------------------- | ---------------------------------------------------- |
| `git-undo`    | `git undo`           | Soft reset to previous commit (keeps changes staged) |
| `git-abort`   | `git abort`          | Hard reset + clean untracked files (destructive)     |
| `git-restore` | `git restore <file>` | Restore file to state before last commit             |
| `git-unstash` | `git unstash`        | Pop stash                                            |

## History

| Script             | Usage              | Purpose                                                     |
| ------------------ | ------------------ | ----------------------------------------------------------- |
| `git-history`      | `git history`      | Pretty log with graph                                       |
| `git-tail`         | `git tail`         | Branches sorted by recent commit                            |
| `git-tree`         | `git tree`         | Full decorated graph (`--all --graph --decorate --oneline`) |
| `git-contributors` | `git contributors` | Commit counts by author                                     |

## Inspection

| Script          | Usage                | Purpose                                      |
| --------------- | -------------------- | -------------------------------------------- |
| `git-conflicts` | `git conflicts`      | List files with merge conflicts              |
| `git-grep`      | `git grep <pattern>` | Search tracked file names (case-insensitive) |
| `git-ignore`    | `git ignore <file>`  | Mark file as assume-unchanged                |
| `git-delete`    | `git delete <file>`  | Remove file from index (`rm --cached`)       |

## Syncing

| Script        | Usage         | Purpose                                           |
| ------------- | ------------- | ------------------------------------------------- |
| `git-sync`    | `git sync`    | Fetch, rebase on upstream default branch, cleanup |
| `git-tidy`    | `git tidy`    | Delete local branches merged/deleted on remote    |
| `git-publish` | `git publish` | Push with `-u origin <branch>`                    |

**Note:** `git-publish` pushes to remote. AI cannot execute push commands per workflow rules.

## Project Helpers

| Script    | Usage             | Purpose                                      |
| --------- | ----------------- | -------------------------------------------- |
| `artisan` | `artisan migrate` | Run Laravel artisan from any subdirectory    |
| `cpx`     | `cpx pint`        | Composer Package eXecuter (like npx for PHP) |

`cpx` searches for vendor/bin commands up the directory tree, falls back to composer scripts, then global composer bin.

## Utilities

| Script      | Usage                  | Purpose                                      |
| ----------- | ---------------------- | -------------------------------------------- |
| `killport`  | `killport 3000`        | Kill process listening on TCP port           |
| `concierge` | `concierge add mysite` | Manage local Caddy dev sites                 |
| `git-issue` | `git issue 123`        | Create branch from GitHub issue              |
| `brewdump`  | `brewdump`             | Interactive Homebrew cleanup + Brewfile dump |

**git-issue requirements:** Needs `DOTFILES_GITHUB_USERNAME` env var. Creates branch like `FEATURE-123` or `BUG-123` based on issue labels.

**concierge commands:** `add <name>`, `remove <name>`, `list`. Optional `--ip <addr>` for X-Forwarded-For testing.

**brewdump:** Reviews leaf packages interactively, marks items for removal, runs `brew autoremove`, then dumps Brewfile to `$DOTFILES/homebrew/bundle`. Use `--dry-run` to preview.

## Claude Internals

| Script   | Usage    | Purpose                                                              |
| -------- | -------- | -------------------------------------------------------------------- |
| `cpanel` | `cpanel` | TUI for everything in `~/.claude/` — browse, search, mine, and clean |

**cpanel:** React/Bun TUI for everything in `~/.claude/` — browse, search, mine, and clean. Requires `bun`.

Panels (in tab order): **Dashboard** (overview cards) · **Insights** (correction/pattern/stuck-loop/wasted-work miners with `s` to scaffold rules + skills) · **Conversations** (chat-rendered reader for every session) · **Live** (real-time monitor of running Claude Code sessions) · **Search** (ripgrep over all jsonls) · **Cost** ($ per day/project/session from token×rate) · **Digest** (daily activity rollup) · **Plans** · **Sessions** (with `r` to resume in a new terminal) · **Projects** · **Settings** (incl. backup restore) · **Cleanup**.

Config: `~/.config/cpanel/config.json`. Currently one option: `ignoreProjects: string[]` — path prefixes hidden from UI lists; aggregates still include them. Press `.` from any panel to toggle showing them temporarily.

Safety: all destructive actions go through a confirm dialog with the exact path + size before deleting.

## Per-cwd Process Runner

| Script | Usage               | Purpose                                                           |
| ------ | ------------------- | ----------------------------------------------------------------- |
| `solo` | `solo`              | Launch the TUI for the current directory                          |
| `solo` | `solo rekey [hash]` | Rename configs to match their `directory:` field (all if no hash) |

**solo:** React/Bun TUI on `@opentui/react` + `node-pty`. Each cwd has its own YAML at `~/.config/solo/<sha1(cwd)>.yaml`, listing the commands to run for that project — dev server, queue worker, log tail, etc. Tabbed UI: one tab per command, full-width output pane per tab, start/stop/restart/clear from the bottom bar. First run in a new directory opens the **Add command** wizard.

## tmux Session Management

| Script | Usage                       | Purpose                                            |
| ------ | --------------------------- | -------------------------------------------------- |
| `mux`  | `mux`                       | Create/attach session for CWD                      |
| `mux`  | `mux my-session`            | Override session name                              |
| `mux`  | `mux list`                  | List all registered sessions                       |
| `mux`  | `mux show [session:window]` | Show pane details (defaults to CWD)                |
| `mux`  | `mux copy session:window`   | Copy pane layout from source to CWD                |
| `mux`  | `mux tab <name> [path]`     | Create/switch to a named tab in current session    |
| `mux`  | `mux tab:show [session]`    | List tabs in a session (defaults to current)       |
| `mux`  | `mux tab:kill <name>`       | Remove a tab from registry (kills window if alive) |
| `mux`  | `mux tab:at <path>`         | Create a tab from a path; name = basename of path  |

Projects are grouped by parent directory (e.g. `~/Code/primcloud/platform` → session `primcloud`, window `platform`). Pane layouts and running commands are saved automatically and restored on next `mux`. Each session has a primary window (the project itself) plus any tabs the user adds — tabs persist across tmux restarts the same way panes do. Running `mux` from a subdirectory of an already-attached session opens a tab automatically instead of creating a new session.

## Not Documented

Scripts excluded from this skill (niche, interactive, or dangerous):

- `git-yolo`, `git-obliterate`, `git-rekt`, `git-squash` — Push or history rewriting
- `hiroshima`, `git-redate`, `git-repl`, `edit` — Niche or interactive
