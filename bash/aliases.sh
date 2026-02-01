#!/usr/bin/env bash
#
# aliases.sh - Shell aliases
#
# This file defines shell aliases.
# Sourced by bashrc.

# Sudo helpers
# Trailing space allows alias expansion after sudo
alias sudo='sudo '
alias fucking='sudo'
alias please='sudo'

# Safety - use trash instead of rm
alias rm='trash'

# Utilities
alias ip='curl -s ifconfig.co'

# Kubernetes
alias k='kubectl'

# Laravel Artisan helpers
alias art='artisan'
alias tinker='artisan tinker'
alias fresh='artisan migrate:fresh'
alias migrate='artisan migrate'
alias rollback='artisan migrate:rollback'
alias solo='artisan solo'

# Git shortcuts
alias wip='git save "WIP"'
alias push='git push'
alias g='git'
alias gs='git status'
alias gd='git diff'
alias gl='git log --oneline -20'

# Editor
alias code.='code .'

# Modern replacements (if installed)
command -v eza &>/dev/null && alias ls='eza'
command -v bat &>/dev/null && alias cat='bat'
