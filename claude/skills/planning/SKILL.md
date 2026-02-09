---
name: planning
description: "Work planning through GitHub issues. Invoke when: starting new work, planning a feature, or when asked 'let's plan X'. Every session = one issue = one PR."
user-invocable: false
---

# Planning Workflow

**Every unit of work gets a GitHub issue. One session = one issue = one PR.**

---

## When to Create an Issue

| Situation                  | Action                      |
| -------------------------- | --------------------------- |
| Starting new work          | Create issue first          |
| "Let's plan X"             | Create detailed issue       |
| Scope creep mid-session    | Pause → ask about new issue |
| Quick fix / trivial change | Ask if issue needed         |

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
8. If scope expands → STOP, ask about new issue
9. Finalize → PR closes the issue
```

---

## Creating the Issue

> **Plan Mode:** During planning, draft the issue content and include it in your plan file. Do NOT run `gh issue create` until after plan approval.

### Before Creating

Gather all context needed to do the work:

- What problem are we solving?
- What's the approach?
- What are the acceptance criteria?
- What files/areas will be touched?
- Any risks or open questions?

### Issue Format

```bash
gh issue create \
  --repo <org>/<repo> \
  --title "Brief description" \
  --body "## Summary
What we're doing and why.

## Approach
How we'll implement this.
- Step 1
- Step 2
- Step 3

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests written

## Files/Areas
- \`path/to/file.ts\`
- \`path/to/other.php\`

## Notes
Any additional context, decisions, risks."
```

**In plan mode:** Include this draft in your plan file and exit plan mode.
**After approval:** Run `gh issue create` as the first execution step.

### After Creating

1. Note the issue number
2. Set issue type if applicable (Task or Bug)
3. Add to project board (if not auto-added)
4. Move to "In Progress"
5. **Store internally:** "Working on #N - [title]"

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

## Scope Creep Handling

**When additional work is discovered mid-session:**

1. **STOP** — Don't just do it
2. **Assess** — Is this part of the current issue or separate?
3. **Ask:**

   ```
   I've discovered we also need to [X]. This seems outside the scope of #123.

   Options:
   1. Add to current issue (if small and related)
   2. Create new issue for separate work
   3. Note it and skip for now

   How do you want to handle this?
   ```

4. **If new issue:** Create it, but don't work on it this session
5. **If adding to current:** Update the issue body with new scope

### Updating Current Issue

```bash
# View current body
gh issue view <number> --repo <org>/<repo>

# Edit to add scope (opens editor)
gh issue edit <number> --repo <org>/<repo>
```

---

## Finalization

When work is complete and approved for commit:

### 1. Create PR with Issue Reference

```bash
gh pr create \
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

Closes #<issue-number>"
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
| Create PR    | `gh pr create --repo <org>/<repo> ... Closes #N`       |

---

## Don't

- Start work without an issue
- Create issue during plan mode (draft only, create after approval)
- Expand scope without asking
- Create PR without `Closes #N`
- Work on multiple issues in one session
- Forget to track the active issue
- Amend commits unless explicitly told to
