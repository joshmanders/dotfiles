#!/usr/bin/env bash
#
# path.sh - PATH configuration
#
# This file sets up the PATH environment variable.
# Sourced by bashrc.

# Determine Homebrew prefix by checking known locations
if [[ -x "/opt/homebrew/bin/brew" ]]; then
    HOMEBREW_PREFIX="/opt/homebrew"
elif [[ -x "/usr/local/bin/brew" ]]; then
    HOMEBREW_PREFIX="/usr/local"
fi
PATH="${DOTFILES}/bin:${HOMEBREW_PREFIX}/bin:${HOMEBREW_PREFIX}/sbin"

# System paths
PATH="${PATH}:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

# Composer global
PATH="${PATH}:${COMPOSER_HOME}/vendor/bin"

# Rex puts its CLI on PATH and in REX_BIN_DIR in each terminal it opens; the
# fixed list above drops it, so put it back in front.
if [[ -n "${REX_BIN_DIR:-}" ]]; then
    PATH="${REX_BIN_DIR}:${PATH}"
fi

export PATH
