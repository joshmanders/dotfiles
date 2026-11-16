---
name: dispatch-parallel-agents
description: Use when facing 2+ independent tasks (e.g. failures in different test files or subsystems) that can be worked on without shared state or sequential dependencies
user-invocable: false
---

# Dispatching Parallel Agents

One agent per independent problem domain, run concurrently.

## When

**Use:** multiple failures or tasks with different root causes, each understandable without the others, no shared state.

**Don't use:**

- Related failures (fixing one may fix others): investigate together first.
- Understanding needs the whole system, or you don't yet know what's broken.
- Agents would interfere (same files, same resources): run them sequentially.

## Process

1. Group by domain (e.g. auth tests / order tests / payment tests).
2. Dispatch all agents in one message so they run concurrently.
3. When all return: read each summary, check for conflicting edits, run the full suite, spot-check (agents make systematic errors).

## Agent prompt

Each prompt is focused, self-contained, and states the output:

- **Scope:** one test file or subsystem, not "fix all the tests".
- **Context:** paste the error messages and test names.
- **Constraints:** e.g. "Do NOT change production code", "don't just increase timeouts".
- **Output:** "Return a summary of root cause and changes."

```markdown
Fix the 3 failing tests in tests/Unit/OrderProcessingTest.php:

1. "test_order_with_partial_fulfillment" - expects 'partially shipped' status
2. "test_concurrent_order_updates" - race condition on inventory count
3. "test_order_cancellation_during_processing" - expects refund to be initiated

Find the root cause (timing issue or real bug). Use proper waiting instead of
sleeps; do NOT just increase timeouts.

Return: summary of what you found and what you fixed.
```
