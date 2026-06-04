# Bin Scripts

Custom scripts for development workflows.

## Installation

Add to PATH via bash config (done automatically by `bash/install.sh`):

```bash
PATH="${PATH}:${DOTFILES}/bin"
```

## Scripts

### System Utilities

| Script      | Description                                                                                |
| ----------- | ------------------------------------------------------------------------------------------ |
| `concierge` | Manage local dev sites (Caddy/dnsmasq)                                                     |
| `artisan`   | Laravel artisan wrapper (finds artisan in parent dirs)                                     |
| `cpx`       | Composer package executor (like npx for PHP)                                               |
| `brewdump`  | Interactive Homebrew cleaner and Brewfile generator                                        |
| `killport`  | Kill process on a specified port                                                           |
| `hiroshima` | Nuke all Docker containers and prune system                                                |
| `edit`      | Open files/configs in editor                                                               |
| `mux`       | tmux session orchestrator (CWD-aware)                                                      |
| `cpanel`    | Claude Panel TUI for `~/.claude/` (Bun/React; see [cpanel/README.md](../cpanel/README.md)) |
| `solo`      | Per-cwd process-runner TUI (Bun/React; see [solo/README.md](../solo/README.md))            |

### Git Workflow

#### Branching

| Script        | Description                     |
| ------------- | ------------------------------- |
| `git-issue`   | Create branch from GitHub issue |
| `git-publish` | Push and set upstream           |

#### Committing

| Script       | Description                                |
| ------------ | ------------------------------------------ |
| `git-save`   | Commit files with message                  |
| `git-amend`  | Amend last commit (`-a --amend --no-edit`) |
| `git-empty`  | Create empty commit                        |
| `git-squash` | Interactive rebase to squash commits       |

#### History

| Script             | Description                         |
| ------------------ | ----------------------------------- |
| `git-history`      | Pretty log with graph               |
| `git-tree`         | Full decorated graph (all branches) |
| `git-tail`         | Branches sorted by recent commit    |
| `git-contributors` | Commit counts by author             |

#### Undoing

| Script        | Description                               |
| ------------- | ----------------------------------------- |
| `git-undo`    | Soft reset to previous commit             |
| `git-restore` | Restore file to state before last commit  |
| `git-unstash` | Pop stash                                 |
| `git-abort`   | Hard reset HEAD and clean untracked files |

#### Cleanup

| Script           | Description                            |
| ---------------- | -------------------------------------- |
| `git-delete`     | Remove file from index (`rm --cached`) |
| `git-tidy`       | Delete stale local branches            |
| `git-obliterate` | Remove file from entire git history    |
| `git-rekt`       | Alias for git-obliterate               |
| `git-yolo`       | Commit with random message and push    |

#### Utilities

| Script          | Description                        |
| --------------- | ---------------------------------- |
| `git-sync`      | Fetch, rebase on upstream, cleanup |
| `git-conflicts` | List files with merge conflicts    |
| `git-grep`      | Search tracked file names          |
| `git-ignore`    | Mark file as assume-unchanged      |
| `git-redate`    | Commit with custom date            |
| `git-repl`      | Interactive git command shell      |
| `git-sus`       | Show commits in date range by user |

## Adding Scripts

1. Create script in `bin/`:

   ```bash
   #!/usr/bin/env bash
   # Description of what this does
   ...
   ```

2. Make executable:

   ```bash
   chmod +x bin/my-script
   ```

3. For git subcommands, prefix with `git-`:

   ```bash
   # bin/git-mycommand
   # Now callable as: git mycommand
   ```

4. Update the `bin-scripts` skill if the script is useful for AI assistance.

## Concierge

The `concierge` command manages local development sites:

```bash
# Add current project
concierge add

# Add with custom name
concierge add mysite

# Add specific path
concierge add mysite ~/Code/project

# List sites
concierge list

# Remove site
concierge remove mysite
```

See `caddy/README.md` for more details.
