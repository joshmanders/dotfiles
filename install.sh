#!/usr/bin/env bash
#
# install.sh - Dotfiles installation script
#
# This script sets up a new machine with all dotfiles configurations.
# Each module can also be run standalone.
#
# Asks for the sudo password once at the start and keeps it alive until the
# run ends, so steps that need root don't stop to prompt.
#
# Usage:
#   bash install.sh                                 # Interactive (prompts for everything)
#   bash install.sh --non-interactive --skip --deny # Skip all conflicts and commands
#   bash install.sh --non-interactive --overwrite --allow  # Do everything
#
# Flags:
#   --non-interactive  Disable all prompts
#   --overwrite        Overwrite symlink conflicts (non-interactive)
#   --skip             Skip symlink conflicts (non-interactive)
#   --allow            Run all commands (non-interactive)
#   --deny             Skip all commands (non-interactive)
#
# Modules (can run standalone):
#   bash homebrew/install.sh
#   bash bash/install.sh
#   bash fzf/install.sh
#   bash git/install.sh
#   bash gh/install.sh
#   bash ssh/install.sh
#   bash dnsmasq/install.sh
#   bash caddy/install.sh
#   bash php/install.sh
#   bash npm/install.sh
#   bash ripgrep/install.sh
#   bash claude/install.sh
#   bash cpanel/install.sh
#   bash solo/install.sh
#   bash lazygit/install.sh
#   bash neovim/install.sh
#   bash tmux/install.sh
#   bash ghostty/install.sh
#   bash macos/install.sh
#   bash rectangle/install.sh
#   bash hyperkey/install.sh
#   bash caffeine/install.sh
#   bash dato/install.sh
#   bash kap/install.sh
#   bash orbstack/install.sh

set -euo pipefail

# Determine dotfiles location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export DOTFILES="$SCRIPT_DIR"

# Source library utilities (handles flag parsing)
source "$DOTFILES/lib/index.sh"

# Ensure config.sh exists (runs setup wizard if not)
ensure_config

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

# Ask for sudo once, up front, so steps that need root don't stop to prompt
hold_sudo

# Run module installers
# Order matters: homebrew first (installs dependencies), then bash (shell
# config the fzf and ripgrep modules plug into), then configs; app preferences
# (macos, rectangle, hyperkey, caffeine, dato, kap, orbstack) last

source "$DOTFILES/homebrew/install.sh"
source "$DOTFILES/bash/install.sh"
source "$DOTFILES/fzf/install.sh"
source "$DOTFILES/git/install.sh"
source "$DOTFILES/gh/install.sh"
source "$DOTFILES/ssh/install.sh"
source "$DOTFILES/dnsmasq/install.sh"
source "$DOTFILES/caddy/install.sh"
source "$DOTFILES/php/install.sh"
source "$DOTFILES/npm/install.sh"
source "$DOTFILES/ripgrep/install.sh"
source "$DOTFILES/claude/install.sh"
source "$DOTFILES/cpanel/install.sh"
source "$DOTFILES/solo/install.sh"
source "$DOTFILES/lazygit/install.sh"
source "$DOTFILES/neovim/install.sh"
source "$DOTFILES/tmux/install.sh"
source "$DOTFILES/ghostty/install.sh"
source "$DOTFILES/macos/install.sh"
source "$DOTFILES/rectangle/install.sh"
source "$DOTFILES/hyperkey/install.sh"
source "$DOTFILES/caffeine/install.sh"
source "$DOTFILES/dato/install.sh"
source "$DOTFILES/kap/install.sh"
source "$DOTFILES/orbstack/install.sh"

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║   Installation complete!                                          ║"
echo "║                                                                   ║"
echo "║   Restart your terminal or run: exec bash                         ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
