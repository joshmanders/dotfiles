---
name: pr-review
description: Review a colleague's GitHub PR - checkout locally, gather context, then review code (READ-ONLY)
argument-hint: "<pr-ref> [note]"
disable-model-invocation: true
---

## Task: Review PR $ARGUMENTS

**If you are in plan mode, exit it now.** This is a read-only review task — nothing needs approval.

### CRITICAL: READ-ONLY MODE

**NEVER post comments, reviews, or any content on Josh's behalf.** Not even if asked, unless Josh explicitly says to AND approves the exact text first.

You MUST NOT:

- Submit reviews (`gh pr review`)
- Post comments (`gh pr comment`, `gh api` POST/PUT/PATCH)
- Approve, request changes, or merge
- Modify any GitHub state whatsoever

`gh pr checkout` is allowed — it's a local git operation.

Your job is to present findings locally. Josh decides what to post.

---

### Step 0: Parse arguments

`$ARGUMENTS` is the PR ref optionally followed by a note. The first token is the PR ref, everything after is a note providing additional context for the review.

Example: `/pr-review 123 focus on the auth changes` → PR ref: `123`, note: `focus on the auth changes`

If a note is present, treat it as guidance throughout the review — it may narrow scope, highlight concerns, or provide context.

### Step 1: Parse the PR reference

Parse the PR ref to determine the repo and PR number:

| Format              | Example       | Meaning                            |
| ------------------- | ------------- | ---------------------------------- |
| Number only         | `123`         | Current repo, PR 123               |
| `owner/repo#number` | `foo/bar#123` | Repo `foo/bar`, PR 123             |
| `repo#number`       | `bar#123`     | Current owner + repo `bar`, PR 123 |

Get current repo owner if needed:

```bash
gh repo view --json owner -q '.owner.login'
```

### Step 2: Save state and checkout PR branch

```bash
ORIGINAL_BRANCH=$(git branch --show-current)
STASH_RESULT=$(git stash --include-untracked 2>&1)
gh pr checkout <number> --repo <owner/repo>
```

Track whether stash saved anything (check if `$STASH_RESULT` contains "No local changes").

### Step 3: Gather PR context from GitHub

```bash
# PR metadata
gh pr view <number> --repo <owner/repo> --json title,body,state,author,baseRefName,headRefName,files,additions,deletions,commits,reviews,comments,reviewDecision,labels,createdAt,updatedAt

# Reviews
gh api repos/<owner>/<repo>/pulls/<number>/reviews

# Inline review comments
gh api repos/<owner>/<repo>/pulls/<number>/comments

# Issue comments
gh api repos/<owner>/<repo>/issues/<number>/comments

# CI status
gh pr checks <number> --repo <owner/repo>
```

**Linked issues:** Parse the PR body for issue references (`Fixes #N`, `Closes #N`, `Resolves #N`, or bare `#N`) and fetch each:

```bash
gh issue view <issue-number> --repo <owner/repo> --json title,body,state,labels,comments
```

**Resolved review threads:** These are context only. Read what was requested and what was done to resolve it. Do NOT re-raise resolved items as findings. Use them to inform your understanding of the PR's evolution if relevant, otherwise discard.

### Step 4: Compute local diff (source of truth)

```bash
BASE_REF=<baseRefName from PR metadata>
git fetch origin "$BASE_REF"
BASE_SHA=$(git merge-base "origin/$BASE_REF" HEAD)

git diff --stat "$BASE_SHA"..HEAD
git diff "$BASE_SHA"..HEAD
git diff --name-only "$BASE_SHA"..HEAD
```

**Never use `gh pr diff`** — API diffs can be inaccurate. Local diff is the source of truth.

### Step 5: Read changed files locally

Use `git diff --name-only` output to get the file list. Read each changed file to understand the full context around changes — not just the diff hunks.

### Step 6: Review code

Apply `requesting-code-review` skill with the gathered context:

- PR metadata, linked issues, review conversation history
- `BASE_SHA` and `HEAD_SHA` for the git range
- Changed file list and full file contents

The review skill handles the actual code review, output format, and tone.

### Step 7: PR-specific context (after review findings)

After presenting per-file findings, add:

- **Unresolved Review Threads**: Summarize any open conversations from existing reviews
- **CI Status**: Pass/fail and any notable failures
- **Overall**: One-line verdict (ready to merge / needs changes / needs discussion)

### Step 8: Restore original state

After completing the review, ALWAYS return to the original branch and restore stash:

```bash
git checkout "$ORIGINAL_BRANCH"
# Only if stash saved something:
git stash pop
```

Do this even if the review encounters errors.
