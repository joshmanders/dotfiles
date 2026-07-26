#!/usr/bin/env bash
# Tests for load_install_hooks.
# Verifies hook loading, caller-directory defaulting, and failure handling.
# Usage: ./install_hooks.test.sh
# Exits non-zero on any failure.
set -uo pipefail

DOTFILES="${DOTFILES:-$(cd "$(dirname "$0")/.." && pwd)}"
export DOTFILES

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

# A module with two hooks and an installer that calls load_install_hooks with
# no argument, so the caller-directory default is what's under test.
mkdir -p "$TMP/mod/install.d"
printf '#!/usr/bin/env bash\nexport HOOK_ONE=one\n' > "$TMP/mod/install.d/a.sh"
printf '#!/usr/bin/env bash\nexport HOOK_TWO=two\n' > "$TMP/mod/install.d/b.sh"
printf 'not a shell file\n' > "$TMP/mod/install.d/notes.txt"
cat > "$TMP/mod/install.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
source "$DOTFILES/lib/index.sh"
load_install_hooks
echo "${HOOK_ONE:-UNSET}/${HOOK_TWO:-UNSET}"
EOF

printf '== Hook loading ==\n'

# Run standalone: the module's installer invoked directly.
assert "standalone" "one/two" \
  "$(bash "$TMP/mod/install.sh" 2>/dev/null | tail -1)"

# Sourced from a parent installer, which is how the main install.sh runs modules.
# The caller-directory default must still resolve to the module, not the parent.
assert "sourced from parent" "one/two" \
  "$(bash -c "set -euo pipefail; source \"\$DOTFILES/lib/index.sh\"; source \"$TMP/mod/install.sh\"" 2>/dev/null | tail -1)"

# Explicit module directory argument.
assert "explicit dir" "one" \
  "$(bash -c "source \"\$DOTFILES/lib/index.sh\"; load_install_hooks \"$TMP/mod\"; echo \"\${HOOK_ONE:-UNSET}\"" 2>/dev/null | tail -1)"

# Non-.sh files in install.d/ are ignored rather than sourced.
assert "ignores non-sh files" "0" \
  "$(bash -c "source \"\$DOTFILES/lib/index.sh\"; load_install_hooks \"$TMP/mod\" >/dev/null 2>&1; echo \$?" | tail -1)"

printf '== Edge cases ==\n'

# A module with no install.d/ is a silent no-op, not an error.
mkdir -p "$TMP/bare"
assert "missing install.d is no-op" "0" \
  "$(bash -c "source \"\$DOTFILES/lib/index.sh\"; load_install_hooks \"$TMP/bare\"; echo \$?" 2>/dev/null | tail -1)"

# An empty install.d/ must not source the literal glob.
mkdir -p "$TMP/empty/install.d"
assert "empty install.d is no-op" "0" \
  "$(bash -c "source \"\$DOTFILES/lib/index.sh\"; load_install_hooks \"$TMP/empty\"; echo \$?" 2>/dev/null | tail -1)"

# A failing hook aborts, because later steps depend on what it exported.
mkdir -p "$TMP/bad/install.d"
printf 'return 1\n' > "$TMP/bad/install.d/x.sh"
assert "failing hook returns 1" "1" \
  "$(bash -c "source \"\$DOTFILES/lib/index.sh\"; load_install_hooks \"$TMP/bad\"; echo \$?" 2>/dev/null | tail -1)"

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
