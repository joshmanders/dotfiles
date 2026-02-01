---
name: github-workflow
description: GitHub Issues and project management. Use when creating issues, tracking work, or linking PRs.
---

# GitHub Project Management

**Project:** https://github.com/orgs/primcloud/projects/6

**Status Flow:** Backlog → To Do → In Progress → In Review → Done

**GitHub Identity:** All GitHub activity is performed under the `aniftybot` account. If you see comments, issues, or PRs from `aniftybot`, that's your previous work.

---

## Issue Types

| Type | ID                    | Use                               |
| ---- | --------------------- | --------------------------------- |
| Task | `IT_kwDOA_9RlM4AwYt7` | A specific piece of work          |
| Bug  | `IT_kwDOA_9RlM4AwYt9` | An unexpected problem or behavior |

### Setting Issue Type via GraphQL

```bash
gh api graphql -f query='
mutation {
  updateIssue(input: {
    id: "<issue-node-id>",
    issueTypeId: "IT_kwDOA_9RlM4AwYt7"
  }) {
    issue { title issueType { name } }
  }
}'
```

### Getting Issue Node ID

```bash
gh issue view <num> --repo primcloud/<repo> --json id --jq '.id'
```

---

## When Work Starts

1. **Create issue** (or find existing) in the appropriate repo
2. **Add to project** (may be automatic)
3. **Move to "In Progress"** before starting

---

## Creating Issues

### Standard Issue

```bash
gh issue create \
  --repo primcloud/<repo> \
  --title "Short description" \
  --body "## Summary
What and why.

## Acceptance Criteria
- [ ] First requirement
- [ ] Second requirement" \
  --project "Primcloud"
```

After creating, set the issue type (Task or Bug) via GraphQL. See "Issue Types" section above.

---

## Project Operations

```bash
# Add issue to project
gh project item-add 6 --owner primcloud \
  --url https://github.com/primcloud/<repo>/issues/<number>

# List project items
gh project item-list 6 --owner primcloud

# List issues in repo
gh issue list --repo primcloud/<repo>

# Search across org
gh search issues --owner primcloud "search terms"

# View issue
gh issue view <number> --repo primcloud/<repo>
```

---

## Status Transitions

| Status      | Trigger       | Method               |
| ----------- | ------------- | -------------------- |
| Backlog     | Issue created | Auto                 |
| To Do       | Prioritized   | Manual               |
| In Progress | Work starts   | **Manual — do this** |
| In Review   | PR opened     | Auto                 |
| Done        | PR merged     | Auto                 |

**Your responsibility:** Move to "In Progress" when starting work.

---

## Linking PRs to Issues

**Always include in PR body:**

```
Closes #123
```

Other keywords: `Fixes #123`, `Resolves #123`

Cross-repo: `Closes primcloud/platform#123`

Reference without closing: `Related to #123`

---

## Complete Workflow

```
1. Create issue (or find existing)
   → gh issue create --repo primcloud/<repo> ...

2. Add to project if not auto-added
   → gh project item-add 6 --owner primcloud --url <issue-url>

3. Move to "In Progress"
   → Update in GitHub UI or via gh project item-edit

4. Create branch, do work (follow josh skill)

5. Create PR with "Closes #123" in body
   → Status auto-moves to "In Review"

6. Merge
   → Status auto-moves to "Done"
```

---

## Quick Reference

| Action         | Command                                                              |
| -------------- | -------------------------------------------------------------------- |
| Create issue   | `gh issue create --repo primcloud/<repo> --title "..." --body "..."` |
| Add to project | `gh project item-add 6 --owner primcloud --url <url>`                |
| List issues    | `gh issue list --repo primcloud/<repo>`                              |
| View issue     | `gh issue view <num> --repo primcloud/<repo>`                        |
| Search org     | `gh search issues --owner primcloud "query"`                         |
