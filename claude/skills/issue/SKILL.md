---
name: issue
description: Start working on a GitHub issue
argument-hint: "<issue-ref> [note]"
disable-model-invocation: true
---

## Task: Work on Issue $ARGUMENTS

Pull the specified GitHub issue, gather its full context, create a working branch, and start.

### Step 0: Parse arguments

`$ARGUMENTS` is the issue ref optionally followed by a note. The first token is the issue ref, everything after is a note providing additional context.

Example: `/issue 123 focus on the api endpoint, ignore the frontend for now` → issue ref: `123`, note: `focus on the api endpoint, ignore the frontend for now`

If a note is present, treat it as guidance throughout planning and execution — it may narrow scope, set priorities, or provide context not in the issue itself.

### Step 1: Parse the issue reference

Parse the issue ref to determine the repo and issue number:

| Format              | Example       | Meaning                               |
| ------------------- | ------------- | ------------------------------------- |
| Number only         | `123`         | Current repo, issue 123               |
| `owner/repo#number` | `foo/bar#123` | Repo `foo/bar`, issue 123             |
| `repo#number`       | `bar#123`     | Current owner + repo `bar`, issue 123 |

To get the current repo's owner:

```bash
gh repo view --json owner -q '.owner.login'
```

### Step 2: Fetch issue context

Gather everything the issue has attached. Any of it may carry relevant context; interpretation isn't this skill's job — pull it all first, then read.

- The issue: title, body, comments, assignees, state
- Labels and their descriptions (label names can be opaque; descriptions often carry the meaning)
- Milestone and its description
- Issue type, if set
- Parent issue, if this is a sub-issue
- Sub-issues, if this issue has any
- Linked PRs
- Project board fields, if the issue is on a board

`gh issue view` returns names but not label/milestone descriptions or type/parent/sub-issue/project data. Reach further for the rest:

```bash
# The issue itself
gh issue view <number> --repo <owner/repo> \
  --json number,title,body,state,assignees,labels,milestone,comments

# Label descriptions (issue view returns only names)
gh label list --repo <owner/repo> --limit 200 --json name,description

# Milestone description (issue view returns only title)
gh api repos/<owner/repo>/milestones/<milestone-number>

# Issue type, parent, sub-issues, linked PRs, project fields
gh api graphql -f query='
query($url: URI!) {
  resource(url: $url) {
    ... on Issue {
      issueType { name description }
      parent { number title url state }
      subIssues(first: 50) { nodes { number title state url } }
      closedByPullRequestsReferences(first: 20, includeClosedPrs: true) {
        nodes { number title state url }
      }
      projectItems(first: 10) {
        nodes {
          project { title number }
          fieldValues(first: 20) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                field { ... on ProjectV2SingleSelectField { name } }
                name
              }
              ... on ProjectV2ItemFieldTextValue {
                field { ... on ProjectV2Field { name } }
                text
              }
              ... on ProjectV2ItemFieldNumberValue {
                field { ... on ProjectV2Field { name } }
                number
              }
            }
          }
        }
      }
    }
  }
}' -f url="https://github.com/<owner/repo>/issues/<number>"
```

### Step 3: Create working branch

Ensure you're on the base branch (usually `master` or `main`), then:

```bash
git issue <number>
```

### Step 4: Set session context

Track the issue as active session context: `Active Issue: #<number> - <title>`.

### Step 5: Assess and begin

Read the fetched context and assess.

**If any signal suggests this is a bug** — issue type set to a bug variant, a label indicating a defect, body or comments describing broken or regressed behavior, a linked PR that reverted something, or the note frames it as an investigation:

- Invoke the `systematic-debugging` skill.
- Trace the root cause before proposing a fix. Do not jump to a patch based on the symptom.
- Once the root cause is understood, continue to the complexity assessment below to decide how to proceed with the fix.

**Otherwise, assess complexity:**

**Straightforward** — requirements clear, approach obvious, no architectural decisions needed:

- Skip planning. Start working immediately.
- Follow the task lifecycle (read nearby code, implement, test, clean up).

**Complex** — ambiguous requirements, multiple approaches possible, architectural decisions needed, or the note asks to plan first:

- Use the `planning` skill to draft a plan.
- Exit plan mode for approval before executing.

Default to just starting. Only plan when the work genuinely needs it.

### Step 6: Execute

- Do the work following the task lifecycle
- If scope expands → STOP, ask about a new issue
- When done, present the work and wait for review
