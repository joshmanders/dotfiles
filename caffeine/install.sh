#!/usr/bin/env bash
#
# caffeine/install.sh - Caffeine keep-awake utility setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Caffeine Setup ==="
echo ""

skip_unless "/Applications/Caffeine.app" "Caffeine not installed" || {
    run "Set Caffeine preferences" bash "$DOTFILES/caffeine/defaults.sh" \
        || echo "Warning: setting Caffeine preferences failed; run 'bash caffeine/install.sh' again" >&2

    echo ""
    echo "Caffeine setup complete!"
    echo "Note: Restart Caffeine for changes to take effect"
}
