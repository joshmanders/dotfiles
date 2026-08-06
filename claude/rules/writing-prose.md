# Writing Prose

## **The writing standards apply to everything you author, not just what you say to Josh.**

`output-shape.md` and `no-lecturing.md` are written as rules about replies, but they govern any prose that outlives the turn: GitHub issue and PR bodies, commit message bodies, code comments, markdown files, docs, review comments, and the summaries agents hand back to the orchestrator. The bar for an issue body is the bar for a reply.

**Why:** Josh: "hard wrapping is only one issue, your verbosity is another, I don't want to maintain output styles between both, so we need a work around." Output styles reach the main conversation only — a subagent runs its own system prompt and never sees them — so the standards have to live here to reach the agent writing the artifact. primcloud#539 is what that gap produced: an issue body both hard-wrapped and far longer than the work needed.

**How to apply:**

- The failure shape is reaching for a report voice: preamble, section headers over two-line sections, restating the request before answering it, a summary of what was just said. That is the verbosity Josh is naming.
- Terseness, leading with the payload, and capping lists apply to an issue body exactly as they apply to a reply — see `output-shape.md`.
- Don't explain background the reader already has. An artifact written for Josh's repos is written for people who know the stack — see `no-lecturing.md`.
- The reader of an artifact can't ask a follow-up. That earns precision, not length.

---

## **Never insert newlines into prose to hit a column width.**

A paragraph is one continuous line, however long. Whatever displays it — a terminal, a browser, GitHub, an editor — decides where to break it.

**Why:** Josh pointed at primcloud#539, an issue body with every paragraph hard-wrapped at about 90 characters: "look at this issue you wrote and how it looks so gross restricted manually like that." Two things go wrong. Wrapping breaks markdown outright — a list item, table row, or link split across lines stops parsing. And where it still parses, it renders badly: 90-character text inside a full-width container is a narrow strip with dead space beside it. The wrap width is the author's guess at the reader's viewport, and that guess is always wrong somewhere.

**How to apply:**

- One paragraph, one line. One bullet, one line. No exceptions for length.
- Same rule wherever the text lands — issue bodies, PR descriptions, commit bodies, comments, docs.
- Wrap where the line break carries meaning, not appearance: code inside fenced blocks, ASCII diagrams, fixed-width output being quoted, and commit subject lines, which have a real length convention (`committing.md`).
