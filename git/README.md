# Git Configuration

Git settings with SSH commit signing.

## Files

| File     | Purpose                                         |
| -------- | ----------------------------------------------- |
| `config` | Git configuration (symlinked to `~/.gitconfig`) |
| `ignore` | Global gitignore (symlinked to `~/.gitignore`)  |

## Installation

```bash
bash git/install.sh
```

## Configuration Overview

### User

- Name: Set via `config.sh` → `DOTFILES_NAME`
- Email: Set via `config.sh` → `DOTFILES_EMAIL`
- Signing key: `~/.ssh/id_ed25519.pub`

### Commit Signing

Uses SSH keys for signing (simpler than GPG, works with 1Password).

```ini
[gpg]
    format = ssh
[gpg "ssh"]
    allowedSignersFile = ~/.ssh/allowed_signers
[commit]
    gpgsign = true
```

**Note:** SSH key generation is handled by `ssh/install.sh`.

### Verify signatures

```bash
git log --show-signature
```

### Credentials

Uses macOS Keychain via `osxkeychain` helper. Authenticate with:

```bash
gh auth login
```

### Diff Tool

Uses `icdiff` for side-by-side colored diffs:

```bash
git difftool <file>
```

## Customization

### Add aliases

Edit `config`:

```ini
[alias]
    co = checkout
    br = branch
```

### Change editor

Edit `config`:

```ini
[core]
    editor = vim
```

### Disable signing for a repo

```bash
git config commit.gpgsign false
```

## Hooks

Git hooks are stored in the `git/hooks/` directory but are not automatically installed. Copy them manually if needed:

```bash
cp ~/.files/git/hooks/post-merge .git/hooks/
```
