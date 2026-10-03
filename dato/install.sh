#!/usr/bin/env bash
#
# dato/install.sh - Dato menu bar calendar setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Dato Setup ==="
echo ""

skip_unless "/Applications/Dato.app" "Dato not installed" || {
    run "Set Dato preferences" bash "$DOTFILES/dato/defaults.sh" \
        || echo "Warning: setting Dato preferences failed; run 'bash dato/install.sh' again" >&2

    # A failure must not abort the other modules.
    if [[ "$(osascript -e 'tell application "System Events" to exists (every login item whose path is "/Applications/Dato.app")' 2>/dev/null)" == "true" ]]; then
        echo "Skip: Dato already starts at login"
    else
        run "Start Dato at login" osascript -e 'tell application "System Events" to make login item at end with properties {path:"/Applications/Dato.app", hidden:false}' \
            || echo "Warning: adding the Dato login item failed; run 'bash dato/install.sh' again" >&2
    fi

    echo ""
    echo "Dato setup complete!"
    echo "Note: Restart Dato for changes to take effect"
}
