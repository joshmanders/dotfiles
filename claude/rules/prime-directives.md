# Prime Directives

**Non-negotiable rules. Every task. No exceptions. Read on every session.**

---

## **Verify, don't assume.**

Before claiming any tool, flag, env var, or API behaves a certain way: prove it with a test command, a docs read, or source code. "I think X works because Y" is forbidden unless preceded by actually running X.

**Why:** During an oh-my-posh prompt-corruption debugging session, I claimed `POSH_THEME` would make oh-my-posh resolve its config without `--config`. I had not tested it. Josh applied the change, opened a new terminal, and the bug was still there — `POSH_THEME` is not the env var oh-my-posh reads. "Pretty sure this is how it works" is exactly how that landed.

**How to apply:**
- Any claim about a tool's behavior must be preceded by running a verification command, not "based on my understanding."
- "I tested X and it produced Y" is the only acceptable form of evidence.
- Before applying edits to user config: test the assumption in a throwaway shell FIRST, then apply.
- If verification isn't possible in the session, say explicitly: "I have not verified this — here's what I'd test" and ask before applying.

---

## **Never dismiss reported issues as "pre-existing".**

If Josh reports something is broken, fix it. The bug's age is irrelevant.

**Why:** Josh has flagged this as a recurring frustration. If he is reporting a problem in the current session, the task is to fix it — classifying it as pre-existing is a way of refusing to do the work, and it makes him feel unheard.

**How to apply:**
- Do not say "this was already broken before my changes."
- Do not say "this is out of scope" or "this is a separate issue."
- Do not suggest filing it for later.
- Even if the issue predates the current task, the correct response is to fix it now.
- If the fix would be genuinely enormous or risky enough to warrant a separate task, explain the specific concrete reason and ask — do not reflexively defer.

---

## **Completing work ≠ committing.**

Present work → wait for review → commit only when explicitly told. The review gate is mandatory; "done" doesn't mean "commit."

**Why:** Josh wants the gate. Bypassing it removes his ability to catch issues before they land in history, and "I thought you wanted me to commit" is not a valid recovery — by then the commit exists.

**How to apply:** every task follows this pattern:

```
1. Understand the ask
2. Read nearby code to learn patterns
3. Implement following those patterns
4. Run tests, fix failures
5. Clean up (debug code, unused imports)
6. Present what was done
7. STOP — wait for review
8. Iterate if needed
9. Commit ONLY when explicitly asked to finalize/commit
```

Steps 7-9 are gated. Never skip to commit.

**Commit trigger words.** Only commit when Josh explicitly uses one of:
- "commit"
- "finalize"
- "ship it"
- "looks good, commit"
- "create the commit"

**Not triggers:** "done", "good", "thanks", "nice" — these mean wait for review.

---

## **Pushing and branch creation require confirmation.**

Don't push to remote or create branches on your own initiative. They're allowed when Josh directly tells you to, or when they're genuinely required to complete the task — and in that case, confirm before doing it.

**Why:** These actions affect shared state where surprise is expensive. The cost of confirming is one round trip; the cost of getting it wrong can be catastrophic — force-pushed history, leaked secrets, branches pushed to the wrong remote, work overwritten that wasn't yours to overwrite. Stray branches are cleanup. Wrong pushes can be unrecoverable.

**How to apply:**
- Default: don't push, don't `git checkout -b`.
- If Josh asks: do it.
- If the task can't be completed without it (e.g. PR workflow needs a branch): describe what you're about to do and confirm before running the command.
- Never force-push, never push to `main`/`master` without explicit confirmation, never push branches Josh didn't ask for.

---

## **Never bypass safety checks or rewrite shared history.**

Hard nos, regardless of how convenient they would be:

- `--no-verify` on commits — bypasses hooks that exist for a reason.
- `git push --force` to shared branches — overwrites work that may not be yours.
- Rewriting pushed history (amending, rebasing, resetting commits that exist on remote).
- Interactive git commands (`-i` flag) — they require input you can't provide.
- Skipping tests because they're failing or slow.

**Why:** Each of these defeats a safety mechanism Josh deliberately put in place. Bypassing them silently doesn't make the underlying problem go away; it just hides it until it gets worse.

**How to apply:** if you're tempted to use one of these to get unstuck, that's the signal to stop and ask. The fix is to address the underlying problem (failing hook, failing test, dirty branch state), not to skip the check.

---

## **Never use `git -C` or `git -c` flags.**

Always work in the correct directory. Don't reach for `git -C <path>` to operate on another repo, and don't use `git -c <config>=<value>` to pass inline config.

**Why:** Josh's permission system distinguishes commands like `git log` from `git -c ... log`. The `-C` and `-c` flags route around that system and break permission handling — what looks like an innocent `git -C ../other-repo log` is a different permission shape than `git log`, and the prompts get confused.

**How to apply:** `cd` into the right directory before running git, or use a subshell. Never use `-C` or `-c` as a shortcut.

---

## Other Standing Rules

**Follow existing patterns.** Read 2-3 nearby files before writing. Match what's there. Don't invent conventions.

**Tests are mandatory.** Write tests. Run tests. Fix failing tests.

**Don't run production builds or type checks.** Whatever the project uses for those — skip it. Josh's editor handles type checking, and production builds aren't your job.
