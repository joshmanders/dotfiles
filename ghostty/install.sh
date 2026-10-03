#!/usr/bin/env bash
#
# ghostty/install.sh - Ghostty terminal setup
#
# This script sets up Ghostty terminal configuration.
#
# What it does:
#   1. Symlinks config to ~/.config/ghostty/config

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Ghostty Setup ==="
echo ""

skip_unless "/Applications/Ghostty.app" "Ghostty not installed" || {
    mkdir -p "$HOME/.config/ghostty"
    symlink "$DOTFILES/ghostty/config" "$HOME/.config/ghostty/config"

    echo ""
    echo "Ghostty setup complete!"
}
