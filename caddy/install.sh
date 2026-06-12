#!/usr/bin/env bash
#
# caddy/install.sh - Caddy web server setup
#
# This script sets up Caddy for local Laravel development.
# Can be run standalone or sourced from the main install.sh.
#
# What it does:
#   1. Symlinks Caddyfile to $(brew --prefix)/etc/Caddyfile
#   2. Symlinks snippets/ and sites/ directories to $(brew --prefix)/etc/caddy/
#   3. Starts Caddy service
#
# Usage:
#   bash caddy/install.sh
#   bash caddy/install.sh --non-interactive --allow --overwrite

set -euo pipefail

source "$DOTFILES/lib/index.sh"

BREW_PREFIX="$(brew --prefix)"

echo ""
echo "=== Caddy Web Server Setup ==="
echo ""

# Symlink Caddyfile
symlink "$DOTFILES/caddy/Caddyfile" "$BREW_PREFIX/etc/Caddyfile"

# Ensure directories exist
mkdir -p "$DOTFILES/caddy/sites"
mkdir -p "$BREW_PREFIX/etc/caddy"

# Symlink snippets and sites to Homebrew location (Caddyfile imports from here)
symlink "$DOTFILES/caddy/snippets" "$BREW_PREFIX/etc/caddy/snippets"
symlink "$DOTFILES/caddy/sites" "$BREW_PREFIX/etc/caddy/sites"

# Start Caddy service
run "Start Caddy service" \
    brew services start caddy

echo ""
echo "Caddy setup complete!"
echo ""
echo "Add sites with: concierge add <name> [path]"
