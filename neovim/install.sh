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

skip_unless nvim "neovim not installed" || {
    symlink "$DOTFILES/neovim/config" "$HOME/.config/nvim"

    skip_unless composer "composer not installed" || {
        run "Install Laravel language server" composer global require laravel/lsp
    }

    echo ""
    echo "Neovim setup complete!"
    echo "Run 'nvim' to trigger plugin installation on first launch."
}
