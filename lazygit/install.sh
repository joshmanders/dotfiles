#!/usr/bin/env bash
#
# lazygit/install.sh - Lazygit setup
#
# This script sets up Lazygit configuration.
#
# What it does:
#   1. Symlinks config to ~/Library/Application Support/lazygit/config.yml

set -euo pipefail

DOTFILES="${DOTFILES:-$HOME/.files}"
source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Lazygit Setup ==="
echo ""

mkdir -p "$HOME/Library/Application Support/lazygit"
symlink "$DOTFILES/lazygit/config.yml" "$HOME/Library/Application Support/lazygit/config.yml"

echo ""
echo "Lazygit setup complete!"
