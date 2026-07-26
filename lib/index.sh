#!/usr/bin/env bash
#
# index.sh - Entry point for dotfiles library utilities
#
# This script sources all library files in the correct order.
# Source this file from install scripts to get access to all utilities.
#
# Usage:
#   source "$DOTFILES/lib/index.sh"
#
# DOTFILES must be set in the environment before sourcing — bashrc sets it for
# any interactive (or BASH_ENV-loaded) shell, and the main install.sh sets it
# from its own script location.
#
# After sourcing, you have access to:
#   - symlink <source> <destination>  Create symlinks with conflict handling
#   - run <description> <command...>  Run commands with confirmation
#   - env_get <var> [default]         Get config variable with fallback
#   - env_require <var> <prompt> [default]  Require config, prompt if missing
#   - ensure_config                   Check config.sh exists
#   - load_install_hooks [module_dir] Source a module's install.d/*.sh
#
# Flags (passed to script or set via environment):
#   --non-interactive  Disable all prompts
#   --overwrite        Overwrite symlink conflicts (non-interactive)
#   --skip             Skip symlink conflicts (non-interactive)
#   --allow            Run all commands (non-interactive)
#   --deny             Skip all commands (non-interactive)
#
# Examples:
#   ./install.sh                                    # Interactive
#   ./install.sh --non-interactive --skip --deny    # Skip everything
#   ./install.sh --non-interactive --overwrite --allow  # Do everything

# Source utilities in order
source "$DOTFILES/lib/flags.sh"
source "$DOTFILES/lib/env.sh"
source "$DOTFILES/lib/symlink.sh"
source "$DOTFILES/lib/run.sh"
source "$DOTFILES/lib/install_hooks.sh"

# Source user config if it exists
if [[ -f "$DOTFILES/config.sh" ]]; then
    source "$DOTFILES/config.sh"
fi
