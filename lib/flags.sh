#!/usr/bin/env bash
#
# flags.sh - Parse command-line flags and set environment variables
#
# This script parses flags passed to install scripts and exports corresponding
# environment variables. It's designed to be sourced, not executed directly.
#
# Flags:
#   --non-interactive  Disable all prompts, use default behavior
#   --overwrite        In non-interactive mode, overwrite symlink conflicts
#   --skip             In non-interactive mode, skip symlink conflicts
#   --allow            In non-interactive mode, run all commands
#   --deny             In non-interactive mode, skip all commands
#
# Environment variables set:
#   DOTFILES_NON_INTERACTIVE=1  When --non-interactive is passed
#   DOTFILES_OVERWRITE=1        When --overwrite is passed
#   DOTFILES_SKIP=1             When --skip is passed
#   DOTFILES_ALLOW=1            When --allow is passed
#   DOTFILES_DENY=1             When --deny is passed
#
# Usage:
#   source "$DOTFILES/lib/flags.sh"
#
# The script processes $@ so it should be sourced before other argument parsing.
# Flags can also be set via environment variables before running.

parse_flags() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --non-interactive)
                export DOTFILES_NON_INTERACTIVE=1
                ;;
            --overwrite)
                export DOTFILES_OVERWRITE=1
                ;;
            --skip)
                export DOTFILES_SKIP=1
                ;;
            --allow)
                export DOTFILES_ALLOW=1
                ;;
            --deny)
                export DOTFILES_DENY=1
                ;;
            *)
                # Unknown flag, ignore (might be for another script)
                ;;
        esac
        shift
    done
}

# Parse flags from command line arguments
# Store original args to pass through
_DOTFILES_ORIGINAL_ARGS=("$@")
parse_flags "$@"
