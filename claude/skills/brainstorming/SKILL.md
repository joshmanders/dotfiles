---
name: brainstorming
description: You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
user-invocable: false
---

# Brainstorming

**Understand the idea:**

- Check project state first (files, docs, recent commits).
- One question per message; multiple choice when possible.
- Pin down purpose, constraints, success criteria.

**Explore approaches:**

- Propose 2-3 approaches with trade-offs, leading with your recommendation and why.
- YAGNI: cut unnecessary features.

**Present the design:**

- In sections of 200-300 words, asking after each whether it looks right.
- Cover architecture, components, data flow, error handling, testing.
- Go back and clarify when something doesn't fit.

**After the design:**

- Write the validated design to a plan file, using the `humanize` skill.
- Ask "Ready to start planning implementation?"; if yes, use the `planning` skill to create the GitHub issue.
