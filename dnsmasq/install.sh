#!/usr/bin/env bash
#
# dnsmasq/install.sh - DNS resolver setup
#
# This script sets up dnsmasq to resolve *.dev.local domains to localhost.
# Can be run standalone or sourced from the main install.sh.
#
# What it does:
#   1. Symlinks dnsmasq.conf to $(brew --prefix)/etc/dnsmasq.conf, replacing
#      Homebrew's example config
#   2. Installs a copy of resolver as /etc/resolver/dev.local for macOS DNS resolution
#   3. Starts dnsmasq service
#
# Usage:
#   bash dnsmasq/install.sh
#   bash dnsmasq/install.sh --non-interactive --allow --overwrite

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== DNS (dnsmasq) Setup ==="
echo ""

skip_unless brew "Homebrew not installed" \
    || skip_unless dnsmasq "dnsmasq not installed" || {
    # Symlink dnsmasq configuration
    # Homebrew installs its example config at this path, so overwrite it without asking
    DOTFILES_NON_INTERACTIVE=1 DOTFILES_OVERWRITE=1 \
        symlink "$DOTFILES/dnsmasq/dnsmasq.conf" "$(brew --prefix)/etc/dnsmasq.conf"

    # Resolver directory and file for *.dev.local. The file is a root-owned
    # copy of dnsmasq/resolver: resolver(5) does not say whether a symlink in
    # /etc/resolver is read. A failure in these steps must not abort the other
    # modules.
    RESOLVER_DIR="/etc/resolver"
    RESOLVER_FILE="${RESOLVER_DIR}/dev.local"

    if [[ ! -d "$RESOLVER_DIR" ]]; then
        run "Create /etc/resolver directory" \
            sudo mkdir -p "$RESOLVER_DIR" \
            || echo "Warning: creating $RESOLVER_DIR failed; run 'sudo mkdir -p $RESOLVER_DIR'" >&2
    fi

    if [[ ! -f "$RESOLVER_FILE" ]]; then
        run "Create resolver for *.dev.local" \
            sudo install -m 644 "$DOTFILES/dnsmasq/resolver" "$RESOLVER_FILE" \
            || echo "Warning: creating $RESOLVER_FILE failed; run 'sudo install -m 644 $DOTFILES/dnsmasq/resolver $RESOLVER_FILE'" >&2
    else
        echo "Skip: $RESOLVER_FILE already exists"
    fi

    # Start dnsmasq service. A failure must not abort the other modules.
    run "Start dnsmasq service" \
        sudo brew services start dnsmasq \
        || echo "Warning: dnsmasq service start failed; run 'sudo brew services start dnsmasq'" >&2

    echo ""
    echo "DNS setup complete!"
    echo ""
    echo "Test with: ping test.dev.local"
}
