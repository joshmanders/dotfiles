#!/usr/bin/env bash
#
# fish/install.sh - Fish shell setup (alternative to bash)
#
# This script sets up fish shell. Not run by main installer.
# Run manually if you prefer fish over bash.
#
# Usage:
#   bash fish/install.sh
#   bash fish/install.sh --non-interactive --allow --overwrite

set -euo pipefail

DOTFILES="${DOTFILES:-$HOME/.files}"
source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Fish Shell Setup ==="
echo ""

# Symlink fish config
mkdir -p "$HOME/.config/fish"
symlink "$DOTFILES/fish/config.fish" "$HOME/.config/fish/config.fish"

# Install fisher plugin manager if not present
if ! fish -c "type -q fisher" 2>/dev/null; then
    run "Install fisher plugin manager" \
        fish -c "curl -sL https://git.io/fisher | source && fisher install jorgebucaran/fisher"
fi

# Install plugins from fishfile
if [[ -f "$DOTFILES/fish/fishfile" ]]; then
    run "Install fish plugins" \
        fish -c "fisher install < $DOTFILES/fish/fishfile"
fi

echo ""
echo "Fish setup complete!"
