---
name: pr-feedback
description: Respond to review feedback on your GitHub PR - fetch comments, understand feedback, implement fixes
argument-hint: "<pr-ref> [note]"
disable-model-invocation: true
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

`$ARGUMENTS` is the PR ref optionally followed by a note. The first token is the PR ref, everything after is a note providing additional context.

Example: `/pr-feedback 123 look at just johnsmith review` → PR ref: `123`, note: `look at just johnsmith review`

If a note is present, treat it as guidance — it may narrow which reviews to address, highlight priorities, or provide context.

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

### Step 3: Fetch all review feedback

```bash
# PR metadata and body
gh pr view <number> --repo <owner/repo> --json title,body,state,author,baseRefName,headRefName,reviewDecision,labels

# Reviews (approval status, review bodies)
gh api repos/<owner>/<repo>/pulls/<number>/reviews

# Inline review comments (the actual feedback on code)
gh api repos/<owner>/<repo>/pulls/<number>/comments

# Issue-level comments
gh api repos/<owner>/<repo>/issues/<number>/comments
```

### Step 4: Categorize feedback

Separate feedback into:

- **Unresolved items** — active feedback that needs attention
- **Resolved items** — already addressed, skip these

For unresolved items, group by reviewer and present a summary to Josh:

- What each reviewer is asking for
- Which items are clear vs. need clarification

### Step 5: Apply `receiving-code-review` skill

This skill governs how to handle all feedback. Key principles:

1. **READ** all feedback without reacting
2. **UNDERSTAND** — restate each item in your own words
3. **VERIFY** — check against the actual codebase
4. **EVALUATE** — is the suggestion technically sound for THIS codebase?
5. **RESPOND** — implement or push back with reasoning

**If ANY item is unclear:** Stop. Present what you understand and what needs clarification. Do not partially implement.

**If a suggestion seems wrong:** Say so with technical reasoning. Check if it breaks existing functionality, contradicts architecture decisions, or violates YAGNI.

### Step 6: Implement fixes

For items Josh agrees should be addressed:

1. Implement one at a time
2. Test each fix individually
3. Verify no regressions

**Implementation order:**

1. Blocking issues (breaks, security)
2. Simple fixes (typos, imports)
3. Complex fixes (refactoring, logic)

### Step 7: Present results

For each addressed item, show:

- What the reviewer asked for
- What was changed (file:line)
- Brief explanation of the fix

For items you recommend pushing back on:

- What the reviewer asked for
- Why it shouldn't be done (technical reasoning)
- Draft reply text for Josh to review and post himself if he agrees

### Step 8: Restore original state (if needed)

If Josh wants to return to the original branch:

```bash
git checkout "$ORIGINAL_BRANCH"
# Only if stash saved something:
git stash pop
```

Note: Josh may want to stay on the PR branch to continue working. Only restore if asked.
