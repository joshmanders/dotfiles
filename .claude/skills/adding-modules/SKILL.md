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
4. If the module has an `install.sh`, register it in root `install.sh`, which runs only the modules it sources:
   - Add `source "$DOTFILES/modulename/install.sh"` among the `source` lines, positioned per the "Order matters" comment above them
   - Add `bash modulename/install.sh` to the "Modules" list in the header comment, in the same position
5. Add packages to `homebrew/bundle` if needed
6. Update root `README.md`:
   - Add to "What's Included" if major feature
   - Add to "Directory Structure"
   - Add to "Module-specific Installation", in the same position as in root `install.sh`
   - Add link to Documentation section
7. If new config option:
   - Add to `config.sh.example` with comment
   - Add to `bash/exports.sh` to export it
   - Update `lib/README.md` if new lib function

## Install Script Template

```bash
#!/usr/bin/env bash
# What this module does
set -euo pipefail

source "$DOTFILES/lib/index.sh"

# Check dependencies (optional)
skip_unless sometool "sometool not installed" || {
    symlink "$DOTFILES/mymodule/config" "$HOME/.myconfig"
}
```

The main `install.sh` sources each module, so `exit` in a module ends the whole install and skips every module after it. Guard dependent work with `skip_unless <requirement> <message> || { ... }`: it prints `Skip: <message>` and skips the block when the requirement is missing. Keep `exit 1` for errors that should stop the install.

- A command: `skip_unless sometool "sometool not installed" || {`
- An app or other path (contains a slash): `skip_unless "/Applications/Some.app" "Some not installed" || {`
- Two requirements: `skip_unless brew "Homebrew not installed" || skip_unless php "php not installed" || {`
- The message is always `<X> not installed`, naming only the missing requirement; the helper prefixes `Skip: `
- Anything else (OS, "already installed", a config directory): plain `if`/`else` with `echo "Skip: ..."`

`lib/skip.sh` holds the full contract.

## Testing

```bash
# Test standalone
bash mymodule/install.sh --non-interactive --overwrite --allow

# Test via main installer
bash install.sh --non-interactive --overwrite --allow
```

## Reference Modules

Look at these for patterns:

- `git/install.sh` — Config + run commands
- `bash/install.sh` — Multiple symlinks
- `npm/install.sh` — Simple symlink only
- `ssh/install.sh` — Permissions + config generation
