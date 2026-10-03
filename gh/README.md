# GitHub CLI Configuration

GitHub CLI (gh) configuration and aliases.

## Setup

```bash
bash gh/install.sh
```

The installer symlinks `config.yml` to `~/.config/gh/config.yml` and installs the `github/gh-stack` extension. A failed extension install prints a warning and the installer carries on; retry with `gh extension install github/gh-stack`.

## After Installation

Run `gh auth login` to authenticate.

## Aliases

- `gh co` - Checkout a PR (`gh pr checkout`)

## Extensions

- `gh stack` (`github/gh-stack`) - Create and manage stacked PRs, a chain of pull requests that build on each other
