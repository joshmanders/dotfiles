#!/usr/bin/env bash
#
# ssh/install.sh - SSH setup
#
# This script sets up SSH configuration and generates keys.
# Can be run standalone or sourced from the main install.sh.
#
# What it does:
#   1. Creates ~/.ssh directory with proper permissions
#   2. Generates an ed25519 SSH key (if none exists)
#   3. Creates allowed_signers file for git commit verification
#   4. Symlinks ssh/config to ~/.ssh/config
#   5. Displays public key for adding to GitHub
#
# Usage:
#   bash ssh/install.sh
#   bash ssh/install.sh --non-interactive --overwrite

set -euo pipefail

source "$DOTFILES/lib/index.sh"

# Get email from config (with fallback for standalone runs)
SSH_EMAIL="${DOTFILES_EMAIL:-${SSH_EMAIL:-}}"
SSH_KEY_PATH="$HOME/.ssh/id_ed25519"

# Require email if we're generating a key
if [[ ! -f "$SSH_KEY_PATH" && -z "$SSH_EMAIL" ]]; then
    echo "Error: DOTFILES_EMAIL is required to generate SSH key" >&2
    echo "Please set it in config.sh or run the main install.sh" >&2
    exit 1
fi

echo ""
echo "=== SSH Setup ==="
echo ""

# Create ~/.ssh with proper permissions
if [[ ! -d "$HOME/.ssh" ]]; then
    mkdir -p "$HOME/.ssh"
    chmod 700 "$HOME/.ssh"
    echo "Created: ~/.ssh"
else
    chmod 700 "$HOME/.ssh"
    echo "Skip: ~/.ssh already exists"
fi

# Generate SSH key if it doesn't exist
if [[ ! -f "$SSH_KEY_PATH" ]]; then
    echo ""
    echo "No SSH key found at $SSH_KEY_PATH"

    run "Generate ed25519 SSH key" \
        ssh-keygen -t ed25519 -C "$SSH_EMAIL" -f "$SSH_KEY_PATH"
else
    echo "Skip: SSH key already exists at $SSH_KEY_PATH"
fi

# Create allowed_signers file for git verification
ALLOWED_SIGNERS="$HOME/.ssh/allowed_signers"
if [[ -f "$SSH_KEY_PATH.pub" ]]; then
    PUBLIC_KEY=$(cat "$SSH_KEY_PATH.pub")

    # Format: email key-type key-data
    SIGNER_ENTRY="$SSH_EMAIL $PUBLIC_KEY"

    if [[ ! -f "$ALLOWED_SIGNERS" ]] || ! grep -q "$SSH_EMAIL" "$ALLOWED_SIGNERS" 2>/dev/null; then
        echo "$SIGNER_ENTRY" > "$ALLOWED_SIGNERS"
        chmod 600 "$ALLOWED_SIGNERS"
        echo "Created: $ALLOWED_SIGNERS"
    else
        echo "Skip: allowed_signers already contains $SSH_EMAIL"
    fi
fi

# Create symlink for SSH config
symlink "$DOTFILES/ssh/config" "$HOME/.ssh/config"

echo ""
echo "SSH setup complete!"

# Display public key if it exists
if [[ -f "$SSH_KEY_PATH.pub" ]]; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║  Your SSH public key (add to GitHub, servers, etc.):              ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo ""
    cat "$SSH_KEY_PATH.pub"
    echo ""
    echo "Add to GitHub: https://github.com/settings/ssh/new"
    echo "  - For Authentication: select 'Authentication Key'"
    echo "  - For Signing: select 'Signing Key' (add it twice for both)"
    echo ""
fi
