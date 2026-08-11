# Correction-Driven Work

Load this when the work is about encoding a behavioral lesson — Josh has been burned by Claude getting something wrong and wants the lesson documented so it doesn't recur.

## Where a correction lands

A correction has three possible homes, and classifying which one it belongs to comes before touching anything:

- **A behavioral lesson about how the session works** → a terse numbered item in the rules list in `claude/CLAUDE.md`, placed in the correct tier (see below). Calm, imperative, one concern per item — the list is uniformly terse.
- **A lesson about how code gets authored or reviewed** → prose in the relevant agent definition (`claude/agents/implementer.md` for authoring, cleanup, tests, and docs; `claude/agents/code-reviewer.md` for review and review output), matching that file's existing prose.
- **An incident-grounded lesson tied to this account or workflow** → a memory entry (`~/.claude/projects/*/memory/`), in the emphatic voice described below.

## The numbered rules list in `claude/CLAUDE.md`

The global behavioral rules are a single flat numbered list, items 1–80, inline in `claude/CLAUDE.md` right after the `---` that follows "You are Josh's engineering assistant." There is no `## Rules` heading and no section headings — just the numbered list.

The list has four implicit priority tiers, in this order:

1. **Orchestrating** — what you are (delegate the work, keep the conversation).
2. **Working with the user** — voice, terseness, presenting work.
3. **Safety / correctness** — verification, git guards, destructive actions.
4. **Task specifics** — commits, PRs, issues, GitHub actions, where knowledge lives.

A correction that belongs here becomes one terse numbered item dropped into the matching tier. It gets no bold heading, no `**Why:**` block, no `---` separator — the list is uniformly terse and every item earns its place by being one or two imperative sentences, one concern each. Match the surrounding items exactly:

- Portable wording — **"the user", never "Josh"**. These rules ship to every project.
- `master`, never `main`.
- Imperative voice, one concern per item.
- No heading, no Why/How block, no separator.

## Why the memory voice asymmetry matters

Memory entries (`~/.claude/projects/*/memory/`) and the loaded global context are injected the same way — there is no system-level priority between them. In practice memory entries win attention because they're written in an emphatic, incident-grounded voice. The same lesson written in calm standards-doc prose loses to a louder memory entry when both compete for behavioral influence.

This is the entire reason a memory entry has its own voice. Future edits must not quietly "clean up" the emphatic voice on a load-bearing memory entry back into neutral prose.

If you find yourself thinking "this is too dramatic, let me tone it down" while editing a load-bearing memory entry — stop. The drama is the point. It's what gets attention to survive.

## How correction work typically arrives

The frustration that prompted the work happened **somewhere else** — a different project, a different session, a moment where Claude misbehaved badly enough that Josh now wants the lesson encoded. The incident is in Josh's head, not in your loaded context.

- Loaded memory entries from this project (e.g. `feedback_*`) are structural examples of voice, not a catalog of incidents to mine.
- "I don't see an incident in my context, so there isn't one" is wrong. Ask Josh what happened.
- "Verify, don't assume" applies doubly — don't invent the incident, don't paraphrase a vague feeling, ask for the actual story.

## The memory-entry voice

These rules govern a correction that lands as a **memory entry**. The numbered rules list and the agent defs stay uniformly terse — a correction headed there gets none of this treatment (see the sections above). This voice is for memory only.

### **Load-bearing entries get promoted.**

A load-bearing entry is one that, if ignored, causes Josh real problems — recurring frustration, wasted work, broken trust, lost time. These get:

- A bold/starred headline
- A short paragraph stating the lesson plainly
- A **Why:** line — the motivation, ideally tied to a concrete incident
- A **How to apply:** line or bullet list — when the lesson fires and what to do

Mirror the existing `feedback_*` files in this project's memory — short headline, **Why:** tied to a concrete incident, **How to apply:** as a bullet list. They are structural examples to match, not a list of incidents that defines the universe of what's worth promoting.

### **Calm standards stay out of memory.**

Items that are genuinely just conventions — "use lowercase commit prefixes", "name things concisely", "remove unused imports" — don't belong in a memory entry at all, and never get forced emphasis. A code convention lives as calm prose in the relevant agent def; a session-behavior convention lives as a terse item in the numbered list. Promoting everything dilutes the signal on the entries that actually matter.

The test: is this something Josh has corrected me on, or expressed frustration about, that's tied to this account or workflow? If yes, it's a load-bearing memory entry. If it's just a convention, it belongs in the numbered list or an agent def instead.

### **Never fabricate incidents.**

This is the hard rule. If you don't already know the motivation behind a load-bearing entry, **stop and ask Josh** for the incident or reasoning before promoting it. Do not invent war stories. Do not write "Josh got burned by X" when you don't know that X happened.

Acceptable framings when there is no specific incident:
- A stated principle ("Josh wants the gate"; "Josh maintains control over what goes out under his name")
- A repeated preference ("Josh has corrected this repeatedly")
- A concrete cost ("the cost of confirming is one round trip; the cost of the wrong action can be catastrophic — lost work, rewritten history, leaked secrets, things Josh can't undo")

Unacceptable:
- "During a session in March, Claude did X and Josh had to..." (fabricated)
- "There was an incident where..." (vague-but-implies-specifics)

### **Don't change the lesson. Only reframe it.**

The semantics of a correction are fixed unless Josh explicitly updates them. The voice changes; the substance does not. If you find yourself wanting to soften, tighten, or expand a lesson mid-rewrite, that's a separate conversation — stop and ask.

### **`[[name]]` links belong to memory only.**

`[[name]]` is memory's internal cross-reference convention — memory entries use it to link to other memory entries within the same project's memory directory. `claude/CLAUDE.md` and the agent defs aren't part of that linking system. A `[[feedback-verify-dont-assume]]` written into the numbered list or an agent def is literal text that looks like a link but resolves to nothing. It's noise everywhere outside memory.

Instead:
- In the numbered list or an agent def, inline the point fully so the item is self-contained.
- In a memory entry, use `[[name]]` to cross-link sibling memory entries in the same memory directory.
- For sibling references within a skill, link relative to the skill directory.

### **Visual rhythm: memory sections get separators.**

Within a memory file, load-bearing sections are separated by `---` horizontal rules and calm tail sections sit together without separators. This visually signals "these are the load-bearing entries; these are the conventions." The numbered list carries no separators at all — it is a flat, uniformly terse list.

## Process

1. **Get the incident from Josh.** The Why lives in his head — the frustration that prompted this work happened in another project or session. Ask him to describe what happened and why he wants it captured. Don't reconstruct from loaded context. Don't invent details to fill gaps.
2. **Classify the home.** Session-behavior lesson → a terse numbered item in the right tier of the list in `claude/CLAUDE.md`. Code-authoring or code-review lesson → prose in `implementer.md` or `code-reviewer.md`. Account- or workflow-tied incident → a memory entry.
3. **Match the destination's voice.** The numbered list and agent defs stay uniformly terse — portable wording, `master` only, imperative, one concern per item, no heading or Why/How block. Only memory entries get the promoted emphatic voice; keep calm conventions out of memory.
4. **Reframe, don't rewrite the lesson.** Keep semantics identical. Only change presentation. If you want to soften or expand a lesson, that's a separate conversation — ask.
5. **Show one file's diff before doing the rest.** When touching multiple files, finish one, present it, wait for validation, then proceed.
