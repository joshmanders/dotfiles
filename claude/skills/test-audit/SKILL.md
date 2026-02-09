---
name: test-audit
description: "Audit test suites for real confidence. Invoke when: reviewing test quality, assessing test coverage value, or analyzing test suite health."
user-invocable: false
---

# Test Audit Workflow

Maximize REAL confidence: tests that fail for real regressions and remain stable through reasonable refactors.

---

## IMPORTANT: Always Enter Plan Mode

**Before auditing any tests, you MUST enter plan mode using the EnterPlanMode tool.**

The audit has two phases that map to plan mode:

| Phase   | Mode           | Purpose                                                     |
| ------- | -------------- | ----------------------------------------------------------- |
| Phase 1 | Plan mode      | Define methodology, detect structure, establish constraints |
| Phase 2 | After approval | Execute the audit using the approved methodology            |

Do NOT start analyzing tests until the user has approved your Phase 1 operating system.

---

## When to Use

- "Audit our tests"
- "Review test suite quality"
- "Are our tests giving us real confidence?"
- Assessing whether a test suite proves "the system works" vs "it seems like it does"

---

## Two-Phase Approach

### Phase 1: Define Your Operating System

Before judging any test, establish methodology for THIS codebase. Write down:

#### 1. Detect Test Structure

Identify the project's testing setup:

- **Framework** — Jest, Vitest, PHPUnit, Pest, pytest, Go testing, etc.
- **Organization** — Directory structure, naming conventions
- **Categories** — Unit, integration, feature, e2e, browser, acceptance, etc.
- **Tooling** — Framework-specific fakes, factories, mocks, fixtures, time control

#### 2. Capabilities

What you will look for, tailored to the detected stack:

- Contract vs implementation detail boundaries
- Appropriate assertions for this framework
- Available determinism tools
- Test pyramid expectations

#### 3. Constraints

Hard rules for this audit (evidence-based only):

- Strict definition: when is a test "implementation detail" vs "contract"?
- Strict rule: when is it safe to delete a test?
- Strict rule: when is mocking acceptable vs "mock theater"?
- Clear boundaries between test categories

#### 4. Workflow

How you will analyze:

- Infer intended behavior from: routes, controllers, services, validation, authorization, events, jobs, notifications, entry points
- Inventory and classify every test
- Identify redundancy, flake sources, false confidence
- Prioritize fixes by ROI

#### 5. Report Format

Commit to producing the standard report (see below).

**Critical:** Phase 1 does not judge specific tests. It only defines HOW you will judge them.

**Plan mode workflow:**

1. Write Phase 1 methodology to the plan file
2. Exit plan mode for user approval
3. Only after approval: proceed to Phase 2

---

### Phase 2: Execute the Audit (after plan approval)

Using ONLY the operating system from Phase 1:

#### 1. Build Behavior Spec Outline

Infer the system's intended behaviors/invariants from the codebase. If uncertain, say so explicitly and proceed with best-effort inference.

#### 2. Inventory and Classify Tests

For each test, capture:

| Field               | Value                               |
| ------------------- | ----------------------------------- |
| File path           |                                     |
| Test name           |                                     |
| Category            | (unit/integration/feature/e2e/etc.) |
| Dependencies        | (db/fs/network/time/queue/etc.)     |
| Stability risk      | (low/med/high + why)                |
| Invariant protected | (one sentence)                      |

#### 3. Identify False Confidence

Flag tests that exhibit:

- **Would pass if behavior broke** — Doesn't assert user-visible outcomes
- **Fails on harmless refactors** — Coupled to implementation
- **Tautology** — Re-implements production logic in the test
- **Mock theater** — Over-mocks the unit under test
- **Redundant** — Duplicates coverage without adding signal
- **Flaky** — Depends on time, async timing, randomness, external services

#### 4. Produce Ranked Actions

| Action      | Description                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| **Keep**    | Top ~20 most valuable tests and why                                                                     |
| **Rewrite** | Ranked list: what to change and what behavior to assert instead                                         |
| **Delete**  | Ranked with safety notes: what risk it covered, where that risk is now covered (or propose replacement) |
| **Add**     | Missing tests written as Given/When/Then specs                                                          |

#### 5. Priority List

Ordered improvements (quick wins first, then structural corrections):

- Determinism fixes
- Signal improvements
- Layering corrections
- Fixture/boundary improvements
- Scope reduction
- Redundancy elimination

---

## False Confidence Signals

Hunt for these anti-patterns:

| Signal                    | Description                                                 |
| ------------------------- | ----------------------------------------------------------- |
| Irrelevant tests          | Would pass even if the feature is broken                    |
| Tautologies               | Test mirrors implementation instead of asserting outcomes   |
| Over-mocking              | Mocks so much that nothing real is tested                   |
| Brittleness               | Fails on harmless refactors (renamed variables, moved code) |
| Redundancy                | Multiple tests covering exact same behavior                 |
| Implementation assertions | Asserts HOW instead of WHAT                                 |

---

## What to Assert (Universal)

Prefer stable, observable outcomes:

- HTTP status, redirects, response structure
- Validation errors, error messages
- Authorization decisions (allowed/denied)
- Persisted state (database records, files)
- Emitted events, jobs, notifications
- Domain outputs, public API contracts
- User-visible behavior

---

## What to Avoid Asserting

Unless explicitly a contract in THIS repo:

- Exact DOM structure/styles
- Framework/library internals
- Exact SQL strings, query counts
- Exact log text
- Private method calls
- Internal call counts
- Broad snapshots without semantic checks

---

## Report Format

### 1. Executive Summary

| Metric      | Score (0-10) | Notes                                 |
| ----------- | ------------ | ------------------------------------- |
| Relevance   |              | Do tests catch real regressions?      |
| Brittleness |              | Do tests break on harmless changes?   |
| Coverage    |              | Are critical paths covered?           |
| Readability |              | Can someone understand what's tested? |

### 2. Test Inventory

Tests by category with risk flags (simplified format).

### 3. Findings

Group issues by category:

- Implementation-detail assertions
- Over-mocking / tautology
- Redundancy
- Flake / nondeterminism
- Missing behavior coverage
- Slow tests / pyramid issues

### 4. Recommendations

- **Keep:** Top valuable tests with justification
- **Rewrite:** Ranked, with what to change
- **Delete:** Ranked, with safety analysis
- **Add:** Given/When/Then specs for missing coverage

### 5. Priority List

Ordered improvements, quick wins first.
