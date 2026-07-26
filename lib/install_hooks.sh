#!/usr/bin/env bash
#
# install_hooks.sh - Autoload a module's install-time hooks
#
# A module can put shell files in its own install.d/ directory. They are
# sourced (not executed) before the module does its work, so anything they
# export stays available to the rest of the installer.
#
# Use them for values that have to be computed at install time rather than
# committed: file contents pulled into a config, machine-specific paths,
# anything derived from another file in the repo.
#
# Usage:
#   load_install_hooks              # <directory of the calling script>/install.d
#   load_install_hooks <module_dir> # <module_dir>/install.d
#
# Arguments:
#   module_dir  Directory containing install.d/ (default: the caller's directory)
#
# Behavior:
#   - Sources every *.sh in install.d/, in lexical order
#   - Does nothing when install.d/ is absent or empty
#   - Aborts when a hook fails, since later steps depend on what it exported
#
# Examples:
#   load_install_hooks                       # called from claude/install.sh
#   load_install_hooks "$DOTFILES/claude"    # explicit module directory

load_install_hooks() {
    local module_dir="${1:-}"

    # Default to the directory of whichever script called this function.
    if [[ -z "$module_dir" ]]; then
        module_dir="$(cd "$(dirname "${BASH_SOURCE[1]}")" && pwd)"
    fi

    local hook_dir="$module_dir/install.d"
    [[ -d "$hook_dir" ]] || return 0

    local hook
    for hook in "$hook_dir"/*.sh; do
        [[ -f "$hook" ]] || continue
        if ! source "$hook"; then
            echo "Error: install hook failed: $hook" >&2
            return 1
        fi
    done
}
