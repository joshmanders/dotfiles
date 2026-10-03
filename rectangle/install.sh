#!/usr/bin/env bash
#
# rectangle/install.sh - Rectangle window manager setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Rectangle Setup ==="
echo ""

skip_unless "/Applications/Rectangle.app" "Rectangle not installed" || {
    run "Set Rectangle preferences" bash "$DOTFILES/rectangle/defaults.sh" \
        || echo "Warning: setting Rectangle preferences failed; run 'bash rectangle/install.sh' again" >&2

    echo ""
    echo "Rectangle setup complete!"
    echo "Note: Restart Rectangle for changes to take effect"
}
