---
name: finalize
description: "Pre-commit quality gate. Re-reads config, verifies work matches rules and codebase patterns, fixes violations. Run before presenting work for review."
user-invocable: true
---

# Finalize

Pre-commit quality gate. Reloads all rules, dispatches a scrutiny agent to review the work cold, then fixes everything it finds.

---

## When to Use

User runs `/finalize`. Never auto-invoked.

---

## The Process

### 1. Reload and Realign

Re-read all config files injected into this session (rules, skills, CLAUDE.md). Realign behavior with what they say.

Acknowledge briefly: "Re-aligned with config files."

### 2. Identify What Changed

```bash
git diff --name-only
git diff
```

Note new files separately — they need pattern checking too.

If nothing changed, stop: "Nothing to finalize."

### 3. Requirements Check

Re-read the original ask (or linked issue if one exists).

- Is every requirement met?
- Is anything half-finished?
- Does the implementation actually solve the problem?

Fix anything incomplete.

### 4. Scope Check

Review all changes against what was asked.

- Were features, abstractions, or config added beyond the ask?
- Were unnecessary helpers or utilities created?
- Was code refactored outside the scope of the task?

Remove anything that wasn't requested.

### 5. Cleanup

Remove from changed files:

| Language | Remove                                                |
| -------- | ----------------------------------------------------- |
| JS/TS    | `console.log`, `console.warn`, `debugger`             |
| PHP      | `dd()`, `dump()`, `var_dump()`, `ray()`               |
| Python   | `print()`, `breakpoint()`, `pprint()`                 |
| All      | Commented-out code, unused imports, TODOs/FIXMEs added during this session |

### 6. Dispatch Code Scrutiny Agent

Dispatch a subagent using the `code-scrutiny.md` template in this skill's directory.

Provide the subagent with:
1. The full `code-scrutiny.md` skill file
2. All config files from this session (rules, skills, CLAUDE.md)
3. The git diff output
4. The changed file list
5. The issue URL or original ask (if available)

When findings come back:
- Fix every item — no cherry-picking, no skipping
- If a finding seems wrong, verify it (read the files the subagent referenced) before dismissing
- Re-run tests after fixes

### 7. Test Coverage

- Verify new behavior has tests
- Check tests assert stable outcomes, not implementation details
- Run the project's test suite **as documented in the loaded config files**
- Fix failures caused by this session's changes

**Never guess which test command to run.** Only use what the config files say.

### 8. Run Formatters

Run formatters **only if explicitly documented in the loaded config files**.

Never run a tool because you think the project might use it. If the config doesn't mention it, don't run it.

### 9. Documentation

If behavior changed, check whether any of these need updating:

- README
- CLAUDE.md
- Skills
- Other project docs

Update what's stale.

### 10. Final Review

```bash
git diff
```

Verify all changes are clean, consistent, and rule-compliant.

Present a summary:

```
Finalize complete.

Changes reviewed: <file list>
Fixed: <what was fixed, or "nothing">
Tests: <pass/fail>
```

Keep the summary short. Only mention what was actually fixed — don't list steps where nothing changed.

---

## Rules

- **Fix, don't ask.** The purpose is to enforce the rules, not to ask about them.
- **Never guess tools.** Only run formatters, linters, and test commands documented in config.
- **Read before judging.** Always read nearby code before deciding something deviates.
- **Stay in scope.** Don't fix things in files that weren't part of this session's work.
- **No committing.** This is a pre-review gate. Stop after presenting the summary.
