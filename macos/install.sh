#!/usr/bin/env bash
#
# macos/install.sh - macOS system preferences and power settings setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

# Only run on macOS
if [[ "$(uname)" == "Darwin" ]]; then
    echo ""
    echo "=== macOS Defaults ==="
    echo ""

    run "Apply macOS system preferences" bash "$DOTFILES/macos/defaults.sh" \
        || echo "Warning: applying macOS system preferences failed; run 'bash macos/install.sh' again" >&2

    # Power settings, one pmset call per power source (-c charger, -b battery).
    # pmset must be run as root to modify any setting:
    #   displaysleep - display sleep timer in minutes, 0 disables it
    # A failure must not abort the other modules. That covers a Mac with no
    # battery too: pmset(1) does not say what -b does there.
    run "Set power settings on charger" \
        sudo pmset -c displaysleep 0 \
        || echo "Warning: setting charger power settings failed; run 'sudo pmset -c displaysleep 0'" >&2

    run "Set power settings on battery" \
        sudo pmset -b displaysleep 30 \
        || echo "Warning: setting battery power settings failed; run 'sudo pmset -b displaysleep 30'" >&2

    # Launches Brave with its --make-default-browser switch. A failure must not
    # abort the other modules.
    skip_unless "/Applications/Brave Browser.app" "Brave not installed" || {
        run "Make Brave the default browser" \
            open -a "Brave Browser" --args --make-default-browser \
            || echo "Warning: setting the default browser failed; set it in System Settings" >&2
    }

    echo ""
    echo "macOS defaults applied!"
else
    echo "Skip: macOS defaults (not on macOS)"
fi
