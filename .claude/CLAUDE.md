# Dotfiles Project

macOS dotfiles with modular architecture.

## Structure

Each module in its own directory with:

- `README.md` - Documentation
- `install.sh` - Installer (optional)
- Config files

## Key Patterns

### Configuration

- `config.sh.example` - Template with defaults
- `config.sh` - User's personal config (gitignored)
- Empty value = required, value with default = optional

### Installer Utilities (lib/)

| Function           | Usage                                               | Description                          |
| ------------------ | --------------------------------------------------- | ------------------------------------ |
| `symlink src dest` | `symlink "$DOTFILES/git/config" "$HOME/.gitconfig"` | Smart symlink with conflict handling |
| `run "msg" cmd...` | `run "Install packages" brew install foo`           | Run with confirmation (interactive)  |
| `env_get VAR`      | `env_get DOTFILES_GIT_EMAIL`                        | Get config value (empty if unset)    |
| `env_require VAR`  | `env_require DOTFILES_GIT_EMAIL`                    | Get config value (error if unset)    |
| `ensure_config`    | Called in main install.sh                           | Interactive config wizard            |

### Installer Flags

| Flag                | Variable            | Effect                      |
| ------------------- | ------------------- | --------------------------- |
| `--non-interactive` | `NON_INTERACTIVE=1` | No prompts, use defaults    |
| `--overwrite`       | `OVERWRITE=1`       | Replace existing files      |
| `--skip`            | `SKIP=1`            | Skip conflicts              |
| `--allow`           | `ALLOW=1`           | Auto-approve `run` commands |
| `--deny`            | `DENY=1`            | Auto-skip `run` commands    |

### Install Script Template

```bash
#!/usr/bin/env bash
# Module description
set -euo pipefail

source "$DOTFILES/lib/index.sh"

# Check dependencies (optional)
if ! command -v sometool &>/dev/null; then
    echo "Skip: sometool not installed"
    exit 0
fi

# Symlink config files
symlink "$DOTFILES/module/config" "$HOME/.config"

# Run commands that need confirmation
run "Set up something" some-command --flag
```

### Adding New Modules

1. Create directory: `mymodule/`
2. Add `README.md` with documentation
3. Add `install.sh` if needed (source lib/index.sh)
4. Add to homebrew/bundle if packages needed
5. Update root README.md

### Conventions

- Use `set -euo pipefail` in scripts
- Use `brew --prefix` not hardcoded paths
- Config vars prefixed with `DOTFILES_`

### GitHub CLI Commands

Always use the `GH_TOKEN` pattern to ensure commands run as the correct user:

```bash
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") gh <command>
```

This overrides the default `gh` auth (which may be a bot account) with the user's personal account.

### Bin Script Maintenance

When creating, modifying, or deleting bin scripts in `bin/`:

- Update the `bin-scripts` skill if the script is relevant for AI assistance
- Scripts that are safe, commonly useful, and don't violate workflow rules should be documented
- Remove deleted scripts from the skill
