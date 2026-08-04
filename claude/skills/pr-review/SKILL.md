---
name: pr-review
description: "Review someone else's GitHub PR - checkout locally, deep read-only review, output copyable findings. Never posts, approves, or merges. Invoke when Josh says things like 'review this PR', 'can you look at Dave's PR', 'take a look at #12', 'review PR 340 for me', 'what do you think of this pull request', 'look over their changes', or drops a PR link and asks for a look. Disambiguation with pr-feedback: authorship decides. A PR authored by someone else belongs here. A PR Josh authored that has review comments to act on belongs to pr-feedback - cues for that are 'our PR', 'my PR', 'feedback we got', 'address the review', 'reviewer said'. When the phrasing is ambiguous ('look at PR 12'), check the PR author with gh before choosing. Takes a PR ref plus an optional note; with no ref, resolves the PR from the conversation or the current branch."
argument-hint: "[pr-ref] [note]"
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
gh pr checkout <number> --repo <owner/repo>
```

Track whether stash saved anything (check if `$STASH_RESULT` contains "No local changes").

### Step 4: Gather PR context from GitHub

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

### Step 6: Read changed files and deep review

Use `git diff --name-only` output to get the file list. Apply the `requesting-code-review` skill:

- Read each changed file in full — not just diff hunks
- Trace code paths end-to-end per the skill's review process
- Use the review criteria from `code-reviewer.md` (bugs, regressions, security, pattern violations, etc.)
- Follow the skill's output rules: only actionable items, nothing else

### Step 7: Output

**If the PR is clean** — no bugs, no regressions, nothing substantial:

> This PR is good to go. Approve it.

One line. Done. Do not elaborate, summarize changes, or praise the code.

**If there are findings** — output each as a raw markdown block wrapped in ```````` so Josh gets copyable markdown. Each finding is a separate block he can paste as a GitHub review comment.

Format for each finding:

`````````
````
`path/to/file.ts` line 42

Description of the problem — direct, specific, explains *why* it matters.

```suggestion
// corrected code here if applicable
```
````
`````````

- File path and line number (or range like `lines 42-48`) on the first line
- Problem description — plain language, no severity labels, no categories
- GitHub suggestion block only when you have a concrete fix. Omit if the fix is non-trivial or requires discussion.
- One finding per block. Do not combine multiple issues.

After all findings, one line:

> Request changes — [N] items above.

Or if findings are minor enough to not block:

> Approve with comments — [N] items above worth addressing.

### Step 8: Restore original state

After completing the review, ALWAYS return to the original branch and restore stash:

```bash
git checkout "$ORIGINAL_BRANCH"
# Only if stash saved something:
git stash pop
```

Do this even if the review encounters errors.
