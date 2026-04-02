#!/usr/bin/env bash
#
# tmux/install.sh - tmux setup
#
# This script sets up tmux configuration and plugin manager.
#
# What it does:
#   1. Symlinks tmux.conf to ~/.tmux.conf
#   2. Installs TPM (tmux plugin manager) if not present
#
# Usage:
#   bash tmux/install.sh
#   bash tmux/install.sh --non-interactive --overwrite --allow

set -euo pipefail

DOTFILES="${DOTFILES:-$HOME/.files}"
source "$DOTFILES/lib/index.sh"

echo ""
echo "=== tmux Setup ==="
echo ""

if ! command -v tmux &>/dev/null; then
    echo "Skip: tmux not installed"
    exit 0
fi

symlink "$DOTFILES/tmux/tmux.conf" "$HOME/.tmux.conf"

if [[ ! -d "$HOME/.tmux/plugins/tpm" ]]; then
    run "Install TPM (tmux plugin manager)" \
        git clone https://github.com/tmux-plugins/tpm "$HOME/.tmux/plugins/tpm"
fi

echo ""
echo "tmux setup complete!"
