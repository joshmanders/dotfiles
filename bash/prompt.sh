#!/usr/bin/env bash
#
# prompt.sh - Prompt configuration
#
# This file initializes the shell prompt using Starship.
# Sourced by bashrc.

if command -v starship &>/dev/null; then
    eval "$(starship init bash)"
fi
