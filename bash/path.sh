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
PATH="${HOMEBREW_PREFIX}/bin:${HOMEBREW_PREFIX}/sbin"

# System paths
PATH="${PATH}:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

# Android SDK
PATH="${PATH}:${ANDROID_HOME}/emulator"
PATH="${PATH}:${ANDROID_HOME}/platform-tools"

# Dotfiles bin scripts
PATH="${PATH}:${DOTFILES}/bin"

export PATH
