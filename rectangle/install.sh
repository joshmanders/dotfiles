#!/usr/bin/env bash
#
# rectangle/install.sh - Rectangle window manager setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Rectangle Setup ==="
echo ""

run "Set Rectangle preferences" bash "$DOTFILES/rectangle/defaults.sh"

echo ""
echo "Rectangle setup complete!"
echo "Note: Restart Rectangle for changes to take effect"
