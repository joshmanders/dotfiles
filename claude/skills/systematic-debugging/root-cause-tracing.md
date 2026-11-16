# Root Cause Tracing

When an error surfaces deep in the stack, trace backward to the original trigger and fix there, never only where the error appears.

## Process

1. **Symptom:** `git init` ran in the source tree instead of a temp dir.
2. **Immediate cause:** the call that runs `git init` with `cwd = projectDir`.
3. **Callers:** walk up the chain (worktree manager ← session init ← session create ← test setup).
4. **Value passed:** `projectDir` was an empty string, and an empty cwd resolves to the process's working directory.
5. **Origin:** the test fixture returned an empty `tempDir` until per-test setup ran, and the test read it before then.

Fix at the origin (fail loudly if the fixture is read too early), then add validation at each layer (`defense-in-depth.md`).

If you can't trace further back, that dead end is the only place a symptom-point fix is acceptable.

## Instrumentation

When reading the code isn't enough to trace the value:

- Log immediately before the dangerous operation, not after it fails.
- Write to stderr; test runners often suppress stdout and loggers.
- Include the suspect values, cwd, relevant env vars, and a stack trace.
- Give the line a unique tag and grep the test output for it.
- In the traces, look for test file names, triggering line numbers, and repeated tests or parameters.

## Which test pollutes

`find-polluter.sh` (this directory) runs tests one by one and stops at the first that creates the artifact:

```bash
./find-polluter.sh '<test_cmd>' '<pollution_check>' '<test_pattern>'
./find-polluter.sh 'npm test' '.git' 'src/**/*.test.ts'
./find-polluter.sh 'php artisan test' '.git' 'tests/**/*Test.php'
./find-polluter.sh 'pytest' 'tmp/' 'tests/**/test_*.py'
```
