#!/usr/bin/env bash
#
# orbstack/install.sh - OrbStack containers and Kubernetes setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== OrbStack Setup ==="
echo ""

skip_unless "/Applications/OrbStack.app" "OrbStack not installed" || {
    symlink "$DOTFILES/orbstack/vmconfig.json" "$HOME/.orbstack/vmconfig.json"

    # A failure must not abort the other modules.
    if [[ "$(osascript -e 'tell application "System Events" to exists (every login item whose path is "/Applications/OrbStack.app")' 2>/dev/null)" == "true" ]]; then
        echo "Skip: OrbStack already starts at login"
    else
        run "Start OrbStack at login" osascript -e 'tell application "System Events" to make login item at end with properties {path:"/Applications/OrbStack.app", hidden:false}' \
            || echo "Warning: adding the OrbStack login item failed; run 'bash orbstack/install.sh' again" >&2
    fi

    echo ""
    echo "OrbStack setup complete!"
    echo "Note: Restart OrbStack for changes to take effect"
}
