---
name: adding-modules
description: Use when adding new modules, configs, or tools to dotfiles
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
3. Add `install.sh` if needed:
   - Source `lib/index.sh`
   - Use `run` for commands
   - Use `symlink` for config files
4. Add packages to `homebrew/bundle` if needed
5. Update root `README.md`:
   - Add to "What's Included" if major feature
   - Add to "Directory Structure"
   - Add link to Documentation section
6. If new config option:
   - Add to `config.sh.example` with comment
   - Add to `bash/exports.sh` to export it
   - Update `lib/README.md` if new lib function
