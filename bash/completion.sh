#!/usr/bin/env bash
#
# completion.sh - Bash completions
#
# This file sets up tab completion for various tools.
# Sourced by bashrc.

# Homebrew completions
if type brew &>/dev/null; then
    HOMEBREW_PREFIX="$(brew --prefix)"
    if [[ -r "${HOMEBREW_PREFIX}/etc/profile.d/bash_completion.sh" ]]; then
        source "${HOMEBREW_PREFIX}/etc/profile.d/bash_completion.sh"
    else
        for COMPLETION in "${HOMEBREW_PREFIX}/etc/bash_completion.d/"*; do
            [[ -r "${COMPLETION}" ]] && source "${COMPLETION}"
        done
    fi
fi

# kubectl completion
if command -v kubectl &>/dev/null; then
    source <(kubectl completion bash)
    complete -F __start_kubectl k
fi

# gh completion
if command -v gh &>/dev/null; then
    eval "$(gh completion -s bash)"
fi
