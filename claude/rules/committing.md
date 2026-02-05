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

| Do                | Don't                           |
| ----------------- | ------------------------------- |
| Subject line only | Add body/explanation paragraphs |

### Structure

Subject line + attribution (if `attribution.commit` is configured in settings).

```
feat: add bandwidth endpoint

Co-Authored-By: ...
```

### Prefixes (lowercase)

- `add:` — New feature or file
- `fix:` — Bug fix
- `remove:` — Removing files or features
- `refactor:` — Code restructuring
- `docs:` — Documentation
- `test:` — Tests

## Atomic Commits

One logical change per commit. If you need "and" to describe it, split it.

- "Add user model and migration"
- "Add user controller"
- ~~"Add user model, controller, routes, and tests"~~
