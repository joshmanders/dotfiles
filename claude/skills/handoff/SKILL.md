---
name: handoff
description: Distill this session into a short pasteable prompt that starts the next one. Prints the draft for refinement, then copies it to the clipboard on approval.
argument-hint: "[note]"
disable-model-invocation: true
---

# Handoff

Write the message that lets the next session pick the work up cold, as if handing off to a competent colleague who has the repo: where things stand and what would bite them, no tour.

## 1. Read the note

`$ARGUMENTS` is an optional note from Josh steering the whole draft: narrowing scope ("drop the CSS stuff"), naming what the next session will do (keep what serves that), adding context not in the conversation ("staging is still broken"), or tightening length.

The note outranks the filter in step 3: include what he asks for even if re-derivable. It never loosens the cap in step 4 unless he says so.

## 2. Mine the conversation, not the repo

| Source | Yields |
| ------ | ------ |
| Josh's corrections and redirects | Constraints the code doesn't express |
| Approaches tried and abandoned | Dead ends not to repeat |
| Things verified by running them | Facts that cost a tool call to rediscover |
| Surprises and gotchas | Environment quirks, flaky steps, non-obvious setup |
| Where work stopped | The next action |

## 3. Filter

**Can the next session get this by looking?** Yes → cut (file contents, function names, line numbers, what a diff shows, anything in CLAUDE.md or the rules). No → keep.

Orientation is exempt: one or two plain sentences on what the work is and where it's happening. Orient in prose; don't inventory.

## 4. Write

Address the next session directly. Prose and short bullets; no headers, no nesting. Name a file only when the location is the point. Current state only: a rejected approach appears as a warning not to retry, never as history. No meta: don't describe the handoff or count what's in or out.

**Hard cap: 30 lines or 400 words.** Over it → cut re-derivable content, not decisions.

> Picking up mid-work on the session-refresh fix in ~/work/api, branch `fix/token-refresh`.
>
> The refresh runs before the redirect now and there's a test covering the expired-token path. What's left: the mobile client hits the same code path and hasn't been checked.
>
> Things worth knowing:
> - Josh rejected wrapping this in a middleware layer twice — he wants it inline.
> - The retry helper looked like the right place for this and isn't; it swallows the 401.
> - Integration tests need `TEST_DB_URL` exported or they fail with a confusing DNS error.

## 5. Present and refine

Print the draft immediately, without waiting for confirmation, as rendered markdown (not fenced or indented) with no commentary. On each refinement, reprint the whole draft; don't describe edits.

## 6. Copy on approval

On approval ("good to go", "ship it", "copy it"), copy the markdown source:

```bash
cat <<'EOF' | pbcopy
<final handoff text>
EOF
```

Quoted `'EOF'` stops the shell expanding backticks and `$`. Confirm with "Copied."
