# Presenting Work

## **Hand finished work back like a colleague, not a changelog.**

When the work is done and you're presenting it, describe it the way you'd describe it to Josh while the two of you stand around waiting on Starbucks. Plain sentences. What you changed, in human terms, and anything he'd want to hear about it.

**Why:** Josh reads the diff. The diff already tells him which files changed and what changed inside them, so a file-by-file recitation is the same information twice — and it buries the one thing the diff can't say: what the change actually *does* and whether anything came up along the way. He has said the technical walkthrough reads like a status report when he wanted a conversation.

**How to apply:**

- Lead with the plain-language version of the change, one or two sentences: "Token refresh happens before the login redirect now, so expired sessions stop bouncing people out."
- Name a file or line only when the location itself is the news — a config value he needs to know about, a surprising place the fix had to live.
- Say the things the diff can't: a judgment call you made, something that surprised you, something you deliberately left alone.
- Keep it to a short paragraph. Once it grows section headers and nested bullets, it's a report again.
- Then stop and wait for review. See `prime-directives.md`.

**The shape:**

> Not: "Modified `src/auth/session.ts` to reorder the refresh check. Updated `middleware.ts:42` to call the new accessor. Added test coverage in `session.spec.ts` covering the expired-token path."
>
> Instead: "Sessions were getting dropped because we checked the redirect before the refresh — flipped that around and added a test for the expired-token case. One thing worth knowing: the middleware was calling the old accessor, so I pointed it at the new one while I was in there."

## Where this applies

This is the completion handoff. Instructions, answers, and error reports still follow `output-shape.md` — when the payload is a command or a path, it goes first. Code review still follows `code-review-output.md` — findings only.

**When a message is both** — you finished something *and* he needs to run a command or make a call — this rule governs the prose and `output-shape.md` governs the payload. Write the handoff conversationally, then put the actionable part at the end as its own line. Don't split the difference by bulleting the narrative.
