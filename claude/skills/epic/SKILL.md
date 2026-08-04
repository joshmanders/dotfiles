---
name: epic
description: "Close out an entire epic in one session — every open child issue of a parent issue, worked by dispatched agents, reviewed and committed one at a time. Use when Josh points at a parent issue and wants the whole thing finished: 'close out the epic', 'let's do epic 40', 'knock out the children of #40', 'work through all of #40's sub-issues', 'finish the whole epic'. Also use when a ref he named — even plain 'let's work on #40' — turns out to have open sub-issues. Routing: if the ref has no open sub-issues it is a single issue, so hand off to the `issue` skill with that ref."
argument-hint: "[epic-ref] [note]"
---

## Task: Close out epic $ARGUMENTS

Finish this epic: every open child issue, one commit each, in one sitting. Nothing else gets worked this session.

`orchestrating.md` governs, without its escape hatch — issue work always goes to an agent, however small it looks. Your only exceptions are metadata: `gh` calls fetching issue context, `git` calls managing the branch and commit. What you keep is the conversation.

## The Ledger

Workers are dispatched fresh; what Josh said during issue 2 never reaches issue 7 unless you carry it. Update after every exchange. Every dispatch carries only the slice bearing on that issue.

| Track                 | What goes in it                                                    |
| --------------------- | ------------------------------------------------------------------ |
| **Decisions**         | Direction Josh gave, approaches ruled out, preferences stated       |
| **Answers**           | Questions workers raised, how they resolved, and by whom            |
| **Constraints**       | Invariants, APIs that must not break, things left alone on purpose  |
| **Cross-issue facts** | Discoveries a later worker will need                                |
| **Deferred work**     | Out-of-scope work that surfaced, parked for Josh                    |

## Step 0: Parse arguments

First token is the ref, everything after is a note: `/epic 437 harden before GA, skip anything cosmetic` → ref `437`, note `harden before GA, skip anything cosmetic`. A note is standing guidance for every issue in the epic; log it under Decisions. Ref formats, parsed as `/issue` does — `437` (current repo), `foo/bar#437` (that repo), `bar#437` (current owner, repo `bar`). Resolve the owner with `gh repo view --json owner -q '.owner.login'`.

`$ARGUMENTS` may be empty. Take the ref from the first source that yields one: a ref in `$ARGUMENTS`, then a ref Josh named in the conversation, then the issue tracked by the current branch — `git rev-parse --abbrev-ref HEAD` gives `<TYPE>-<number>`, e.g. `FEATURE-40`. Nothing resolves → ask which epic, one line, no preamble.

## Step 1: Fetch the epic

```bash
gh issue view <n> --repo <owner/repo> --json number,title,body,state,labels,milestone,comments

gh api graphql -f url="https://github.com/<owner/repo>/issues/<n>" -f query='
query($url: URI!) { resource(url: $url) { ... on Issue {
  issueType { name description }
  subIssues(first: 100) { nodes { number title state url labels(first: 10) { nodes { name } } } }
} } }'

# descriptions carry meaning the names don't — fetch when the epic uses labels or a milestone
gh label list --repo <owner/repo> --limit 200 --json name,description
gh api repos/<owner/repo>/milestones/<milestone-number>
```

`subIssues` carries a `state` on every node. **No sub-issue is `OPEN` → this is a single issue.** Say so in one line and invoke the `issue` skill with the same ref and note.

At least one `OPEN` sub-issue → announce what's running, one line, then continue without waiting for confirmation:

```
Running the epic close-out on #40 — <title>
```

## Step 2: Present the queue

Read the parent body and every sub-issue title. Order by dependency, not number: if A changes a contract B builds on, A goes first. Keep independent issues adjacent so a rejection on one doesn't strand the other. One line each, with the reason for its position, and note anything already closed:

```
Epic #437 — <title>. 7 open sub-issues. Proposed order:
1. #441 <title>   (nothing depends on this, safe to lead with)
2. #439 <title>   (changes the token shape #443 reads)
3. #443 <title>   (needs #439)
#445 is closed already — skipping it.
```

Wait for Josh to confirm or reorder. Never start off your own proposed order.

## Step 3: Branch

From the base branch, branch off the **parent** with `git issue <epic-number>`. Every sub-issue commits here; no branch churn mid-epic.

## Step 4: The per-issue loop

**4a. Gather and dispatch.** Fetch the sub-issue's body, comments, labels, type, and linked PRs yourself — metadata. Dispatch one worker, subject to the same rules you are:

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
## Your scope
Only this issue, in the current working tree on branch <branch>. Do not commit. Do not push. Do not touch files outside this issue's scope — other sub-issues own their own commits on this branch.
## If you get stuck
Return `BLOCKED: <the question>` and stop. Do not guess, do not pick an approach and note the uncertainty, do not implement both.
## Return
What you changed and why, the files you touched, and every factual claim you make about how a tool, flag, env var, API, or library behaves — quoted verbatim, for independent verification.
```

**4b. Handle a block.** **100% confident** from the conversation, ledger, issue, or epic → answer it. **Anything less** → put the question to Josh verbatim with the context needed to answer it; don't soften it, don't answer around it, don't hand him a guess to confirm. Never invent an answer. Resume the same worker with `SendMessage` so its context survives, and log the resolution.

**4c. Scrutinize until clean.** Dispatch a reviewer with: (1) the full contents of `adversarial-review.md` in this skill's directory, (2) the sub-issue number, URL, and body, (3) the branch name and the fact that the diff is the uncommitted working tree, (4) the worker's summary and its verbatim claims, (5) the relevant ledger slice.

- **Code findings** → back to the worker via `SendMessage`. All of them, no cherry-picking. If one looks wrong, dispatch an agent to check it before dismissing it.
- **Claims findings** → to Josh, in your own message, immediately.

Dispatch a **fresh** scrutinizer on the fixed work — one that already blessed its own findings isn't reviewing. Exit when both hold: `findings: 0`, and every acceptance criterion on the sub-issue met. Three rounds without converging → stop and bring it to Josh; the issue is underspecified or the approach is wrong, and more rounds fix neither.

**4d. Finalize the issue.** Dispatch an agent to run the `finalize` skill against this issue's uncommitted work — **skip its scrutiny-agent step**, 4c covered it — and execute the rest: scope (nothing built beyond what the issue asked for), cleanup (no debug output, breakpoints, commented-out code, stray session markers), tests (new behavior covered, the project's suite run and green), formatters (whatever the config actually documents, nothing invented), docs (README, CLAUDE.md, or skills updated if behavior changed). It fixes what it can and reports the rest to the worker. **Tests failing means the issue isn't done** — it does not go to Josh with a caveat.

**4e. Present and stop.** Hand it over per `presenting-work.md`: a short plain-language paragraph, not a file listing. Then **stop**. Changes requested → worker via `SendMessage`, feedback verbatim, then back through 4c and 4d. Signed off → commit.

**4f. Commit.**

```bash
git add -A
git commit -m "<prefix>: <subject>" -m "Closes #<n>" -m "<attribution>"
```

One commit per sub-issue, prefix and subject per `committing.md`. If the subject needs an "and", the issue holds two logical changes — say so and let Josh decide whether to split. `Closes #<n>` is a trailer, not a body. Then move to the next issue.

## Step 5: Close out the epic

Queue empty → dispatch an agent to run the full `finalize` skill against the branch diff, **scrutiny step included** this time, since no single-issue reviewer saw the commits together. Fix what it returns; a fix to already-committed work is a new commit, never an amend. Then present: `Epic #437 done. 7 commits on <branch>.`, one line per issue (number and subject), and a `Deferred:` line carrying anything parked for Josh, or "nothing".

**Stop there.** No push, no PR, no merge until Josh signs off on the branch as a whole — and then only what he asked for.

## Rules

- **Dispatch, don't do.** Work touching code goes to an agent. You have no business reading a source file.
- **Sequential, not parallel.** Sub-issues share a branch and usually a blast radius. One at a time, reviewed between each.
- **The review gate is per issue.** Never commit two issues on one approval. Never commit without one.
- **Josh sees finished work.** Scrutiny clean, finalize run, tests passing, acceptance criteria met. He should be able to LGTM on a skim.
- **Nothing leaves without a sign-off.** No commit without his per-issue approval. No push, PR, or merge without his approval of the finished branch.
- **100% or ask.** Anything short of certainty goes to Josh.
- **Scope expands → stop.** Out-of-issue work gets reported, logged as deferred, and decided by Josh. It does not get quietly fixed.
- **The ledger is the product.** Lose track of what was decided and the epic degrades into seven unrelated sessions.
