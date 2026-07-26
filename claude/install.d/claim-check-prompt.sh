#!/usr/bin/env bash
#
# Install hook: embeds the Stop hook's verifier prompt into settings.json.
#
# The prompt is authored as markdown in hooks/claim-check.md so it stays
# readable and reviewable in a diff. This exports it JSON-escaped with the
# outer quotes stripped, so settings.json.template can carry it inside an
# ordinary JSON string.
#
# It is injected rather than referenced by path because a referenced file is
# a file the verifier has to choose to open — and can fail to open, or decide
# it doesn't need. Embedding the text removes that decision entirely.

SCRUTINY_AGENT_HOOK_PROMPT="$(jq -Rs . < "$DOTFILES/claude/hooks/claim-check.md" | sed -e 's/^"//' -e 's/"$//')"
export SCRUTINY_AGENT_HOOK_PROMPT
