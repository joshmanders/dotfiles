#!/usr/bin/env bash
#
# gh/install.sh - GitHub CLI configuration setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== GitHub CLI Setup ==="
echo ""

skip_unless gh "gh not installed" || {
    mkdir -p "$HOME/.config/gh"
    symlink "$DOTFILES/gh/config.yml" "$HOME/.config/gh/config.yml"

    # The install needs the network, which a fresh machine may not have ready.
    # A failure must not abort the other modules.
    if [[ "$(gh extension list 2>/dev/null)" == *github/gh-stack* ]]; then
        echo "Skip: gh-stack extension already installed"
    else
        run "Install the gh-stack extension" \
            gh extension install github/gh-stack \
            || echo "Warning: gh-stack install failed; run 'gh extension install github/gh-stack' to retry" >&2
    fi

    echo ""
    echo "GitHub CLI setup complete!"
    echo "Note: Run 'gh auth login' to authenticate"
}
