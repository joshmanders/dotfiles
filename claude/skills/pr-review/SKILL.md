---
name: pr-review
description: |
  Review someone else's GitHub PR - checkout locally, deep read-only review, output copyable findings. Never posts, approves, or merges. Invoke when Josh says things like 'review this PR', 'can you look at Dave's PR', 'take a look at #12', 'review PR 340 for me', 'what do you think of this pull request', 'look over their changes', or drops a PR link and asks for a look. Disambiguation with pr-feedback: authorship decides. A PR authored by someone else belongs here. A PR Josh authored that has review comments to act on belongs to pr-feedback - cues for that are 'our PR', 'my PR', 'feedback we got', 'address the review', 'reviewer said'. When the phrasing is ambiguous ('look at PR 12'), check the PR author with gh before choosing. Takes a PR ref plus an optional note; with no ref, resolves the PR from the conversation or the current branch.
argument-hint: "[pr-ref] [note]"
---

## Task: Review PR $ARGUMENTS

**If you are in plan mode, exit it now.** This is a read-only review task — nothing needs approval.

Review like a senior engineer on the team: does it do what it's meant to, is it correct, does it break anything. The author will most likely paste your comments straight into their coding agent, so bring only the big-ticket items, each one something an agent can act on as written. Leave nits out entirely.

### CRITICAL: READ-ONLY MODE

**NEVER post comments, reviews, or any content on Josh's behalf.** Not even if asked, unless Josh explicitly says to AND approves the exact text first.

You MUST NOT:

- Submit reviews (`gh pr review`)
- Post comments (`gh pr comment`, `gh api` POST/PUT/PATCH)
- Approve, request changes, or merge
- Modify any GitHub state whatsoever

Read-only means nothing goes to GitHub, not that no code runs. `gh pr checkout` is a local git operation, and running the relevant tests locally — focused files or filters, with the project's configured test command — is encouraged when it helps decide whether the PR is correct. Never the full suite.

Your job is to present findings locally. Josh decides what to post.

---

### Step 0: Parse arguments

`$ARGUMENTS` is a PR ref optionally followed by a note. The first token is the PR ref, everything after is a note providing additional context for the review.

Example: `/pr-review 123 focus on the auth changes` → PR ref: `123`, note: `focus on the auth changes`

If the first token is not a PR ref, the whole of `$ARGUMENTS` is a note. `$ARGUMENTS` may also be empty.

If a note is present, treat it as guidance throughout the review — it may narrow scope, highlight concerns, or provide context.

### Step 1: Resolve the PR reference

Resolve in this order, stopping at the first that produces a PR:

1. A PR ref in `$ARGUMENTS`
2. A PR ref or URL Josh named in the conversation
3. The PR for the current branch:

   ```bash
   GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
     gh pr view --json number,headRepository -q '.number'
   ```

If none of these resolve, ask in one line — no preamble: `Which PR?`

Parse a ref to determine the repo and PR number:

| Format              | Example       | Meaning                            |
| ------------------- | ------------- | ---------------------------------- |
| Number only         | `123`         | Current repo, PR 123               |
| `owner/repo#number` | `foo/bar#123` | Repo `foo/bar`, PR 123             |
| `repo#number`       | `bar#123`     | Current owner + repo `bar`, PR 123 |
| URL                 | `https://github.com/foo/bar/pull/123` | Repo `foo/bar`, PR 123 |

Get current repo owner if needed:

```bash
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh repo view --json owner -q '.owner.login'
```

### Step 2: Confirm authorship, then announce

This skill reviews PRs authored by someone other than Josh. Check the author before doing anything else:

```bash
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh pr view <number> --repo <owner/repo> --json author,title,headRefName
```

Compare `.author.login` against `$DOTFILES_GITHUB_USERNAME`:

| Author                          | Action                                                       |
| ------------------------------- | ------------------------------------------------------------ |
| Anyone other than Josh          | Continue here                                                 |
| `$DOTFILES_GITHUB_USERNAME`     | Say so in one line and invoke `pr-feedback` with the same ref |

The handoff line when the author is Josh:

> PR #123 is yours — switching to pr-feedback.

Otherwise announce the run in one line, then proceed without waiting for confirmation:

> Reviewing PR #123 (read-only) — Add bandwidth endpoint

### Step 3: Save state and checkout PR branch

```bash
ORIGINAL_BRANCH=$(git branch --show-current)
STASH_RESULT=$(git stash --include-untracked 2>&1)
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh pr checkout <number> --repo <owner/repo>
```

Track whether stash saved anything (check if `$STASH_RESULT` contains "No local changes").

### Step 4: Gather PR context from GitHub

```bash
# PR metadata
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh pr view <number> --repo <owner/repo> --json title,body,state,author,baseRefName,headRefName,files,additions,deletions,commits,reviews,comments,reviewDecision,labels,createdAt,updatedAt,isDraft,mergeable,mergeStateStatus,closingIssuesReferences

# Reviews, including every review summary body
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh api --paginate repos/<owner>/<repo>/pulls/<number>/reviews

# Inline review threads, resolved and unresolved, with every reply
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh api graphql -F owner=<owner> -F repo=<repo> -F number=<number> -f query='
    query($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $number) {
          reviewThreads(first: 100) {
            nodes {
              isResolved
              isOutdated
              path
              line
              comments(first: 100) {
                nodes { author { login __typename } body createdAt }
              }
            }
          }
        }
      }
    }'

# PR conversation comments
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh api --paginate repos/<owner>/<repo>/issues/<number>/comments

# Timeline: commits, reviews, dismissals, force-pushes, and cross-references in order
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh api --paginate repos/<owner>/<repo>/issues/<number>/timeline

# CI status
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh pr checks <number> --repo <owner/repo>
```

**Linked issues:** Take every issue in `closingIssuesReferences`, plus any the PR body references (`Fixes #N`, `Closes #N`, `Resolves #N`, bare `#N`, or `owner/repo#N`), and fetch each with its comments — decisions made in the issue thread are part of the requirement:

```bash
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh issue view <issue-number> --repo <owner/repo> --json title,body,state,labels,comments
```

**Paired PRs:** A PR in this or another repo that this one depends on or pairs with shows up as a `cross-referenced` timeline event (`.source.issue.pull_request` set) on this PR or its linked issues, or as a PR ref in the body ("Pairs with owner/repo#N"). Fetch each one whose contract this PR consumes or provides:

```bash
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh pr view <number> --repo <owner/repo> --json title,body,state,files,headRefOid
```

Read the files that carry the shared contract at its `headRefOid`.

**PR state:** `isDraft` and `mergeable` (`CONFLICTING` means the branch needs a rebase) — carry them to Step 7.

**Reconstruct the conversation.** Read the PR's history the way a person catching up on it would. Review summary bodies, every inline thread (resolved or not), and every conversation comment are all places reviewers ask things — a question in a `COMMENTED` review body is as real as one in an unresolved thread. Read the commits in order, the message and what each changed (`git show <oid>` for each commit in the metadata), and lay them against the comments on the timeline. Then connect the dots:

- Which comment, if any, each commit responds to, and whether the change actually settles that concern or only touches nearby code
- Whether each question was answered in substance, even when not in the expected form — a reply, a commit that makes the concern moot, a later review that drops it
- What is still genuinely outstanding, and for whom

Replies, a targeted commit, a re-request of the reviewer (timeline `review_requested`), a resolved thread, a dismissed review — all of these are evidence to weigh, not a decision table. A resolved thread whose concern the code still has is not settled; a review-body question the author fixed and then re-requested that reviewer on is usually back in the reviewer's court, though a dismissal by itself answers nothing.

**Settled items are context only.** Do NOT re-raise what was resolved or answered as findings. Use it to understand how the PR got here.

**Humans still waiting on the author:** a human reviewer whose question or concern the author has not yet answered in substance. Bot reviewers (REST `.user.type == "Bot"`, GraphQL `author.__typename == "Bot"`) are reviewers too, but this gate is about humans only. Record each waiting reviewer, their question, and what's still unanswered for Step 7.

Never answer another reviewer's question on their behalf — not in a finding, not in the verdict. Their question is theirs and the author's to settle.

### Step 5: Compute local diff (source of truth)

```bash
BASE_REF=<baseRefName from PR metadata>
git fetch origin "$BASE_REF"
BASE_SHA=$(git merge-base "origin/$BASE_REF" HEAD)

git diff --stat "$BASE_SHA"..HEAD
git diff "$BASE_SHA"..HEAD
git diff --name-only "$BASE_SHA"..HEAD
```

**Never use `gh pr diff`** — API diffs can be inaccurate. Local diff is the source of truth.

### Step 6: Deep review via the reviewer agent

Dispatch the `reviewer` agent (Agent tool, `subagent_type: reviewer`) to do the actual review. The review criteria and output discipline live in the agent — don't restate them here.

Give it, in the prompt:

- The diff range: review `"$BASE_SHA"..HEAD` from Step 5, and tell it the base is already computed — the local diff is the source of truth, so it must not recompute the base or fall back to `origin/HEAD`
- The changed-file list from `git diff --name-only "$BASE_SHA"..HEAD`
- The requirement to measure against: the PR title and body, plus the linked-issue titles, bodies, and comments gathered in Step 4
- Any paired PR's contract from Step 4, so it checks this side against the other
- The note from Step 0, if present, as review guidance
- That this is someone else's PR, so findings come back to you rather than to an implementer
- That it may run the relevant tests (focused files or filters) to settle whether the PR is correct, never the full suite
- That only big-ticket findings count — intent, correctness, breakage — and nits are dropped

The agent returns a `Findings` list (each item as `path:line — problem`) and, when the work carried claims, a `Claims` block. Both are your input to Step 7, not Josh's output — you reshape them into copyable markdown there.

### Step 7: Output

Decide whether this PR is good by weighing the agent's findings together with what Step 4 left genuinely outstanding; if it isn't, say exactly what to suggest or ask. Josh decides approve or request-changes from this output alone, without opening the code. Everything that asks him to decide carries its own explanation in plain sentences, outside any copyable block. The copyable block is only the comment text he pastes.

**If the PR is a draft or `CONFLICTING`**, say so in one line before anything else.

**If a human reviewer is waiting on an answer** (Step 4), the PR does not get an approve verdict — neither of the approve lines below. Report it as waiting on that person, one entry per reviewer: quote what they asked, say where they asked it, and say what is still unanswered and why their answer matters to the change:

> Waiting on @reviewer — in their review on Oct 28 they asked "Not sure if this is a possible scenario / blocker: …". The author never replied and no later commit touches that path, so whether a retry can double-charge is still open; that's the call that decides whether this ships.

Any findings still go out as below, and a `Request changes` verdict still stands, but the waiting entry replaces every approve verdict.

**If the PR is clean** — no bugs, no regressions, nothing substantial:

> This PR is good to go — [one sentence: what it does and what you checked that holds]. Approve it.

Do not summarize the changes beyond that sentence or praise the code.

**If there are findings** — each finding is two parts: the explanation for Josh, then the copyable comment.

The explanation, in plain sentences:

- **What** the problem is
- **How** it happens — the concrete input, state, or sequence that triggers it
- **Why it matters** — the wrong outcome a user, the data, or production gets
- **Blocking or not** — why this one is worth requesting changes over, or why it can ride along with an approval

Then the comment as a raw markdown block wrapped in ```````` so Josh gets copyable markdown he can paste as a GitHub review comment:

`````````
**Retry can charge the card twice** — the job retries after the Stripe call succeeds but before the invoice is marked paid, so the second attempt charges again. A customer double-billed is a refund and a support ticket. Blocking: this is billing correctness.

````
`path/to/file.ts` line 42

What's wrong, the scenario that triggers it, and the outcome the fix must reach — direct enough for the author's agent to act on as written.

```suggestion
// corrected code here if applicable
```
````
`````````

- File path and line number (or range like `lines 42-48`) on the first line of the comment
- Problem description — plain language, no severity labels, no categories, self-contained so an agent can act on it without the rest of the review
- GitHub suggestion block only when you have a concrete fix. Omit if the fix is non-trivial or requires discussion.
- One finding per explanation and block. Do not combine multiple issues.

After all findings, the verdict with its reason:

> Request changes — [N] items above. [Why: which items block and what goes wrong if this merges as-is.]

Or if none of them blocks:

> Approve with comments — [N] items above worth addressing. [Why: why none of them blocks.]

### Step 8: Restore original state

After completing the review, ALWAYS return to the original branch and restore stash:

```bash
git checkout "$ORIGINAL_BRANCH"
# Only if stash saved something:
git stash pop
```

Do this even if the review encounters errors.
