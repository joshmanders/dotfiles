# Correction-Driven Work

Load this when the work is about encoding a behavioral lesson — Josh has been burned by Claude getting something wrong and wants the lesson documented so it doesn't recur.

## Why the voice asymmetry matters

Global rules and memory entries (`~/.claude/projects/*/memory/`) are injected into context the same way — there is no system-level priority between them. In practice memory entries win attention because they're written in an emphatic, incident-grounded voice. Rule files written in calm standards-doc prose lose to louder memory entries when both compete for behavioral influence.

This is the entire reason correction work has its own voice. Future edits must not quietly "clean up" the emphatic voice on load-bearing items back into neutral prose.

If you find yourself thinking "this is too dramatic, let me tone it down" while editing a load-bearing correction rule — stop. The drama is the point. It's what gets attention to survive.

## How correction work typically arrives

The frustration that prompted the work happened **somewhere else** — a different project, a different session, a moment where Claude misbehaved badly enough that Josh now wants the lesson encoded. The incident is in Josh's head, not in your loaded context.

- Loaded memory entries from this project (e.g. `feedback_*`) are structural examples of voice, not a catalog of incidents to mine.
- "I don't see an incident in my context, so there isn't one" is wrong. Ask Josh what happened.
- "Verify, don't assume" applies doubly — don't invent the incident, don't paraphrase a vague feeling, ask for the actual story.

## The Voice Rules

### **Load-bearing items get promoted.**

A load-bearing item is one that, if ignored, causes Josh real problems — recurring frustration, wasted work, broken trust, lost time. These get:

- A bold/starred heading (`## **Rule statement.**`)
- A short paragraph stating the rule plainly
- A **Why:** line — the motivation, ideally tied to a concrete incident
- A **How to apply:** line or bullet list — when the rule fires and what to do

Match the structure of memory entries — short headline, **Why:** tied to a concrete incident, **How to apply:** as a bullet list. The `feedback_*` files in this project's memory are structural examples to mirror, not a list of incidents that defines the universe of what's worth promoting.

### **Calm standards stay calm.**

Items that are genuinely just conventions — "use lowercase commit prefixes", "name things concisely", "remove unused imports" — do not get forced emphasis. They live as short principle statements or do/don't tables. Promoting everything dilutes the signal on the items that actually matter.

The test: is this something Josh has corrected me on, or expressed frustration about? If yes, it's load-bearing. If it's just a convention I've never gotten wrong, it's calm.

### **Never fabricate incidents.**

This is the hard rule. If the file doesn't already record the motivation behind a load-bearing rule, **stop and ask Josh** for the incident or reasoning before promoting it. Do not invent war stories. Do not write "Josh got burned by X" when you don't know that X happened.

Acceptable framings when there is no specific incident:
- A stated principle ("Josh wants the gate"; "Josh maintains control over what goes out under his name")
- A repeated preference ("Josh has corrected this repeatedly")
- A concrete cost ("the cost of confirming is one round trip; the cost of the wrong action can be catastrophic — lost work, rewritten history, leaked secrets, things Josh can't undo")

Unacceptable:
- "During a session in March, Claude did X and Josh had to..." (fabricated)
- "There was an incident where..." (vague-but-implies-specifics)

### **Don't change the rule. Only reframe it.**

The semantics of each rule are fixed unless Josh explicitly updates them. The voice changes; the substance does not. If you find yourself wanting to soften, tighten, or expand a rule mid-rewrite, that's a separate conversation — stop and ask.

### **No `[[name]]` memory links in rule files.**

`[[name]]` is memory's internal cross-reference convention — memory entries use it to link to other memory entries within the same project's memory directory. Rule files aren't part of that linking system. A `[[feedback-verify-dont-assume]]` written in a rule file is literal text that looks like a link but resolves to nothing. It's noise everywhere it appears.

Instead:
- Inline the Why fully so the rule file is self-contained.
- For sibling references within the global rules, use the plain filename: `` see `prime-directives.md` ``.
- For sibling references within a skill, link relative to the skill directory.

### **Visual rhythm: promoted items get separators.**

Memory-style sections are separated by `---` horizontal rules. Calm tail sections (the "Other Standing Rules" block) sit together without separators. This visually signals "these are the load-bearing items; these are the conventions."

### **Read on every session.**

Top-level "Non-negotiable" callouts on rule files should include "Read on every session" when the file's items are universally applicable. This is a hint to future-me that the file isn't background reference — it's active instruction.

## Process

1. **Get the incident from Josh.** The Why lives in his head — the frustration that prompted this work happened in another project or session. Ask him to describe what happened and why he wants it captured. Don't reconstruct from loaded context. Don't invent details to fill gaps. If a memory entry on the same topic happens to be loaded, mirror its Why inline (don't link).
2. **Identify load-bearing vs calm within the file.** For each item, ask: has Josh been burned by this, or is it just a convention?
3. **Promote load-bearing items, leave calm items calm.** Don't promote everything to be consistent — that dilutes signal.
4. **Reframe, don't rewrite the rule.** Keep semantics identical. Only change presentation. If you want to soften or expand a rule, that's a separate conversation — ask.
5. **Show one file's diff before doing the rest.** When rewriting multiple files, finish one, present it, wait for validation, then proceed.
