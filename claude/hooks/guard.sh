#!/usr/bin/env bash
# Guard hook: blocks denied commands and provides feedback.
# Config: denied-commands.json (pattern -> recommendation)
# Exit codes: 0 = allow, 2 = block (with message on stderr)
set -uo pipefail

allow() { echo '{}'; exit 0; }

# Openers that put the next word in command position: ; && || | & ( $( `
SEPARATOR='(^|[;&|(`])[[:space:]]*'

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG="$HOOK_DIR/denied-commands.json"

[[ ! -f "$CONFIG" ]] && allow

input=$(cat)
tool_name=$(printf '%s' "$input" | jq -r '.tool_name')

[[ "$tool_name" != "Bash" ]] && allow

command=$(printf '%s' "$input" | jq -r '.tool_input.command')

# Match the command as written, plus a copy split at shell separators. The split
# copy is what lets a pattern ending in `$` line up when the dangerous command is
# wrapped, as in `out=$(crontab -r)` — the `)` would otherwise defeat the anchor.
# Keeping the raw command in play means a pattern that needs a separator to be
# present, like `curl ... | sh`, still matches.
haystack=$(printf '%s\n' "$command"; printf '%s' "$command" | tr ';&|`()' '\n')

# Load patterns (one jq call). A pattern anchored to the start of the command
# only earns its keep if it also fires after a separator, or `cd /tmp && rm -rf /`
# walks past the rule that stops a bare `rm -rf /`. keys[] stays the untouched
# JSON key so the recommendation can be looked up by it.
keys=()
patterns=()
while IFS= read -r key; do
  keys+=("$key")
  if [[ "$key" == '^'* ]]; then
    patterns+=("$SEPARATOR${key#^}")
  else
    patterns+=("$key")
  fi
done < <(jq -r 'keys[]' "$CONFIG")

# Expanding an empty array is an unbound-variable error under `set -u` on bash 3.2
(( ${#patterns[@]} == 0 )) && allow

pattern_file=$(mktemp)
trap 'rm -f "$pattern_file"' EXIT
printf '%s\n' "${patterns[@]}" > "$pattern_file"

# Fast path: single grep -f check against all patterns
if printf '%s\n' "$haystack" | grep -qEf "$pattern_file"; then
  # Find which pattern matched (for the message)
  for i in "${!keys[@]}"; do
    if printf '%s\n' "$haystack" | grep -qE "${patterns[$i]}"; then
      message=$(jq -r --arg p "${keys[$i]}" '.[$p]' "$CONFIG")
      printf 'BLOCKED: %s\n' "$message" >&2
      exit 2
    fi
  done
fi

allow
