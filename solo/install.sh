#!/usr/bin/env bash
#
# solo/install.sh - process-runner TUI setup

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== solo Setup ==="
echo ""

# Per-cwd config files live in the dotfiles repo; ~/.config/solo is a
# symlink to that directory so edits land in version control.
mkdir -p "$DOTFILES/solo/configs"
symlink "$DOTFILES/solo/configs" "$HOME/.config/solo"

if command -v bun &>/dev/null; then
    run "Install solo dependencies (bun install)" \
        bash -c "cd '$DOTFILES/solo' && bun install"

    # Bun skips node-pty's postinstall, which leaves the prebuilt
    # `spawn-helper` binary without +x. Without this, posix_spawnp fails
    # at runtime. Fix it everywhere it might be loaded from — both the
    # project's node_modules and Bun's global cache (Bun resolves
    # node-pty from there even though node_modules has a copy).
    find "$DOTFILES/solo/node_modules/node-pty/prebuilds" \
         "$HOME/.bun/install/cache" \
         -name spawn-helper -type f -exec chmod +x {} + 2>/dev/null || true
else
    echo "Skip: bun not installed — install via Brewfile, then re-run this script"
fi
