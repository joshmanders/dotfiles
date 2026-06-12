#!/usr/bin/env bash
#
# macos/install.sh - macOS system preferences setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

# Only run on macOS
if [[ "$(uname)" != "Darwin" ]]; then
    echo "Skip: macOS defaults (not on macOS)"
    exit 0
fi

echo ""
echo "=== macOS Defaults ==="
echo ""

run "Apply macOS system preferences" bash "$DOTFILES/macos/defaults.sh"

echo ""
echo "macOS defaults applied!"
