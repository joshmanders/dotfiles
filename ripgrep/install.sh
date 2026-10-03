#!/usr/bin/env bash
#
# ripgrep/install.sh - ripgrep configuration setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== ripgrep Setup ==="
echo ""

# rg reads its flags from RIPGREP_CONFIG_PATH, which bash/exports.sh points
# at ripgrep/config in this repo, so only the ignore file needs a link.
skip_unless rg "ripgrep not installed" || {
    symlink "$DOTFILES/ripgrep/ignore" "$HOME/.ignore"

    echo ""
    echo "ripgrep setup complete!"
}
