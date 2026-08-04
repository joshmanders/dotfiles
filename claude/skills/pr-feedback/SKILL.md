---
name: pr-feedback
description: "Address review feedback on a PR Josh authored - fetch the review comments, understand them, implement the fixes locally. Never posts on his behalf. Invoke when Josh says things like 'we got some feedback on our PR', 'address the review comments', 'the reviewer said X', 'my PR has comments on it', 'can you handle the feedback on #12', 'fix what the review flagged', or mentions someone reviewing a PR of his. Disambiguation with pr-review: authorship decides. A PR Josh authored with review comments to act on belongs here - cues are 'our PR', 'my PR', 'feedback we got', 'address the review', 'reviewer said'. A PR authored by someone else that he wants read belongs to pr-review - cues are 'review this PR', \"take a look at Dave's PR\", 'can you review #12'. When the phrasing is ambiguous ('look at PR 12'), check the PR author with gh before choosing. Takes an optional PR ref and note; with no ref, resolves the PR from the conversation or the current branch."
argument-hint: "[pr-ref] [note]"
---

## Task: Address review feedback on PR $ARGUMENTS

**If you are in plan mode, exit it now.** This is an active task — feedback needs to be addressed, not planned.

### CRITICAL: No posting without approval

**NEVER post comments, reviews, or any content on Josh's behalf.** Not even if asked, unless Josh explicitly says to AND approves the exact text first.

You MUST NOT:

- Submit reviews (`gh pr review`)
- Post comments (`gh pr comment`, `gh api` POST/PUT/PATCH)
- Reply to review threads
- Modify any GitHub state whatsoever

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

# Inline review comments (the actual feedback on code)
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh api repos/<owner>/<repo>/pulls/<number>/comments

# Issue-level comments
GH_TOKEN=$(gh auth token --user "$DOTFILES_GITHUB_USERNAME") \
  gh api repos/<owner>/<repo>/issues/<number>/comments
```

### Step 5: Categorize feedback

Separate feedback into:

- **Unresolved items** — active feedback that needs attention
- **Resolved items** — already addressed, skip these

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

### Step 9: Present results

For each addressed item, show:

- What the reviewer asked for
- What was changed (file:line)
- Brief explanation of the fix

For items you recommend pushing back on:

- What the reviewer asked for
- Why it shouldn't be done (technical reasoning)
- Draft reply text for Josh to review and post himself if he agrees

### Step 10: Restore original state (if needed)

If Josh wants to return to the original branch:

```bash
git checkout "$ORIGINAL_BRANCH"
# Only if stash saved something:
git stash pop
```

Note: Josh may want to stay on the PR branch to continue working. Only restore if asked.
