#!/usr/bin/env bash
#
# aliases.sh - Shell aliases
#
# This file defines shell aliases.
# Sourced by bashrc.

# Hack to auto expand aliases in sudo.
alias sudo='sudo '

# Because sometimes you gotta be harsh.
alias fucking='sudo'

# And sometimes you gotta be nice.
alias please='sudo'

# LOL don't be Jamon.
# https://twitter.com/jamonholmgren/status/967548502648668161
alias rm='trash'

# Get my IP Address.
alias ip='curl -s -4 icanhazip.com'

# Kubernetes
alias k='kubectl'

# Laravel Artisan helpers
alias art='artisan'
alias tinker='artisan tinker'
alias fresh='artisan migrate:fresh'
alias migrate='artisan migrate'
alias rollback='artisan migrate:rollback'

# Git shortcuts
alias wip='git save "WIP"'
alias push='git push'
