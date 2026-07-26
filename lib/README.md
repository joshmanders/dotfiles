# Library Utilities

Shared utilities for dotfiles install scripts.

## Usage

Source `index.sh` in your install script to get access to all utilities:

```bash
#!/usr/bin/env bash
source "$DOTFILES/lib/index.sh"

symlink "$DOTFILES/bash/bashrc" "$HOME/.bashrc"
run "Set default shell" chsh -s /opt/homebrew/bin/bash
```

## Functions

### `symlink <source> <destination>`

Creates a symlink with conflict detection and resolution.

**Behavior:**

- Destination doesn't exist: creates symlink
- Destination is symlink to same source: skips (already correct)
- Destination exists (file or different symlink): prompts or uses flags

### `run <description> <command...>`

Wraps commands that modify the environment with confirmation prompts.

**Behavior:**

- Shows the command and description
- In interactive mode: prompts "Run? [y/n]"
- In non-interactive mode: uses `--allow` or `--deny` flags

### `env_get <var> [default]`

Gets an environment variable with a default fallback.

```bash
email=$(env_get "DOTFILES_EMAIL" "default@example.com")
```

### `env_require <var> <prompt> [default]`

Requires an environment variable. If not set, prompts the user interactively (or exits in non-interactive mode). Saves the value to config.sh.

```bash
env_require "DOTFILES_NAME" "Your name" "John Doe"  # With default
env_require "DOTFILES_EMAIL" "Your email"            # Without default
```

### `ensure_config`

Checks that `config.sh` exists. Prompts to create it if missing.

```bash
ensure_config
```

### `load_install_hooks [module_dir]`

Sources every `*.sh` in a module's `install.d/` directory, in lexical order. With no argument it uses the directory of the calling script, so a module's installer can just call it.

```bash
load_install_hooks                    # <caller's directory>/install.d
load_install_hooks "$DOTFILES/claude" # explicit
```

**Behavior:**

- Hooks are sourced, not executed, so their exports survive into the rest of the installer
- A missing or empty `install.d/` is a silent no-op
- A hook that fails aborts, since later steps depend on what it exported

Use it for values that must be computed at install time rather than committed — file contents pulled into a generated config, machine-specific paths, anything derived from elsewhere in the repo. `claude/install.d/claim-check-prompt.sh` is the worked example: it reads a markdown file and exports it JSON-escaped for the settings template.

## Configuration

Personal settings are stored in `config.sh` (gitignored).

1. Copy the example: `cp config.sh.example config.sh`
2. Edit with your values: `$EDITOR config.sh`

Available variables:

| Variable          | Used For             |
| ----------------- | -------------------- |
| `DOTFILES_NAME`   | Git commits          |
| `DOTFILES_EMAIL`  | Git commits, SSH key |
| `DOTFILES_EDITOR` | Default editor       |
| `DOTFILES_TZ`     | Timezone             |

## Flags

Pass these flags to any install script:

| Flag                | Description                 |
| ------------------- | --------------------------- |
| `--non-interactive` | Disable all prompts         |
| `--overwrite`       | Overwrite symlink conflicts |
| `--skip`            | Skip symlink conflicts      |
| `--allow`           | Run all commands            |
| `--deny`            | Skip all commands           |

## Examples

```bash
# Interactive mode (default) - prompts for everything
bash install.sh

# Non-interactive, skip conflicts and commands (safe, does nothing)
bash install.sh --non-interactive

# Non-interactive, skip conflicts but run commands
bash install.sh --non-interactive --skip --allow

# Non-interactive, overwrite everything and run everything
bash install.sh --non-interactive --overwrite --allow

# Run a single module with flags
bash homebrew/install.sh --non-interactive --allow
```

## Files

- `index.sh` - Entry point, sources all other files
- `flags.sh` - Parses command-line flags
- `env.sh` - Environment variable helpers
- `symlink.sh` - Symlink creation with conflict handling
- `run.sh` - Command wrapper with confirmation prompts
