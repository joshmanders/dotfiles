#!/usr/bin/env bash
#
# npm/install.sh - npm configuration setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== npm Setup ==="
echo ""

skip_unless npm "npm not installed" || {
    symlink "$DOTFILES/npm/npmrc" "$HOME/.npmrc"

    echo ""
    echo "npm setup complete!"
    echo "Note: Run 'npm login' to add auth tokens"
}
