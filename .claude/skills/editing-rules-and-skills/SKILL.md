---
name: editing-rules-and-skills
description: Use when editing or creating rules or skills (global or project). Routes to the correct voice and process based on whether the work is correction-driven (encoding a behavioral lesson) or informative (documenting a capability).
user-invocable: false
---

# Editing Rules and Skills

## Classify first

- **Correction-driven**: Josh wants a lesson encoded after Claude got something wrong, usually in another project or session. Load `correction-driven.md`.
- **Informative / capability**: Josh wants Claude to know a tool, command, workflow, or process. No incident. Load `informative-capability.md`.

If unsure, ask: "Is this you correcting a behavior, or you wanting me to know about a capability?"

Most global skills are informative; most global behavioral rules are correction-driven.

## Scope

- The behavioral rules in `claude/CLAUDE.md`
- The code-authoring standards in `claude/agents/implementer.md`
- Project rules, as sections in the project `CLAUDE.md`
- Any skill file, global or project

## Placement

Which file and which tree an item belongs in is separate from voice. Load `placement.md` for both.

## Never

- Dramatize the terse rules or agent defs.
- Invent an incident.
- Change a rule's meaning while rewording it.
- Write informative reference in correction voice.
