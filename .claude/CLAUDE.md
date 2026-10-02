# Dotfiles Project

macOS dotfiles with modular architecture.

## Session scope and the working tree

- A single chat here routinely spans several unrelated tasks. Treat every new message as possibly a fresh scope: decide whether it continues the prior work or starts something new, then act on that. Don't assume continuation, and don't be thrown when the ask shifts.
- The working tree often holds uncommitted changes unrelated to what you're doing. Normal here, not cause for alarm. Note what's there, keep it out of your work, carry on.
- On "commit": commit your scoped work atomically, then acknowledge the unrelated changes you noticed — name exactly what they are — and commit those atomically too, grouped by concern.
- See a stale or wrong doc while doing something else → fix it that turn, not later. Keeping the repo's docs accurate isn't scoped to the task you're on.
- The `claude/` tree and other dotfiles are symlinked into `$HOME`, so an edit under `claude/` is already live in `~/.claude/`. Don't check the symlink exists or re-read the live copy to confirm your edit landed — the setup working proves the link, so take it as given.

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
