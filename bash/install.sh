#!/usr/bin/env bash
#
# bash/install.sh - Bash shell setup
#
# This script sets up the bash shell environment with fish-like features.
# Can be run standalone or sourced from the main install.sh.
#
# What it does:
#   1. Installs ble.sh for syntax highlighting and autosuggestions
#   2. Runs fzf install for keybindings
#   3. Symlinks bashrc to ~/.bashrc and ~/.bash_profile
#   4. Symlinks starship.toml to ~/.config/starship.toml
#   5. Sets Homebrew bash as default shell
#
# Usage:
#   bash bash/install.sh
#   bash bash/install.sh --non-interactive --allow --overwrite

set -euo pipefail

DOTFILES="${DOTFILES:-$HOME/.files}"
source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Bash Shell Setup ==="
echo ""

# Install ble.sh for syntax highlighting and autosuggestions
BLESH_DIR="${HOME}/.local/share/blesh"
if [[ ! -d "${BLESH_DIR}" ]]; then
    run "Install ble.sh (syntax highlighting + autosuggestions)" \
        bash -c 'git clone --recursive --depth 1 --shallow-submodules https://github.com/akinomyoga/ble.sh.git /tmp/ble.sh && make -C /tmp/ble.sh install PREFIX="${HOME}/.local" && rm -rf /tmp/ble.sh'
else
    echo "Skip: ble.sh already installed"
fi

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

mkdir -p "$HOME/.config"
symlink "$DOTFILES/bash/starship.toml" "$HOME/.config/starship.toml"

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
