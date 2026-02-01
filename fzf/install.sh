#!/usr/bin/env bash
#
# fzf/install.sh - fzf fuzzy finder setup

set -euo pipefail

DOTFILES="${DOTFILES:-$HOME/.files}"
source "$DOTFILES/lib/index.sh"

echo ""
echo "=== fzf Setup ==="
echo ""

# Run fzf install script for keybindings
if [[ -f "$(brew --prefix)/opt/fzf/install" ]]; then
    run "Install fzf keybindings" "$(brew --prefix)/opt/fzf/install" --key-bindings --completion --no-update-rc
fi

echo ""
echo "fzf setup complete!"
