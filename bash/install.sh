#!/usr/bin/env bash
#
# bash/install.sh - Bash shell setup
#
# This script sets up the bash shell environment with fish-like features.
# Can be run standalone or sourced from the main install.sh.
#
# What it does:
#   1. Runs fzf install for keybindings
#   2. Symlinks bashrc to ~/.bashrc and ~/.bash_profile
#   3. Sets Homebrew bash as default shell
#
# Usage:
#   bash bash/install.sh
#   bash bash/install.sh --non-interactive --allow --overwrite

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Bash Shell Setup ==="
echo ""

# Run fzf install for keybindings
if command -v fzf &>/dev/null && [[ ! -f "${HOME}/.fzf.bash" ]]; then
    run "Install fzf keybindings" \
        "$(brew --prefix)/opt/fzf/install" --key-bindings --completion --no-update-rc --no-fish --no-zsh
else
    echo "Skip: fzf keybindings already installed or fzf not found"
fi

# Create symlinks
symlink "$DOTFILES/bash/bashrc" "$HOME/.bashrc"
symlink "$DOTFILES/bash/bashrc" "$HOME/.bash_profile"
symlink "$DOTFILES/bash/inputrc" "$HOME/.inputrc"
symlink "$DOTFILES/bash/hushlogin" "$HOME/.hushlogin"

# Set Homebrew bash as default shell
BASH_PATH="$(brew --prefix)/bin/bash"
if [[ -x "${BASH_PATH}" ]]; then
    if ! grep -q "${BASH_PATH}" /etc/shells 2>/dev/null; then
        run "Add ${BASH_PATH} to /etc/shells" \
            sudo bash -c "echo '${BASH_PATH}' >> /etc/shells"
    fi

    if [[ "${SHELL}" != "${BASH_PATH}" ]]; then
        run "Set default shell to ${BASH_PATH}" \
            chsh -s "${BASH_PATH}"
    else
        echo "Skip: ${BASH_PATH} is already default shell"
    fi
fi

echo ""
echo "Bash setup complete!"
