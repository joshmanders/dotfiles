---
name: pr
description: Review a GitHub PR - analyze changes, comments, and reviews (READ-ONLY)
argument-hint: "<pr-ref>"
disable-model-invocation: true
---

## Task: Review PR $ARGUMENTS

### CRITICAL: READ-ONLY MODE

This skill is strictly read-only. You MUST NOT:

- Submit reviews (`gh pr review`)
- Post comments (`gh pr comment`, `gh api` POST/PUT/PATCH)
- Approve, request changes, or merge
- Modify any GitHub state whatsoever
- Use any write/mutating API calls

Only use read operations: `gh pr view`, `gh pr diff`, `gh pr checks`, `gh api` GET requests.

### Step 1: Parse the PR reference

Parse `$ARGUMENTS` to determine the repo and PR number:

| Format              | Example       | Meaning                            |
| ------------------- | ------------- | ---------------------------------- |
| Number only         | `123`         | Current repo, PR 123               |
| `owner/repo#number` | `foo/bar#123` | Repo `foo/bar`, PR 123             |
| `repo#number`       | `bar#123`     | Current owner + repo `bar`, PR 123 |

Get current repo owner if needed:

```bash
gh repo view --json owner -q '.owner.login'
```

### Step 2: Gather PR data

Fetch all relevant information (read-only commands only):

```bash
# PR metadata, body, state, reviews, comments
gh pr view <number> --repo <owner/repo> --json title,body,state,author,baseRefName,headRefName,files,additions,deletions,commits,reviews,comments,reviewDecision,labels,createdAt,updatedAt

# Full diff
gh pr diff <number> --repo <owner/repo>

# Review comments (inline on code)
gh api repos/<owner>/<repo>/pulls/<number>/comments

# Check status
gh pr checks <number> --repo <owner/repo>
```

### Step 3: Analyze the PR

Review these aspects:

1. **Purpose & Context**
   - What problem does this solve?
   - Is the scope appropriate?
   - Does the title/description match the changes?

2. **Code Quality**
   - Follows existing patterns in the codebase?
   - Handles edge cases?
   - Error handling appropriate?
   - No obvious bugs or security issues?

3. **Test Coverage**
   - Are there tests for new functionality?
   - Do tests cover edge cases?
   - Any test quality concerns?

4. **Review History**
   - What have other reviewers said?
   - Are there unresolved conversations?
   - What's the current review decision?

5. **CI Status**
   - Are checks passing?
   - Any failures to investigate?

### Step 4: Apply Code Review Standards

**Related skill:** Follow `requesting-code-review` skill patterns for review criteria.

Evaluate against these standards:

- Requirements met?
- Follows existing patterns (check nearby code)?
- Debug code removed?
- Tests pass and cover new functionality?
- Formatters run?
- Documentation updated if behavior changed?

### Step 5: Provide Assessment

Present findings in this format:

**Summary:** One-line assessment (e.g., "Ready to merge", "Needs changes", "Needs discussion")

**Strengths:**

- What's good about this PR

**Concerns:**

- Issues that should be addressed
- Questions that need answers

**Existing Review Threads:**

- Summarize unresolved conversations

**Recommendation:**

- Clear guidance on next steps

---

### REMINDER: READ-ONLY MODE

DO NOT submit reviews, post comments, or make any changes. This skill only analyzes and reports.
