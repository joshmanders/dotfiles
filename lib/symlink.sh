#!/usr/bin/env bash
#
# symlink.sh - Create symlinks with conflict detection and resolution
#
# This script provides the `symlink` function for creating symlinks with
# intelligent handling of existing files and symlinks.
#
# Usage:
#   symlink <source> <destination>
#
# Arguments:
#   source       The file to link to (must exist)
#   destination  Where to create the symlink
#
# Behavior:
#   - If destination doesn't exist: creates symlink
#   - If destination is a symlink pointing to source: skips (already correct)
#   - If destination exists (file or different symlink):
#     - Interactive mode: prompts "Overwrite [source]? [y/n]"
#     - Non-interactive + DOTFILES_OVERWRITE: overwrites
#     - Non-interactive + DOTFILES_SKIP: skips
#     - Non-interactive (default): skips
#
# Environment variables:
#   DOTFILES_NON_INTERACTIVE  If set, don't prompt
#   DOTFILES_OVERWRITE        If set with non-interactive, overwrite conflicts
#   DOTFILES_SKIP             If set with non-interactive, skip conflicts
#
# Examples:
#   symlink "$DOTFILES/bash/bashrc" "$HOME/.bashrc"
#   symlink "$DOTFILES/git/config" "$HOME/.gitconfig"

symlink() {
    local src="$1"
    local dest="$2"
    local dest_dir

    # Validate arguments
    if [[ -z "$src" || -z "$dest" ]]; then
        echo "Error: symlink requires source and destination arguments" >&2
        return 1
    fi

    # Check source exists
    if [[ ! -e "$src" ]]; then
        echo "Error: source does not exist: $src" >&2
        return 1
    fi

    # Ensure destination directory exists
    dest_dir="$(dirname "$dest")"
    if [[ ! -d "$dest_dir" ]]; then
        mkdir -p "$dest_dir"
    fi

    # Check if destination already exists
    if [[ -L "$dest" ]]; then
        # It's a symlink - check where it points
        local current_target
        current_target="$(readlink "$dest")"

        if [[ "$current_target" == "$src" ]]; then
            echo "Skip: $dest (already linked)"
            return 0
        fi

        # Symlink points elsewhere
        echo "Conflict: $dest -> $current_target"
        echo "    Want: $dest -> $src"

    elif [[ -e "$dest" ]]; then
        # It's a real file
        echo "Conflict: $dest exists as a file"
        echo "    Want: $dest -> $src"
    else
        # Destination doesn't exist, create symlink
        ln -s "$src" "$dest"
        echo "Link: $dest -> $src"
        return 0
    fi

    # Handle conflict
    if [[ -n "${DOTFILES_NON_INTERACTIVE:-}" ]]; then
        if [[ -n "${DOTFILES_OVERWRITE:-}" ]]; then
            rm -rf "$dest"
            ln -s "$src" "$dest"
            echo "Overwritten: $dest -> $src"
            return 0
        else
            echo "Skipped (non-interactive)"
            return 0
        fi
    fi

    # Interactive mode - prompt user
    local response
    read -r -p "Overwrite? [y/n] " response
    case "$response" in
        [yY]|[yY][eE][sS])
            rm -rf "$dest"
            ln -s "$src" "$dest"
            echo "Overwritten: $dest -> $src"
            ;;
        *)
            echo "Skipped"
            ;;
    esac
}
