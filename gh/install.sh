#!/usr/bin/env bash
#
# gh/install.sh - GitHub CLI configuration setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== GitHub CLI Setup ==="
echo ""

mkdir -p "$HOME/.config/gh"
symlink "$DOTFILES/gh/config.yml" "$HOME/.config/gh/config.yml"

echo ""
echo "GitHub CLI setup complete!"
echo "Note: Run 'gh auth login' to authenticate"
