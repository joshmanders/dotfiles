---
name: issue
description: Start working on a GitHub issue
argument-hint: "<issue-ref> [note]"
disable-model-invocation: true
---

## Task: Work on Issue $ARGUMENTS

Pull the specified GitHub issue, create a working branch, and start.

**Related skills:** Use `github` skill patterns for CLI commands.

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

### Step 2: Fetch issue details

```bash
gh issue view <number> --repo <owner/repo>
```

Read the full issue: description, comments, linked issues/PRs, acceptance criteria.

### Step 3: Create working branch

Ensure you're on the base branch (usually `master` or `main`), then create the working branch:

```bash
git issue <number>
```

This uses the `git-issue` helper which creates a branch named `TYPE-<number>` based on the issue's type field.

### Step 4: Assess and begin

Read the issue requirements and assess complexity:

**Straightforward** — the requirements are clear, the approach is obvious, no architectural decisions needed:

- Skip planning. Start working immediately.
- Follow the task lifecycle (read nearby code, implement, test, clean up).

**Complex** — ambiguous requirements, multiple approaches possible, architectural decisions needed, or the note asks to plan first:

- Use the `planning` skill to draft a plan.
- Exit plan mode for approval before executing.

Use your judgment. Default to just starting. Only plan when the work genuinely needs it.

### Step 5: Execute

- Track the issue as session context: `Active Issue: #<number> - <title>`
- Do the work following the task lifecycle
- If scope expands → STOP, ask about a new issue
- When done, present the work and wait for review
