# Memory vs. Codification

Project knowledge that future contributors (or fresh Claude installs) need to do their work belongs in the repo, not in personal memory. Personal preferences and Josh-specific workflow signals belong in memory.

## Codify in the repo

If it's about the project — its conventions, positioning, architecture, workflows, voice, or any rule that affects code or content shipped from that repo — write it where the repo can carry it:

- `.claude/rules/` — coding conventions, patterns, project-specific style
- `.claude/skills/` — multi-step workflows, operational procedures
- `.claude/CLAUDE.md` — high-level project orientation
- `docs/` — long-form material (positioning, vision, internal strategy, design)

A fresh Claude install with no memory should be able to do the work from the repo alone. If it can't, the gap is in the repo, not in memory.

When writing project knowledge to memory by reflex (an old habit, a corrected mistake, a positioning decision), stop and move it into the repo instead. If a corresponding memory file already exists, replace its content with a thin pointer to the canonical location in the repo.

## Save to memory

Personal preferences, workflow signals, and Josh-specific patterns that govern *how I work with Josh* — not what the project is — stay in memory. Examples that legitimately belong there:

- How Josh wants me to handle pushing, committing, branching
- Which rules Josh wants me to bend or override in specific contexts
- Temporary workflow state (e.g., "skip TASK branches until PR X merges")
- Anything tied to Josh's personal account, identity, or cross-project habits

These are black-box-fine because they don't need to ride with any one repo. A new collaborator joining the project shouldn't inherit them, and a fresh install starting on a different project shouldn't either.

## The decision rule

Ask: "would a new engineer joining this project need to know this?"

- **Yes** → repo.
- **No, it's about me** → memory.

When unsure, default to the repo. Black boxes that should have been documented are harder to fix later than documented things that turn out to be personal.
