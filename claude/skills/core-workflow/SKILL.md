---
name: core-workflow
description: Foundational workflow and code standards. ALWAYS ACTIVE on every task.
---

# Core Workflow

**This skill is always active. Every task. No exceptions.**

---

## Prime Directives

1. **Verify, don't assume** — Look it up. Read the docs. Check the code. Never trust learned knowledge.
2. **Follow existing patterns** — Read nearby code before writing. Match what's there.
3. **Tests are mandatory** — Write tests. Run tests. Fix failing tests.
4. **Never push** — Josh pushes. You commit when asked.
5. **Never create branches** — Josh creates branches.
6. **Completing work ≠ committing** — Present work → wait for review → commit only when told.

---

## Task Lifecycle

````
1. Understand the ask
2. Read nearby code to learn patterns
3. Implement following those patterns
4. Run tests, fix failures
5. Clean up (debug code, unused imports)
6. Present what was done
7. STOP — wait for review
8. Iterate if needed
9. Commit ONLY when explicitly asked to finalize/commit
````

**Critical:** Steps 7-9 are gated. Never skip to commit.

---

## Before Writing Code

| Do This                                | Not This                            |
| -------------------------------------- | ----------------------------------- |
| Read 2-3 similar files in the codebase | Assume patterns from other projects |
| Check current docs/APIs via search     | Trust training data about libraries |
| Look at recent git history for style   | Invent new conventions              |
| Ask if unsure about architecture       | Make structural decisions alone     |

---

## Code Standards

**Naming:** Concise. Not verbose.

**Comments:** Explain _why_, not _what_. No obvious comments.

**Errors:** Fail fast. Log errors. Graceful degradation where appropriate.

**Dependencies:** Latest stable versions only. Look up current docs before using.

---

## Before Presenting Work

Remove all of these:

| Language | Remove                                                           |
| -------- | ---------------------------------------------------------------- |
| JS/TS    | `console.log`, `console.warn`, `debugger`                        |
| PHP      | `dd()`, `dump()`, `var_dump()`, `ray()`                          |
| Python   | `print()`, `breakpoint()`, `pprint()`                            |
| All      | Commented-out code, unused imports, TODO/FIXME added during work |

---

## Committing

**Only when explicitly asked to finalize/commit.**

### Pre-commit

1. Run formatters:

   ````bash
   # JS/TS/CSS/JSON/MD files
   npx prettier --write .

   # PHP files
   cpx pint
   ````

2. Run tests:

   ````bash
   npm test        # or project equivalent
   ````

3. Review changes:
   ````bash
   git status
   git diff
   git log --oneline -5  # check commit style
   ````

### Commit Format

**Match the project's existing style.** Check `git log --oneline -10` first.

**Structure:** Subject line + blank line + footer. No body text.

````
feat: add bandwidth endpoint

Co-Authored-By: Dunnbot <dunnbot@joshmanders.com>
````

Common prefixes (lowercase):

- `add:` — New feature or file
- `fix:` — Bug fix
- `remove:` — Removing files or features
- `refactor:` — Code restructuring
- `docs:` — Documentation
- `test:` — Tests

**Exception:** Some work repos may not want co-author footers. Check project conventions.

### Atomic Commits

One logical change per commit. If you need "and" to describe it, split it.

- ✅ "Add user model and migration"
- ✅ "Add user controller"
- ❌ "Add user model, controller, routes, and tests"

---

## Never Do

- ❌ `npm run build` or production builds
- ❌ `npm run typecheck` (editor handles this)
- ❌ Push to remote
- ❌ Create branches
- ❌ `git push`, `git push --force`
- ❌ `--no-verify` on commits
- ❌ Interactive git commands (`-i` flag)
- ❌ Rewrite pushed history
- ❌ Skip tests
- ❌ Commit without being asked

---

## PR Summary Format

When work is complete on a feature branch:

**Title:**

````
feat: short description
````

**Summary:**

````
Brief description of what and why.

Closes #123
````

---

## Decision Authority

| You Decide                     | Ask First                  |
| ------------------------------ | -------------------------- |
| Implementation details         | Architecture decisions     |
| Following established patterns | Adding dependencies        |
| Refactoring within scope       | Changing project structure |
| Test approach                  | Expanding scope            |

**Scope creep:** Flag bigger issues, stay focused on current task.

---

## Final Checklist

Before declaring done:

- [ ] Requirements met
- [ ] Follows existing patterns (verified by reading nearby code)
- [ ] Debug code removed
- [ ] Tests pass
- [ ] New tests written for new functionality
- [ ] Formatters run
- [ ] `git diff` reviewed
- [ ] Documentation updated if behavior changed
