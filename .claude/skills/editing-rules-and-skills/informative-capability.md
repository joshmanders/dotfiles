# Informative / Capability Work

Load this when the work is about surfacing a tool, command, workflow, or process so Claude can use it competently. There's no incident, no frustration — just a capability worth documenting.

## How informative work typically arrives

Josh wants Claude to know about something. Maybe a CLI tool he keeps reaching for, a workflow he wants encoded, an internal script he wrote, a set of conventions in a third-party API. The information lives in his head or in the tool itself.

- There's no incident to anchor to and one shouldn't be invented.
- The work is proactive enablement, not reactive damage control.
- The voice should be calm reference: tables, sections, examples. No bolded screaming, no manufactured **Why:** lines, no "non-negotiable" callouts.

## What "calm" actually looks like

Pattern-match to existing informative skills for the shape:

- **`github`** — CLI tables organized by domain (Issues, Project Boards, PRs, Sub-Issues). Each entry is a labeled code block. No prose dressing.
- **`bin-scripts`** — command tables grouped by purpose (Committing, Undoing, History, etc.). Each row is `script | usage | purpose`.
- **`brainstorming`** — process steps in short bullet groups under section headers. Key principles as a bulleted list at the bottom.
- **`dispatch-parallel-agents`** — process + concrete ❌/✅ examples + when-not-to-use guardrails.
- **`humanizer`** — a pattern catalog grouped by category, each entry a labeled Before/After pair.

Shape signals: tables, code blocks, short labeled sections, examples. Almost no `**Why:**` blocks. Bolding is used sparingly to emphasize key terms, not to scream.

## The hard rules

### **Verify every fact.**

Run the command. Read the `--help`. Read the source. Untested informative content confidently misleads, which is worse than no content — Claude will trust the reference and propagate the wrong information into real work.

Never paraphrase from training data ("I think this flag works like X"). If verification isn't possible in the current session, say so and ask Josh, or omit the unverified claim.

### **Don't pad. Don't preach.**

Informative skills get used as reference. The reader wants the answer fast. Long preambles, motivational framing, "the philosophy of X" sections — all noise. Lead with the table, the command, the example.

Counter-example: don't open a CLI reference with "Modern development requires effective use of the command line. This skill helps you..." Just put the table.

### **Promotion only for items Josh has had to re-remind about.**

The bar for emphatic callouts in an informative skill is high. Most content is calm reference. If a specific subsection has bitten Josh repeatedly — "you keep forgetting to pass `--repo` to `gh`" — that specific item can get a small emphatic note. The skill as a whole stays calm.

## Process

1. **Confirm scope with Josh.** What does he want documented, at what depth, for what audience (always Claude — but is this "Claude in this project" or "Claude everywhere")?
2. **Verify every fact.** Run commands, read help text, read source. Never invent details to fill out a reference.
3. **Pattern-match to existing skills.** Pick a sibling skill with similar shape (`github` for CLI references, `brainstorming` for process docs, `bin-scripts` for command catalogs) and match its structure.
4. **Stay calm.** No emphatic headings, no manufactured Why/How blocks. Tables, sections, examples.
5. **Decide scope: global or project?** Universal capabilities → global. Dotfiles-specific tooling → project. See `placement.md` if unsure.
6. **Show one section's draft before completing the rest.** When writing a new skill, finish one section, present it, wait for validation, then proceed.
