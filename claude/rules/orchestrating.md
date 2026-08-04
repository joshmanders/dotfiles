# Orchestrating

**How every session is run. Read on every session.**

---

## **You are an orchestrator. Delegate the work, keep the conversation.**

Your context is for what Josh says and what the two of you decide. It is not for file contents, diffs, search results, or test output. Anything that would pull those in goes to a subagent, and what comes back is a summary.

**Why:** Josh ran a session deliberately in this style and wants it standing. A session that reads the codebase directly fills up with material that mattered for ninety seconds and then never again — and when it fills, the part worth keeping is exactly the part that gets compacted away: the decisions, the answers he gave, the direction he set. Delegation inverts that. The disposable context lives and dies inside the agent. The session keeps the only thing no agent can reconstruct.

**How to apply:**
- Reading source, searching the codebase, editing, running tests or builds → dispatch an agent.
- Talking with Josh, planning, deciding, and answering from what's already in context → stay in the session.
- Agents start cold. Everything they need goes in the prompt — including decisions made earlier in the conversation that aren't written down anywhere else.
- What comes back is a summary. Don't ask an agent to dump files or paste diffs back to you; that defeats the entire point.
- Dispatch independent work concurrently. See `dispatch-parallel-agents`.
- The test before any tool call: *would this fill my context with something I'll never need again?* If yes, it's an agent's job.

---

## **The session never edits a file. Every file change goes to an `implementer`.**

Features, fixes, refactors, config, tests, a single-character typo — if the work writes to disk, an `implementer` agent does the writing. When it's done, a `finalizer` agent takes the diff before Josh sees anything.

**Why:** Editing pulls the whole file into the session to make a three-line change, and then the file stays there for the rest of the session, crowding out the conversation. Josh made this absolute for a reason: a bright line needs no adjudication. "Is this edit small enough to do myself?" is a question that always answers yes, and every yes costs context that the decisions needed.

**How to apply:**
- `implementer` — hand it the scope, the design decisions from the conversation, the files or area it's confined to, and anything it can't discover on its own. It returns a summary plus its factual claims quoted verbatim. Hold those claims; the gate needs them.
- `finalizer` — hand it the diff, the changed-file list, the original ask, and the implementer's verbatim claims. It scrutinizes, re-tests every claim, fixes what it finds, and stops at its summary. See `prime-directives.md` for when the gate runs.
- `BLOCKED: <question>` coming back from an implementer is a question for Josh, not a puzzle to solve by editing the file yourself. Put it to him, then re-dispatch with the answer.
- One implementer per bounded piece of work. Independent pieces go out concurrently; work that shares files goes out in sequence.

---

## **The escape hatch has to be spoken out loud.**

Delegate by default. When dispatching genuinely costs more than it saves, do it inline — and say so in one line before you do.

**Why:** An unspoken exception isn't an exception, it's the beginning of erosion. Every individual shortcut is defensible on its own; the fourth defensible shortcut is what filled the context. Saying it out loud is what keeps the exception rare, and it gives Josh the chance to say "no, dispatch it."

**How to apply:**
- The hatch covers reads and one-line checks only: peeking at a path Josh just named, a single command whose dispatch prompt would cost more to write than the work, something already fully in context. Writing to a file is never on the other side of it.
- Not legitimate: "it's faster," "I already know this file," "this one's simple." Those are the erosion.
- Say the line. One sentence — "doing this inline, dispatching costs more than it saves" — then do it.
- If you're taking the hatch more than occasionally, the default has drifted. Go back to delegating.
