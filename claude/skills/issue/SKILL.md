---
name: issue
description: |
  Work a single GitHub issue end to end — fetch its full context, branch, and start. Use when Josh points at an issue and wants it worked: 'let's look at issue 43', 'work on #43', 'start 43', 'pick up foo/bar#43', 'what's next?', 'grab the next issue', 'let's fix that bug'. Also with no ref on 'let's get started' or 'what am I on?' — the ref resolves from the conversation or the current git branch. An issue with at least one open sub-issue is a parent → hand off to the `epic` skill ('close out the epic', 'work through all of #40's children').
argument-hint: "[issue-ref] [note]"
---

## Task: Work on Issue $ARGUMENTS

Code work always goes to an agent, however small. You do only metadata: `gh` calls for issue context, `git` calls for the branch.

### Step 0: Resolve the ref and note

First token is the ref, the rest is a note: `/issue 123 focus on the api endpoint, ignore the frontend for now`. The note guides planning and execution — it may narrow scope, set priorities, or add context.

| Format              | Example       | Meaning                               |
| ------------------- | ------------- | ------------------------------------- |
| Number only         | `123`         | Current repo                          |
| `owner/repo#number` | `foo/bar#123` | Repo `foo/bar`                        |
| `repo#number`       | `bar#123`     | Current owner (`gh repo view --json owner -q '.owner.login'`), repo `bar` |

No ref in `$ARGUMENTS` → a ref Josh named in the conversation → the current branch's issue (`git rev-parse --abbrev-ref HEAD` gives `<TYPE>-<number>`, e.g. `FEATURE-43`). Nothing resolves → ask which issue, one line.

### Step 1: Fetch everything

Pull it all before reading. `gh issue view` lacks label/milestone descriptions and type, parent, sub-issue, linked-PR, and project data:

```bash
gh issue view <number> --repo <owner/repo> \
  --json number,title,body,state,assignees,labels,milestone,comments

gh label list --repo <owner/repo> --limit 200 --json name,description
gh api repos/<owner/repo>/milestones/<milestone-number>

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

### Step 2: Route and announce

Any sub-issue `OPEN` → say so in one line and invoke `epic` with the same ref and note.

Otherwise announce in one line and go straight on — `/issue` with a resolved ref is the go-ahead:

```
Working issue #43 — <title>
```

Pause only if the ref resolved implicitly and might be wrong, or the issue leaves a decision open that context can't settle.

### Step 3: Branch and track

From the base branch: `git issue <number>`. Track `Active Issue: #<number> - <title>` as session context.

### Step 4: Assess

**Any bug signal** — bug issue type, defect label, body or comments describing broken or regressed behavior, a linked reverting PR, or a note framing it as an investigation → invoke `systematic-debugging` and trace the root cause before proposing a fix. Then assess complexity.

- **Straightforward** (clear requirements, obvious approach) → Step 5. The default.
- **Complex** (ambiguous requirements, several approaches, architectural decisions, or the note asks to plan) → draft a plan with the `planning` skill, exit plan mode for approval, then Step 5 with the plan as direction.

### Step 5: Dispatch the implementer

```
Work GitHub issue #<n> in <owner/repo>: <title>
## The issue
<full body>
## Discussion
<comments carrying requirements or constraints>
## Direction
<the note, the approved plan, the root cause traced in triage — whatever applies>
```

`BLOCKED:` → 100% confident from the conversation or issue → answer and resume the same agent with `SendMessage`. Anything less → put the question to Josh verbatim with the context to answer it; no softening, no guess for him to confirm.

Scope expands past the issue → stop and ask about a new issue.

The change is what the issue needs plus the minimum prerequisite that keeps its invariant, including any consumer or sibling the change itself would break; a sibling is otherwise in scope only when the issue asks. Findings outside the issue, cosmetic slips outside the touched lines included, are dropped without mention. A defect the issue doesn't need stays out, however small: don't fix it, and don't draft an issue for it unless asked.

### Step 6: Run the gate

If the project defines a `team-review` skill, invoke it yourself (a skill, not an agent).

- **Code findings** → the implementer via `SendMessage`. All of them. One that looks wrong gets checked by a dispatched agent before it's dismissed.
- **Claims findings** → Josh, in your own message: in full when it bears on the open topic, otherwise first once that topic concludes.

One pass, then the work goes to Josh. Tests failing means the issue isn't done — it doesn't go to Josh with a caveat.

### Step 7: Present and stop

A short plain-language paragraph, not a file listing. Then stop and wait for review. Changes requested → implementer via `SendMessage`, feedback verbatim, then Steps 6 and 7 again.
