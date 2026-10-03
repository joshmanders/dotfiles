# Kap Configuration

Preferences for Kap, the screen recorder.

## Files

| File          | Purpose                                                                    |
| ------------- | -------------------------------------------------------------------------- |
| `install.sh`  | Symlinks `config.json` into place and adds the Kap login item              |
| `config.json` | Kap's config, symlinked to `~/Library/Application Support/Kap/config.json` |

## Setup

```bash
bash kap/install.sh
```

Kap itself comes from `homebrew/bundle` (cask `kap`). The installer skips when `/Applications/Kap.app` is missing. Restart Kap for changes to take effect.

## Configuration

`~/Library/Application Support/Kap/config.json` is a symlink to `config.json` in this module, which holds these keys:

| Key              | Type    | Value   |
| ---------------- | ------- | ------- |
| `loopExports`    | boolean | `true`  |
| `allowAnalytics` | boolean | `false` |

`kapturesDir`, where recordings are saved, is left out: its value is an absolute path containing the home directory, and Kap's own default is `~/Movies/Kaptures`.

Kap may replace the symlink with a regular file. The settings then live only on that machine. Running `bash kap/install.sh` again restores the symlink: the installer reports `Conflict: ... exists as a file` and prompts `Overwrite? [y/n]`. Answering `y`, or running with `--non-interactive --overwrite`, deletes the regular file, along with whatever Kap stored in it, and creates the symlink. Any other answer, or `--non-interactive` without `--overwrite`, leaves the regular file in place.

While the symlink is in place, whatever Kap writes lands in the tracked file, so check `git diff kap/config.json` before committing.

## Launch at Login

Kap starts at login. The installer adds `/Applications/Kap.app` to the login items through System Events, not hidden, and skips the step when a login item with that path exists. When the step fails the installer prints a warning and carries on.

## Customization

Edit `config.json`.
