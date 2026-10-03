#!/usr/bin/env bash
#
# kap/install.sh - Kap screen recorder setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Kap Setup ==="
echo ""

skip_unless "/Applications/Kap.app" "Kap not installed" || {
    symlink "$DOTFILES/kap/config.json" "$HOME/Library/Application Support/Kap/config.json"

    # A failure must not abort the other modules.
    if [[ "$(osascript -e 'tell application "System Events" to exists (every login item whose path is "/Applications/Kap.app")' 2>/dev/null)" == "true" ]]; then
        echo "Skip: Kap already starts at login"
    else
        run "Start Kap at login" osascript -e 'tell application "System Events" to make login item at end with properties {path:"/Applications/Kap.app", hidden:false}' \
            || echo "Warning: adding the Kap login item failed; run 'bash kap/install.sh' again" >&2
    fi

    echo ""
    echo "Kap setup complete!"
    echo "Note: Restart Kap for changes to take effect"
}
