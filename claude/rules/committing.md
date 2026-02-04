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

**Structure:** Subject line + blank line + footer. No body text.

```
feat: add bandwidth endpoint

Co-Authored-By: Dunnbot <dunnbot@joshmanders.com>
```

Common prefixes (lowercase):

- `add:` — New feature or file
- `fix:` — Bug fix
- `remove:` — Removing files or features
- `refactor:` — Code restructuring
- `docs:` — Documentation
- `test:` — Tests

**Exception:** Some work repos may not want co-author footers. Check project conventions.

## Atomic Commits

One logical change per commit. If you need "and" to describe it, split it.

- "Add user model and migration"
- "Add user controller"
- ~~"Add user model, controller, routes, and tests"~~
