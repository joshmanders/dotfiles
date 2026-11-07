---
name: syncing-app-settings
description: |
  Capture a Mac app's current preferences from its macOS defaults domain into the module's `defaults.sh`, which the module's `install.sh` runs. Use when Josh says 'sync the settings for <app>', 'sync <app>'s settings', 'pull <app>'s preferences into the repo', 'capture my <app> settings', or 'add defaults for <app>'. Covers refreshing an existing module's `defaults.sh` and adding one for an app that has none. Apps whose settings live in a file rather than a defaults domain are out of scope.
---

# Syncing App Settings

Apps with a defaults domain kept in the repo: `macos`, `hyperkey`, `caffeine`, `rectangle`, `dato`, `rex`. Each module has a `defaults.sh` of `defaults write` lines, run from its `install.sh`. That's the repo's established pattern for app preferences, so settings go through `defaults write` in `defaults.sh`.

`rex/defaults.sh` and `rex/README.md` are the worked example.

## Find the domain

| Source | Command |
| --- | --- |
| Existing module | the domain in its `defaults.sh` |
| App bundle | `defaults read "/Applications/<App>.app/Contents/Info" CFBundleIdentifier` |
| App name | `osascript -e 'id of app "<App>"'` |
| Unsandboxed app | `~/Library/Preferences/<domain>.plist` |
| Sandboxed app | `~/Library/Containers/<domain>/Data/Library/Preferences/<domain>.plist` |
| All domains | `defaults domains` |

`defaults read <domain>` reads a sandboxed app's container plist too, so the same commands work for both. Dato and Caffeine are sandboxed.

`macos` spans several domains (`com.apple.dock`, `com.apple.finder`, `NSGlobalDomain`, ...); `macos/README.md` lists the common ones and covers per-host settings (`defaults -currentHost`).

## Read the live settings

```bash
defaults read <domain>              # every key the app has stored
defaults read-type <domain> <key>   # e.g. "Type is float"
defaults export <domain> -          # XML plist, with each value's type
```

A setting with no key in the domain isn't captured. To carry it, change it in the app first, then read the domain again.

## Choose the keys

Carry user preferences that belong on every machine. Leave out machine state (examples from Rex's domain):

| Leave out | Examples |
| --- | --- |
| Window frames | `NSWindow Frame Workspace` |
| Last-focused and session state | `Workspace.lastFocusedSession` |
| Cached routes and endpoints | `rex.local-server.cached-route.v1` |
| Onboarding and first-run flags | `Onboarding.firstRun` |
| Sync and migration markers | `RexSync.servers`, `rex.sync.hosts-migrated.v1` |
| Status item visibility | `NSStatusItem VisibleCC Item-0` |
| Sparkle bookkeeping | `SULastCheckTime`, `SUUpdateGroupIdentifier`, `SUHasLaunchedBefore`, `SUScheduledCheckInterval` |

Sparkle's `SUEnableAutomaticChecks` and `SUAutomaticallyUpdate` are user choices and stay in.

## Write `defaults.sh`

Write each key with the flag matching its stored type from `defaults read-type`:

| `read-type` | Flag |
| --- | --- |
| `boolean` | `-bool` |
| `integer` | `-int` |
| `float` | `-float` |
| `string` | `-string` |
| `array` | `-array` |
| `dictionary` | `-dict` |

A number can be stored as a float; write it with `-float` and say so in a comment, as `rex/defaults.sh` does for `Workspace.terminalFontPointSize` and `rectangle/defaults.sh` for `gapSize`. A string holding JSON stays `-string`, as Rectangle's `landscapeSnapAreas` does.

Match the existing file's layout: the header comment, `set -euo pipefail`, then `defaults write <domain> <key> <flag> <value>` lines. Larger files group keys under `# ===` section headers (`macos`, `rex`).

Comments state only what was verified. Don't map a key to a Settings window label unless the app's docs or a change in its Settings showed it.

Refreshing an existing module: add new keys, update changed values, remove keys the app no longer stores.

## Apply safely

The app is usually running, so write to the live domain only when every value already equals what's stored. Then confirm nothing moved:

```bash
defaults export <domain> - > before.plist
bash <module>/defaults.sh
defaults export <domain> - > after.plist
diff before.plist after.plist
```

Keep the snapshots in the scratchpad. An empty diff means the values and types match the live app.

## Update the README

The module README lists what's carried and what's left out. `rex/README.md` has an "App preferences" section with both lists; `dato/README.md` names the keys it doesn't write. The Customization section says how to read the domain:

```
Edit `defaults.sh`. Read the current values with `defaults read <domain>` and a key's type with `defaults read-type <domain> <key>`.
```

Like comments, README lines state only what was verified.

## New module

For an app with no module yet, follow the `adding-modules` skill. The install script for a defaults-only module matches `caffeine/install.sh`:

- `skip_unless "/Applications/<App>.app" "<App> not installed" || { ... }`
- `run "Set <App> preferences" bash "$DOTFILES/<module>/defaults.sh"`, with `|| echo "Warning: ..." >&2` so a failure doesn't stop the other modules
- A closing note: `Restart <App> for changes to take effect`

For an app that already has a module but no `defaults.sh` (as `rex` had `init.lua`), add `defaults.sh`, the `run` line in its `install.sh`, and the README rows.
