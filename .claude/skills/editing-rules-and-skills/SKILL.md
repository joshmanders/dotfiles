---
name: editing-rules-and-skills
description: Use when editing or creating rules or skills (global or project). Routes to the correct voice and process based on whether the work is correction-driven (encoding a behavioral lesson) or informative (documenting a capability).
user-invocable: false
---

# Editing Rules and Skills

## Two flavors of work — classify first

Before touching anything, identify which kind of work this is. The two flavors look superficially similar but want very different voices and processes, and classifying wrong is the single biggest way this skill gets misapplied.

- **Correction-driven** — Josh has been burned by Claude getting something wrong and wants the lesson encoded so it doesn't recur. Reactive: a frustration arrived from another project or session. Load **`correction-driven.md`** before editing.
- **Informative / capability** — Josh wants to surface a tool, command, workflow, or process so Claude can use it competently. Proactive: no incident, just a capability worth documenting. Load **`informative-capability.md`** before editing.

If unsure, ask Josh in one sentence: "Is this you correcting a behavior, or you wanting me to know about a capability?"

Most existing global skills (`github`, `bin-scripts`, `brainstorming`, `planning`, `dispatch-parallel-agents`, `writing-clearly-and-concisely`) are informative. Most of the numbered behavioral rules are correction-driven. Memory entries are always correction-driven.

## When this skill fires

- Editing the numbered behavioral rules in `claude/CLAUDE.md`
- Editing the code-authoring or code-review standards in the agent defs (`claude/agents/implementer.md`, `claude/agents/code-reviewer.md`)
- Editing project rules, which live as sections in the project `CLAUDE.md`
- Editing or creating any skill file (global or project)
- Adding new items to any of the above
- Anytime Josh says "let's document this so it doesn't happen again" (correction) or "let's make sure you know about X" (informative)

It does **not** fire when editing memory entries (`~/.claude/projects/*/memory/`) — those already use this voice natively.

## Scope decision

Whether the work is correction or informative, it also has a scope: global (applies everywhere) or project (only when working in this dotfiles repo). Misplaced rules either pollute every project or silently stop applying. If unsure which scope a new rule or skill belongs in, load **`scope-global-vs-project.md`**.

## What this skill is NOT

- Not a license to make the terse numbered rules or agent defs dramatic for the sake of drama.
- Not a license to invent incidents to anchor promoted memory entries.
- Not a license to change the semantics of a rule while reframing it.
- Not a license to dress informative reference up in correction voice.
- Not applied to memory entries — those already have the right voice.
