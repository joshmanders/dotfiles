#!/usr/bin/env bash
#
# claude/install.sh - Claude Code setup
#
# This script sets up Claude Code configuration.
# Can be run standalone or sourced from the main install.sh.
#
# What it does:
#   1. Symlinks CLAUDE.md to ~/.claude/CLAUDE.md
#   2. Symlinks rules/ to ~/.claude/rules/
#   3. Symlinks skills/ to ~/.claude/skills/
#   4. Symlinks agents/ to ~/.claude/agents/
#   5. Symlinks settings.json to ~/.claude/settings.json
#   6. Symlinks keybindings.json to ~/.claude/keybindings.json
#
# Usage:
#   bash claude/install.sh
#   bash claude/install.sh --non-interactive --overwrite

set -euo pipefail

DOTFILES="${DOTFILES:-$HOME/.files}"
source "$DOTFILES/lib/index.sh"

echo ""
echo "=== Claude Code Setup ==="
echo ""

# Create .claude directory if it doesn't exist
if [[ ! -d "$HOME/.claude" ]]; then
    mkdir -p "$HOME/.claude"
fi

# Symlink config files
symlink "$DOTFILES/claude/CLAUDE.md" "$HOME/.claude/CLAUDE.md"
symlink "$DOTFILES/claude/skills" "$HOME/.claude/skills"
symlink "$DOTFILES/claude/agents" "$HOME/.claude/agents"
symlink "$DOTFILES/claude/rules" "$HOME/.claude/rules"
symlink "$DOTFILES/claude/settings.json" "$HOME/.claude/settings.json"
symlink "$DOTFILES/claude/keybindings.json" "$HOME/.claude/keybindings.json"

echo ""
echo "Claude Code setup complete!"
