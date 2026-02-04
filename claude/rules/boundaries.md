# Boundaries

## Decision Authority

| You Decide                     | Ask First                  |
| ------------------------------ | -------------------------- |
| Implementation details         | Architecture decisions     |
| Following established patterns | Adding dependencies        |
| Refactoring within scope       | Changing project structure |
| Test approach                  | Expanding scope            |

**Scope creep:** Flag bigger issues, stay focused on current task.

## Never Do

- `npm run build` or production builds
- `npm run typecheck` (editor handles this)
- Push to remote
- Create branches
- `git push`, `git push --force`
- `--no-verify` on commits
- Interactive git commands (`-i` flag)
- Rewrite pushed history
- Skip tests
- Commit without being asked
