---
name: issue
description: "Work a single GitHub issue end to end — fetch its full context, branch, and start. Use when Josh points at an issue and wants it worked: 'let's look at issue 43', 'work on #43', 'start 43', 'pick up foo/bar#43', 'what's next?', 'grab the next issue', 'let's fix that bug'. Also use with no ref when he says 'let's get started' or 'what am I on?' — the ref resolves from the conversation or from the current git branch. Routing: if the issue has at least one open sub-issue it is a parent, so hand off to the `epic` skill with that ref; `epic` covers 'close out the epic', 'work through all of #40's children', 'do the whole epic'."
argument-hint: "[issue-ref] [note]"
---

## Task: Work on Issue $ARGUMENTS

Pull the specified GitHub issue, gather its full context, create a working branch, and start.

`orchestrating.md` governs, without its escape hatch — work touching code always goes to an agent, however small it looks. Your exceptions are metadata: `gh` calls fetching issue context, `git` calls managing the branch. What you keep is the conversation.

### Step 0: Resolve the ref and note

`$ARGUMENTS` is the issue ref optionally followed by a note. The first token is the issue ref, everything after is a note providing additional context.

Example: `/issue 123 focus on the api endpoint, ignore the frontend for now` → issue ref: `123`, note: `focus on the api endpoint, ignore the frontend for now`

`$ARGUMENTS` may be empty. Resolve the ref from the first source that yields one:

| Order | Source                                                                                                    |
| ----- | --------------------------------------------------------------------------------------------------------- |
| 1     | A ref in `$ARGUMENTS`                                                                                     |
| 2     | A ref Josh named in the conversation                                                                      |
| 3     | The issue tracked by the current branch — `git rev-parse --abbrev-ref HEAD` gives `<TYPE>-<number>`, e.g. `FEATURE-43` |

Nothing resolves → ask which issue, one line, no preamble.

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

### Step 3: Route and announce

The GraphQL call returns `subIssues` with a `state` on every node. If at least one sub-issue is `OPEN`, this is a parent with work left in it and the `epic` skill owns it — say so in one line and invoke `epic` with the same ref and note.

Otherwise announce what's running, one line:

```
Working issue #43 — <title>
```

Wait for Josh to confirm before branching.

### Step 4: Create working branch

Ensure you're on the base branch (usually `master` or `main`), then:

```bash
git issue <number>
```

### Step 5: Set session context

Track the issue as active session context: `Active Issue: #<number> - <title>`.

### Step 6: Assess and route

Read the fetched context and assess.

**If any signal suggests this is a bug** — issue type set to a bug variant, a label indicating a defect, body or comments describing broken or regressed behavior, a linked PR that reverted something, or the note frames it as an investigation:

- Invoke the `systematic-debugging` skill.
- Trace the root cause before proposing a fix. Do not jump to a patch based on the symptom.
- Once the root cause is understood, continue to the complexity assessment below to decide how to proceed with the fix.

**Otherwise, assess complexity:**

**Straightforward** — requirements clear, approach obvious, no architectural decisions needed:

- Skip planning. Go straight to step 7.

**Complex** — ambiguous requirements, multiple approaches possible, architectural decisions needed, or the note asks to plan first:

- Use the `planning` skill to draft a plan.
- Exit plan mode for approval, then go to step 7 with the approved plan as direction.

Default to just starting. Only plan when the work genuinely needs it.

### Step 7: Dispatch the implementer

Dispatch an `implementer` agent. It starts cold, so everything bearing on the work goes in the prompt:

```
Work GitHub issue #<n> in <owner/repo>: <title>
## The issue
<full body>
## Discussion
<comments carrying requirements or constraints>
## Direction
<the note, the approved plan, the root cause traced in triage — whatever applies>
## Your scope
Only this issue, in the current working tree on branch <branch>.
```

`BLOCKED: <question>` comes back — **100% confident** from the conversation or the issue → answer it and resume the same agent with `SendMessage` so its context survives. **Anything less** → put the question to Josh verbatim with the context needed to answer it; don't soften it, don't answer around it, don't hand him a guess to confirm.

Scope expands past the issue → stop and ask about a new issue.

### Step 8: Run the gate

Dispatch a `code-reviewer` agent with the diff (the uncommitted working tree on branch `<branch>`), the list of changed files, the issue URL, and the implementer's claims quoted verbatim.

- **Code findings** → back to the implementer via `SendMessage`. All of them, no cherry-picking. If one looks wrong, dispatch an agent to check it before dismissing it.
- **Claims findings** → to Josh, in your own message, immediately.

Dispatch a **fresh** reviewer on the fixed work — one that already blessed its own findings isn't a gate. Exit on `No findings.` Three rounds without converging → stop and bring it to Josh. **Tests failing means the issue isn't done** — it does not go to Josh with a caveat.

### Step 9: Present and stop

Hand it over per `presenting-work.md`: a short plain-language paragraph, not a file listing. Then **stop** and wait for review. Changes requested → implementer via `SendMessage`, feedback verbatim, then back through steps 8 and 9.
