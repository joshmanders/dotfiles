---
name: issue
description: Start planning work on a GitHub issue
argument-hint: "<issue-ref>"
---

## Task: Work on Issue $ARGUMENTS

Pull the specified GitHub issue and start planning work to complete it.

**Related skills:** Use `github` skill patterns for CLI commands. Follow `planning` skill workflow for the planning phase.

### Step 1: Parse the issue reference

Parse `$ARGUMENTS` to determine the repo and issue number:

| Format              | Example       | Meaning                               |
| ------------------- | ------------- | ------------------------------------- |
| Number only         | `123`         | Current repo, issue 123               |
| `owner/repo#number` | `foo/bar#123` | Repo `foo/bar`, issue 123             |
| `repo#number`       | `bar#123`     | Current owner + repo `bar`, issue 123 |

To get the current repo's owner:

```bash
gh repo view --json owner -q '.owner.login'
```

### Step 2: Fetch issue details

Use `github` skill patterns:

```bash
gh issue view <number> --repo <owner/repo>
```

### Step 3: Understand the requirements

- Read the issue description and comments
- Identify acceptance criteria
- Note linked issues or PRs

### Step 4: Start planning workflow

Follow the `planning` skill:

1. Understand the work from the issue
2. Explore the codebase for relevant files
3. Draft implementation plan
4. Exit plan mode for approval

### Step 5: Execute (after plan approval)

Per `planning` skill workflow:

- Track this as the active issue
- Do the work
- Create PR that closes the issue
