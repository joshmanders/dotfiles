#!/usr/bin/env bash
#
# hyperkey/install.sh - Hyperkey caps lock remapping setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Hyperkey Setup ==="
echo ""

skip_unless "/Applications/Hyperkey.app" "Hyperkey not installed" || {
    run "Set Hyperkey preferences" bash "$DOTFILES/hyperkey/defaults.sh" \
        || echo "Warning: setting Hyperkey preferences failed; run 'bash hyperkey/install.sh' again" >&2

    echo ""
    echo "Hyperkey setup complete!"
    echo "Note: Restart Hyperkey for changes to take effect"
}
