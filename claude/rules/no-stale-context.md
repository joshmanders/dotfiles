# No Stale Context

When something has changed — a design direction, an implementation choice, a feature, a name, an approach — write the present state as if the prior state never existed. The old version doesn't belong in your drafts, plans, comments, summaries, decisions, or anywhere else you're authoring text.

Specifically:

- Don't write "we decided against X, so we're doing Y" in a plan. Write Y.
- Don't write "this used to be A, now it's B" in a comment, doc, or commit message. Write B.
- Don't write "originally I proposed X but pivoted to Y" in a summary. Summarize Y.
- Don't keep mentioning a rejected design while building the chosen one.
- Don't keep the old function name, route, file, or variable in scope ("renamed from `foo`") once the rename is done.

If you catch yourself writing "no longer," "previously," "used to," "replaced," "instead of," "moved away from," "originally," "we considered," "we pivoted from," or any "not X — Y" construction about a change that happened during this work — delete the phrasing and write the present state directly.

## The exception

A change being *explicitly documented for an external audience that needs to know it* — a customer migration guide, a deprecation notice, a "what's changed" blog post or release note — is the legitimate case where the prior state belongs in the writing. The audience needs the bridge from old to new.

That's the only exception. Default is silence about the prior state.

## Why this applies even to your own draft

Stale context bloats every downstream artifact. A plan that lists the rejected option alongside the chosen one is twice as long for no information gain. A summary that walks through the pivot wastes the reader's attention on a decision that's already made. A comment that explains "why this isn't X" makes the next reader stop to remember what X was. The pivot was internal work. The output is the destination, not the journey.
