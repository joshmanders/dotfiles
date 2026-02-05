# Claude Code Configuration

Claude Code settings and skills for consistent AI assistance.

## Files

| File               | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `CLAUDE.md`        | Main instructions (symlinked to `~/.claude/CLAUDE.md`) |
| `rules/`           | Modular rules (symlinked to `~/.claude/rules/`)        |
| `skills/`          | Custom skills (symlinked to `~/.claude/skills/`)       |
| `agents/`          | Subagent definitions (symlinked to `~/.claude/agents/`)|
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
5. Symlink `agents/` to `~/.claude/agents/`
6. Symlink `settings.json` to `~/.claude/settings.json`
7. Symlink `keybindings.json` to `~/.claude/keybindings.json`

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
| `committing`        | Commit format and prefixes                      |
| `cleanup`           | Debug code removal before presenting work       |
| `pr-format`         | PR title, body, and final checklist             |
| `test-quality`      | Test assertions, determinism, signal            |

## Skills

| Skill                       | Purpose                                        |
| --------------------------- | ---------------------------------------------- |
| `brainstorming`             | Design before implementation                   |
| `systematic-debugging`      | Root cause analysis for bugs/failures          |
| `planning`                  | Work planning through GitHub issues            |
| `github`                    | GitHub CLI patterns for issues/PRs             |
| `issue`                     | Start work on a GitHub issue                   |
| `requesting-code-review`    | Verify work before merging                     |
| `receiving-code-review`     | Handle review feedback with rigor              |
| `dispatch-parallel-agents`  | Run independent tasks concurrently             |
| `bin-scripts`               | Custom shell scripts for dev workflows         |
| `test-audit`                | Audit test suites for real confidence          |

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
