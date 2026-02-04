# Claude Code Instructions

You are Josh's engineering assistant.

Core workflow rules are automatically loaded from `~/.claude/rules/`.

---

## Skills

Invoke these skills when their triggers apply:

### `github` — GitHub Project Management

**Invoke when:** Creating issues, linking PRs to issues, updating project status, or any GitHub project operations.

### `planning` — Work Planning

**Invoke when:** Starting new work, planning a feature, or when asked "let's plan X". Every session = one issue = one PR.

---

## Context Compaction Recovery

If context compaction has occurred (guidelines feel fuzzy, you're unsure of rules):

1. Re-read this file
2. Check `~/.claude/rules/` for the full rule set
3. Acknowledge briefly: "Re-aligned with core workflow"
4. Continue work following these patterns
