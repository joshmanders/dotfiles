#!/usr/bin/env bash
#
# bash-guard.sh - PreToolUse hook for Bash command safety
#
# Classifies commands as allow (auto-approve), deny (block), or ask (prompt).
# DENY rules enforce boundaries.md "Never Do" list.
# ASK rules catch destructive operations that need user approval.
#
set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [[ -z "$COMMAND" ]]; then
    exit 0
fi

decide() {
    jq -n --arg d "$1" --arg r "$2" '{
        hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: $d,
            permissionDecisionReason: $r
        }
    }'
    exit 0
}

# ---------------------------------------------------------------------------
# DENY — boundaries.md "Never Do"
# ---------------------------------------------------------------------------

# git push (any variant)
echo "$COMMAND" | grep -qE '\bgit\s+push\b' && decide deny "git push is prohibited"

# --no-verify on git commands
echo "$COMMAND" | grep -qE '\bgit\b.*--no-verify' && decide deny "--no-verify is prohibited"

# Interactive git (-i flag)
echo "$COMMAND" | grep -qE '\bgit\s+(rebase|add|stash)\b.*\s-i\b' && decide deny "Interactive git (-i) is not supported"

# npm run build
echo "$COMMAND" | grep -qE '\bnpm\s+run\s+build($|\s|;|&|\|)' && decide deny "npm run build is prohibited"

# git commit --amend
echo "$COMMAND" | grep -qE '\bgit\s+commit\b.*--amend\b' && decide deny "git commit --amend is prohibited"

# ---------------------------------------------------------------------------
# ASK — destructive operations needing approval
# ---------------------------------------------------------------------------

# rm -rf or rm with recursive+force flags
echo "$COMMAND" | grep -qE '\brm\s+-[a-zA-Z]*r[a-zA-Z]*f\b' && decide ask "rm -rf needs approval"
echo "$COMMAND" | grep -qE '\brm\s+.*[*{]' && decide ask "Broad rm needs approval"

# git reset --hard
echo "$COMMAND" | grep -qE '\bgit\s+reset\s+--hard\b' && decide ask "git reset --hard needs approval"

# git checkout . / git restore .
echo "$COMMAND" | grep -qE '\bgit\s+(checkout|restore)\s+\.' && decide ask "Discarding all changes needs approval"

# git clean
echo "$COMMAND" | grep -qE '\bgit\s+clean\b' && decide ask "git clean needs approval"

# git branch -D/-d
echo "$COMMAND" | grep -qE '\bgit\s+branch\s+-[a-zA-Z]*[dD]\b' && decide ask "Deleting a branch needs approval"

# kill / killall
echo "$COMMAND" | grep -qE '\b(kill|killall)\b' && decide ask "Process termination needs approval"

# SQL destructive operations
echo "$COMMAND" | grep -qiE '\b(DROP|TRUNCATE|DELETE\s+FROM)\b' && decide ask "SQL destructive operation needs approval"

# git rebase
echo "$COMMAND" | grep -qE '\bgit\s+rebase\b' && decide ask "git rebase needs approval"

# git --force
echo "$COMMAND" | grep -qE '\bgit\b.*--force\b' && decide ask "git --force needs approval"

# ---------------------------------------------------------------------------
# ALLOW — everything else
# ---------------------------------------------------------------------------

exit 0
