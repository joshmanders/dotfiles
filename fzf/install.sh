#!/usr/bin/env bash
#
# fzf/install.sh - fzf fuzzy finder setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== fzf Setup ==="
echo ""

# Run fzf install script for keybindings
skip_unless brew "Homebrew not installed" \
    || skip_unless fzf "fzf not installed" || {
    if [[ ! -f "${HOME}/.fzf.bash" ]]; then
        run "Install fzf keybindings" \
            "$(brew --prefix)/opt/fzf/install" --key-bindings --completion --no-update-rc --no-fish --no-zsh

        echo ""
        echo "fzf setup complete!"
    else
        echo "Skip: fzf keybindings already installed"
    fi
}
