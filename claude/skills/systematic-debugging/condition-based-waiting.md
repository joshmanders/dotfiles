# Condition-Based Waiting

Flaky tests that sleep for a guessed duration → wait for the actual condition instead.

Use when tests have arbitrary delays, flake under load or in parallel, or wait on async work. Don't use when testing real timing behavior (debounce, throttle); then document why the fixed delay is needed.

Replace `sleep(50ms)` with `waitFor(condition, description, timeout)`: an event arrived, state is ready, a count reached N, a file exists.

`waitFor`, if the test framework lacks one:

1. Evaluate the condition; if truthy, return it.
2. If elapsed time exceeds the timeout, fail with "Timeout waiting for <description> after <timeout>".
3. Sleep ~10ms and repeat.

- Poll every ~10ms, not 1ms.
- Always time out with a clear error.
- Re-read state inside the loop, never cache it before.

## When a fixed delay is right

Only after first waiting for the triggering condition, based on known timing, with a comment explaining it: wait for the process to start, then sleep 200ms because that's 2 ticks at a 100ms interval.
