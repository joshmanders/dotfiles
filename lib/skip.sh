#!/usr/bin/env bash
#
# skip.sh - Skip a module's work when something it needs is missing
#
# This script provides the `skip_unless` function. A module calls it to guard
# the work that depends on a command or an app being installed.
#
# No exit on skip: a module's install.sh is sourced by the main install.sh, so
# `exit` in a module ends the whole install and skips every module after it.
# A function cannot end the file that called it either. So `skip_unless` is a
# predicate: it reports through its return status, and the module puts the
# guarded work in a `|| { ... }` block after the call.
#
# Usage:
#   skip_unless <requirement> <message> || {
#       ...work that needs the requirement...
#   }
#
# Arguments:
#   requirement  A command name, or a path when it contains a slash
#   message      "<X> not installed", where X names the requirement;
#                printed after "Skip: "
#
# Behavior:
#   - Command name: present when `command -v` finds it
#   - Path (contains a slash): present when it exists (`-e`)
#   - Requirement present: prints nothing, returns 1, so the block runs
#   - Requirement missing: prints "Skip: <message>", returns 0, so the block
#     is skipped and the module carries on after it
#   - Empty requirement or message: prints an error and returns 0, so the
#     block is skipped
#   - Never calls `exit`
#
# Return status:
#   0  Skipped. The name reads as a statement: "skip unless brew" succeeded,
#      the work was skipped.
#   1  Not skipped. `||` runs the block.
#
# The block is the last command of the `||` list, so `set -e` still applies
# inside it: a failing command in the block aborts the install.
#
# Examples:
#   skip_unless brew "Homebrew not installed" || {
#       symlink "$DOTFILES/caddy/Caddyfile" "$(brew --prefix)/etc/Caddyfile"
#   }
#
#   skip_unless "/Applications/Rectangle.app" "Rectangle not installed" || {
#       run "Set Rectangle preferences" bash "$DOTFILES/rectangle/defaults.sh"
#   }
#
#   # Two requirements: chain the calls, the block follows the last one
#   skip_unless brew "Homebrew not installed" \
#       || skip_unless php "php not installed" || {
#       symlink "$DOTFILES/php/99-dotfiles.ini" "$PHP_ETC/conf.d/99-dotfiles.ini"
#   }

skip_unless() {
    local requirement="${1:-}"
    local message="${2:-}"

    # Validate arguments
    if [[ -z "$requirement" || -z "$message" ]]; then
        echo "Error: skip_unless requires requirement and message arguments" >&2
        return 0
    fi

    if [[ "$requirement" == */* ]]; then
        [[ -e "$requirement" ]] && return 1
    else
        command -v "$requirement" &>/dev/null && return 1
    fi

    echo "Skip: $message"
    return 0
}
