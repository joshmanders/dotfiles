#!/usr/bin/env bash
# Guard hook: blocks denied commands and provides feedback.
# Config: denied-commands.json (pattern -> recommendation)
set -euo pipefail

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG="$HOOK_DIR/denied-commands.json"

if [[ ! -f "$CONFIG" ]]; then
  exit 0
fi

input=$(cat)
tool=$(echo "$input" | jq -r '.tool_name')

if [[ "$tool" != "Bash" ]]; then
  exit 0
fi

command=$(echo "$input" | jq -r '.tool_input.command')

# Check each denied regex pattern against the command
while IFS= read -r pattern; do
  if echo "$command" | grep -qE "$pattern"; then
    message=$(jq -r --arg p "$pattern" '.[$p]' "$CONFIG")
    echo "BLOCKED: $message" >&2
    exit 2
  fi
done < <(jq -r 'keys[]' "$CONFIG")

exit 0
