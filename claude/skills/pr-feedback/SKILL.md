---
name: pr-feedback
description: "Address review feedback on a PR Josh authored - fetch the review comments, understand them, implement the fixes locally, and resolve the threads it addressed once Josh has reviewed, approved, and pushed. Never posts on his behalf. Invoke when Josh says things like 'we got some feedback on our PR', 'address the review comments', 'the reviewer said X', 'my PR has comments on it', 'can you handle the feedback on #12', 'fix what the review flagged', or mentions someone reviewing a PR of his. Disambiguation with pr-review: authorship decides. A PR Josh authored with review comments to act on belongs here - cues are 'our PR', 'my PR', 'feedback we got', 'address the review', 'reviewer said'. A PR authored by someone else that he wants read belongs to pr-review - cues are 'review this PR', \"take a look at Dave's PR\", 'can you review #12'. When the phrasing is ambiguous ('look at PR 12'), check the PR author with gh before choosing. Takes an optional PR ref and note; with no ref, resolves the PR from the conversation or the current branch."
argument-hint: "[pr-ref] [note]"
---

## Task: Address review feedback on PR $ARGUMENTS

**If you are in plan mode, exit it now.** This is an active task — feedback needs to be addressed, not planned.

### CRITICAL: No posting without approval

**NEVER post comments, reviews, or any content on Josh's behalf.** Not even if asked, unless Josh explicitly says to AND approves the exact text first.

You MUST NOT:

- Submit reviews (`gh pr review`)
- Post comments (`gh pr comment`, `gh api` comment endpoints)
- Reply to review threads (`addPullRequestReviewThreadReply`)
- Approve, request changes, or merge
- Run any other mutation or write request against the PR

**One write is permitted: the `resolveReviewThread` mutation.** Resolving a thread is a state change with no content authored in Josh's name. Posting text is speaking for him, and that never happens without his explicit approval of the exact words. Resolve only threads whose feedback was actually addressed and pushed — Step 10 governs.

You implement fixes locally. Josh decides what to post and when to push.

---

### Step 0: Parse arguments

`$ARGUMENTS` contains an optional PR ref and an optional note.

**PR ref detection:** The first token is a PR ref if it matches any of these patterns:

- A plain number: `123`
- `owner/repo#number`: `foo/bar#123`
- `repo#number`: `bar#123`

If the first token is NOT a PR ref, the entire `$ARGUMENTS` is a note. `$ARGUMENTS` may also be empty. Step 1 covers resolving the PR when no ref is given.

**Examples:**

| Input                                      | PR ref      | Note                           |
| ------------------------------------------ | ----------- | ------------------------------ |
| `123 look at just johnsmith review`        | `123`       | `look at just johnsmith review`|
| `foo/bar#123`                              | `foo/bar#123` | (none)                       |
| `look at just johnsmith review`            | (auto)      | `look at just johnsmith review`|
| (empty)                                    | (auto)      | (none)                         |

If a note is present, treat it as guidance — it may narrow which reviews to address, highlight priorities, or provide context.

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

This skill handles PRs Josh authored. Check the author before doing anything else:

```bash
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh pr view <number> --repo <owner/repo> --json author,title,headRefName
```

Compare `.author.login` against `$DOTFILES_GITHUB_USERNAME`:

| Author                      | Action                                                     |
| --------------------------- | ---------------------------------------------------------- |
| `$DOTFILES_GITHUB_USERNAME` | Continue here                                               |
| Anyone else                 | Say so in one line and invoke `pr-review` with the same ref |

The handoff line when the author is someone else:

> PR #123 is octocat's — switching to pr-review.

Otherwise announce the run in one line, then proceed without waiting for confirmation:

> Addressing review feedback on PR #123 — Add bandwidth endpoint

### Step 3: Save state and checkout PR branch

```bash
ORIGINAL_BRANCH=$(git branch --show-current)
STASH_RESULT=$(git stash --include-untracked 2>&1)
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh pr checkout <number> --repo <owner/repo>
```

Track whether stash saved anything (check if `$STASH_RESULT` contains "No local changes").

### Step 4: Fetch all review feedback

```bash
# PR metadata and body
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh pr view <number> --repo <owner/repo> --json title,body,state,author,baseRefName,headRefName,reviewDecision,labels

# Reviews (approval status, review bodies)
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh api repos/<owner>/<repo>/pulls/<number>/reviews

# Issue-level comments
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh api repos/<owner>/<repo>/issues/<number>/comments
```

Inline feedback comes from GraphQL, which carries the thread ID and resolution state alongside each comment:

```bash
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh api graphql -f owner=<owner> -f repo=<repo> -F number=<number> -f query='
query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          viewerCanResolve
          comments(first: 20) {
            nodes { author { login } body url }
          }
        }
      }
    }
  }
}'
```

Each node is one conversation on the diff:

| Field             | Use                                                        |
| ----------------- | ---------------------------------------------------------- |
| `id`              | `PRRT_…` node ID — what Step 10 resolves                   |
| `isResolved`      | Step 5 categorization                                       |
| `path`, `line`    | Where the feedback points                                   |
| `isOutdated`      | The thread points at code the diff has since moved past     |
| `comments.nodes`  | The feedback itself, author first to last                   |
| `viewerCanResolve`| Whether resolving will succeed                              |

`first: 100` is this connection's ceiling. If `pageInfo.hasNextPage` is true, fetch the rest with `after: $endCursor` — a truncated fetch silently drops feedback.

Carry each item's thread `id` alongside the feedback from here on. Step 10 needs it.

### Step 5: Categorize feedback

Separate feedback into:

- **Unresolved items** — `isResolved: false`, active feedback that needs attention
- **Resolved items** — `isResolved: true`, already addressed, skip these

For unresolved items, group by reviewer and present a summary to Josh:

- What each reviewer is asking for
- Which items are clear vs. need clarification

### Step 6: Apply `receiving-code-review` skill

This skill governs how to handle all feedback. Key principles:

1. **READ** all feedback without reacting
2. **UNDERSTAND** — restate each item in your own words
3. **VERIFY** — check against the actual codebase
4. **EVALUATE** — is the suggestion technically sound for THIS codebase?
5. **RESPOND** — implement or push back with reasoning

**If ANY item is unclear:** Stop. Present what you understand and what needs clarification. Do not partially implement.

**If a suggestion seems wrong:** Say so with technical reasoning. Check if it breaks existing functionality, contradicts architecture decisions, or violates YAGNI.

### Step 7: Dispatch the implementer

For items Josh agrees should be addressed, dispatch an `implementer` agent. It starts cold, so everything bearing on the fixes goes in the prompt:

```
Address review feedback on PR #<n> in <owner/repo>: <title>
## The feedback
<each agreed item verbatim, with the file and line it points at>
## Direction
<the note, and anything Josh decided about how to handle an item>
## Order
Blocking issues (breaks, security), then simple fixes (typos, imports), then complex fixes (refactoring, logic). One at a time, tested individually, no regressions.
## Your scope
Only these items, in the current working tree on branch <branch>. Do not push.
```

`BLOCKED: <question>` comes back — **100% confident** from the conversation or the review thread → answer it and resume the same agent with `SendMessage` so its context survives. **Anything less** → put the question to Josh verbatim with the context needed to answer it; don't soften it, don't answer around it, don't hand him a guess to confirm.

### Step 8: Finalize

Dispatch a `finalizer` agent with the diff (the uncommitted working tree on branch `<branch>`), the list of changed files, the PR URL, and the implementer's claims quoted verbatim. Fix-ups it hands back go to the implementer via `SendMessage`. **Tests failing means the feedback isn't addressed** — it does not go to Josh with a caveat.

### Step 9: Present results and record what Josh approves

For each addressed item, show:

- What the reviewer asked for
- What was changed (file:line)
- Brief explanation of the fix

For items you recommend pushing back on:

- What the reviewer asked for
- Why it shouldn't be done (technical reasoning)
- Draft reply text for Josh to review and post himself if he agrees

Then **stop** and wait for his review. Changes requested → implementer via `SendMessage`, feedback verbatim, then back through steps 8 and 9. Signed off → commit when he asks for it, per `committing.md`.

Keep an **approved set** as he goes: one entry per item he signs off on, carrying the item, the file and line, and the thread `id` from Step 4. An item he pushes back on, defers, or wants draft reply text for does not enter the set, and neither does one he hasn't reached yet. This set is the whole input to Step 10 — it is built here, from what he actually said, and never reconstructed later from the diff.

### Step 10: Resolve the threads Josh approved

Josh pushes, in his own shell. His `git push` appearing in the conversation is the go signal. Until it does, wait — nothing resolves, no polling, no asking again.

Once it lands, run one mutation per entry in the approved set:

```bash
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh api graphql -f threadId=<thread-id> -f query='
mutation($threadId: ID!) {
  resolveReviewThread(input: { threadId: $threadId }) {
    thread { id isResolved }
  }
}'
```

Which threads get resolved:

| Item                                                      | Resolve            |
| --------------------------------------------------------- | ------------------ |
| In the approved set from Step 9                            | Yes                |
| Josh pushed back on, deferred, or wants draft reply text   | No — leave it open |
| Not yet approved, even alongside items that were           | No                 |

Resolution only. No reply comment, no "fixed in `abc123`". The draft reply text from Step 9 stays Josh's to post.

When a call fails — a stale ID, a thread already resolved, permission you don't have — `gh` exits non-zero and prints the GraphQL error. Say so plainly, move to the next thread, don't abort the step.

Then report what closed and what stayed open, with the reason for each one left open, so Josh reads it here rather than finding it on GitHub:

> Resolved 3 threads: `src/auth.ts:42`, `src/auth.ts:88`, `README.md:12`. Left open: the `Cargo.toml` pinning thread — you're replying to that one yourself, draft is above.

Josh can also ask for the threads to be closed at any point — a later session, or after the conversation has moved on. Pick up from the approved set and resolve exactly those. If that set is no longer in hand, re-fetch the threads per Step 4, show him the unresolved ones, and ask which to resolve. Never infer the set from the diff or the commits.

### Step 11: Restore original state (if needed)

If Josh wants to return to the original branch:

```bash
git checkout "$ORIGINAL_BRANCH"
# Only if stash saved something:
git stash pop
```

Note: Josh may want to stay on the PR branch to continue working. Only restore if asked.
