---
name: handoff
description: "Distill a long session into a short pasteable prompt that starts the next one. Prints for refinement, then copies to the clipboard on approval. Use when Josh signals the session itself is ending or moving: \"let's wrap up\", \"I'm going to start a fresh session\", \"write me a prompt for the next session\", \"give me something to paste into a new session\", \"we should pick this up tomorrow\", \"context is getting long\", \"let's continue this somewhere else\". Do not use on \"done\", \"thanks\", \"nice\", \"that's it\" — those close a task, not a session — or on a plain question about session state. When it's genuinely ambiguous whether the session is ending, ask in one line rather than generating."
argument-hint: "[note]"
---

# Handoff

The conversation has gotten long enough that it needs to end. Write the message that lets the next session pick the work up cold.

Write it the way you'd hand a task to a colleague taking over because you got pulled onto something else. They're competent and they have the repo — they don't need a tour, they need to know where things stand and what would bite them.

---

## When to Use

Josh runs `/handoff`, or he signals in conversation that the session itself is ending or moving elsewhere.

| Signal | Fires |
| ------ | ----- |
| "let's wrap up", "we should pick this up tomorrow" | Yes |
| "I'm going to start a fresh session", "let's continue this somewhere else" | Yes |
| "write me a prompt for the next session", "give me something to paste into a new session" | Yes |
| "context is getting long" | Yes |
| "done", "thanks", "nice", "that's it" | No — a task finished, not the session |
| "how much context is left?", "how long have we been at this?" | No — answer the question |

The skill ends a session, so it stays off ambient phrasing. When the signal is genuinely ambiguous, ask in one line — "want a handoff for the next session?" — and wait.

---

## The Process

### 0. Read the note

`$ARGUMENTS` is an optional note from Josh. When it's empty, skip to step 1. When present, treat it as steering for the whole draft.

A note typically does one of these:

| Note | Effect |
| ---- | ------ |
| `focus on the migration, drop the CSS stuff` | Narrows what's worth carrying forward |
| `next session is going to rewrite the parser` | Sets what the next session needs, so keep what serves that |
| `mention that staging is still broken` | Adds context from Josh's head that isn't in the conversation at all |
| `keep it to a few lines` | Tightens the cap further |

The note outranks the filter in step 2 — if Josh says to include something, include it even if it's re-derivable. It never loosens the cap in step 3 unless he says so.

### 1. Mine the conversation, not the repo

Everything in the handoff comes from this conversation. The next session can read code, run `git log`, and load CLAUDE.md on its own.

Look for:

| Source | What it yields |
| ------ | -------------- |
| Josh's corrections and redirects | Constraints the code doesn't express |
| Approaches tried and abandoned | Dead ends worth not repeating |
| Things you verified by running them | Facts that cost a tool call to rediscover |
| Surprises and gotchas | Environment quirks, flaky steps, non-obvious setup |
| Where work stopped | The actual next action |

### 2. Apply the filter

For each candidate, ask: **can the next session get this by looking?**

- Yes → cut it. File contents, function names, line numbers, what a diff already shows, anything in CLAUDE.md or the rules.
- No → keep it. It only exists in this conversation.

The filter applies to facts, not to orientation. One or two plain sentences establishing what the work is and where it's happening are worth their space — the next session shouldn't have to reverse-engineer the task from a branch name. Orient in prose; don't inventory.

### 3. Write it

Address the next session directly. Prose and short bullets, no section headers, no nested structure. Name a file only when the location itself is the point.

**Hard cap: 30 lines or 400 words.** If it doesn't fit, the filter wasn't applied hard enough — cut re-derivable content, not the decisions.

Example shape:

> Picking up mid-work on the session-refresh fix in ~/work/api, branch `fix/token-refresh`.
>
> The refresh runs before the redirect now and there's a test covering the expired-token path. What's left: the mobile client hits the same code path and hasn't been checked.
>
> Things worth knowing:
> - Josh rejected wrapping this in a middleware layer twice — he wants it inline.
> - The retry helper looked like the right place for this and isn't; it swallows the 401.
> - Integration tests need `TEST_DB_URL` exported or they fail with a confusing DNS error.

### 4. Present and refine

Open with one line naming what you're doing — `Writing the session handoff.` — then go straight into the draft. Don't wait for confirmation.

Print the draft as rendered markdown in the response body — not fenced, not indented, no wrapper. Backticks, bold, and bullets should display as formatting so Josh reads it the way it will land. Stop there — no commentary, no explanation of choices.

Josh will refine. Rewrite the whole draft each time and reprint it; don't describe edits.

### 5. Copy on approval

When Josh approves ("good to go", "ship it", "copy it"), pipe the markdown source of the approved draft — the version with the backticks and asterisks intact — to `pbcopy`:

```bash
cat <<'EOF' | pbcopy
<final handoff text>
EOF
```

The quoted `'EOF'` matters — it stops the shell expanding backticks and `$` in the text.

Confirm in one line: "Copied."

---

## Rules

- **Conversation only.** If it came from a file, it doesn't go in.
- **No stale context.** Write the current state. A rejected approach appears only as a warning not to retry it, never as history.
- **No meta.** Don't describe the handoff, count what you included, or note what you left out.
- **Prose over structure.** Headers and nested bullets turn it back into the document this is meant to replace.
