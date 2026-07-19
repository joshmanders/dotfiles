---
name: planning
description: "Work planning through GitHub issues, including creating and refining them. Invoke when: starting new work, drafting or editing an issue, or when asked 'let's plan X'. Each issue covers one coherent thing."
user-invocable: false
---

# Planning Workflow

**Every unit of work gets a GitHub issue. Each issue covers one coherent thing — not a mix of unrelated concerns. A session may span multiple issues (planning several, working through several); an issue may not span multiple concerns.**

---

## When to Create an Issue

| Situation                        | Action                      |
| -------------------------------- | --------------------------- |
| Starting new work                | Create issue first          |
| "Let's plan X"                   | Create detailed issue       |
| New work discovered mid-session  | Pause → ask about new issue |
| Quick fix / trivial change       | Ask if issue needed         |

---

## Session Flow

### Planning Phase (plan mode active)

```
1. Understand the work
2. Draft issue content (do NOT create yet)
3. Include issue draft in plan file
4. Exit plan mode for approval
```

### Execution Phase (after plan approval)

```
5. Create the issue (first step after approval)
6. Track issue as session context
7. Do the work (core-workflow)
8. If new work surfaces → see Discovered Work
9. Finalize → PR closes the issue
```

---

## Creating the Issue

> **High level, always.** An issue describes an *outcome* — what needs to be true when it's resolved. Never *how*. Files, function names, refactor steps, migration order, code snippets, "first do X then Y": none of it belongs in the body. If you catch yourself typing an implementation detail, delete it. The future session picking this up must investigate the code as it exists then — not follow a recipe you baked in now, which is almost certainly stale or wrong.

> **Plan Mode:** During planning, draft the issue content and include it in your plan file. Do NOT run `gh issue create` until after plan approval.

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
High-level overview of what we need to achieve and why. Include only
constraints that must be honored (e.g. \"must not break the public v1 API\",
\"must preserve existing session behavior\"). No approach, no files,
no implementation steps.

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
High-level overview of the initiative — what are we trying to achieve overall,
and why. Constraints that span all children (e.g. \"no child PR may break
the public v1 API\") go here.")

printf '%s' "$ISSUE_URL" | pbcopy
echo "$ISSUE_URL"
```

**In plan mode:** Include the draft in your plan file and exit plan mode.
**After approval:** Run `gh issue create`, capture the URL, and hand it back. Do not assume the next step is starting work on it.

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

1. Draft all issues in the plan file
2. Note dependencies/order if any
3. Get approval on the full set
4. After approval: create all issues, pick one to start
5. Other issues become backlog (or parallel work if independent)

### Plan File Format

```markdown
## Issue Drafts

### Issue 1: Feature A

Summary, approach, acceptance criteria...

### Issue 2: Feature B

Summary, approach, acceptance criteria...

## Execution Order

1. Start with Issue 1 (no dependencies)
2. Issue 2 depends on Issue 1
```

---

## Discovered Work

When additional work surfaces mid-session, judge it against the acceptance criteria — not against a "scope" boundary.

- **If it's needed to meet acceptance criteria** — it's part of the work. Do it. Don't defer under "out of scope" language.
- **If it's unrelated to acceptance criteria but small and adjacent** (per `leave-code-better`) — do it.
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

```bash
PR_URL=$(gh pr create \
  --draft \
  --repo <org>/<repo> \
  --title "feat: clear description" \
  --body "## Summary
What was done.

## Changes
- Change 1
- Change 2

## Testing
- [ ] Tests pass
- [ ] Manual testing done

Closes #<issue-number>")

printf '%s' "$PR_URL" | pbcopy   # draft PR URL copied to clipboard, ready to paste
echo "$PR_URL"
```

### 2. PR Summary Format

When presenting the PR:

```
PR ready to create:

Title: feat: add feature description

Body:
## Summary
Implemented the feature.

## Changes
- Added endpoint
- Added validation
- Added tests

Closes #123
```

The `Closes #123` automatically:

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
- Create issue during plan mode (draft only, create after approval)
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
