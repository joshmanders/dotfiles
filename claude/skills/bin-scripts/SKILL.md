---
name: bin-scripts
description: Use when performing git operations, running Laravel/Composer commands, managing local dev sites, running per-project processes, or killing processes on ports. Custom PATH scripts shortcut these workflows.
user-invocable: false
---

# Bin Scripts

Custom scripts on PATH.

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

`git-publish` pushes, so AI doesn't run it.

## Project Helpers

| Script    | Usage             | Purpose                                      |
| --------- | ----------------- | -------------------------------------------- |
| `artisan` | `artisan migrate` | Run Laravel artisan from any subdirectory    |
| `cpx`     | `cpx pint`        | Composer Package eXecuter (like npx for PHP) |

`cpx` looks for vendor/bin commands up the tree, then composer scripts, then global composer bin.

## Utilities

| Script      | Usage                  | Purpose                            |
| ----------- | ---------------------- | ---------------------------------- |
| `killport`  | `killport 3000`        | Kill process listening on TCP port |
| `concierge` | `concierge add mysite` | Manage local Caddy dev sites       |
| `git-issue` | `git issue 123`        | Create branch from GitHub issue    |

- `git-issue` needs `DOTFILES_GITHUB_USERNAME`; names the branch `FEATURE-123` or `BUG-123` from issue labels.
- `concierge`: `add <name>`, `remove <name>`, `list`; `--ip <addr>` for X-Forwarded-For testing.

## Per-cwd Process Runner

| Script | Usage               | Purpose                                                           |
| ------ | ------------------- | ----------------------------------------------------------------- |
| `solo` | `solo`              | Launch the TUI for the current directory                          |
| `solo` | `solo rekey [hash]` | Rename configs to match their `directory:` field (all if no hash) |

TUI (Bun, `@opentui/react` + `node-pty`). Each cwd's commands (dev server, queue worker, log tail…) live in `~/.config/solo/<sha1(cwd)>.yaml`. One tab per command with start/stop/restart/clear; first run in a new directory opens the **Add command** wizard.

## Not Documented

Excluded on purpose:

- `git-yolo`, `git-obliterate`, `git-rekt`, `git-squash`: push or history rewriting
- `hiroshima`, `git-redate`, `git-repl`, `edit`: niche or interactive
