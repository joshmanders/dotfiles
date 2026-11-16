# Dotfiles Project

macOS dotfiles with modular architecture.

## Session scope and the working tree

- A single chat here routinely spans several unrelated tasks. Treat every new message as possibly a fresh scope; don't assume it continues the prior work.
- The working tree often holds unrelated uncommitted changes. That's normal; keep them out of your work.
- On "commit": commit your scoped work atomically, then acknowledge the unrelated changes you noticed — name exactly what they are — and commit those atomically too, grouped by concern.
- The `claude/` tree and other dotfiles are symlinked into `$HOME`, so an edit under `claude/` is already live in `~/.claude/`. Don't check the symlink or re-read the live copy.

## Key Patterns

### Configuration

- `config.sh.example` - Template with defaults
- `config.sh` - User's personal config (gitignored)
- Empty value = required, value with default = optional

### Installer Reference

Read these before writing an install script:

- `lib/README.md` - Helper function signatures and behavior (`symlink`, `run`, `env_get`, `env_require`, `ensure_config`, `load_install_hooks`)
- `lib/flags.sh` - Installer flags and the `DOTFILES_*` variables they export

### Conventions

- Use `set -euo pipefail` in scripts
- Use `$(brew --prefix)` not hardcoded paths
- Config vars prefixed with `DOTFILES_`
