---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
user-invocable: false
---

# Code Review

Review code changes for production readiness. Used both for self-review (before merge) and PR review (via `/pr-review` skill).

## Review Principles

- **Deep investigation, not surface scanning** — Read actual files, trace code paths end-to-end, understand call sites and callers. Follow data through the full lifecycle before forming opinions. If you haven't traced the actual execution path, you don't understand the code well enough to comment on it.
- **Verify everything** — don't assume code is correct or incorrect. Investigate before commenting.
- **Resolved review threads** — context only. Do NOT re-raise. Use to inform understanding if relevant, otherwise discard.
- **`receiving-code-review` takes precedence** — for communication style and how to handle feedback, defer to that skill.

## How to Review

**1. Get git range:**

```bash
BASE_SHA=$(git merge-base origin/<base-branch> HEAD)
HEAD_SHA=$(git rev-parse HEAD)
```

**2. Get the diff and changed files:**

```bash
git diff --stat "$BASE_SHA".."$HEAD_SHA"
git diff "$BASE_SHA".."$HEAD_SHA"
git diff --name-only "$BASE_SHA".."$HEAD_SHA"
```

**Never use `gh pr diff`** — local diff is the source of truth.

**3. Read changed files** for full context — not just diff hunks.

**4. Trace code paths** — For each significant change, follow the execution path: who calls this? What does the caller expect? What happens downstream? Read the callers, the callees, the types, the tests.

**5. Check codebase patterns** — Read nearby code (same directory, similar files) to understand existing conventions. Flag deviations from established patterns and suggest the existing approach.

**6. Review** using the criteria and output format in `code-reviewer.md`.

**7. Act on findings:**

- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with reasoning)

## Output Rules

**Only surface actionable items.** If a file has no issues, skip it entirely. No narration, no affirmations, no commentary on working code.

- Report only: bugs, regressions, security issues, pattern violations, and concrete alternatives
- If there are no issues, say so in one line
- Use the output format from `code-reviewer.md`

## Self-Review via Subagent

For self-review during development, dispatch a code-reviewer subagent:

Use Task tool with code-reviewer type, fill template at `code-reviewer.md`

**Placeholders:**

- `{WHAT_WAS_IMPLEMENTED}` - What you just built
- `{PLAN_OR_REQUIREMENTS}` - What it should do
- `{BASE_SHA}` - Starting commit
- `{HEAD_SHA}` - Ending commit
- `{DESCRIPTION}` - Brief summary

See template at: requesting-code-review/code-reviewer.md
