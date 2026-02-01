#!/usr/bin/env bash
#
# exports.sh - Environment variables
#
# This file sets up environment variables for the shell.
# Sourced by bashrc.

# Dotfiles location
export DOTFILES="${HOME}/.files"

# Source config if it exists (for personal overrides)
[[ -f "$DOTFILES/config.sh" ]] && source "$DOTFILES/config.sh"

# Editor (from config or default)
export EDITOR="${DOTFILES_EDITOR:-code}"
export VISUAL="${DOTFILES_EDITOR:-code}"

# Timezone (from config or default)
export TZ="${DOTFILES_TZ:-America/Los_Angeles}"

# Homebrew
export HOMEBREW_NO_AUTO_UPDATE=1

# GPG
export GPG_TTY=$(tty)

# Android SDK
export JAVA_HOME="/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home"
export ANDROID_HOME="${HOME}/Library/Android/sdk"

# History configuration (fish-like behavior)
export HISTSIZE=50000
export HISTFILESIZE=50000
export HISTCONTROL=ignoreboth:erasedups
export HISTIGNORE="ls:cd:cd -:pwd:exit:date:* --help"
shopt -s histappend
