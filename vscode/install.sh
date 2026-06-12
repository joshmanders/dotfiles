#!/usr/bin/env bash
#
# vscode/install.sh - VS Code settings setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== VS Code Setup ==="
echo ""

if [[ ! -d "/Applications/Visual Studio Code.app" ]]; then
    echo "Skip: VS Code not installed"
    exit 0
fi

symlink "$DOTFILES/vscode/settings.json" "$HOME/Library/Application Support/Code/User/settings.json"

echo ""
echo "VS Code setup complete!"
