---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
user-invocable: false
---

# Code Review

Review code changes for production readiness. Used both for self-review (before merge) and PR review (via `/pr` skill).

## Review Principles

- **Verify everything** — don't assume code is correct or incorrect. Read actual files, understand the codebase context, trace through the logic. If you're not sure about something, investigate before commenting. No assumptions.
- **Resolved review threads** — context only. Read what was requested and how it was resolved. Do NOT re-raise. Use to inform understanding if relevant, otherwise discard.
- **`receiving-code-review` takes precedence** — for communication style and how to handle feedback, defer to that skill.

## When to Review

**Mandatory:**

- After each task in subagent-driven development
- After completing major feature
- Before merge to main
- When `/pr` skill invokes this for PR review

**Optional but valuable:**

- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

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

**4. Review** using the checklist and output format in `code-reviewer.md`.

**5. Act on findings:**

- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with reasoning)

## Self-Review via Subagent

For self-review during development, dispatch a code-reviewer subagent:

Use Task tool with code-reviewer type, fill template at `code-reviewer.md`

**Placeholders:**

- `{WHAT_WAS_IMPLEMENTED}` - What you just built
- `{PLAN_OR_REQUIREMENTS}` - What it should do
- `{BASE_SHA}` - Starting commit
- `{HEAD_SHA}` - Ending commit
- `{DESCRIPTION}` - Brief summary

## Red Flags

**Never:**

- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**

- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

See template at: requesting-code-review/code-reviewer.md
