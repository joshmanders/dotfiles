---
name: planning
description: |
  Create and refine the GitHub issues and epics that later sessions work — draft a standalone issue for one piece of work, or a parent tracker issue (epic) with child issues. Invoke when: planning new work, drafting or editing an issue or epic, or when asked 'let's plan X'. Counterpart to the `issue` and `epic` skills, which work already-created issues; `planning` authors them. Each issue covers one coherent thing.
user-invocable: false
---

# Planning Workflow

**This skill authors the work. It drafts and refines GitHub issues and epics so a later session can pick them up: a standalone issue captures one coherent piece of work; a parent tracker issue — an epic — groups child issues under one initiative. The `issue` and `epic` skills work already-created issues; `planning` is where those issues come from.**

**Every unit of work gets a GitHub issue. Each issue covers one coherent thing — not a mix of unrelated concerns. A session may plan several issues at once, but an issue may not span multiple concerns.**

---

## When to Create an Issue

| Situation                        | Action                      |
| -------------------------------- | --------------------------- |
| Starting new work                | Create issue first          |
| "Let's plan X"                   | Create detailed issue       |
| New work discovered mid-session  | Pause → ask about new issue |
| Quick fix / trivial change       | Ask if issue needed         |

---

## Flow

```
1. Understand the work — the problem, the outcome, the constraints
2. Draft the issue content (leaf or tracker — see below)
3. Create the issue and capture its URL
4. Hand the URL back — don't assume the next step is working it
```

Working the issue is the `issue` and `epic` skills' job, not this one.

---

## Creating the Issue

> **High level, always.** An issue describes an *outcome* — what needs to be true when it's resolved. Never *how*. Files, function names, refactor steps, migration order, code snippets, "first do X then Y": none of it belongs in the body. If you catch yourself typing an implementation detail, delete it. The future session picking this up must investigate the code as it exists then — not follow a recipe you baked in now, which is almost certainly stale or wrong.

> **Body prose follows CLAUDE.md's prose and body rules** — terse, lead with the payload, cap lists, one paragraph on one line. Break a line only to separate paragraphs, list items, and headings; let the display wrap the rest.

### Before Creating

Gather what you need to describe the outcome — not how to reach it:

- What problem are we solving, and why?
- What does "done" look like — what observable outcomes prove it?
- Are there constraints that must be honored (existing behavior to preserve, APIs not to break, invariants to hold)?

Do not draft an approach. Do not enumerate files. Do not sketch implementation steps. The future session picking this up needs to investigate the codebase itself, not follow a recipe you baked into the body.

### Issue Format

The body shape depends on whether the issue is a leaf or a tracker.

**Leaf issues** — Task, Bug, Feature, or anything else meant to be resolved in a single PR. Body = Summary + Acceptance Criteria.

```bash
ISSUE_URL=$(gh issue create \
  --repo <org>/<repo> \
  --title "Brief description" \
  --body "## Summary
High-level overview of what we need to achieve and why. Include only constraints that must be honored (e.g. \"must not break the public v1 API\", \"must preserve existing session behavior\"). No approach, no files, no implementation steps.

## Acceptance Criteria
- [ ] Observable outcome 1
- [ ] Observable outcome 2
- [ ] Tests written")

printf '%s' "$ISSUE_URL" | pbcopy   # issue URL copied to clipboard
echo "$ISSUE_URL"
```

Acceptance criteria are the source of truth for "done" on a leaf — each item should be something you can point at and verify, not an implementation task.

**Tracker issues** — Epic, or any parent issue whose purpose is to group sub-issues under one initiative. Body = Summary only. **No acceptance criteria** — the acceptance lives on the children. The tracker describes what the initiative is about; the sub-issues are the work.

```bash
ISSUE_URL=$(gh issue create \
  --repo <org>/<repo> \
  --title "Brief description" \
  --body "## Summary
High-level overview of the initiative — what are we trying to achieve overall, and why. Constraints that span all children (e.g. \"no child PR may break the public v1 API\") go here.")

printf '%s' "$ISSUE_URL" | pbcopy
echo "$ISSUE_URL"
```

Run `gh issue create`, capture the URL, and hand it back. Don't assume the next step is starting work on it.

---

## Session Context Tracking

Once an issue is created, track it as session context:

```
Active Issue: #123 - Feature description
Repo: <org>/<repo>
```

This context should be referenced:

- When making implementation decisions
- When scope questions arise
- When creating the PR

If context compaction occurs, the issue contains the full context. Fetch it:

```bash
gh issue view <number> --repo <org>/<repo>
```

---

## Planning Multiple Issues

Sometimes planning reveals work that should be split into multiple issues.

### When to Split

- Distinct deliverables that could merge independently
- Different areas of the codebase with no dependencies
- Work that benefits from separate review cycles

### How to Handle

1. Draft all the issues together
2. Note dependencies and order, if any
3. Create them, and say which is the starting point

When the split is one initiative broken into pieces rather than independent deliverables, make the initiative a tracker (epic) and the pieces its children — see the tracker body shape above.

---

## Discovered Work

When additional work surfaces mid-session, judge it against the acceptance criteria — not against a "scope" boundary.

- **If it's needed to meet acceptance criteria** — it's part of the work. Do it. Don't defer under "out of scope" language.
- **If it's unrelated to acceptance criteria but small and adjacent** — leave the code better than you found it, so do it.
- **If it's genuinely a separate initiative** — STOP and ask:

  ```
  I've discovered we also need to [X], and it's unrelated to the acceptance
  criteria on #123.

  Options:
  1. Fold into current issue (update acceptance criteria)
  2. Create a new issue and defer
  3. Note it and skip

  How do you want to handle this?
  ```

If folding in, update the issue body so the acceptance criteria reflect the new expected outcome — don't just leave it stale.

### Updating an Existing Issue Body

```bash
# View current body
gh issue view <number> --repo <org>/<repo>

# Edit (opens editor)
gh issue edit <number> --repo <org>/<repo>
```

## Refining an Existing Issue

Same rules apply. When editing an issue that already exists:

- Strip any `## Approach`, `## Files/Areas`, `## Notes`, `## Scope`, or step-by-step implementation sections. They short-circuit investigation.
- Rewrite the summary as a high-level overview + constraints only.
- For leaf issues: rewrite acceptance criteria as observable outcomes, not implementation tasks.
- For tracker issues (Epic, etc.): remove any acceptance criteria — the acceptance belongs on the child issues, not the umbrella.
- Keep constraints that materially shape what "done" means; drop everything else.

---

## Finalization

When work is complete and approved for commit:

### 1. Create PR with Issue Reference

Title and body follow CLAUDE.md's PR rules — `feat: short description`, body is what/why at a high level, and it must end with `Closes #<issue-number>`.

```bash
PR_URL=$(gh pr create \
  --draft \
  --repo <org>/<repo> \
  --title "feat: clear description" \
  --body "## Summary
What was done and why.

Closes #<issue-number>")

printf '%s' "$PR_URL" | pbcopy   # draft PR URL copied to clipboard, ready to paste
echo "$PR_URL"
```

### 2. The `Closes` Line

The `Closes #123` line is what wires the PR to the issue. It:

- Links the PR to the issue
- Moves issue to "Done" when PR merges

---

## Quick Reference

| Action       | Command                                                |
| ------------ | ------------------------------------------------------ |
| Create issue | `gh issue create --repo <org>/<repo> ...`              |
| View issue   | `gh issue view <num> --repo <org>/<repo>`              |
| Edit issue   | `gh issue edit <num> --repo <org>/<repo>`              |
| Add comment  | `gh issue comment <num> --repo <org>/<repo> --body ""` |
| Create PR    | `gh pr create --draft --repo <org>/<repo> ... Closes #N` (pbcopy URL) |

---

## Don't

- Start work without an issue
- Include implementation steps, an approach, or a step-by-step recipe in the body
- List files, function names, or areas in the body
- Include code snippets, refactor plans, or migration order in the body
- Add a `## Scope` section — the concept doesn't exist here
- Attach acceptance criteria to a tracker issue (Epic, etc.) — acceptance lives on the children
- Defer work that's needed to meet acceptance criteria under an "out of scope" excuse
- Create PR without `Closes #N`
- Mix unrelated concerns into a single issue
- Forget to track the active issue
- Amend commits unless explicitly told to
