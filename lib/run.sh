#!/usr/bin/env bash
#
# run.sh - Wrap commands that modify the environment with confirmation
#
# This script provides the `run` function for executing commands with
# user confirmation in interactive mode.
#
# Usage:
#   run <description> <command...>
#
# Arguments:
#   description  Human-readable description of what the command does
#   command...   The command and its arguments to execute
#
# Behavior:
#   - Interactive mode: shows command, prompts "Run? [y/n]"
#   - Non-interactive + DOTFILES_ALLOW: runs command
#   - Non-interactive + DOTFILES_DENY: skips command
#   - Non-interactive (default): skips command
#
# Environment variables:
#   DOTFILES_NON_INTERACTIVE  If set, don't prompt
#   DOTFILES_ALLOW            If set with non-interactive, run all commands
#   DOTFILES_DENY             If set with non-interactive, skip all commands
#
# Examples:
#   run "Install Homebrew packages" brew bundle --file="$DOTFILES/homebrew/Brewfile"
#   run "Set default shell to bash" chsh -s /opt/homebrew/bin/bash
#   run "Start Caddy service" brew services start caddy

run() {
    local description="$1"
    shift
    local cmd=("$@")

    # Validate arguments
    if [[ -z "$description" || ${#cmd[@]} -eq 0 ]]; then
        echo "Error: run requires description and command arguments" >&2
        return 1
    fi

    echo ""
    echo "Command: ${cmd[*]}"
    echo "Purpose: $description"

    # Handle non-interactive mode
    if [[ -n "$DOTFILES_NON_INTERACTIVE" ]]; then
        if [[ -n "$DOTFILES_ALLOW" ]]; then
            echo "Running (--allow)..."
            "${cmd[@]}"
            return $?
        else
            echo "Skipped (non-interactive)"
            return 0
        fi
    fi

    # Interactive mode - prompt user
    local response
    read -r -p "Run? [y/n] " response
    case "$response" in
        [yY]|[yY][eE][sS])
            "${cmd[@]}"
            return $?
            ;;
        *)
            echo "Skipped"
            return 0
            ;;
    esac
}
