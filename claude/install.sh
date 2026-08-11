#!/usr/bin/env bash
#
# claude/install.sh - Claude Code setup
#
# This script sets up Claude Code configuration.
# Can be run standalone or sourced from the main install.sh.
#
# What it does:
#   1. Symlinks CLAUDE.md to ~/.claude/CLAUDE.md
#   2. Symlinks skills/ to ~/.claude/skills/
#   3. Symlinks agents/ to ~/.claude/agents/
#   4. Symlinks output-styles/ to ~/.claude/output-styles/
#   5. Renders settings.json.template into settings.json with the actual
#      $DOTFILES path, then symlinks it to ~/.claude/settings.json
#   6. Symlinks keybindings.json to ~/.claude/keybindings.json
#
# Usage:
#   bash claude/install.sh
#   bash claude/install.sh --non-interactive --overwrite

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Claude Code Setup ==="
echo ""

# Create .claude directory if it doesn't exist
if [[ ! -d "$HOME/.claude" ]]; then
    mkdir -p "$HOME/.claude"
fi

# Render settings.json from template with the actual $DOTFILES path so the
# install works regardless of where the repo is cloned. The rendered file is
# gitignored.
#
# The render replaces settings.json wholesale, which keeps the template as the
# only source of truth: a key deleted from the template is gone after the next
# install. Anything Claude Code wrote into settings.json itself is discarded.
# See settings.reference.md under `remote.defaultEnvironmentId` for why that is
# the behaviour we want.

# install.d/ runs first. Its hooks export the variables the template references,
# which lets the template pull in content too large to hand-write inline.
load_install_hooks

# Every ${VAR} in the template is expanded from the environment. perl rather
# than sed because the expansions include JSON-escaped text whose backslashes
# sed would reinterpret. An unreferenced variable is a hard error, so a missing
# install hook fails the install instead of rendering an empty prompt.
export DOTFILES
rendered="$(mktemp)"

if ! perl -pe 's/\$\{(\w+)\}/exists $ENV{$1} ? $ENV{$1} : die "unset template var: $1\n"/ge' \
        "$DOTFILES/claude/settings.json.template" > "$rendered"; then
    rm -f "$rendered"
    echo "Error: failed to render settings.json.template" >&2
    exit 1
fi

# Never leave a broken settings.json behind - a malformed one disables Claude Code.
if ! jq empty "$rendered" 2>/dev/null; then
    rm -f "$rendered"
    echo "Error: rendered settings.json is not valid JSON" >&2
    exit 1
fi

mv "$rendered" "$DOTFILES/claude/settings.json"

# Symlink config files
symlink "$DOTFILES/claude/CLAUDE.md" "$HOME/.claude/CLAUDE.md"
symlink "$DOTFILES/claude/skills" "$HOME/.claude/skills"
symlink "$DOTFILES/claude/agents" "$HOME/.claude/agents"
symlink "$DOTFILES/claude/output-styles" "$HOME/.claude/output-styles"
symlink "$DOTFILES/claude/settings.json" "$HOME/.claude/settings.json"
symlink "$DOTFILES/claude/keybindings.json" "$HOME/.claude/keybindings.json"

echo ""
echo "Claude Code setup complete!"
