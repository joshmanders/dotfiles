# Bin Scripts

## GitHub CLI Commands

Always use the `GH_TOKEN` pattern to ensure commands run as the correct user:

```bash
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") gh <command>
```

This overrides the default `gh` auth (which may be a bot account) with the user's personal account.

## Skill Maintenance

When creating, modifying, or deleting bin scripts in `~/.files/bin/`:

- Update the `bin-scripts` skill if the script is relevant for AI assistance
- Scripts that are safe, commonly useful, and don't violate workflow rules should be documented
- Remove deleted scripts from the skill
