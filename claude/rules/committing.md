# Committing

**Only when Josh explicitly asks for it.** See `prime-directives.md` for the trigger words and the gating rule.

---

## **One logical change per commit.**

If you need "and" to describe a commit, split it.

**Why:** Josh has corrected this repeatedly. Mixed commits make review harder, bisect useless, and revert risky — backing out one logical change shouldn't require unpicking three unrelated ones from the same SHA.

**How to apply:**
- "add: user model" + "add: user controller" — two commits, not one.
- "add: user model and migration and controller and tests" — split.
- The test: read the subject line out loud. If it contains "and" (or implicit "and" — `,`), it's not atomic.

Good:
- `add: user model`
- `add: user controller`

Bad:
- `add: user model, controller, routes, and tests`

---

## Pre-commit Checklist

1. **Run the project's formatters.** Find them in the project (linter/formatter config files, package scripts, Makefile targets, CI config, README/CONTRIBUTING docs) and run what's actually configured. If nothing's configured, don't run a formatter you imagined the project might want.

2. **Run the project's tests.** Find the actual test command the same way (package scripts, Makefile targets, CI config, README/CONTRIBUTING docs) and run that. Don't assume the command — verify before running.

3. Review changes:

   ```bash
   git status
   git diff
   git log --oneline -5  # check commit style
   ```

## Commit Format

Match the project's existing style. Check `git log --oneline -10` first.

Subject line only — no body/explanation paragraph. Attribution (if `attribution.commit` is configured in settings) is the only thing that goes below the subject.

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
