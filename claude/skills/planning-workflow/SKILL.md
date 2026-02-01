---
name: planning-workflow
description: Work tracking through GitHub issues. Every session has one issue. Triggers on planning or when starting work.
---

# Planning Workflow

**Every unit of work gets a GitHub issue. One session = one issue = one PR.**

---

## When to Create an Issue

| Situation                  | Action                      |
| -------------------------- | --------------------------- |
| Starting new work          | Create issue first          |
| "Let's plan X"             | Create detailed issue       |
| Scope creep mid-session    | Pause → ask about new issue |
| Quick fix / trivial change | Ask if issue needed         |

---

## Session Flow

```
1. Understand the work
2. Create issue with full context (wait for approval)
3. Track issue internally as session context
4. Do the work (core-workflow)
5. If scope expands → STOP, ask about new issue
6. Finalize → PR closes the issue
```

---

## Creating the Issue

### Before Creating

Gather all context needed to do the work:

- What problem are we solving?
- What's the approach?
- What are the acceptance criteria?
- What files/areas will be touched?
- Any risks or open questions?

### Issue Format

```bash
gh issue create \
  --repo primcloud/<repo> \
  --title "Clear, specific title" \
  --body "## Summary
What we're doing and why.

## Approach
How we'll implement this.
- Step 1
- Step 2
- Step 3

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests written

## Files/Areas
- \`path/to/file.ts\`
- \`path/to/other.php\`

## Notes
Any additional context, decisions, risks." \
  --project "Primcloud"
```

**Wait for approval before creating.**

### After Creating

1. Note the issue number and node ID
2. Set issue type (Task or Bug)
3. Add to project board (if not auto-added)
4. Move to "In Progress"
5. **Store internally:** "Working on #N - [title]"

### Setting Issue Type

After creating an issue, set its type:

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

# Or set as Bug
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

| Type | ID                    | Use                               |
| ---- | --------------------- | --------------------------------- |
| Task | `IT_kwDOA_9RlM4AwYt7` | A specific piece of work          |
| Bug  | `IT_kwDOA_9RlM4AwYt9` | An unexpected problem or behavior |

---

## Session Context Tracking

Once an issue is created, track it as session context:

```
Active Issue: #123 - Add bandwidth tracking endpoint
Repo: primcloud/platform
```

**GitHub Identity:** You operate as `aniftybot`. Comments, issues, and PRs from that account are your previous work.

This context should be referenced:

- When making implementation decisions
- When scope questions arise
- When creating the PR

If context compaction occurs, the issue contains the full context. Fetch it:

```bash
gh issue view 123 --repo primcloud/<repo>
```

**Note:** Comments from `aniftybot` are your previous notes. Use them to restore context.

---

## Scope Creep Handling

**When additional work is discovered mid-session:**

1. **STOP** — Don't just do it
2. **Assess** — Is this part of the current issue or separate?
3. **Ask:**

   ```
   I've discovered we also need to [X]. This seems outside the scope of #123.

   Options:
   1. Add to current issue (if small and related)
   2. Create new issue for separate work
   3. Note it and skip for now

   How do you want to handle this?
   ```

4. **If new issue:** Create it, but don't work on it this session
5. **If adding to current:** Update the issue body with new scope

### Updating Current Issue

```bash
# View current body
gh issue view 123 --repo primcloud/<repo>

# Edit to add scope (opens editor)
gh issue edit 123 --repo primcloud/<repo>
```

Or add a comment:

```bash
gh issue comment 123 --repo primcloud/<repo> \
  --body "## Scope Update
Adding [X] to this work because [reason]."
```

---

## Finalization

When work is complete and approved for commit:

### 1. Create PR with Issue Reference

```bash
gh pr create \
  --repo primcloud/<repo> \
  --title "feat: clear description" \
  --body "## Summary
What was done.

## Changes
- Change 1
- Change 2

## Testing
- [ ] Tests pass
- [ ] Manual testing done

Closes #123"
```

### 2. Provide PR Summary

When presenting the PR:

```
PR ready to create:

Title: feat: add bandwidth tracking endpoint

Body:
## Summary
Implemented bandwidth tracking endpoint for ingress metrics.

## Changes
- Added POST endpoint at `/api/bandwidth`
- Added validation for incoming data
- Added NATS event publishing
- Added feature tests

Closes #123
```

The `Closes #123` automatically:

- Links the PR to the issue
- Moves issue to "Done" when PR merges

---

## Quick Commands

| Action         | Command                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Create issue   | `gh issue create --repo primcloud/<repo> --title "..." --body "..." --project "Primcloud"`                                               |
| Get node ID    | `gh issue view <num> --repo primcloud/<repo> --json id --jq '.id'`                                                                       |
| Set as Task    | `gh api graphql -f query='mutation { updateIssue(input: { id: "<node-id>", issueTypeId: "IT_kwDOA_9RlM4AwYt7" }) { issue { title } } }'` |
| Set as Bug     | `gh api graphql -f query='mutation { updateIssue(input: { id: "<node-id>", issueTypeId: "IT_kwDOA_9RlM4AwYt9" }) { issue { title } } }'` |
| View issue     | `gh issue view <num> --repo primcloud/<repo>`                                                                                            |
| Edit issue     | `gh issue edit <num> --repo primcloud/<repo>`                                                                                            |
| Add comment    | `gh issue comment <num> --repo primcloud/<repo> --body "..."`                                                                            |
| Add to project | `gh project item-add 6 --owner primcloud --url <issue-url>`                                                                              |
| Create PR      | `gh pr create --repo primcloud/<repo> --title "..." --body "... Closes #N"`                                                              |

---

## Examples

### Starting a Session

**Josh:** "Let's add rate limiting to the API"

**Response:**

```
I'll create an issue to track this work.

## Summary
Add rate limiting to API endpoints to prevent abuse.

## Approach
- Use Laravel's built-in rate limiter
- Configure limits in RouteServiceProvider
- Add rate limit headers to responses
- Add tests for rate limit behavior

## Acceptance Criteria
- [ ] Rate limits applied to auth endpoints
- [ ] Rate limits applied to API endpoints
- [ ] Headers show remaining requests
- [ ] Tests cover rate limit scenarios

## Files/Areas
- `app/Providers/RouteServiceProvider.php`
- `routes/api.php`
- `tests/Feature/RateLimitTest.php`

Should I create this issue?
```

### Scope Creep

**During work:** "I noticed the auth middleware also needs updating"

**Response:**

```
I've found that the auth middleware needs changes to support rate limiting properly. This seems related but expands the scope.

Options:
1. Add middleware update to current issue #123 (it's directly related)
2. Create separate issue for middleware refactor
3. Note it for later and keep current scope

How do you want to handle this?
```

### Finalization

**Josh:** "Looks good, commit it"

**Response:**

```
PR ready:

Title: feat: add rate limiting to API

Body:
## Summary
Added rate limiting to prevent API abuse.

## Changes
- Configured rate limits in RouteServiceProvider
- Applied limits to auth and API routes
- Added X-RateLimit headers to responses
- Added comprehensive rate limit tests

## Testing
- All tests pass
- Manually verified rate limit headers

Closes #123
```

---

## Don't

- ❌ Start work without an issue
- ❌ Create issue without approval
- ❌ Expand scope without asking
- ❌ Create PR without `Closes #N`
- ❌ Work on multiple issues in one session
- ❌ Forget to track the active issue
