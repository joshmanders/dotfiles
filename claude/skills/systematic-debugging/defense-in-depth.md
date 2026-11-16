# Defense-in-Depth Validation

After fixing invalid-data bugs, validate at every layer the data passes through, so other code paths, refactors, or mocks can't bypass a single check. Goal: the bug becomes structurally impossible.

## Layers

| Layer | Purpose | Example |
| ----- | ------- | ------- |
| 1. Entry point | Reject obviously invalid input at the API boundary | Creating a project fails if the working directory is empty or doesn't exist |
| 2. Business logic | Data makes sense for this operation | Workspace init fails if the project dir is empty |
| 3. Environment guard | Block dangerous operations in specific contexts | In the test environment, `git init` refuses any directory outside the system temp dir |
| 4. Debug instrumentation | Forensics when the others fail | Log directory, cwd, and stack trace before `git init` |

## Applying

1. Trace where the bad value originates and where it's used.
2. List every checkpoint it passes through.
3. Add validation at each layer.
4. Test each layer: bypass layer 1 and confirm layer 2 catches it.

In the empty-project-dir case all four layers were needed: other code paths bypassed entry validation, mocks bypassed business checks, platform edge cases needed the environment guard, and the debug log exposed structural misuse.
