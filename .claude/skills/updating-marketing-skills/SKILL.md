---
name: updating-marketing-skills
description: |
  Update the vendored marketing skills under claude/skills/ from an aged upstream release. Use when Josh asks to check or update them — 'check the marketing skills for updates,' 'update the coreyhaines skills,' 'are the marketing skills current,' 'pull the latest marketing skills.' Takes only tagged releases at least 7 days old; never automates the pull, never trusts the default branch.
---

# Updating Marketing Skills

The marketing skills under `claude/skills/` are pristine vendored copies from `coreyhaines31/marketingskills`. This skill refreshes them from upstream — deliberately, and only from aged GitHub releases.

## Why aged releases only

Marketplaces and auto-update mechanisms are prompt-injection vectors: automatically fetching and trusting third-party skill content is how you get injected. So this skill never automates the pull. Trust comes from a tagged release having aged in public for at least 7 days, not from inspecting diffs. Someone else finds the poison first.

The 7-day floor is the whole safety model. Don't shorten it, don't skip it, don't substitute a diff review for it.

## Process

### 1. Pick the release

Compute the cutoff at runtime — never hardcode a date. Select the newest non-draft, non-prerelease release whose `published_at` is at or before 7 days ago. No account override is needed — `coreyhaines31/marketingskills` is public and this only reads release data:

```bash
CUTOFF=$(date -u -v-7d +%Y-%m-%dT%H:%M:%SZ)

TAG=$(gh api repos/coreyhaines31/marketingskills/releases --jq \
  "[.[] | select(.draft==false and .prerelease==false) | select(.published_at <= \"$CUTOFF\")] | sort_by(.published_at) | reverse | .[0].tag_name")
```

If the newest release is younger than 7 days, this expression already falls back to the newest one that *is* aged past the cutoff. If `TAG` comes back empty or `null`, report "nothing aged past 7 days yet" and stop.

### 2. Fetch the trusted snapshot

Shallow-clone the repo *at that tag* into a temp dir. Releases only — never the default branch tip:

```bash
TMP=$(mktemp -d)
git clone --depth 1 --branch "$TAG" https://github.com/coreyhaines31/marketingskills "$TMP"
```

### 3. Locate skills by finding SKILL.md files

Discover the layout — don't hardcode it. Each `SKILL.md`'s parent dir is a skill; the dir name is the skill name:

```bash
find "$TMP" -name SKILL.md
```

(At the time of writing, upstream lays these out as `skills/<name>/SKILL.md`, but discover it each run rather than assuming.)

### 4. Compare versions

For each skill present in BOTH the snapshot and local `claude/skills/`, read `metadata.version` from each `SKILL.md` frontmatter and compare as semver. Extract the version from the first frontmatter block:

```bash
ver() {  # ver <path-to-SKILL.md>
  awk '/^---$/{n++; next} n==1 && /^  version:/{gsub(/^  version:[ ]*/,""); print; exit}' "$1"
}
```

Compare with `sort -V` (version-aware, so `2.0.0` < `2.10.0`, not lexical):

```bash
if [ "$UP" = "$LOCAL" ]; then
  :  # equal → skip
else
  newest=$(printf '%s\n%s\n' "$UP" "$LOCAL" | sort -V | tail -1)
  [ "$newest" = "$UP" ] && echo "update"   # upstream strictly newer
fi
```

Show a summary of what bumped, one line each: `cro 2.0.0 → 2.1.0`. Equal or older upstream → skip.

### 5. Update matched skills wholesale

For each skill whose version bumped, remove the local dir and copy the snapshot's dir in its place. No content diff, no payload inspection — the aged release is trusted.

Two safety points: the copy *source* is the parent dir `find` located for that skill in Step 3 (`SRC`), never a re-derived `$TMP/skills/<name>`; the copy *target* is anchored under `$DOTFILES` (the repo root), never a relative path — a relative `rm -rf` fires against the wrong tree if the CWD isn't the repo root.

```bash
# SRC = the SKILL.md parent dir that `find` returned for this skill in step 3
name=$(basename "$SRC")
DEST="$DOTFILES/claude/skills/$name"

rm -rf "$DEST"
cp -R "$SRC" "$DEST"
```

Only skills whose version actually bumped get touched.

### 6. New skills → ask

Collect skills present in the snapshot but NOT in local `$DOTFILES/claude/skills/`, and present them to Josh as a short list, asking which to add. Default toward yes, but he chooses — don't dump all of them in silently. Add only the ones he picks — copy each with the same anchored pattern as Step 5 (`cp -R "$SRC" "$DOTFILES/claude/skills/$name"`).

Skills Josh vendors that upstream no longer has: leave them alone, just note them in the summary.

### 7. Clean up and commit

Delete the temp snapshot, then commit everything this run changed — the updated skill dirs from Step 5 plus any skills Josh chose to add in Step 6 — in a SINGLE commit. Stage under `$DOTFILES` (never a relative path, same anchoring as Step 5) so the commit runs from the repo root regardless of CWD.

```bash
rm -rf "$TMP"

cd "$DOTFILES"
git add "$DOTFILES/claude/skills"
git commit -m "update marketing skills to $TAG" -m "cro 2.0.0 → 2.1.0
launch 1.4.0 → 1.5.0
+ prospecting 2.1.0 (added)

Co-Authored-By: Dunnbot <dunnbot@joshmanders.com>"
```

The subject names the release tag pulled this run (fill the real `$TAG`, e.g. `update marketing skills to v2.10.0`). The body carries one line per changed skill: a bump line `cro 2.0.0 → 2.1.0` for each updated skill from Step 5, and a `+ <name> <version> (added)` line for each skill added in Step 6. Match the repo's commit conventions and keep the `Co-Authored-By: Dunnbot <dunnbot@joshmanders.com>` attribution trailer the other commits use. Don't walk the implementation in the message.

COMMIT ONLY — never push. Pushing stays Josh's separate call.

Then report the per-skill summary and the resulting commit SHA.

## Guardrails

- Releases only, aged ≥ 7 days. Never the default branch tip, never a prerelease or draft, never a release younger than 7 days.
- Never add a marketplace, plugin config, or auto-update hook. Never run fetch-and-trust installers (`npx skills`-style).
- Version bump is the only update signal — no bump, no change.
- Pristine in, pristine out: no merging, no local edits to vendored skills.
- Commit the run's changes in one commit; never push. Pushing stays Josh's separate call.
