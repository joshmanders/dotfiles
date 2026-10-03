# Library Utilities

Shared utilities for dotfiles install scripts.

## Usage

Source `index.sh` in your install script to get access to all utilities:

```bash
#!/usr/bin/env bash
source "$DOTFILES/lib/index.sh"

symlink "$DOTFILES/bash/bashrc" "$HOME/.bashrc"
run "Set default shell" chsh -s "$(brew --prefix)/bin/bash"
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

### `hold_sudo`

Asks for the sudo password once and keeps it alive until the calling script exits. The main `install.sh` calls it before the first module; modules call `sudo` themselves and never depend on it, so a module run on its own just gets sudo's usual prompt.

**Behavior:**

- Non-interactive without `--allow`: does nothing, since no command runs
- Credentials already cached: no prompt
- Otherwise: says why, then prompts with `sudo -v`
- Prompt fails or is cancelled: prints a warning and carries on, so steps that need root prompt or fail on their own
- A background loop refreshes the credentials with `sudo -n -v` every 60 seconds, never prompts, and stops when the script exits

### `skip_unless <requirement> <message>`

Guards work that needs a command or an app. When the requirement is missing it prints `Skip: <message>` and the block after `||` is skipped; when it is present it prints nothing and the block runs.

```bash
skip_unless brew "Homebrew not installed" || {
    symlink "$DOTFILES/caddy/Caddyfile" "$(brew --prefix)/etc/Caddyfile"
}

skip_unless "/Applications/Rectangle.app" "Rectangle not installed" || {
    run "Set Rectangle preferences" bash "$DOTFILES/rectangle/defaults.sh"
}

# Two requirements: chain the calls, the block follows the last one
skip_unless brew "Homebrew not installed" \
    || skip_unless php "php not installed" || {
    run "Install global Composer tools" composer global require laravel/pint
}
```

**Behavior:**

- A requirement without a slash is a command name, checked with `command -v`
- A requirement with a slash is a path, checked with `-e`
- Returns 0 when it skipped and 1 when the requirement is present
- The message is `<X> not installed`, where X names the missing requirement; one call per requirement, each with its own message
- Never calls `exit`: the main `install.sh` sources each module, so `exit` in a module ends the whole install and skips every module after it
- `set -e` still applies inside the block, so a failing command there aborts the install
- Any other condition (the OS, "already installed", a login item, a config directory) stays a plain `if` in the module

## Configuration

Personal settings are stored in `config.sh` (gitignored).

1. Copy the example: `cp config.sh.example config.sh`
2. Edit with your values: `$EDITOR config.sh`

Available variables:

| Variable                          | Used For                                    |
| --------------------------------- | ------------------------------------------- |
| `DOTFILES_NAME`                   | Git commits                                 |
| `DOTFILES_EMAIL`                  | Git commits, SSH key                        |
| `DOTFILES_GITHUB_USERNAME`        | Scoped gh cli actions                       |
| `DOTFILES_EDITOR`                 | Editor                                      |
| `DOTFILES_HOMEBREW_NO_AUTOUPDATE` | Disable Homebrew auto-update (1 = disabled) |
| `DOTFILES_HISTSIZE`               | Shell history size                          |
| `DOTFILES_NPM_TOKEN`              | npm registry auth token                     |
| `DOTFILES_GITHUB_NPM_TOKEN`       | GitHub npm package registry auth token      |
| `DOTFILES_PRIMCLOUD_DIR`          | Primcloud projects directory                |

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
- `install_hooks.sh` - Loader for a module's `install.d/` hooks
- `sudo.sh` - One sudo prompt held for the whole run
- `skip.sh` - Guard for work that needs a command or an app
