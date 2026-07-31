#!/usr/bin/env bash
#
# neovim/install.sh - Neovim setup
#
# This script sets up Neovim configuration.
#
# What it does:
#   1. Symlinks config to ~/.config/nvim
#   2. Installs the Laravel language server globally via composer
#
# Plugins are auto-installed on first nvim launch via lazy.nvim.
#
# Usage:
#   bash neovim/install.sh
#   bash neovim/install.sh --non-interactive --overwrite --allow

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Neovim Setup ==="
echo ""

if ! command -v nvim &>/dev/null; then
    echo "Skip: neovim not installed"
    exit 0
fi

symlink "$DOTFILES/neovim/config" "$HOME/.config/nvim"

if command -v composer &>/dev/null; then
    run "Install Laravel language server" composer global require laravel/lsp
else
    echo "Skip laravel/lsp: composer not installed"
fi

echo ""
echo "Neovim setup complete!"
echo "Run 'nvim' to trigger plugin installation on first launch."
