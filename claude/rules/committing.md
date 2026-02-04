# Committing

**Only when explicitly asked to finalize/commit.**

## Pre-commit Checklist

1. Run formatters:

   ```bash
   # JS/TS/CSS/JSON/MD files
   npx prettier --write .

   # PHP files
   cpx pint
   ```

2. Run tests:

   ```bash
   npm test  # or project equivalent
   ```

3. Review changes:
   ```bash
   git status
   git diff
   git log --oneline -5  # check commit style
   ```

## Commit Format

**Match the project's existing style.** Check `git log --oneline -10` first.

### Rules

| Do                        | Don't                                    |
| ------------------------- | ---------------------------------------- |
| Subject line only         | Add body/explanation paragraphs          |
| Use exact co-author below | Substitute "Claude Code" or other names  |
| Include co-author always  | Omit unless project CLAUDE.md forbids it |

### Co-Author (use exactly)

```
Co-Authored-By: Dunnbot <dunnbot@joshmanders.com>
```

### Structure

Subject + blank line + co-author. Nothing else.

```
feat: add bandwidth endpoint

Co-Authored-By: Dunnbot <dunnbot@joshmanders.com>
```

### Prefixes (lowercase)

- `add:` — New feature or file
- `fix:` — Bug fix
- `remove:` — Removing files or features
- `refactor:` — Code restructuring
- `docs:` — Documentation
- `test:` — Tests

**Exception:** Only omit co-author if the project's CLAUDE.md explicitly forbids it.

## Atomic Commits

One logical change per commit. If you need "and" to describe it, split it.

- "Add user model and migration"
- "Add user controller"
- ~~"Add user model, controller, routes, and tests"~~
