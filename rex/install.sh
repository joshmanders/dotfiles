#!/usr/bin/env bash
#
# rex/install.sh - Rex terminal multiplexer setup
#
# What it does:
#   1. Symlinks init.lua to ~/.config/rex/init.lua
#   2. Writes app preferences (defaults.sh)
#
# Usage:
#   bash rex/install.sh
#   bash rex/install.sh --non-interactive --overwrite --allow

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Rex Setup ==="
echo ""

skip_unless "/Applications/Rex Beta.app" "Rex not installed" || {
    mkdir -p "$HOME/.config/rex"
    symlink "$DOTFILES/rex/init.lua" "$HOME/.config/rex/init.lua"

    run "Set Rex preferences" bash "$DOTFILES/rex/defaults.sh" \
        || echo "Warning: setting Rex preferences failed; run 'bash rex/install.sh' again" >&2

    echo ""
    echo "Rex setup complete!"
    echo "Note: Run 'rex config reload' in a Rex terminal to apply the config"
}
