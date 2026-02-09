---
name: bin-scripts
description: Use when performing git operations, running Laravel/Composer commands, managing local dev sites, or killing processes on ports. Custom scripts in ~/.files/bin/ provide shortcuts for common workflows.
user-invocable: false
---

# Bin Scripts

Custom shell scripts in `~/.files/bin/` for common development workflows.

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

## Not Documented

Scripts excluded from this skill (niche, interactive, or dangerous):

- `git-yolo`, `git-obliterate`, `git-rekt`, `git-squash` — Push or history rewriting
- `hiroshima`, `git-redate`, `git-repl`, `edit` — Niche or interactive
