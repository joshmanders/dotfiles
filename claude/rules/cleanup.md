# Cleanup Before Presenting Work

## **Remove all debug code before presenting.**

When you finish work and hand it back, the diff Josh reviews should look like the change he asked for — not the scratchpad you used to get there. Whatever language you're in, whatever its idiomatic debugging tools are, none of them belong in the final diff.

**Why:** Josh has corrected this repeatedly. Leftover debug code wastes his review attention on noise he then has to ask you to remove, and the back-and-forth implies the work wasn't actually finished.

**How to apply:** before you say "done", scan the diff for anything in these categories. They apply regardless of language — figure out the equivalent for whatever stack you're working in.

| Category                       | What to look for                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Inspection output**          | Any statement you added during development to dump state to a console, log, or terminal. If it exists to show you a value, it goes.       |
| **Breakpoints / pauses**       | Anything that halts execution to let you poke around.                                                                                     |
| **Commented-out code**         | Lines disabled with comments instead of deleted. If you needed to keep them around to think, fine — they don't survive into the final diff. |
| **Unused imports / requires**  | Anything you imported while exploring and never ended up using.                                                                           |
| **Session markers**            | `TODO`, `FIXME`, `XXX`, `HACK`, and equivalents that you added during this work. Existing markers in the codebase aren't your problem; new ones you wrote are. |

If you're unsure what counts as debug noise in the current language, look at how the rest of the codebase debugs — every codebase has a dominant pattern — and verify before assuming any specific tool's name or syntax.

"I left it in case you wanted to see it" is not an acceptable reason. If a value is worth surfacing, surface it in your response, not in the code.
