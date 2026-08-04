#!/usr/bin/env bash
# Tests for the UserPromptSubmit skill-gate hook.
# Verifies each prompt routes to the expected skill (or to nothing).
# Usage: ./skill-gate.test.sh
# Exits non-zero on any failure.
set -uo pipefail

HOOK="$(cd "$(dirname "$0")" && pwd)/skill-gate.sh"
PASS=0
FAIL=0
FAILURES=()

# Returns the routed skill name, or "none".
route() {
  local prompt="$1"
  jq -n --arg p "$prompt" '{prompt: $p, hook_event_name: "UserPromptSubmit"}' \
    | "$HOOK" \
    | jq -r 'if .hookSpecificOutput then (.hookSpecificOutput.additionalContext | capture("the (?<s>[a-z-]+) skill").s) else "none" end' 2>/dev/null
}

assert() {
  local expected="$1" prompt="$2"
  local got
  got=$(route "$prompt")
  if [[ "$expected" == "$got" ]]; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    FAILURES+=("expected=$expected got=$got prompt=\"$prompt\"")
  fi
}

debug() { assert "systematic-debugging" "$1"; }
design() { assert "brainstorming" "$1"; }
none()  { assert "none" "$1"; }

printf '== Routes to systematic-debugging ==\n'
debug "calc.py add() is broken, fix it"
debug "the deploy failed again"
debug "why is this test failing"
debug "there's a bug in the auth flow"
debug "it crashed on startup"
debug "this doesn't work after the upgrade"
debug "getting a traceback from the worker"
debug "why doesn't the webhook fire"

printf '== Routes to brainstorming ==\n'
design "add a new endpoint for users"
design "build a component for the dashboard"
design "implement the billing integration"
design "create a page for account settings"

printf '== Routes to nothing ==\n'
none "what is in this directory"
none "commit this"
none "add a comment explaining the regex"
none "rename this variable"
none "what did we decide about pricing"
none "run the tests"
none "update the README"
none "<task-notification>
<result>Fixed the bug in the worker: the deploy failed because the retry test was failing.</result>
</task-notification>"

# A debugging request that also mentions building must go to debugging first,
# since keys_unsorted puts systematic-debugging ahead of brainstorming.
printf '== Priority ==\n'
debug "the feature I asked you to build is broken"

printf '\n================================\n'
printf 'Tests passed: %d\n' "$PASS"
printf 'Tests failed: %d\n' "$FAIL"
if (( FAIL > 0 )); then
  printf '\nFailures:\n'
  for f in "${FAILURES[@]}"; do
    printf '  - %s\n' "$f"
  done
  exit 1
fi
exit 0
