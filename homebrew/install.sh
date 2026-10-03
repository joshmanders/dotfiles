#!/usr/bin/env bash
#
# homebrew/install.sh - Homebrew setup
#
# This script installs Homebrew and runs brew bundle.
# Can be run standalone or sourced from the main install.sh.
#
# What it does:
#   1. Installs Homebrew if not present
#   2. Runs brew bundle to install all packages
#
# Usage:
#   bash homebrew/install.sh
#   bash homebrew/install.sh --non-interactive --allow
#
# Reads $DOTFILES from the environment (bashrc exports it). On a new Mac,
# before bashrc is linked, run the main install.sh, which sets it.

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Homebrew Setup ==="
echo ""

# Install Homebrew if not present
if ! command -v brew &>/dev/null; then
    # Single-quoted so the download happens only if the step runs
    run "Install Homebrew" \
        /bin/bash -c 'installer="$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" && /bin/bash -c "$installer"'

    # Add Homebrew to PATH for this session (detect architecture)
    if [[ -f /opt/homebrew/bin/brew ]]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [[ -f /usr/local/bin/brew ]]; then
        eval "$(/usr/local/bin/brew shellenv)"
    fi
else
    echo "Skip: Homebrew already installed"
fi

skip_unless brew "Homebrew not installed" || {
    # Run brew bundle
    run "Install Homebrew packages" \
        brew bundle --file="$DOTFILES/homebrew/bundle"

    echo ""
    echo "Homebrew setup complete!"
}
