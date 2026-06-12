#!/usr/bin/env bash
#
# git/install.sh - Git setup
#
# This script sets up git configuration with SSH signing.
# Can be run standalone or sourced from the main install.sh.
#
# What it does:
#   1. Symlinks git/config to ~/.gitconfig
#   2. Symlinks git/ignore to ~/.gitignore
#   3. Sets user.name and user.email from config.sh
#   4. Sets core.editor from config.sh
#
# Note: SSH key generation and signing setup is handled by ssh/install.sh
#
# Usage:
#   bash git/install.sh
#   bash git/install.sh --non-interactive --overwrite

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Git Setup ==="
echo ""

# Create symlinks
symlink "$DOTFILES/git/config" "$HOME/.gitconfig"
symlink "$DOTFILES/git/ignore" "$HOME/.gitignore"

# Set user info from config
GIT_NAME="${DOTFILES_NAME:-}"
GIT_EMAIL="${DOTFILES_EMAIL:-}"
GIT_EDITOR="${DOTFILES_EDITOR:-nvim}"

if [[ -n "$GIT_NAME" ]]; then
    git config --global user.name "$GIT_NAME"
    echo "Set: user.name = $GIT_NAME"
else
    echo "Skip: user.name (DOTFILES_NAME not set)"
fi

if [[ -n "$GIT_EMAIL" ]]; then
    git config --global user.email "$GIT_EMAIL"
    echo "Set: user.email = $GIT_EMAIL"
else
    echo "Skip: user.email (DOTFILES_EMAIL not set)"
fi

git config --global core.editor "$GIT_EDITOR"
echo "Set: core.editor = $GIT_EDITOR"

echo ""
echo "Git setup complete!"
echo ""
echo "Note: Commit signing uses SSH keys (see ssh/install.sh)"
