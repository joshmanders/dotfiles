#!/usr/bin/env bash
#
# plugins.sh - Plugin initialization
#
# This file initializes shell plugins for enhanced functionality.
# Sourced by bashrc.

# ble.sh - syntax highlighting and autosuggestions
# Provides fish-like experience in bash
if [[ -f "${HOME}/.local/share/blesh/ble.sh" ]]; then
    source "${HOME}/.local/share/blesh/ble.sh"
fi

# fzf - fuzzy finder (better Ctrl+R)
if [[ -f "${HOME}/.fzf.bash" ]]; then
    source "${HOME}/.fzf.bash"
fi

# zoxide - smart directory jumping (replaces z)
if command -v zoxide &>/dev/null; then
    eval "$(zoxide init bash)"
fi

# direnv - per-directory environment variables
if command -v direnv &>/dev/null; then
    eval "$(direnv hook bash)"
fi
