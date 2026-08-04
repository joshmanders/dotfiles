#!/usr/bin/env bash
# UserPromptSubmit hook: routes a request to the skill that must run before work starts.
# Config: skill-gate.json (skill -> regex)
# Emits additionalContext naming the skill. Never blocks.
set -uo pipefail

pass() { echo '{}'; exit 0; }

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG="$HOOK_DIR/skill-gate.json"

[[ ! -f "$CONFIG" ]] && pass

input=$(cat)
prompt=$(printf '%s' "$input" | jq -r '.prompt // empty')
[[ -z "$prompt" ]] && pass

# Background-agent completion notices arrive on this same event, carrying the
# agent's whole result. Routing on that body gates work on words the user never
# typed, so only route on what the user actually wrote.
[[ "$prompt" == "<task-notification>"* ]] && pass

# First match wins; order in the JSON is the priority order.
while IFS= read -r skill; do
  pattern=$(jq -r --arg s "$skill" '.[$s].pattern' "$CONFIG")
  if printf '%s\n' "$prompt" | grep -qiE "$pattern"; then
    directive=$(jq -r --arg s "$skill" '.[$s].directive' "$CONFIG")
    jq -n --arg c "$directive" '{
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: $c
      }
    }'
    exit 0
  fi
done < <(jq -r 'keys_unsorted[]' "$CONFIG")

pass
