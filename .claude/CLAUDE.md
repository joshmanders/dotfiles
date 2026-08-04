# Dotfiles Project

macOS dotfiles with modular architecture.

## Key Patterns

### Configuration

- `config.sh.example` - Template with defaults
- `config.sh` - User's personal config (gitignored)
- Empty value = required, value with default = optional

### Installer Reference

Read these before writing an install script — don't work from memory:

- `lib/README.md` - Helper function signatures and behavior (`symlink`, `run`, `env_get`, `env_require`, `ensure_config`, `load_install_hooks`)
- `lib/flags.sh` - Installer flags and the `DOTFILES_*` variables they export

### Conventions

- Use `set -euo pipefail` in scripts
- Use `$(brew --prefix)` not hardcoded paths
- Config vars prefixed with `DOTFILES_`

### GitHub CLI Commands

Always use the `GH_TOKEN` pattern to ensure commands run as the correct user:

```bash
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") gh <command>
```

This overrides the default `gh` auth (which may be a bot account) with the user's personal account.
