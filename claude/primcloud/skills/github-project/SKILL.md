---
name: github-project
description: "Primcloud GitHub project board config, IDs, and commands. Invoke when: working in any primcloud repository."
user-invocable: false
---

# Primcloud GitHub Project

**Project:** https://github.com/orgs/primcloud/projects/6

**Project Number:** 6

**Status Flow:** Backlog → To Do → In Progress → In Review → Done

---

## GitHub Identity

You operate as `dunnbot`. Comments, issues, and PRs from that account are your previous work.

---

## Issue Types

| Type | ID                    | Use                               |
| ---- | --------------------- | --------------------------------- |
| Task | `IT_kwDOA_9RlM4AwYt7` | A specific piece of work          |
| Bug  | `IT_kwDOA_9RlM4AwYt9` | An unexpected problem or behavior |

### Setting Issue Type

```bash
# Get issue node ID
ISSUE_ID=$(gh issue view <num> --repo primcloud/<repo> --json id --jq '.id')

# Set as Task
gh api graphql -f query="
mutation {
  updateIssue(input: {
    id: \"$ISSUE_ID\",
    issueTypeId: \"IT_kwDOA_9RlM4AwYt7\"
  }) {
    issue { title issueType { name } }
  }
}"

# Set as Bug
gh api graphql -f query="
mutation {
  updateIssue(input: {
    id: \"$ISSUE_ID\",
    issueTypeId: \"IT_kwDOA_9RlM4AwYt9\"
  }) {
    issue { title issueType { name } }
  }
}"
```

---

## Status Field

**Status Field ID:** `PVTSSF_lADOA_9RlM0Qr82HRA`

| Status      | ID         |
| ----------- | ---------- |
| Backlog     | `f75ad846` |
| To Do       | `47fc9ee4` |
| In Progress | `98236657` |
| In Review   | `d64335fb` |
| Done        | `fe8b95e7` |

### Getting Project Item ID

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
}' -f url="https://github.com/primcloud/<repo>/issues/<num>" --jq '.data.resource.projectItems.nodes[0].id'
```

### Setting Status

```bash
gh api graphql -f query='
mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "PVT_kwDOA_9RlM0Qrw"
    itemId: "<project-item-id>"
    fieldId: "PVTSSF_lADOA_9RlM0Qr82HRA"
    value: { singleSelectOptionId: "<status-id>" }
  }) {
    projectV2Item { id }
  }
}'
```

**Move to In Progress:**

```bash
ITEM_ID=$(gh api graphql -f query='
query($url: URI!) {
  resource(url: $url) {
    ... on Issue {
      projectItems(first: 1) {
        nodes { id }
      }
    }
  }
}' -f url="https://github.com/primcloud/<repo>/issues/<num>" --jq '.data.resource.projectItems.nodes[0].id')

gh api graphql -f query="
mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: \"PVT_kwDOA_9RlM0Qrw\"
    itemId: \"$ITEM_ID\"
    fieldId: \"PVTSSF_lADOA_9RlM0Qr82HRA\"
    value: { singleSelectOptionId: \"98236657\" }
  }) {
    projectV2Item { id }
  }
}"
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

## Issue Titles

Use brief noun phrases, not imperative actions:

| Good                       | Bad                             |
| -------------------------- | ------------------------------- |
| "API rate limiting"        | "Add rate limiting to API"      |
| "User authentication flow" | "Fix authentication flow"       |
| "Dashboard performance"    | "Improve dashboard performance" |

---

## Creating Issues

```bash
gh issue create \
  --repo primcloud/<repo> \
  --title "Brief noun phrase" \
  --body "## Summary
What we're doing and why.

## Approach
How we'll implement this.
- Step 1
- Step 2

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests written

## Files/Areas
- \`path/to/file.ts\`" \
  --project "Primcloud"
```

---

## Cross-Repo Coordination

Primcloud is a multi-repo project. Work often spans multiple repositories.

1. **Base issue in platform** — Create the main tracking issue in `primcloud/platform`
2. **Sub-issues in related repos** — Create issues in repos where work is needed
3. **Link as sub-issues** — Use GitHub's native sub-issue feature (see `github` skill for CLI commands)

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

# Edit issue
gh issue edit <number> --repo primcloud/<repo>

# Add comment
gh issue comment <number> --repo primcloud/<repo> --body "..."
```

---

## Creating PRs

```bash
gh pr create \
  --repo primcloud/<repo> \
  --title "feat: clear description" \
  --body "## Summary
What was done.

## Changes
- Change 1
- Change 2

Closes #123"
```

---

## Quick Reference

| Action         | Command                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------ |
| Create issue   | `gh issue create --repo primcloud/<repo> --title "..." --body "..." --project "Primcloud"` |
| Add to project | `gh project item-add 6 --owner primcloud --url <url>`                                      |
| Set status     | See "Setting Status" section                                                               |
| List issues    | `gh issue list --repo primcloud/<repo>`                                                    |
| View issue     | `gh issue view <num> --repo primcloud/<repo>`                                              |
| Search org     | `gh search issues --owner primcloud "query"`                                               |
| Create PR      | `gh pr create --repo primcloud/<repo> --title "..." --body "... Closes #N"`                |

---

## Context Recovery

If context compacts, fetch the issue:

```bash
gh issue view <num> --repo primcloud/<repo>
```

Comments from `dunnbot` are your previous notes.
