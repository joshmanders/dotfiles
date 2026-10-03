#!/usr/bin/env bash
# Tests for hold_sudo.
# Runs against a stub sudo that logs its arguments, so nothing is elevated.
# Usage: bash lib/sudo.test.sh
# Exits non-zero on any failure.
set -uo pipefail

DOTFILES="${DOTFILES:-$(cd "$(dirname "$0")/.." && pwd)}"
export DOTFILES

# A BASH_ENV that sources bashrc would rebuild PATH in every child shell and
# drop the stubs these tests put first on it.
unset BASH_ENV

PASS=0
FAIL=0
FAILURES=()

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

assert() {
  local label="$1" expected="$2" got="$3"
  if [[ "$expected" == "$got" ]]; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    FAILURES+=("$label: expected=$expected got=$got")
  fi
}

# Stub sudo: logs every call. `-n true` (the cached check) and `-n -v` (the
# refresh) succeed only once credentials are "cached" (STUB_CACHED set, or a
# successful -v earlier in the same run).
# `-v` fails when STUB_DENY is set, like a cancelled password prompt.
mkdir -p "$TMP/bin"
cat > "$TMP/bin/sudo" <<'EOF'
#!/usr/bin/env bash
echo "$*" >> "$STUB_LOG"
case "$*" in
  "-v")
    [[ -n "${STUB_DENY:-}" ]] && exit 1
    touch "$STUB_LOG.cached"
    ;;
  "-n true" | "-n -v")
    [[ -n "${STUB_CACHED:-}" || -f "$STUB_LOG.cached" ]] || exit 1
    ;;
esac
exit 0
EOF
# Stub sleep: shrinks the 60 second refresh interval so several refreshes fit
# in a short run.
cat > "$TMP/bin/sleep" <<'EOF'
#!/usr/bin/env bash
exec /bin/sleep 0.1
EOF
chmod +x "$TMP/bin/sudo" "$TMP/bin/sleep"

# A stand-in for the main install.sh: hold sudo, then do a "module" that
# outlasts several refresh intervals.
cat > "$TMP/installer.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
source "$DOTFILES/lib/index.sh"
hold_sudo
echo "module" >> "$STUB_LOG"
/bin/sleep "${MODULE_SECONDS:-0}"
echo "pid=${_DOTFILES_SUDO_HOLD_PID:-none}"
echo "reached end"
EOF

# Runs the installer with the stubs first on PATH. Sets OUT, ERR and LOG.
# Usage: drive <name> [VAR=value...] [-- installer flags...]
drive() {
  local name="$1"
  shift
  local vars=()
  while [[ $# -gt 0 && "$1" != "--" ]]; do
    vars+=("$1")
    shift
  done
  [[ $# -gt 0 ]] && shift

  LOG="$TMP/$name.log"
  : > "$LOG"
  OUT="$(env -u DOTFILES_NON_INTERACTIVE -u DOTFILES_ALLOW -u DOTFILES_DENY \
    PATH="$TMP/bin:$PATH" STUB_LOG="$LOG" ${vars[@]+"${vars[@]}"} \
    bash "$TMP/installer.sh" "$@" 2>"$TMP/$name.err")"
  ERR="$(cat "$TMP/$name.err")"
}

# True once the process is gone; gives a just-signalled process a moment to exit.
gone() {
  local pid="$1" tries=0
  while kill -0 "$pid" 2>/dev/null; do
    tries=$((tries + 1))
    (( tries > 20 )) && return 1
    /bin/sleep 0.1
  done
  return 0
}

printf '== Prompt ==\n'

drive prompt MODULE_SECONDS=1
assert "prompts exactly once" "1" "$(grep -c -x -e '-v' "$LOG")"
assert "prompts before the first module" "-v" \
  "$(grep -x -e '-v' -e 'module' "$LOG" | head -1)"
assert "explains the prompt" "1" "$(grep -c 'Enter your password once' <<<"$OUT")"

printf '== Keep-alive ==\n'

refreshes="$(sed -n '/^-v$/,$p' "$LOG" | grep -c -x -e '-n -v')"
assert "refreshes repeatedly during the run" "yes" \
  "$( (( refreshes >= 3 )) && echo yes || echo "no ($refreshes)")"
assert "checks with -n true exactly once" "1" "$(grep -c -x -e '-n true' "$LOG")"
assert "only ever calls -n true, -v or -n -v" "0" \
  "$(grep -v -x -e '-v' -e '-n true' -e '-n -v' -e 'module' "$LOG" | wc -l | tr -d ' ')"

pid="$(sed -n 's/^pid=//p' <<<"$OUT")"
assert "keep-alive started" "yes" "$([[ "$pid" =~ ^[0-9]+$ ]] && echo yes || echo "no ($pid)")"
assert "keep-alive gone after exit" "yes" "$(gone "$pid" && echo yes || echo no)"
calls="$(wc -l < "$LOG")"
/bin/sleep 0.5
assert "no refresh after exit" "$calls" "$(wc -l < "$LOG")"

printf '== Cached credentials ==\n'

drive cached STUB_CACHED=1
assert "cached: no prompt" "0" "$(grep -c -x -e '-v' "$LOG")"
assert "cached: no message" "0" "$(grep -c 'Enter your password once' <<<"$OUT")"
assert "cached: keep-alive still runs" "yes" \
  "$([[ "$(sed -n 's/^pid=//p' <<<"$OUT")" =~ ^[0-9]+$ ]] && echo yes || echo no)"

printf '== Prompt refused ==\n'

drive denied STUB_DENY=1 MODULE_SECONDS=1
assert "denied: warns" "1" "$(grep -c 'sudo was not granted' <<<"$ERR")"
assert "denied: installer carries on" "reached end" "$(tail -1 <<<"$OUT")"
assert "denied: no keep-alive" "pid=none" "$(grep '^pid=' <<<"$OUT")"
assert "denied: no refresh calls" "0" "$(grep -c -x -e '-n -v' "$LOG")"

printf '== Non-interactive ==\n'

drive ni-skip -- --non-interactive
assert "non-interactive without --allow: sudo untouched" "module" "$(cat "$LOG")"

drive ni-deny -- --non-interactive --deny
assert "non-interactive --deny: sudo untouched" "module" "$(cat "$LOG")"

drive ni-allow -- --non-interactive --allow
assert "non-interactive --allow: prompts" "1" "$(grep -c -x -e '-v' "$LOG")"

drive ni-allow-cached STUB_CACHED=1 -- --non-interactive --allow
assert "non-interactive --allow, cached: no prompt" "0" "$(grep -c -x -e '-v' "$LOG")"

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
