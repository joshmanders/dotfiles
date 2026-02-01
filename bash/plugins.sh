#!/usr/bin/env bash
#
# plugins.sh - Plugin initialization
#
# This file initializes shell plugins for enhanced functionality.
# Sourced by bashrc.

# fzf - fuzzy finder (better Ctrl+R)
if [[ -f "${DOTFILES}/fzf/config.sh" ]]; then
    source "${DOTFILES}/fzf/config.sh"
fi
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
