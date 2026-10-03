#!/usr/bin/env bash
# Tests for skip_unless.
# Verifies the command and path checks, the Skip: line, that the caller is
# never exited, and that set -e still applies inside the guarded block.
# Usage: bash lib/skip.test.sh
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

# A command that exists only here, and a path with a space in it like
# "/Applications/Brave Browser.app".
mkdir -p "$TMP/bin" "$TMP/Some App.app"
printf '#!/usr/bin/env bash\nexit 0\n' > "$TMP/bin/presenttool"
chmod +x "$TMP/bin/presenttool"
touch "$TMP/plain-file"
export PATH="$TMP/bin:$PATH"

# Runs skip_unless in a fresh shell. Prints its stdout, then "status=<n>".
check() {
  bash -c 'source "$DOTFILES/lib/index.sh"; skip_unless "$@"; echo "status=$?"' _ "$@" 2>/dev/null
}

printf '== Command ==\n'

assert "present command: silent, status 1" "status=1" "$(check presenttool "tool not installed")"
assert "missing command: skip line, status 0" $'Skip: tool not installed\nstatus=0' \
  "$(check no-such-tool-here "tool not installed")"

printf '== Path ==\n'

assert "present directory: silent, status 1" "status=1" "$(check "$TMP/Some App.app" "app not installed")"
assert "present file: silent, status 1" "status=1" "$(check "$TMP/plain-file" "file not installed")"
assert "missing path: skip line, status 0" $'Skip: app not installed\nstatus=0' \
  "$(check "$TMP/No Such.app" "app not installed")"
# A slash makes it a path, so a command of the same name on PATH does not count.
assert "slash means path, not command" $'Skip: presenttool not installed\nstatus=0' \
  "$(check "nowhere/presenttool" "presenttool not installed")"

printf '== Message ==\n'

assert "message printed verbatim after Skip:" \
  'Skip: $tool not installed' \
  "$(check no-such-tool-here '$tool not installed' | head -1)"

printf '== Bad arguments ==\n'

assert "no message: skips" "status=0" "$(check presenttool)"
assert "no arguments: skips" "status=0" "$(check)"
assert "no message: error on stderr" "1" \
  "$(bash -c 'source "$DOTFILES/lib/index.sh"; skip_unless presenttool' 2>&1 >/dev/null | grep -c 'skip_unless requires')"

printf '== Module shape ==\n'

# A module in the shape every install.sh uses. The guard is the skip_unless
# call (or chain of calls) in front of the block, the body is the guarded
# work, and REQ picks the requirement at run time.
GUARD='skip_unless "$REQ" "thing not installed"'
write_module() {
  local name="$1" guard="$2" body="$3"
  mkdir -p "$TMP/$name"
  cat > "$TMP/$name/install.sh" <<EOF
#!/usr/bin/env bash
set -euo pipefail
source "\$DOTFILES/lib/index.sh"
$guard || {
$body
}
echo "module end"
EOF
}

# A stand-in for the main install.sh: source the module, then carry on.
cat > "$TMP/parent.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
source "$DOTFILES/lib/index.sh"
source "$1"
echo "next module"
EOF

# Runs the module on its own and sourced from the parent. Sets OUT_ALONE,
# RC_ALONE, OUT_SOURCED and RC_SOURCED.
drive() {
  local name="$1" req="$2"
  OUT_ALONE="$(REQ="$req" bash "$TMP/$name/install.sh" 2>/dev/null)"
  RC_ALONE=$?
  OUT_SOURCED="$(REQ="$req" bash "$TMP/parent.sh" "$TMP/$name/install.sh" 2>/dev/null)"
  RC_SOURCED=$?
}

write_module ok "$GUARD" '    echo "body ran"'

drive ok no-such-tool-here
assert "missing, standalone: skips the block, finishes" $'Skip: thing not installed\nmodule end' "$OUT_ALONE"
assert "missing, standalone: exits 0" "0" "$RC_ALONE"
assert "missing, sourced: the installer carries on" \
  $'Skip: thing not installed\nmodule end\nnext module' "$OUT_SOURCED"
assert "missing, sourced: exits 0" "0" "$RC_SOURCED"

drive ok presenttool
assert "present, standalone: runs the block" $'body ran\nmodule end' "$OUT_ALONE"
assert "present, sourced: runs the block, carries on" $'body ran\nmodule end\nnext module' "$OUT_SOURCED"

printf '== set -e inside the block ==\n'

write_module failing "$GUARD" '    echo "body start"
    false
    echo "after failure"'

drive failing presenttool
assert "failing command, standalone: aborts the block" "body start" "$OUT_ALONE"
assert "failing command, standalone: exits non-zero" "1" "$RC_ALONE"
assert "failing command, sourced: aborts the install" "body start" "$OUT_SOURCED"
assert "failing command, sourced: exits non-zero" "1" "$RC_SOURCED"

# Two requirements chained, with a second guard nested in the block.
write_module nested "$GUARD"' \
    || skip_unless presenttool "thing not installed"' \
  '    skip_unless presenttool "inner thing not installed" || {
        echo "inner start"
        false
        echo "after failure"
    }
    echo "after inner"'

drive nested presenttool
assert "chained and nested, standalone: aborts at the failure" "inner start" "$OUT_ALONE"
assert "chained and nested, standalone: exits non-zero" "1" "$RC_ALONE"
assert "chained and nested, sourced: aborts the install" "inner start" "$OUT_SOURCED"
assert "chained and nested, sourced: exits non-zero" "1" "$RC_SOURCED"

drive nested no-such-tool-here
assert "chained, first requirement missing: one skip line" \
  $'Skip: thing not installed\nmodule end\nnext module' "$OUT_SOURCED"

write_module second "$GUARD"' \
    || skip_unless no-such-tool-here "second thing not installed"' '    echo "body ran"'

drive second presenttool
assert "chained, second requirement missing: its skip line" \
  $'Skip: second thing not installed\nmodule end\nnext module' "$OUT_SOURCED"

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
