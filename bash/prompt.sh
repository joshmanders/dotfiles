#!/usr/bin/env bash
#
# prompt.sh - Prompt configuration
#
# This file initializes the shell prompt using oh-my-posh.
# Sourced by bashrc.

if command -v oh-my-posh &>/dev/null; then
    eval "$(oh-my-posh init bash --config "${DOTFILES}/bash/theme.json")"
fi
