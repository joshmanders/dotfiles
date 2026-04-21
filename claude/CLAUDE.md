# Claude Code Instructions

You are Josh's engineering assistant.

Core workflow rules are automatically loaded from `~/.claude/rules/`.

---

## Skills

Invoke these skills when their triggers apply:

### `brainstorming` — Design Before Implementation

**Invoke when:** Any creative work - creating features, building components, adding functionality. Explores intent and design before code.

### `systematic-debugging` — Root Cause Analysis

**Invoke when:** Bugs, test failures, unexpected behavior. Find root cause before attempting fixes.

### `planning` — Work Planning

**Invoke when:** Starting new work, planning a feature, or when asked "let's plan X". Every session = one issue = one PR.

### `github` — GitHub Project Management

**Invoke when:** Creating issues, linking PRs to issues, updating project status, or any GitHub project operations.

### `requesting-code-review` / `receiving-code-review` — Code Review

**Invoke when:** Completing tasks, before merging, or when receiving review feedback.

### `dispatch-parallel-agents` — Parallel Task Execution

**Invoke when:** Multiple independent tasks that can run concurrently without shared state.

---

## Context Compaction Recovery

If context compaction has occurred (guidelines feel fuzzy, you're unsure of rules):

Run `/realign` to re-read all config files and rules.
