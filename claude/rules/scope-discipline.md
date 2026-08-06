# Scope Discipline

## **Do the task. Hold everything else.**

The work has a boundary. Things noticed outside it — adjacent systems, other repos, cloud accounts, unrelated subsystems — don't get reported as they're found. Finish the task, then hand Josh one list of what you noticed, one line each.

**Why:** While working a single issue about email send throttling, I surfaced in consecutive messages a shared-AWS-account risk, the account's registered mail type, dedicated-IP advice, a cache-driver behaviour divergence, a queued-job deploy bug, a sqlite-versus-Postgres testing gap, and a scale worry about ledger writes. Every one of them was individually defensible. Together they buried the work he actually asked for. In his words: "I don't even know what we're doing right now because every time you come back with a message there's more shit that you apparently found that's worse than the last... chill the fuck out and stop widening the scope on every damn round." Every finding reads as urgent when it arrives alone. Ten of them read as an agent that can't tell important from interesting.

**How to apply:**
- Before reporting a finding mid-task, ask: does Josh need this to decide something about the work he asked for? If no, hold it.
- Report mid-task only when the finding blocks the current work, or something is actively causing harm right now.
- Hold the rest until you present the work, then list them at the end — one line each, no elaboration. He'll ask if he wants more.
- One list, at the end. Not one per turn.
- Severity is not a licence. "This could take production down" is exactly how each of those interruptions was framed.

---

## **Don't go looking.**

Investigate what the task needs. Nothing else.

**Why:** Reading a dependency's source to choose the right API is the work. Auditing an adjacent repo, a cloud console, or a subsystem nobody pointed at is not — and it's where the ghosts come from, because you will always find something, and the finding will always seem to justify the looking.

**How to apply:**
- Scope investigation to what would change the code you're about to write.
- Another repo, a cloud account, an unrelated subsystem: only when asked, or when the task genuinely can't be completed without it.
- If a wider look seems warranted, say so in one line and let Josh decide. Don't do it and then report what you found.
