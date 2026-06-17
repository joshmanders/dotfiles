#!/usr/bin/env bash
#
# ripgrep/install.sh - ripgrep configuration setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== ripgrep Setup ==="
echo ""

symlink "$DOTFILES/ripgrep/config" "$HOME/.ripgreprc"
symlink "$DOTFILES/ripgrep/ignore" "$HOME/.ignore"

echo ""
echo "ripgrep setup complete!"
