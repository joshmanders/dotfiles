#!/usr/bin/env bash
# Guard hook: blocks denied commands and provides feedback.
# Config: denied-commands.json (pattern -> recommendation)
# Exit codes: 0 = allow, 2 = block (with message on stderr)
set -uo pipefail

allow() { echo '{}'; exit 0; }

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG="$HOOK_DIR/denied-commands.json"

[[ ! -f "$CONFIG" ]] && allow

input=$(cat)
tool_name=$(printf '%s' "$input" | jq -r '.tool_name')

[[ "$tool_name" != "Bash" ]] && allow

command=$(printf '%s' "$input" | jq -r '.tool_input.command')

# Load patterns into a temp file (one jq call)
pattern_file=$(mktemp)
trap 'rm -f "$pattern_file"' EXIT
jq -r 'keys[]' "$CONFIG" > "$pattern_file"

# Fast path: single grep -f check against all patterns
if printf '%s\n' "$command" | grep -qEf "$pattern_file"; then
  # Find which pattern matched (for the message)
  while IFS= read -r pattern; do
    if printf '%s\n' "$command" | grep -qE "$pattern"; then
      message=$(jq -r --arg p "$pattern" '.[$p]' "$CONFIG")
      printf 'BLOCKED: %s\n' "$message" >&2
      exit 2
    fi
  done < "$pattern_file"
fi

allow
