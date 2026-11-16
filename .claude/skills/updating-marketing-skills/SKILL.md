---
name: updating-marketing-skills
description: |
  Update the vendored marketing skills under claude/skills/ from an aged upstream release. Use when Josh asks to check or update them — 'check the marketing skills for updates,' 'update the coreyhaines skills,' 'are the marketing skills current,' 'pull the latest marketing skills.' Takes only tagged releases at least 7 days old; never automates the pull, never trusts the default branch.
---

# Updating Marketing Skills

The marketing skills under `claude/skills/` are pristine vendored copies from `coreyhaines31/marketingskills`, refreshed only from aged GitHub releases.

## Why aged releases only

Auto-fetching third-party skill content is a prompt-injection vector, so the pull is never automated. Trust comes from a tagged release having aged in public for at least 7 days, not from inspecting diffs. The 7-day floor is the whole safety model: don't shorten it, skip it, or substitute a diff review for it.

## Process

### 1. Pick the release

Select the newest non-draft, non-prerelease release published at least 7 days ago, computing the cutoff at runtime. The repo is public, so no account override is needed:

```bash
CUTOFF=$(date -u -v-7d +%Y-%m-%dT%H:%M:%SZ)

TAG=$(gh api repos/coreyhaines31/marketingskills/releases --jq \
  "[.[] | select(.draft==false and .prerelease==false) | select(.published_at <= \"$CUTOFF\")] | sort_by(.published_at) | reverse | .[0].tag_name")
```

If `TAG` is empty or `null`, report "nothing aged past 7 days yet" and stop.

### 2. Fetch the trusted snapshot

Shallow-clone the repo at that tag, never the default branch tip:

```bash
TMP=$(mktemp -d)
git clone --depth 1 --branch "$TAG" https://github.com/coreyhaines31/marketingskills "$TMP"
```

### 3. Locate skills by finding SKILL.md files

Discover the layout each run. Each `SKILL.md`'s parent dir is a skill, named by the dir:

```bash
find "$TMP" -name SKILL.md
```

### 4. Compare versions

For each skill present in both the snapshot and local `claude/skills/`, compare `metadata.version` from each `SKILL.md` frontmatter:

```bash
ver() {  # ver <path-to-SKILL.md>
  awk '/^---$/{n++; next} n==1 && /^  version:/{gsub(/^  version:[ ]*/,""); print; exit}' "$1"
}
```

Compare with `sort -V`:

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

For each skill whose version bumped, replace the local dir with the snapshot's. No content diff; the aged release is trusted. The source is the dir `find` located in Step 3 (`SRC`), never a re-derived `$TMP/skills/<name>`; the target is anchored under `$DOTFILES`, never relative.

```bash
# SRC = the SKILL.md parent dir that `find` returned for this skill in step 3
name=$(basename "$SRC")
DEST="$DOTFILES/claude/skills/$name"

rm -rf "$DEST"
cp -R "$SRC" "$DEST"
```

### 6. New skills → ask

List skills in the snapshot but not in `$DOTFILES/claude/skills/` and ask Josh which to add (default toward yes). Copy only his picks, anchored as in Step 5.

Local skills upstream no longer has: leave them, note them in the summary.

### 7. Clean up and commit

Delete the temp snapshot, then commit everything from Steps 5 and 6 in a single commit, staged under `$DOTFILES`.

```bash
rm -rf "$TMP"

cd "$DOTFILES"
git add "$DOTFILES/claude/skills"
git commit -m "update marketing skills to $TAG" -m "cro 2.0.0 → 2.1.0
launch 1.4.0 → 1.5.0
+ prospecting 2.1.0 (added)

Co-Authored-By: Dunnbot <dunnbot@joshmanders.com>"
```

The subject names the real `$TAG`. The body has one line per changed skill (`cro 2.0.0 → 2.1.0`, or `+ <name> <version> (added)`) and the Dunnbot trailer.

Never push. Report the per-skill summary and the resulting commit SHA.

## Guardrails

- Releases only, aged ≥ 7 days. Never the default branch tip, never a prerelease or draft, never a release younger than 7 days.
- Never add a marketplace, plugin config, or auto-update hook. Never run fetch-and-trust installers (`npx skills`-style).
- Version bump is the only update signal — no bump, no change.
- Pristine in, pristine out: no merging, no local edits to vendored skills.
- Commit the run's changes in one commit; never push. Pushing stays Josh's separate call.
