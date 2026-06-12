#!/usr/bin/env bash
#
# cpanel/install.sh - Claude Panel TUI setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== cpanel Setup ==="
echo ""

# Personal config is gitignored — seed it on first install so the symlink
# helper has something to point at.
CONFIG="$DOTFILES/cpanel/config.json"
if [[ ! -e "$CONFIG" ]]; then
    cat > "$CONFIG" <<'EOF'
{
  "ignoreProjects": []
}
EOF
    echo "Seeded $CONFIG with defaults"
fi

mkdir -p "$HOME/.config/cpanel"
symlink "$CONFIG" "$HOME/.config/cpanel/config.json"

if command -v bun &>/dev/null; then
    run "Install cpanel dependencies (bun install)" \
        bash -c "cd '$DOTFILES/cpanel' && bun install"
else
    echo "Skip: bun not installed — install via Brewfile, then re-run this script"
fi
