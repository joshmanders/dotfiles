# Placement: Where an Artifact Lives

Load this to decide which physical file an artifact belongs in. Two questions stack here, and they're independent of voice (correction vs informative):

1. **Which home** does a behavioral lesson land in — the flat list or an agent def?
2. **Which tree** does a rule or skill belong in — global (everywhere) or project (this repo only)?

## Two homes for a behavioral lesson

A correction that encodes a behavioral lesson has two possible homes. Classify which before touching anything:

- **A lesson about how the session works** → a terse bullet in the flat list in `claude/CLAUDE.md`. Calm, imperative, one concern per item.
- **A lesson about how code gets authored or reviewed** → prose in the relevant agent def: `claude/agents/implementer.md` for authoring, cleanup, tests, and docs; `claude/agents/code-reviewer.md` for review and review output. Match that file's existing prose.

## The flat list in `claude/CLAUDE.md`

The global behavioral rules are a single flat bullet list, inline in `claude/CLAUDE.md` right after the `---` that follows "You are Josh's engineering assistant." No `## Rules` heading, no section headings — just the bullet items, uniformly terse.

The list is loosely grouped by topic, not split into strict priority tiers:

- It opens with **orchestration** (what you are — delegate the work, keep the conversation).
- Then **working with the user and voice** (terseness, presenting work, apologizing, corrections).
- Then a long run of **task specifics** — commits, PRs, GitHub actions, git safety, where knowledge lives — grouped loosely by topic with no hard boundary between the groups. The git-safety items sit among the task specifics, after the commit-approval and code-reviewer-gate items, not in an earlier tier of their own.

To place a new item: find the existing items on the same topic and drop it next to them. Match your neighbors — don't compute a tier, and don't hardcode a count anywhere, since it rots on the next edit.

An item that belongs here gets no bold heading, no `**Why:**` block, no `---` separator — one or two imperative sentences, one concern each. Match the surrounding items exactly:

- Portable wording — **"the user", never "Josh"**. These rules ship to every project.
- `master`, never `main`.
- Imperative voice, one concern per item.
- No heading, no Why/How block, no separator.

## The two trees

The dotfiles repo contains two Claude config trees that look superficially identical and are easy to confuse:

| Directory            | Scope     | Symlinked to    | Loads when                                 |
| -------------------- | --------- | --------------- | ------------------------------------------ |
| `$DOTFILES/claude/`  | Global    | `~/.claude/`    | Every project, every session               |
| `$DOTFILES/.claude/` | Project   | (not symlinked) | Only when CWD is inside the dotfiles repo  |

`$DOTFILES` is the env var pointing at the dotfiles repo root (defaults to `$HOME/.files` if unset; check the install template in the project CLAUDE.md). Use `$DOTFILES` in references so paths don't break if the repo lives somewhere else.

Global is the source of truth for what becomes `~/.claude/` after install. Project is dotfiles-internal — it loads only when working on the dotfiles themselves.

## Global vs project

Ask: *does this apply everywhere Claude runs, or only when editing this repo?*

| Belongs in **global**                                        | Belongs in **project**                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| Universal behavior (verify before claiming, never push without confirmation) | Dotfiles maintenance (update the bin-scripts skill when bin scripts change) |
| Tools available everywhere (`gh`, `git`, `npm`)              | Tools internal to this repo (`brewdump`, dotfiles install patterns) |
| Workflow patterns useful in any codebase (brainstorming, planning) | Workflow patterns specific to dotfiles (`adding-modules`)    |
| Correction lessons that transcend projects ("never dismiss reported issues as pre-existing") | Corrections that only matter when editing this repo          |

## Failure modes of misclassification

**Putting project-scoped content in global** pollutes every other project Claude works in with irrelevant noise. A "when you change a bin script, update the skill" rule in the global tree fires in some random Laravel project where there are no bin scripts and confuses the model.

**Putting global content in project** means the rule silently stops applying the moment you `cd` out of the dotfiles repo. A "never push without confirmation" rule in the project tree only protects you when working on dotfiles, which is not where you usually need protection.

When in doubt, prefer global for **behavior** and project for **maintenance / repo-specific tooling**.

## Where things live within each tree

**Global tree** (`$DOTFILES/claude/`):

| Path                | Purpose                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `CLAUDE.md`         | Top-level global instructions and the inline flat behavioral-rules list                       |
| `agents/*.md`       | Subagent definitions, and the home of the code-authoring and code-review standards            |
| `skills/*/SKILL.md` | Capability skills                                                                              |

**Project tree** (`$DOTFILES/.claude/`):

| Path                  | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| `CLAUDE.md`           | Project-scoped instructions for working on dotfiles  |
| `skills/*/SKILL.md`   | Project-scoped skills (e.g. `adding-modules`, `editing-rules-and-skills`) |
| `settings.local.json` | Project-local settings overrides                     |

Project doesn't have a `rules/` directory by convention — project-scoped rules live in `CLAUDE.md` as sections, or in the `.claude/skills/` directory if they're substantive enough to warrant a skill.
