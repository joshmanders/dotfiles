# Code Standards

## Before Writing Code

| Do This                                | Not This                            |
| -------------------------------------- | ----------------------------------- |
| Read 2-3 similar files in the codebase | Assume patterns from other projects |
| Check current docs/APIs via search     | Trust training data about libraries |
| Look at recent git history for style   | Invent new conventions              |
| Ask if unsure about architecture       | Make structural decisions alone     |

## Standards

**Naming:** Concise. Not verbose.

**Comments:** Explain _why_, not _what_. No obvious comments.

**Errors:** Fail fast. Log errors. Graceful degradation where appropriate.

**Dependencies:** Latest stable versions only. Look up current docs before using.
