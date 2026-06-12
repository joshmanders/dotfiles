# Documentation Maintenance

Keep documentation current as code changes.

## What to Update

When modifying code, check if these need updates:

| Changed               | Update                                         |
| --------------------- | ---------------------------------------------- |
| New feature/behavior  | README, CLAUDE.md                              |
| API/interface change  | Relevant docs, type definitions                |
| New patterns          | CLAUDE.md, relevant rules                      |
| Removed functionality | Remove from docs, don't leave stale references |

## Claude Configuration

Keep Claude config in sync with the codebase:

- **CLAUDE.md** — Update when project structure, patterns, or conventions change
- **Rules** — Update when coding patterns or standards evolve
- **Skills** — Update when workflows or processes change

## Don't

- Leave stale documentation that contradicts code
- Add new features without documenting them
- Remove code without removing its documentation
- Let CLAUDE.md drift from actual project patterns
