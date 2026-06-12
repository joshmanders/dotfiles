# Leave Code Better

When touching a file, improve what you find — but only what you find. Don't expand scope to hunt for things to fix.

## Opportunistic Refactoring

While making changes, fix nearby issues that don't expand scope:

| Do                                                     | Don't                                       |
| ------------------------------------------------------ | ------------------------------------------- |
| Rename unclear variables in functions you're modifying | Rename variables across the entire codebase |
| Fix obvious bugs in code you're already changing       | Hunt for bugs in unrelated files            |
| Update deprecated API calls in touched files           | Migrate all deprecated calls project-wide   |
| Remove dead code you encounter                         | Audit the whole project for dead code       |
| Improve types in functions you're editing              | Add types to the entire codebase            |

## The Test

Ask: "Am I improving code I'm already touching, or starting a new task?"

- **Yes, already touching** → Do it
- **No, new scope** → Note it, stay focused

## Examples

**Good:** While adding a feature to `processUser()`, you notice `userData` could be `user` and a commented-out debug line exists. Fix both.

**Bad:** While adding a feature to `processUser()`, you notice the entire auth module uses an old pattern. That's a separate task.

## Why

Small, continuous improvements compound. Technical debt decreases naturally as the codebase evolves, without dedicated "refactoring sprints."
