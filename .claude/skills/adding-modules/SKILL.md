---
name: adding-modules
description: Use when adding new modules, configs, or tools to dotfiles
user-invocable: false
---

# Adding Dotfiles Modules

## When This Applies

Use this skill when:

- Adding a new tool/config to dotfiles
- Creating a new module directory
- Adding new config options

## Checklist

1. Create module directory: `modulename/`
2. Add `README.md` with:
   - Purpose description
   - Files table
   - Installation command
   - Configuration overview
   - Customization section
3. Add `install.sh` if needed (see template below)
4. Add packages to `homebrew/bundle` if needed
5. Update root `README.md`:
   - Add to "What's Included" if major feature
   - Add to "Directory Structure"
   - Add link to Documentation section
6. If new config option:
   - Add to `config.sh.example` with comment
   - Add to `bash/exports.sh` to export it
   - Update `lib/README.md` if new lib function

## Install Script Template

```bash
#!/usr/bin/env bash
# What this module does
set -euo pipefail

DOTFILES="${DOTFILES:-$HOME/.files}"
source "$DOTFILES/lib/index.sh"

# Check dependencies (optional)
if ! command -v sometool &>/dev/null; then
    echo "Skip: sometool not installed"
    exit 0
fi

symlink "$DOTFILES/mymodule/config" "$HOME/.myconfig"
```

## Testing

```bash
# Test standalone
bash mymodule/install.sh --non-interactive --overwrite --allow

# Test via main installer
./install.sh --non-interactive --overwrite --allow
```

## Reference Modules

Look at these for patterns:

- `git/install.sh` — Config + run commands
- `bash/install.sh` — Multiple symlinks
- `npm/install.sh` — Simple symlink only
- `ssh/install.sh` — Permissions + config generation
