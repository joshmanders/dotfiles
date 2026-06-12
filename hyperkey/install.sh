#!/usr/bin/env bash
#
# hyperkey/install.sh - Hyperkey caps lock remapping setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Hyperkey Setup ==="
echo ""

run "Set Hyperkey preferences" bash "$DOTFILES/hyperkey/defaults.sh"

echo ""
echo "Hyperkey setup complete!"
echo "Note: Restart Hyperkey for changes to take effect"
