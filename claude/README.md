# Claude Code Configuration

Claude Code settings and skills for consistent AI assistance.

## Files

| File               | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `CLAUDE.md`        | Main instructions (symlinked to `~/.claude/CLAUDE.md`) |
| `skills/`          | Custom skills (symlinked to `~/.claude/skills/`)       |
| `settings.json`    | Permissions and plugins (symlinked to `~/.claude/`)    |
| `keybindings.json` | Custom keybindings (symlinked to `~/.claude/`)         |

## Installation

```bash
bash claude/install.sh
```

This will:

1. Create `~/.claude` directory if needed
2. Symlink `CLAUDE.md` to `~/.claude/CLAUDE.md`
3. Symlink `skills/` to `~/.claude/skills/`
4. Symlink `settings.json` to `~/.claude/settings.json`
5. Symlink `keybindings.json` to `~/.claude/keybindings.json`

## Skills

| Skill               | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `core-workflow`     | Always active. Task lifecycle, commit format. |
| `github-workflow`   | GitHub Issues and project management.         |
| `planning-workflow` | Work tracking through GitHub issues.          |

## Customization

### Add a new skill

1. Create directory: `skills/my-skill/`
2. Add `SKILL.md` with frontmatter:
   ```yaml
   ---
   name: my-skill
   description: When to use this skill
   ---
   ```

Skills are automatically available since the folder is symlinked.

### Edit instructions

Modify `CLAUDE.md` directly. Changes apply to all Claude Code sessions.

### Add keybindings

Edit `keybindings.json`:

```json
{
  "bindings": [{ "key": "ctrl+s", "command": "submit" }]
}
```

### Change settings

Edit `settings.json` for permissions mode and enabled plugins.
