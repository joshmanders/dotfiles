---
name: pr-feedback
description: |
  Address review feedback on a PR Josh authored - fetch the review comments, decide each item, fix the sound ones locally, decline the ones that don't hold up with a draft reply, and resolve the threads Josh's sign-off on the finished work covers, with the matching resolution reason. Never posts on his behalf. Invoke when Josh says things like 'we got some feedback on our PR', 'address the review comments', 'the reviewer said X', 'my PR has comments on it', 'can you handle the feedback on #12', 'fix what the review flagged', or mentions someone reviewing a PR of his. Disambiguation with pr-review: authorship decides. A PR Josh authored with review comments to act on belongs here - cues are 'our PR', 'my PR', 'feedback we got', 'address the review', 'reviewer said'. A PR authored by someone else that he wants read belongs to pr-review - cues are 'review this PR', "take a look at Dave's PR", 'can you review #12'. When the phrasing is ambiguous ('look at PR 12'), check the PR author with gh before choosing. Takes an optional PR ref and note; with no ref, resolves the PR from the conversation or the current branch.
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

**One write is permitted: the `resolveReviewThread` mutation, with the `resolutionReason` Josh's decision sets.** Resolving a thread is a state change with no content authored in Josh's name. Posting text is speaking for him, and that never happens without his explicit approval of the exact words. Resolve only threads Josh's sign-off covers — Step 10 governs.

You decide each item and implement fixes locally. Josh signs off on the finished work, approves any reply text, and decides what to post and when to push.

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

### Step 5: Collect the open items

Unresolved items (`isResolved: false`) are the ones to handle. Resolved items are already addressed; skip them.

### Step 6: Decide each item

Every item gets a decision from you, not from Josh:

| Item                                                                 | Decision                                          |
| -------------------------------------------------------------------- | ------------------------------------------------- |
| Sound                                                                | Fix it                                            |
| The implementer pushes back with sound technical reasoning           | Decline it, with a draft reply                    |
| Its right handling turns on Josh's preference or facts only he has   | Ask Josh, then handle it per his answer           |

A declined item carries its resolution reason from the pushback: `WONT_FIX` when the finding is real but not worth acting on, `INVALID` when it's wrong or doesn't hold up.

The `implementer` evaluates each point technically before applying it — tracing it against the actual code, pushing back on anything wrong or unsafe through its `BLOCKED:` path, and YAGNI-checking suggested additions. You don't pre-verify or pre-implement; the dispatch (Step 7) and the gate (Step 8) carry the work.

### Step 7: Dispatch the implementer

Dispatch an `implementer` with every item that doesn't wait on Josh. An item that does joins the work once he answers, resumed into the same agent with `SendMessage`.

```
Address review feedback on PR #<n> in <owner/repo>: <title>
## The feedback
<each item verbatim, with the file and line it points at>
## Direction
<the note, and Josh's answer on any item that needed him>
```

When `BLOCKED:` comes back:

- **Pushback on an item** — reasoning sound → the item is declined; draft the reply and tell the implementer to drop it. Reasoning unsound → send it back with why the item holds.
- **A question** — the facts settle it → answer and resume. It turns on Josh's preference or facts only he has → it goes to Josh.

### Step 8: Run the gate

Dispatch a `reviewer` agent with the PR URL and the feedback items, the list of changed files, and the implementer's claims quoted verbatim. **Tests failing means the feedback isn't addressed** — it does not go to Josh with a caveat.

### Step 9: Present the finished work

Josh reviews the work once, as a whole:

- **Fixed** — what the reviewer asked for, and what changed
- **Declined** — what the reviewer asked for, why it isn't done, its resolution reason, and the draft reply text for him to approve before anything is posted
- **Handled per his answer** — how each item that needed him landed

Then **stop** and wait for his review. Changes requested → implementer via `SendMessage`, his feedback verbatim, then back through steps 8 and 9. Commit only when he explicitly asks.

His sign-off sets the resolution reason for every item the signed-off work covers:

| Item in the signed-off work                  | Reason      |
| -------------------------------------------- | ----------- |
| Fixed                                        | `ADDRESSED` |
| Declined: real but not worth acting on       | `WONT_FIX`  |
| Declined: wrong or doesn't hold up           | `INVALID`   |

Record that as the **signed-off set**: one entry per item, carrying the item, the file and line, the thread `id` from Step 4, and its reason. An item he pulls out, defers, or changes the handling of enters the set only as he signs it off. This set is the whole input to Step 10 — it is built here, from what he signed off on, and never reconstructed later from the diff.

### Step 10: Resolve the signed-off threads

Josh pushes, in his own shell. His `git push` appearing in the conversation is the go signal for `ADDRESSED` entries. Until it does, wait — no `ADDRESSED` thread resolves, no polling, no asking again. A `WONT_FIX` or `INVALID` entry resolves once his approved reply is on the thread, when he wants one.

Run one mutation per entry in the signed-off set, passing its reason:

```bash
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh api graphql -f threadId=<thread-id> -f reason=<ADDRESSED|WONT_FIX|INVALID> -f query='
mutation($threadId: ID!, $reason: PullRequestReviewThreadResolutionReason) {
  resolveReviewThread(input: { threadId: $threadId, resolutionReason: $reason }) {
    thread { id isResolved }
  }
}'
```

Which threads get resolved:

| Item                                                                | Resolve                                              |
| ------------------------------------------------------------------- | ---------------------------------------------------- |
| Fixed, signed off, and pushed                                       | Yes — `ADDRESSED`                                    |
| Declined as not worth acting on, signed off                         | Yes — `WONT_FIX`, after any approved reply is posted |
| Declined as wrong, signed off                                       | Yes — `INVALID`, after any approved reply is posted  |
| Outside his sign-off — deferred, pulled out, or not yet signed off  | No — leave it open                                   |

GitHub shows the reason on the thread: Addressed ("This suggestion has been addressed."), Won't fix ("This suggestion won't be addressed."), Incorrect ("This suggestion is incorrect or unhelpful.").

Resolution only. No reply comment, no "fixed in `abc123`". The draft reply text from Step 9 stays Josh's to post.

When a call fails — a stale ID, a thread already resolved, permission you don't have — `gh` exits non-zero and prints the GraphQL error. Say so plainly, move to the next thread, don't abort the step.

Then report what closed and what stayed open, with the reason for each one left open, so Josh reads it here rather than finding it on GitHub:

> Resolved 3 threads: `src/auth.ts:42` (addressed), `src/auth.ts:88` (addressed), `README.md:12` (won't fix). Left open: the `Cargo.toml` pinning thread — you deferred it.

Josh can also ask for the threads to be closed at any point — a later session, or after the conversation has moved on. Pick up from the signed-off set and resolve exactly those. If that set is no longer in hand, re-fetch the threads per Step 4, show him the unresolved ones, and ask which to resolve and with which reason. Never infer the set from the diff or the commits.

### Step 11: Restore original state (if needed)

If Josh wants to return to the original branch:

```bash
git checkout "$ORIGINAL_BRANCH"
# Only if stash saved something:
git stash pop
```

Note: Josh may want to stay on the PR branch to continue working. Only restore if asked.
