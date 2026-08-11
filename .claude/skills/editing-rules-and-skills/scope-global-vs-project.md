# Scope: Global vs Project

Load this when you need to decide whether a new rule or skill belongs in the global tree (applies everywhere) or the project tree (only when working in this dotfiles repo).

## The two trees

The dotfiles repo contains two Claude config trees that look superficially identical and are easy to confuse:

| Directory            | Scope     | Symlinked to    | Loads when                                 |
| -------------------- | --------- | --------------- | ------------------------------------------ |
| `$DOTFILES/claude/`  | Global    | `~/.claude/`    | Every project, every session               |
| `$DOTFILES/.claude/` | Project   | (not symlinked) | Only when CWD is inside the dotfiles repo  |

`$DOTFILES` is the env var pointing at the dotfiles repo root (defaults to `$HOME/.files` if unset; check the install template in the project CLAUDE.md). Use `$DOTFILES` in references so paths don't break if the repo lives somewhere else.

Global is the source of truth for what becomes `~/.claude/` after install. Project is dotfiles-internal — it loads only when working on the dotfiles themselves.

## The decision

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
| `CLAUDE.md`         | Top-level global instructions and the inline numbered behavioral-rules list                   |
| `agents/*.md`       | Subagent definitions, and the home of the code-authoring and code-review standards            |
| `skills/*/SKILL.md` | Capability skills                                                                              |

**Project tree** (`$DOTFILES/.claude/`):

| Path                  | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| `CLAUDE.md`           | Project-scoped instructions for working on dotfiles  |
| `skills/*/SKILL.md`   | Project-scoped skills (e.g. `adding-modules`, `editing-rules-and-skills`) |
| `settings.local.json` | Project-local settings overrides                     |

Project doesn't have a `rules/` directory by convention — project-scoped rules live in `CLAUDE.md` as sections, or in the `.claude/skills/` directory if they're substantive enough to warrant a skill.
