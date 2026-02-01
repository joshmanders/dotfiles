#!/usr/bin/env bash
#
# npm/install.sh - npm configuration setup

set -euo pipefail

DOTFILES="${DOTFILES:-$HOME/.files}"
source "$DOTFILES/lib/index.sh"

echo ""
echo "=== npm Setup ==="
echo ""

symlink "$DOTFILES/npm/npmrc" "$HOME/.npmrc"

echo ""
echo "npm setup complete!"
echo "Note: Run 'npm login' to add auth tokens"
