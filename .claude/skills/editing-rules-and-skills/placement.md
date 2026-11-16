# Placement

Two questions, independent of voice:

1. Which home does a behavioral lesson land in: the flat list or an agent def?
2. Which tree does a rule or skill belong in: global or project?

## Homes for a behavioral lesson

- **How the session works** → a bullet in the flat list in `claude/CLAUDE.md`.
- **How code gets authored** (cleanup, tests, docs) → prose in `claude/agents/implementer.md`, matching its existing prose.

## The flat list

The global rules are one flat bullet list in `claude/CLAUDE.md`, after the `---`, with no headings. It's short and loosely grouped by topic (agent orchestration, verification, commits, git safety, posting, and similar), with no hard boundaries or priority tiers. Place a new item next to existing items on the same topic. Never hardcode a count.

Each item:

- One or two imperative sentences, one concern
- "the user", never "Josh"; these rules ship to every project
- `master`, never `main`
- No heading, Why/How block, or separator

## The two trees

| Directory            | Scope   | Symlinked to    | Loads when                                |
| -------------------- | ------- | --------------- | ----------------------------------------- |
| `$DOTFILES/claude/`  | Global  | `~/.claude/`    | Every project, every session              |
| `$DOTFILES/.claude/` | Project | (not symlinked) | Only when CWD is inside the dotfiles repo |

`$DOTFILES` is the repo root (default `$HOME/.files`). Use it in references.

## Global vs project

Ask: does this apply everywhere Claude runs, or only in this repo?

| Global                                                       | Project                                                    |
| ------------------------------------------------------------ | ---------------------------------------------------------- |
| Universal behavior (verify before claiming, never push without confirmation) | Dotfiles maintenance (update `bin-scripts` when bin scripts change) |
| Tools available everywhere (`gh`, `git`, `npm`)              | Repo-internal tooling (install patterns)                   |
| Workflows useful in any codebase (brainstorming, planning)   | Dotfiles workflows (`adding-modules`)                      |
| Corrections that transcend projects                          | Corrections that matter only in this repo                  |

Project content in global adds noise to every other project. Global content in project silently stops applying outside this repo. When in doubt: behavior → global, maintenance and repo tooling → project.

## Layout

**Global** (`$DOTFILES/claude/`):

| Path                | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `CLAUDE.md`         | Global instructions and the flat rules list          |
| `agents/*.md`       | Subagent definitions; code-authoring standards       |
| `skills/*/SKILL.md` | Capability skills                                    |

**Project** (`$DOTFILES/.claude/`):

| Path                  | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `CLAUDE.md`           | Project instructions; project rules as sections |
| `skills/*/SKILL.md`   | Project skills                              |
| `settings.local.json` | Project-local settings overrides            |

There's no project `rules/` directory: project rules go in `CLAUDE.md` sections, or a skill if substantial.
