# Test Quality

Tests must fail for real regressions and remain stable through reasonable refactors.

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
