#!/usr/bin/env bash
#
# index.sh - Entry point for dotfiles library utilities
#
# This script sources all library files in the correct order.
# Source this file from install scripts to get access to all utilities.
#
# Usage:
#   DOTFILES="${DOTFILES:-$HOME/.files}"
#   source "$DOTFILES/lib/index.sh"
#
# After sourcing, you have access to:
#   - symlink <source> <destination>  Create symlinks with conflict handling
#   - run <description> <command...>  Run commands with confirmation
#   - env_get <var> [default]         Get config variable with fallback
#   - env_require <var> <prompt> [default]  Require config, prompt if missing
#   - ensure_config                   Check config.sh exists
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

# Determine DOTFILES location if not set
DOTFILES="${DOTFILES:-$HOME/.files}"

# Source utilities in order
source "$DOTFILES/lib/flags.sh"
source "$DOTFILES/lib/env.sh"
source "$DOTFILES/lib/symlink.sh"
source "$DOTFILES/lib/run.sh"

# Source user config if it exists
if [[ -f "$DOTFILES/config.sh" ]]; then
    source "$DOTFILES/config.sh"
fi
