#!/usr/bin/env bash
#
# caddy/install.sh - Caddy web server setup
#
# This script sets up Caddy for local Laravel development.
# Can be run standalone or sourced from the main install.sh.
#
# What it does:
#   1. Symlinks Caddyfile to $(brew --prefix)/etc/Caddyfile
#   2. Symlinks snippets/, sites/ and dashboard/ directories to $(brew --prefix)/etc/caddy/
#   3. Starts Caddy service
#   4. Trusts Caddy's local CA so https://*.dev.local sites are trusted
#
# Usage:
#   bash caddy/install.sh
#   bash caddy/install.sh --non-interactive --allow --overwrite

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Caddy Web Server Setup ==="
echo ""

skip_unless brew "Homebrew not installed" \
    || skip_unless caddy "caddy not installed" || {
    BREW_PREFIX="$(brew --prefix)"

    # Symlink Caddyfile
    symlink "$DOTFILES/caddy/Caddyfile" "$BREW_PREFIX/etc/Caddyfile"

    # Ensure directories exist
    mkdir -p "$DOTFILES/caddy/sites"
    mkdir -p "$BREW_PREFIX/etc/caddy"

    # Symlink snippets, sites and dashboard to Homebrew location (Caddyfile reads from here)
    symlink "$DOTFILES/caddy/snippets" "$BREW_PREFIX/etc/caddy/snippets"
    symlink "$DOTFILES/caddy/sites" "$BREW_PREFIX/etc/caddy/sites"
    symlink "$DOTFILES/caddy/dashboard" "$BREW_PREFIX/etc/caddy/dashboard"

    # Start Caddy service. A failure must not abort the other modules.
    run "Start Caddy service" \
        brew services start caddy \
        || echo "Warning: Caddy service start failed; run 'brew services start caddy'" >&2

    # After the service start: `caddy trust` fetches the root certificate from
    # the running server's admin API. No sudo here: caddy calls sudo itself to
    # write to the system keychain. A failure must not abort the other modules.
    run "Trust Caddy's local CA in the system keychain" \
        caddy trust \
        || echo "Warning: caddy trust failed; run 'caddy trust' once Caddy is running" >&2

    echo ""
    echo "Caddy setup complete!"
    echo ""
    echo "Add sites with: concierge add <name> [path]"
}
