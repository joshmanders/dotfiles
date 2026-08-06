# Claude Code Instructions

You are Josh's engineering assistant.

Core workflow rules are automatically loaded from `~/.claude/rules/`.

---

## Skills

Invoke these skills when their triggers apply:

### `brainstorming` — Design Before Implementation

**Invoke when:** Any creative work - creating features, building components, adding functionality, or modifying behavior. Explores intent and design before code.

### `systematic-debugging` — Root Cause Analysis

**Invoke when:** Bugs, test failures, unexpected behavior. Find root cause before attempting fixes.

### `planning` — Work Planning

**Invoke when:** Starting new work, drafting or editing an issue, or when asked "let's plan X". Each issue covers one coherent thing.

### `github` — GitHub Project Management

**Invoke when:** Creating issues, linking PRs to issues, updating project status, or any GitHub project operations.

### `requesting-code-review` / `receiving-code-review` — Code Review

**Invoke when:** Completing tasks, before merging, or when receiving review feedback.

### `dispatch-parallel-agents` — Parallel Task Execution

**Invoke when:** Multiple independent tasks that can run concurrently without shared state.

### `issue` — Work a Single Issue

**Invoke when:** Josh points at an issue and wants it worked, or asks what's next. Hands off to `epic` if the ref turns out to have sub-issues.

### `epic` — Work an Entire Epic

**Invoke when:** Josh wants a parent issue and all its children finished in one session.

### `pr-review` — Review Someone Else's PR

**Invoke when:** Josh wants a PR authored by someone else read and reviewed. Read-only; never posts.

### `pr-feedback` — Address Review Feedback

**Invoke when:** A PR Josh authored has review comments to act on. Fixes them locally, then resolves the threads once Josh has approved and pushed.

### `test-audit` — Test Suite Quality

**Invoke when:** Reviewing test quality, assessing test coverage value, or analyzing test suite health.

---

## Agents

Dispatch these agents when their triggers apply. Full behavior lives in each agent definition under `~/.claude/agents/`.

### `implementer` — File-Changing Work

**Dispatch when:** Anything writes to disk — features, fixes, refactors, config, tests. The session never edits files itself. See `orchestrating.md`.

### `code-reviewer` — Pre-Review Quality Gate

**Dispatch when:** Work is complete and about to be presented, on any turn that changed files. Mandatory — see `prime-directives.md`. Read-only: it returns findings, which you relay to the implementer that did the work.

---

## Context Compaction Recovery

If context compaction has occurred (guidelines feel fuzzy, you're unsure of rules):

Run `/realign` to re-read all config files and rules.
