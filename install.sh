#!/usr/bin/env bash
#
# install.sh - Dotfiles installation script
#
# This script sets up a new machine with all dotfiles configurations.
# Each module can also be run standalone.
#
# Usage:
#   ./install.sh                                    # Interactive (prompts for everything)
#   ./install.sh --non-interactive --skip --deny    # Skip all conflicts and commands
#   ./install.sh --non-interactive --overwrite --allow  # Do everything
#
# Flags:
#   --non-interactive  Disable all prompts
#   --overwrite        Overwrite symlink conflicts (non-interactive)
#   --skip             Skip symlink conflicts (non-interactive)
#   --allow            Run all commands (non-interactive)
#   --deny             Skip all commands (non-interactive)
#
# Modules (can run standalone):
#   bash homebrew/install.sh    # Shell setup
#   bash git/install.sh         # Git configuration
#   bash ssh/install.sh         # SSH configuration
#   bash dnsmasq/install.sh     # DNS resolver
#   bash caddy/install.sh       # Web server

set -euo pipefail

# Determine dotfiles location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export DOTFILES="$SCRIPT_DIR"

# Source library utilities (handles flag parsing)
source "$DOTFILES/lib/index.sh"

# Ensure config.sh exists before proceeding
ensure_config

# Validate required config (prompts if not set in config.sh)
env_require "DOTFILES_NAME" "Your name"
env_require "DOTFILES_EMAIL" "Your email"

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║   Dotfiles Installation                                           ║"
echo "║                                                                   ║"
echo "║   These are my dotfiles. There are many like them,                ║"
echo "║   but these are mine.                                             ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Show mode
if [[ -n "${DOTFILES_NON_INTERACTIVE:-}" ]]; then
    echo "Mode: Non-interactive"
    [[ -n "${DOTFILES_OVERWRITE:-}" ]] && echo "  - Symlinks: overwrite conflicts"
    [[ -n "${DOTFILES_SKIP:-}" ]] && echo "  - Symlinks: skip conflicts"
    [[ -n "${DOTFILES_ALLOW:-}" ]] && echo "  - Commands: run all"
    [[ -n "${DOTFILES_DENY:-}" ]] && echo "  - Commands: skip all"
else
    echo "Mode: Interactive (will prompt for confirmations)"
fi
echo ""

# Run module installers
# Order matters: homebrew first (installs dependencies), then configs

source "$DOTFILES/homebrew/install.sh"
source "$DOTFILES/bash/install.sh"
source "$DOTFILES/git/install.sh"
source "$DOTFILES/ssh/install.sh"
source "$DOTFILES/dnsmasq/install.sh"
source "$DOTFILES/caddy/install.sh"

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║   Installation complete!                                          ║"
echo "║                                                                   ║"
echo "║   Restart your terminal or run: exec bash                         ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
