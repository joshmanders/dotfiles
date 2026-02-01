#!/usr/bin/env bash
#
# path.sh - PATH configuration
#
# This file sets up the PATH environment variable.
# Sourced by bashrc.

# Start with Homebrew paths
HOMEBREW_PREFIX="$(brew --prefix)"
PATH="${HOMEBREW_PREFIX}/bin:${HOMEBREW_PREFIX}/sbin"

# System paths
PATH="${PATH}:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

# Android SDK
PATH="${PATH}:${ANDROID_HOME}/emulator"
PATH="${PATH}:${ANDROID_HOME}/platform-tools"

# Dotfiles bin scripts
PATH="${PATH}:${DOTFILES}/bin"

export PATH
