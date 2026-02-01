#!/usr/bin/env bash
#
# exports.sh - Environment variables
#
# This file sets up environment variables for the shell.
# Sourced by bashrc.

# Where are my dotfiles?
export DOTFILES="${HOME}/.files"

# Source config if it exists (for personal overrides)
[[ -f "$DOTFILES/config.sh" ]] && source "$DOTFILES/config.sh"

# Editor (from config or default)
export EDITOR="${DOTFILES_EDITOR}"
export VISUAL="${DOTFILES_EDITOR}"

# Timezone (from config or default)
export TZ="${DOTFILES_TZ}"

# Homebrew
export HOMEBREW_NO_AUTO_UPDATE=1

# Android SDK
export JAVA_HOME="/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home"
export ANDROID_HOME="${HOME}/Library/Android/sdk"

# ripgrep config
export RIPGREP_CONFIG_PATH="${DOTFILES}/ripgrep/config"

# History configuration (fish-like behavior)
export HISTSIZE=50000
export HISTFILESIZE=50000
export HISTCONTROL=ignoreboth:erasedups
export HISTIGNORE="ls:cd:cd -:pwd:exit:date:* --help"
shopt -s histappend
