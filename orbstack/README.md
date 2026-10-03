# OrbStack Configuration

Preferences for OrbStack, the Docker and Kubernetes runtime.

## Files

| File            | Purpose                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| `install.sh`    | Symlinks `vmconfig.json` into place and adds the OrbStack login item     |
| `vmconfig.json` | OrbStack's VM config, symlinked to `~/.orbstack/vmconfig.json`           |

## Setup

```bash
bash orbstack/install.sh
```

OrbStack itself comes from `homebrew/bundle` (cask `orbstack`). The installer skips when `/Applications/OrbStack.app` is missing. Restart OrbStack for changes to take effect.

## Configuration

`~/.orbstack/vmconfig.json` is a symlink to `vmconfig.json` in this module, which holds these keys:

| Key                   | Type    | Value   |
| --------------------- | ------- | ------- |
| `cpu`                 | number  | `1`     |
| `k8s.enable`          | boolean | `true`  |
| `k8s.expose_services` | boolean | `true`  |
| `rosetta`             | boolean | `false` |

OrbStack may replace the symlink with a regular file. The settings then live only on that machine. Running `bash orbstack/install.sh` again restores the symlink: the installer reports `Conflict: ... exists as a file` and prompts `Overwrite? [y/n]`. Answering `y`, or running with `--non-interactive --overwrite`, deletes the regular file, along with whatever OrbStack stored in it, and creates the symlink. Any other answer, or `--non-interactive` without `--overwrite`, leaves the regular file in place.

While the symlink is in place, whatever OrbStack writes through it lands in the tracked file, so check `git diff orbstack/vmconfig.json` before committing.

## Launch at Login

OrbStack starts at login. The installer adds `/Applications/OrbStack.app` to the login items through System Events, not hidden, and skips the step when a login item with that path exists. When the step fails the installer prints a warning and carries on.

## Customization

Edit `vmconfig.json`.
