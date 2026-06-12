#!/usr/bin/env bash
#
# exports.sh - Environment variables
#
# This file sets up environment variables for the shell.
# Sourced by bashrc, which sets DOTFILES and loads config.sh first.

# Editor (from config or default)
export EDITOR="${DOTFILES_EDITOR}"
export VISUAL="${DOTFILES_EDITOR}"

# Timezone (from config or default)
export TZ="${DOTFILES_TZ}"

# Silence macOS "default interactive shell is now zsh" warning
export BASH_SILENCE_DEPRECATION_WARNING=1

# Homebrew
export HOMEBREW_NO_AUTO_UPDATE="${DOTFILES_HOMEBREW_NO_AUTOUPDATE}"

# Android SDK
export JAVA_HOME="/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home"
export ANDROID_HOME="${HOME}/Library/Android/sdk"

# Composer
export COMPOSER_HOME="${HOME}/.composer"

# ripgrep config
export RIPGREP_CONFIG_PATH="${DOTFILES}/ripgrep/config"

# History configuration (fish-like behavior)
export HISTSIZE="${DOTFILES_HISTSIZE}"
export HISTFILESIZE="${DOTFILES_HISTSIZE}"
export HISTCONTROL=ignoreboth:erasedups
export HISTIGNORE="ls:cd:cd -:pwd:exit:date:* --help"
shopt -s histappend
