# Bin Scripts

Custom scripts for development workflows.

## Installation

Add to PATH via bash config (done automatically by `bash/install.sh`):

```bash
PATH="${PATH}:${DOTFILES}/bin"
```

## Scripts

### System Utilities

| Script      | Description                                            |
| ----------- | ------------------------------------------------------ |
| `concierge` | Manage local dev sites (Caddy/dnsmasq)                 |
| `artisan`   | Laravel artisan wrapper (finds artisan in parent dirs) |
| `cpx`       | Composer package executor (like npx for PHP)           |
| `brewdump`  | Interactive Homebrew cleaner and Brewfile generator    |
| `killport`  | Kill process on a specified port                       |
| `hiroshima` | Aggressive cleanup script                              |
| `edit`      | Open files/configs in editor                           |
| `checkout`  | Simplified git checkout helper                         |

### Git Workflow

#### Branching

| Script         | Description                     |
| -------------- | ------------------------------- |
| `git-feature`  | Create a feature branch         |
| `git-refactor` | Create a refactor branch        |
| `git-issue`    | Create branch from GitHub issue |
| `git-publish`  | Push and set upstream           |

#### Committing

| Script       | Description               |
| ------------ | ------------------------- |
| `git-save`   | Quick commit with message |
| `git-amend`  | Amend last commit         |
| `git-empty`  | Create empty commit       |
| `git-squash` | Squash commits            |

#### History

| Script             | Description          |
| ------------------ | -------------------- |
| `git-history`      | Pretty log output    |
| `git-tree`         | Tree view of commits |
| `git-tail`         | Recent commits       |
| `git-contributors` | List contributors    |

#### Undoing

| Script        | Description              |
| ------------- | ------------------------ |
| `git-undo`    | Undo last commit         |
| `git-restore` | Restore file from commit |
| `git-unstash` | Pop stash                |
| `git-abort`   | Abort merge/rebase       |

#### Cleanup

| Script           | Description              |
| ---------------- | ------------------------ |
| `git-delete`     | Delete branch            |
| `git-tidy`       | Clean up branches        |
| `git-obliterate` | Remove file from history |
| `git-rekt`       | Hard reset               |
| `git-yolo`       | Force push               |

#### Utilities

| Script          | Description                  |
| --------------- | ---------------------------- |
| `git-sync`      | Fetch and rebase on upstream |
| `git-conflicts` | Show merge conflicts         |
| `git-grep`      | Search in commits            |
| `git-ignore`    | Generate gitignore           |
| `git-io`        | Shorten GitHub URLs          |
| `git-redate`    | Change commit dates          |
| `git-repl`      | Interactive git shell        |
| `git-shortcut`  | Run git shortcuts            |
| `git-sus`       | Show suspicious changes      |

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
