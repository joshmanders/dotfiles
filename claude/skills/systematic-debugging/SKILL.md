---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
user-invocable: false
---

# Systematic Debugging

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

Applies to every technical issue (tests, production bugs, build, performance, integration), especially under time pressure, when a quick fix looks obvious, or after a fix already failed. Complete each phase before the next.

## Phase 1: Root cause

1. **Read errors fully**: whole stack trace, line numbers, paths, codes, warnings.
2. **Reproduce reliably.** Not reproducible → gather more data, don't guess.
3. **Check recent changes**: diff, commits, dependencies, config, environment.
4. **Multi-component systems** (CI → build → signing, API → service → DB): before proposing fixes, log what enters and exits each boundary and whether env/config propagates (e.g. is the secret set in the workflow, present in the build script's environment, visible to the signing step). Run once to find the failing layer, then investigate that layer.

5. **Error deep in the call stack**: trace the bad value backward to its source and fix there. See `root-cause-tracing.md`.

## Phase 2: Pattern

- Find similar working code in the codebase.
- When following a reference implementation, read it completely.
- List every difference between working and broken, however small.
- Identify the dependencies, config, and assumptions it relies on.

## Phase 3: Hypothesis

- State one: "X is the root cause because Y."
- Test it with the smallest change, one variable at a time.
- Failed → new hypothesis; don't stack fixes.
- Don't know → say "I don't understand X" and research or ask.

## Phase 4: Fix

1. Write a failing test (or one-off script) reproducing it before fixing.
2. One fix for the root cause. No bundled refactors or "while I'm here" changes.
3. Verify: test passes, nothing else broke, issue resolved.
4. Fix failed: under 3 attempts → back to Phase 1 with the new information. **3+ failed → stop and question the architecture** with Josh before a 4th. Signs: each fix exposes new coupling elsewhere, fixes need massive refactoring, fixes create symptoms elsewhere. That's a wrong architecture, not a failed hypothesis.

## Stop and return to Phase 1 when

- Thinking "quick fix now, investigate later", "just try X", "it's probably X", "skip the test, I'll verify manually", "I'll adapt the pattern differently", or listing fixes before investigating.
- Making multiple changes before a test run.
- Proposing solutions before tracing data flow.
- About to try "one more fix" after 2+ failures.
- Josh says "Is that not happening?" (you assumed), "Will it show us...?" (add evidence gathering), "Stop guessing", "Ultrathink this" (question fundamentals), or "We're stuck?"

## No root cause found

If investigation shows it's truly environmental, timing-dependent, or external: document what you investigated, add handling (retry, timeout, error message) and logging. Most "no root cause" cases are incomplete investigation.

## Supporting files

- `root-cause-tracing.md`: trace backward through the call stack; `find-polluter.sh` for test pollution
- `defense-in-depth.md`: validate at every layer after finding the cause
- `condition-based-waiting.md`: replace sleeps with condition polling
