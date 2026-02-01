#!/usr/bin/env bash
#
# dnsmasq/install.sh - DNS resolver setup
#
# This script sets up dnsmasq to resolve *.dev.local domains to localhost.
# Can be run standalone or sourced from the main install.sh.
#
# What it does:
#   1. Symlinks dnsmasq.conf to $(brew --prefix)/etc/dnsmasq.conf
#   2. Creates /etc/resolver/dev.local for macOS DNS resolution
#   3. Starts dnsmasq service
#
# Usage:
#   bash dnsmasq/install.sh
#   bash dnsmasq/install.sh --non-interactive --allow --overwrite

set -euo pipefail

DOTFILES="${DOTFILES:-$HOME/.files}"
source "$DOTFILES/lib/index.sh"

echo ""
echo "=== DNS (dnsmasq) Setup ==="
echo ""

# Symlink dnsmasq configuration
symlink "$DOTFILES/dnsmasq/dnsmasq.conf" "$(brew --prefix)/etc/dnsmasq.conf"

# Create resolver directory and file for *.dev.local
RESOLVER_DIR="/etc/resolver"
RESOLVER_FILE="${RESOLVER_DIR}/dev.local"

if [[ ! -d "$RESOLVER_DIR" ]]; then
    run "Create /etc/resolver directory" \
        sudo mkdir -p "$RESOLVER_DIR"
fi

if [[ ! -f "$RESOLVER_FILE" ]]; then
    run "Create resolver for *.dev.local" \
        sudo bash -c "echo 'nameserver 127.0.0.1' > $RESOLVER_FILE"
else
    echo "Skip: $RESOLVER_FILE already exists"
fi

# Start dnsmasq service
run "Start dnsmasq service" \
    sudo brew services start dnsmasq

echo ""
echo "DNS setup complete!"
echo ""
echo "Test with: ping test.dev.local"
