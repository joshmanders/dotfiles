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

- `run "msg" cmd` - Run command with status
- `symlink source dest` - Safe symlink with conflict handling
- `ensure_config` - First-time setup wizard

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
