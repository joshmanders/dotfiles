# Test Quality

Tests must fail for real regressions and remain stable through reasonable refactors.

## Never test your dependencies

**The decision question: if this test fails, whose bug is it?** If the answer is a framework, library, or tooling maintainer's — delete it. It was never yours to write.

A test earns its place by failing when *your* code regresses. One that exercises a dependency's contract with itself fails only when the dependency breaks — which you can't fix, won't catch before they do, and which their own suite already covers. Coverage that proves a third party works is not coverage.

| Don't assert                                                     | Because                                |
| ---------------------------------------------------------------- | -------------------------------------- |
| A framework helper returns the shape its docs promise            | The framework's suite covers it        |
| A build tool emitted, hashed, or copied a file it said it would  | Tooling's contract with itself         |
| An ORM persists a field you set, with no logic in between        | That's the ORM's test                  |
| A validation library rejects what its docs say it rejects        | That's the library's test              |
| A third-party client parses a response you hand-built for it     | That's their parser's test             |

**The trap that produces these.** You hit uncertainty mid-implementation — does this resolve, does that emit — and write a check to answer it. It answers it. Then it gets committed. That was a debugging step; its job ended the moment it told you what you needed. Delete it. Don't promote it to a permanent test because it happens to be green.

**When integration genuinely needs proving,** assert the outcome a user gets — the page renders, the record comes back, the endpoint returns 200 — never the dependency's mechanics. The check: if you deleted every line of code you wrote and the test still passed, it was never testing you.

## Assert Stable Outcomes

Prefer observable, user-visible results:

| Good Assertions                            |
| ------------------------------------------ |
| HTTP status, redirects, response structure |
| Validation errors, error messages          |
| Authorization decisions (allowed/denied)   |
| Persisted state (database, files)          |
| Emitted events, jobs, notifications        |
| Domain outputs, public API contracts       |

## Avoid Implementation Details

Unless explicitly a contract in the project:

| Bad Assertions                             |
| ------------------------------------------ |
| Exact DOM structure/styles                 |
| Framework/library internals                |
| Exact SQL strings, query counts            |
| Private method calls, internal call counts |
| Broad snapshots without semantic checks    |
| Exact log text                             |

## Determinism

- Use framework test utilities (fakes, mocks, time control)
- No sleep-based timing in E2E tests
- Deterministic test data (factories, fixtures)
- Stable selectors (data-test attributes over CSS)

## Test Signal

| High Signal                | Low Signal                  |
| -------------------------- | --------------------------- |
| Fails when behavior breaks | Fails on harmless refactors |
| Asserts contracts          | Asserts implementation      |
| Minimal mocking            | Mock theater (over-mocking) |
| One test = one behavior    | Redundant coverage          |

## False Confidence Smells

Watch for tests that:

- Would still pass if the feature broke
- Re-implement production logic (tautology)
- Mock so much nothing real is tested
- Are flaky (time, async, randomness)
