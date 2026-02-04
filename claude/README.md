# Claude Code Configuration

Claude Code settings and skills for consistent AI assistance.

## Files

| File               | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `CLAUDE.md`        | Main instructions (symlinked to `~/.claude/CLAUDE.md`) |
| `rules/`           | Modular rules (symlinked to `~/.claude/rules/`)        |
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
3. Symlink `rules/` to `~/.claude/rules/`
4. Symlink `skills/` to `~/.claude/skills/`
5. Symlink `settings.json` to `~/.claude/settings.json`
6. Symlink `keybindings.json` to `~/.claude/keybindings.json`

## Rules

Modular rules in `rules/` directory, auto-loaded by Claude Code:

| Rule                | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| `prime-directives`  | Non-negotiable rules (verify, test, don't push) |
| `task-lifecycle`    | Step-by-step task workflow                      |
| `code-standards`    | Before-writing checks, naming, errors           |
| `boundaries`        | Decision authority, what to ask first           |
| `leave-code-better` | Opportunistic refactoring while touching files  |
| `documentation`     | Keep docs current as code changes               |
| `committing`        | Commit format, co-author, prefixes              |
| `cleanup`           | Debug code removal before presenting work       |
| `pr-format`         | PR title, body, and final checklist             |

## Skills

| Skill      | Purpose                              |
| ---------- | ------------------------------------ |
| `github`   | GitHub Issues and project management |
| `planning` | Work planning through GitHub issues  |

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
