---
name: github
description: "GitHub CLI patterns for issues, projects, and PRs. Invoke when: creating issues, linking PRs to issues, updating project status, or any GitHub project operations."
---

# GitHub CLI Patterns

Generic patterns for GitHub operations using `gh` CLI.

---

## Issues

### Creating Issues

```bash
gh issue create \
  --repo <org>/<repo> \
  --title "Issue title" \
  --body "## Summary
Description of what and why.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2"
```

With project board:

```bash
gh issue create \
  --repo <org>/<repo> \
  --title "Issue title" \
  --body "..." \
  --project "<project-name>"
```

### Issue Operations

```bash
# List issues
gh issue list --repo <org>/<repo>

# View issue
gh issue view <number> --repo <org>/<repo>

# Edit issue
gh issue edit <number> --repo <org>/<repo>

# Add comment
gh issue comment <number> --repo <org>/<repo> --body "..."

# Search across org
gh search issues --owner <org> "search terms"

# Get issue node ID (for GraphQL)
gh issue view <number> --repo <org>/<repo> --json id --jq '.id'
```

---

## Project Boards (v2)

### Adding to Project

```bash
gh project item-add <project-number> --owner <org> \
  --url https://github.com/<org>/<repo>/issues/<number>

# List project items
gh project item-list <project-number> --owner <org>
```

### Getting Project Item ID

Required for status updates:

```bash
gh api graphql -f query='
query($url: URI!) {
  resource(url: $url) {
    ... on Issue {
      projectItems(first: 1) {
        nodes { id }
      }
    }
  }
}' -f url="https://github.com/<org>/<repo>/issues/<num>" --jq '.data.resource.projectItems.nodes[0].id'
```

### Setting Status

```bash
gh api graphql -f query='
mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "<project-id>"
    itemId: "<project-item-id>"
    fieldId: "<status-field-id>"
    value: { singleSelectOptionId: "<status-option-id>" }
  }) {
    projectV2Item { id }
  }
}'
```

### Setting Issue Type

```bash
gh api graphql -f query='
mutation {
  updateIssue(input: {
    id: "<issue-node-id>",
    issueTypeId: "<issue-type-id>"
  }) {
    issue { title issueType { name } }
  }
}'
```

---

## Pull Requests

### Creating PRs

```bash
gh pr create \
  --repo <org>/<repo> \
  --title "feat: short description" \
  --body "## Summary
What was done.

## Changes
- Change 1
- Change 2

Closes #<issue-number>"
```

### PR Operations

```bash
# List PRs
gh pr list --repo <org>/<repo>

# View PR
gh pr view <number> --repo <org>/<repo>

# Check PR status
gh pr checks <number> --repo <org>/<repo>
```

---

## Linking PRs to Issues

Include in PR body to auto-close:

```
Closes #123
Fixes #123
Resolves #123
```

Cross-repo reference:

```
Closes <org>/<other-repo>#123
```

Reference without closing:

```
Related to #123
```

---

## Quick Reference

| Action         | Command                                       |
| -------------- | --------------------------------------------- |
| Create issue   | `gh issue create --repo <org>/<repo> ...`     |
| Add to project | `gh project item-add <num> --owner <org> ...` |
| List issues    | `gh issue list --repo <org>/<repo>`           |
| View issue     | `gh issue view <num> --repo <org>/<repo>`     |
| Search org     | `gh search issues --owner <org> "query"`      |
| Create PR      | `gh pr create --repo <org>/<repo> ...`        |
