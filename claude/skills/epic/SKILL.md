---
name: epic
description: |
  Close out an entire epic in one session — every open child issue of a parent issue, worked by dispatched agents, reviewed and committed one at a time. Use when Josh points at a parent issue and wants it finished: 'close out the epic', 'let's do epic 40', 'knock out the children of #40', 'work through all of #40's sub-issues', 'finish the whole epic'. Also use when a ref he named — even plain 'let's work on #40' — has open sub-issues. No open sub-issues → hand off to the `issue` skill with that ref.
argument-hint: "[epic-ref] [note]"
---

## Task: Close out epic $ARGUMENTS

Every open child issue, one commit each, in one sitting. Nothing else gets worked this session.

Issue work always goes to an agent, however small. You do only metadata: `gh` calls for issue context, `git` calls for the branch and commits.

## The Ledger

Agents start fresh; what Josh said during issue 2 reaches issue 7 only if you carry it. Update after every exchange; each dispatch carries only the slice bearing on that issue.

| Track                 | Contents                                                           |
| --------------------- | ------------------------------------------------------------------ |
| **Decisions**         | Direction Josh gave, approaches ruled out, preferences stated       |
| **Answers**           | Questions agents raised, how they resolved, and by whom             |
| **Constraints**       | Invariants, APIs that must not break, things left alone on purpose  |
| **Cross-issue facts** | Discoveries a later agent will need                                 |
| **Commits**           | One row per sub-issue: commit SHA and implementer's name            |

## Step 0: Parse arguments

First token is the ref, the rest is a note: `/epic 437 harden before GA, skip anything cosmetic`. A note is standing guidance for every issue; log it under Decisions. Ref formats: `437` (current repo), `foo/bar#437`, `bar#437` (current owner, repo `bar`; owner from `gh repo view --json owner -q '.owner.login'`).

No ref in `$ARGUMENTS` → a ref Josh named in the conversation → the current branch's issue (`git rev-parse --abbrev-ref HEAD` gives `<TYPE>-<number>`, e.g. `FEATURE-40`). Nothing resolves → ask which epic, one line.

## Step 1: Fetch the epic

```bash
gh issue view <n> --repo <owner/repo> --json number,title,body,state,labels,milestone,comments

gh api graphql -f url="https://github.com/<owner/repo>/issues/<n>" -f query='
query($url: URI!) { resource(url: $url) { ... on Issue {
  issueType { name description }
  subIssues(first: 100) { nodes { number title state url labels(first: 10) { nodes { name } } } }
} } }'

# when the epic uses labels or a milestone — descriptions carry meaning names don't
gh label list --repo <owner/repo> --limit 200 --json name,description
gh api repos/<owner/repo>/milestones/<milestone-number>
```

No sub-issue `OPEN` → single issue: say so in one line and invoke the `issue` skill with the same ref and note.

Otherwise announce in one line and continue without waiting:

```
Running the epic close-out on #40 — <title>
```

## Step 2: Present the queue

Order by dependency, not number: if A changes a contract B builds on, A goes first. Keep independent issues adjacent so a rejection on one doesn't strand the other. One line each with the reason for its position; note anything already closed:

```
Epic #437 — <title>. 7 open sub-issues. Proposed order:
1. #441 <title>   (nothing depends on this, safe to lead with)
2. #439 <title>   (changes the token shape #443 reads)
3. #443 <title>   (needs #439)
#445 is closed already — skipping it.
```

Wait for Josh to confirm or reorder before starting.

## Step 3: Branch

From the base branch: `git issue <epic-number>`. Every sub-issue commits on this branch.

## Step 4: The per-issue loop

**4a. Gather and dispatch.** Fetch the sub-issue's body, comments, labels, type, and linked PRs yourself. Dispatch an `implementer`:

```
Work GitHub issue #<n> in <owner/repo>: <title>
## The issue
<full body>
## Discussion
<comments carrying requirements or constraints>
## Epic context
Sub-issue of epic #<parent> — <parent title>.
<the lines from the parent that bear on this issue>
## What's already been decided
<the relevant slice of the ledger>
```

**4b. Handle a block.** 100% confident from the conversation, ledger, issue, or epic → answer it. Anything less → put the question to Josh verbatim with the context to answer it; no softening, no guess for him to confirm, never an invented answer. Resume the same implementer with `SendMessage` and log the resolution.

**4c. Scrutinize.** Dispatch a fresh `general-purpose` agent with: (1) the full contents of `adversarial-review.md` in this skill's directory, (2) the sub-issue number, URL, and body, (3) the branch name and that the diff is the uncommitted working tree, (4) the implementer's summary and verbatim claims, (5) the relevant ledger slice. Route findings per **Findings** below. One pass: the implementer fixes every finding and meets every acceptance criterion, then 4d.

**4d. Run the gate.** If the project defines a `team-review` skill, invoke it yourself (a skill, not an agent). Route findings per **Findings**. One pass, then the work goes to Josh. Tests failing means the issue isn't done — it doesn't go to Josh with a caveat.

**4e. Present and stop.** A short plain-language paragraph, not a file listing. Then stop. Changes requested → implementer via `SendMessage`, feedback verbatim, then 4c and 4d again. Signed off → commit.

**4f. Commit.**

```bash
git add -A
git commit -m "<prefix>: <subject>" -m "Closes #<sub-issue>" -m "<attribution>"
```

One commit per sub-issue, only after Josh's sign-off, in the project's commit style. Always include `Closes #<n>` (`owner/repo#<n>` cross-repo) yourself, without asking. A subject needing "and" means two logical changes — say so and let Josh decide whether to split.

Log the sub-issue, the SHA (`git rev-parse --short HEAD`), and the implementer's name under Commits — Step 5 routes fixes to that name. Next issue.

## Step 5: Close out the epic

Queue empty → if the project defines `team-review`, invoke it yourself over the whole branch diff. Code findings go to the implementer that wrote the commit they land in (by name, from Commits); claims findings per **Findings**. A fix to committed work is a new commit, never an amend. One pass, then present:

`Epic #437 done. 7 commits on <branch>.` plus one line per issue (number and subject).

Stop. No push, PR, or merge until Josh signs off on the branch — then only what he asked for. For a PR, present its full title and body and wait for approval of that exact text (branch sign-off isn't that approval), then verify:

```bash
gh pr view <number> --repo <owner/repo> --json number,title,isDraft,state,url,closingIssuesReferences
```

## Findings

- **Code findings** → the implementer via `SendMessage`. All of them. One that looks wrong gets checked by a dispatched agent before it's dismissed.
- **Claims findings** → Josh, in your own message: in full when it bears on the open topic, otherwise first once that topic concludes.

## Rules

- **Sequential.** Sub-issues share a branch; one at a time, reviewed between each.
- **Per-issue gate.** Never commit two issues on one approval, or any without one.
- **Josh sees finished work.** Scrutiny clean, tests passing, acceptance criteria met.
- **Out of scope → dropped.** The change is what the issue needs plus the minimum prerequisite that keeps its invariant, including any consumer or sibling the change itself would break; a sibling is otherwise in scope only when the issue asks. Findings outside the issue, cosmetic slips outside the touched lines included, are dropped without mention. A defect the issue doesn't need stays out, however small: don't fix it, and don't draft an issue for it unless asked.
- **The ledger is the product.** Lose it and the epic becomes seven unrelated sessions.
