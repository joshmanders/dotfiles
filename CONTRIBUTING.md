# Contributing

Contributions welcome! This project uses a modular architecture.

## Adding a Module

1. Create directory: `mymodule/`
2. Add `README.md` with documentation
3. Add `install.sh` if needed (source `lib/index.sh`)
4. Add packages to `homebrew/bundle` if needed
5. Update root `README.md`

## Script Conventions

- Use `set -euo pipefail`
- Use `$(brew --prefix)` not hardcoded paths
- Prefix config vars with `DOTFILES_`
- Use lib utilities: `run`, `symlink`, `ensure_config`

## Commits

Use descriptive commit messages with a type prefix:

`add`, `fix`, `remove`, `refactor`, `docs`, `test`

Example: `add: zsh support`

## Pull Requests

1. Fork the repo
2. Create a branch
3. Make changes
4. Test with `bash install.sh`
5. Submit PR with descriptive title and body
