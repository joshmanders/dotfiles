---
name: planning
description: |
  Create and refine the GitHub issues and epics that later sessions work — a standalone issue for one piece of work, or a parent tracker issue (epic) with child issues. Invoke when: planning new work, drafting or editing an issue or epic, or 'let's plan X'. The `issue` and `epic` skills work already-created issues; `planning` authors them.
user-invocable: false
---

# Planning

Every unit of work gets a GitHub issue covering one coherent thing — never a mix of unrelated concerns. A session may plan several issues at once.

| Situation                       | Action                    |
| ------------------------------- | ------------------------- |
| Starting new work               | Create issue first        |
| "Let's plan X"                  | Create detailed issue     |
| New work discovered mid-session | Add to the follow-up list |
| Quick fix / trivial change      | Ask if issue needed       |

## Flow

1. Understand the problem, the outcome, the constraints.
2. Draft the issue (leaf or tracker).
3. Present title, body, and type; wait for Josh's approval of that exact text. Agreeing to the plan, or telling you to open it, isn't that approval; a draft changed after approval goes back to him.
4. `gh issue create`, capture the URL.
5. Verify: `gh issue view <number> --repo <org>/<repo> --json number,title,issueType,state,url`
6. Hand the URL back. Working it is the `issue`/`epic` skills' job — don't assume it's next.

Track a created issue as session context (`Active Issue: #123 - <title>`, `Repo: <org>/<repo>`) for implementation decisions, scope questions, and the PR. After compaction, re-fetch it with `gh issue view`.

## Writing the body

**Outcome, never how.** No files, function names, refactor steps, migration order, code snippets, approach, or "first X then Y". The session that picks it up investigates the code as it exists then; a baked-in recipe is stale or wrong. Include only what's needed to describe the outcome: the problem and why, observable outcomes that prove done, and constraints that must hold (behavior to preserve, APIs not to break, invariants).

**Reply-terse.** Lead with the payload, cap lists, no report voice, no headers over two-line sections. Each paragraph on one line; break lines only between paragraphs, list items, and headings.

No session-specific debugging context — a particular customer's setup, a one-off repro, a mechanism that only mattered while diagnosing. Frame the general case. No `## Scope` section; the concept doesn't exist here.

**Leaf** (Task, Bug, Feature — anything resolved in one PR): Summary + Acceptance Criteria.

```bash
ISSUE_URL=$(gh issue create \
  --repo <org>/<repo> \
  --title "Brief description" \
  --body "## Summary
What we need to achieve and why, plus constraints that must be honored (e.g. \"must not break the public v1 API\").

## Acceptance Criteria
- [ ] Observable outcome 1
- [ ] Observable outcome 2")

printf '%s' "$ISSUE_URL" | pbcopy
echo "$ISSUE_URL"
```

Acceptance criteria are the source of truth for done: verifiable outcomes, not tasks. Don't list tests passing.

**Tracker** (Epic, any parent grouping sub-issues): Summary only — what the initiative achieves and why, plus constraints spanning all children. No acceptance criteria; those live on the children. Same command with only `## Summary` in the body.

## Multiple issues

Split when deliverables could merge independently, touch unrelated areas, or benefit from separate review.

1. Draft them all; note dependencies and order.
2. Present one at a time, each worked to Josh's approve or deny before the next.
3. Create and verify each approved one; say which is the starting point.

One initiative broken into pieces → a tracker with the pieces as children; present the tracker first. Linking each child is its own ask at the moment of linking (`github` skill, Sub-Issues).

## Discovered work

Needed to meet the acceptance criteria → part of the work; do it, never defer it as "out of scope". Anything else, however small → don't do it; add it to the follow-up list.

## Editing an existing issue

Run `gh issue create` or `gh issue edit` only when asked — issues are Josh's planning surface; otherwise work against an existing issue and leave its body alone. When asked, present the full revised title and body, get approval of that exact text, then:

```bash
gh issue edit <number> --repo <org>/<repo> --body-file <file>
gh issue view <number> --repo <org>/<repo> --json number,title,body,issueType,state
```

Refining:

- Strip `## Approach`, `## Files/Areas`, `## Notes`, `## Scope`, and step-by-step sections.
- Summary → high-level overview + constraints only.
- Leaf → acceptance criteria as observable outcomes.
- Tracker → remove acceptance criteria.
- Keep constraints that shape what done means; drop the rest.

## PR

When work is done and approved for commit: title like `feat: short description`, body is what/why at a high level, ending with `Closes #<issue>` (links the PR; moves the issue to Done on merge). Present the full title and body and get approval of that exact text first.

```bash
PR_URL=$(gh pr create \
  --draft \
  --repo <org>/<repo> \
  --title "feat: clear description" \
  --body "## Summary
What was done and why.

Closes #<issue-number>")

printf '%s' "$PR_URL" | pbcopy
echo "$PR_URL"
```

Don't amend commits unless told to.
