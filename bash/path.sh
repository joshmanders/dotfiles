#!/usr/bin/env bash
#
# path.sh - PATH configuration
#
# This file sets up the PATH environment variable.
# Sourced by bashrc.

# Start with Homebrew paths
PATH="/opt/homebrew/bin:/opt/homebrew/sbin"

# System paths
PATH="${PATH}:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

# Composer global
PATH="${PATH}:${HOME}/.composer/vendor/bin"

# Android SDK
PATH="${PATH}:${ANDROID_HOME}/emulator"
PATH="${PATH}:${ANDROID_HOME}/platform-tools"

# Dotfiles bin scripts
PATH="${PATH}:${DOTFILES}/bin"

export PATH
