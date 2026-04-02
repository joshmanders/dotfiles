#!/usr/bin/env bash
#
# neovim/install.sh - Neovim setup
#
# This script sets up Neovim configuration.
#
# What it does:
#   1. Symlinks config to ~/.config/nvim
#
# Plugins are auto-installed on first nvim launch via lazy.nvim.
#
# Usage:
#   bash neovim/install.sh
#   bash neovim/install.sh --non-interactive --overwrite --allow

set -euo pipefail

DOTFILES="${DOTFILES:-$HOME/.files}"
source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Neovim Setup ==="
echo ""

if ! command -v nvim &>/dev/null; then
    echo "Skip: neovim not installed"
    exit 0
fi

symlink "$DOTFILES/neovim/config" "$HOME/.config/nvim"

echo ""
echo "Neovim setup complete!"
echo "Run 'nvim' to trigger plugin installation on first launch."
