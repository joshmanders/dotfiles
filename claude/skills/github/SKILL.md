---
name: github
description: |
  GitHub CLI patterns for issues, projects, sub-issues, and PRs. Invoke when: creating issues, linking PRs to issues, updating project status, attaching screenshots, or any GitHub project operation.
user-invocable: false
---

# GitHub CLI Patterns

## Writes

Writes: `gh issue create|edit|comment`, `gh project item-add`, `gh pr create|edit|comment`, and any `gh api graphql` `mutation`. `list`, `view`, `search`, `checks`, and GraphQL `query` calls are reads.

Every write:

1. Present it in full — exact title and body for an issue, comment, or PR; exact action and target for a label, type, status, project, or sub-issue change.
2. Run it once Josh approves that exact text or action. Each write is its own ask at the moment of acting, even if it was in an approved plan.
3. Verify with the matching read — number, type, state — not the exit code.

```bash
# gh issue create / edit / updateIssue
gh issue view <number> --repo <org>/<repo> --json number,title,body,labels,issueType,state,url

# gh issue comment
gh issue view <number> --repo <org>/<repo> --json comments --jq '.comments[-1] | {url, body}'

# gh project item-add / issue create --project / updateProjectV2ItemFieldValue
gh issue view <number> --repo <org>/<repo> --json projectItems --jq '.projectItems[] | {title, status: .status.name}'

# addSubIssue / removeSubIssue, on the parent
gh issue view <parent-num> --repo <org>/<repo> --json subIssues --jq '[.subIssues.nodes[].url]'

# gh pr create / edit
gh pr view <number> --repo <org>/<repo> --json number,title,body,isDraft,state,url,closingIssuesReferences

# gh pr comment
gh pr view <number> --repo <org>/<repo> --json comments --jq '.comments[-1] | {url, body}'
```

## Issues

```bash
gh issue create --repo <org>/<repo> --title "Issue title" \
  --body "What needs doing and why, in a sentence or two.

- [ ] Criterion 1
- [ ] Criterion 2" \
  [--project "<project-name>"]

gh issue list --repo <org>/<repo>
gh issue view <number> --repo <org>/<repo>
gh issue edit <number> --repo <org>/<repo>
gh issue comment <number> --repo <org>/<repo> --body "..."
gh search issues --owner <org> "search terms"
gh issue view <number> --repo <org>/<repo> --json id --jq '.id'   # node ID for GraphQL
```

## Project Boards (v2)

```bash
gh project item-add <project-number> --owner <org> \
  --url https://github.com/<org>/<repo>/issues/<number>
gh project item-list <project-number> --owner <org>
```

Project item ID (needed for status):

```bash
gh api graphql -f query='
query($url: URI!) {
  resource(url: $url) {
    ... on Issue { projectItems(first: 1) { nodes { id } } }
  }
}' -f url="https://github.com/<org>/<repo>/issues/<num>" --jq '.data.resource.projectItems.nodes[0].id'
```

Set status:

```bash
gh api graphql -f query='
mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "<project-id>"
    itemId: "<project-item-id>"
    fieldId: "<status-field-id>"
    value: { singleSelectOptionId: "<status-option-id>" }
  }) { projectV2Item { id } }
}'
```

Set issue type:

```bash
gh api graphql -f query='
mutation {
  updateIssue(input: { id: "<issue-node-id>", issueTypeId: "<issue-type-id>" }) {
    issue { title issueType { name } }
  }
}'
```

## Pull Requests

```bash
PR_URL=$(gh pr create \
  --draft \
  --repo <org>/<repo> \
  --title "feat: short description" \
  --body "What this does and why, at a high level.

Closes #<issue-number>")

printf '%s' "$PR_URL" | pbcopy
echo "$PR_URL"

gh pr list --repo <org>/<repo>
gh pr view <number> --repo <org>/<repo>
gh pr checks <number> --repo <org>/<repo>
```

Linking in the body: `Closes #123` / `Fixes #123` / `Resolves #123` auto-close; `Closes <org>/<other-repo>#123` cross-repo; `Related to #123` references without closing.

### Screenshots and Video

Upload with `--attach` yourself — never tell Josh to drag files in on GitHub. Works on `gh pr create|edit|comment` and `gh issue create|edit|comment`; repeat per file, up to 50 per command.

Reference the local path in the body and `gh` rewrites it to the uploaded URL; an unreferenced file is appended to the end.

```bash
# pr-body.md holds the approved body, with the image above the closes line:
#   ![Claim To Finish report](./claim-to-finish.png)
#
#   Closes #17332
gh pr edit 17402 --body-file pr-body.md --attach ./claim-to-finish.png
```

- Alt text after `#`: `--attach './login.png#The login error state'`. Default is the filename; video takes none.
- `edit` with `--attach` and no body flag keeps the body and appends the file.
- Failed uploads don't stop the rest, but the command exits non-zero — verify with the matching read.

Attachments are part of the approved body: present it with image references in place and name the files. Before the write, `open <file>` each screenshot and get Josh's sign-off on each; attach only approved ones.

## Sub-Issues

Native parent-child hierarchy, works cross-repo.

```bash
# Add
PARENT_ID=$(gh issue view <num> --repo <org>/<repo> --json id --jq '.id')
gh api graphql -f query="
mutation {
  addSubIssue(input: {
    issueId: \"$PARENT_ID\"
    subIssueUrl: \"https://github.com/<org>/<repo>/issues/<num>\"
  }) { issue { title } subIssue { title url } }
}"

# View
gh api graphql -f query='
query($url: URI!) {
  resource(url: $url) {
    ... on Issue { title subIssues(first: 10) { nodes { title url state } } }
  }
}' -f url="https://github.com/<org>/<repo>/issues/<num>"

# Remove
PARENT_ID=$(gh issue view <parent-num> --repo <org>/<repo> --json id --jq '.id')
SUB_ID=$(gh issue view <sub-num> --repo <org>/<repo> --json id --jq '.id')
gh api graphql -f query="
mutation {
  removeSubIssue(input: { issueId: \"$PARENT_ID\" subIssueId: \"$SUB_ID\" }) {
    issue { title } subIssue { title }
  }
}"
```
