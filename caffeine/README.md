# Caffeine Configuration

Preferences for Caffeine, the menu bar utility that keeps the Mac awake.

## Files

| File          | Purpose                                              |
| ------------- | ---------------------------------------------------- |
| `install.sh`  | Runs `defaults.sh` when Caffeine is installed        |
| `defaults.sh` | Writes the preferences to `net.domzilla.caffeine`    |

## Setup

```bash
bash caffeine/install.sh
```

Caffeine itself comes from `homebrew/bundle` (cask `domzilla-caffeine`). The installer skips when `/Applications/Caffeine.app` is missing. Restart Caffeine for changes to take effect.

## Configuration

| Key                       | Type    | Value  |
| ------------------------- | ------- | ------ |
| `CADefaultDuration`       | integer | `120`  |
| `CASuppressLaunchMessage` | boolean | `true` |

## Customization

Edit `defaults.sh`. Read the current values with `defaults read net.domzilla.caffeine` and a key's type with `defaults read-type net.domzilla.caffeine <key>`.
