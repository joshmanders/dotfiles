# SSH Configuration

SSH client settings, key generation, and commit signing setup.

## Files

| File     | Purpose                                                 |
| -------- | ------------------------------------------------------- |
| `config` | SSH client configuration (symlinked to `~/.ssh/config`) |

## Installation

```bash
bash ssh/install.sh
```

This will:

1. Create `~/.ssh` with proper permissions
2. Generate an ed25519 SSH key (if none exists)
3. Create `~/.ssh/allowed_signers` for git verification
4. Symlink the SSH config
5. Display your public key for easy copying

## SSH Key

The install script generates an ed25519 key at `~/.ssh/id_ed25519`.

### View your public key

```bash
cat ~/.ssh/id_ed25519.pub
```

### Add to GitHub

1. Copy your public key
2. Go to https://github.com/settings/ssh/new
3. Add the key twice:
   - Once as **Authentication Key** (for git push/pull)
   - Once as **Signing Key** (for commit verification)

## Commit Signing

Git is configured to use SSH for commit signing (instead of GPG).

**Configuration in git/config:**

```ini
[user]
    signingkey = ~/.ssh/id_ed25519.pub
[gpg]
    format = ssh
[gpg "ssh"]
    allowedSignersFile = ~/.ssh/allowed_signers
[commit]
    gpgsign = true
```

**Verify a signed commit:**

```bash
git log --show-signature
```

## Configuration Overview

### 1Password SSH Agent

Uses 1Password as the SSH agent for key management:

```
IdentityAgent "~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"
```

This means SSH keys stored in 1Password are automatically available.

### Using 1Password for key management

If you prefer 1Password to manage your SSH key:

1. Import `~/.ssh/id_ed25519` into 1Password
2. Enable SSH agent in 1Password settings
3. Delete the local key (optional): `rm ~/.ssh/id_ed25519*`

### OrbStack Integration

Includes OrbStack SSH config for Linux VM access:

```
Include ~/.orbstack/ssh/config
```

### Connection Settings

- `ServerAliveInterval 60` - Keeps connections alive

### Host Configurations

**quasirc** - Local QEMU/Docker container:

```
Host quasirc
    HostName 127.0.0.1
    User joshmanders
    Port 2222
```

## Adding New Hosts

Edit `config`:

```
Host myserver
    HostName example.com
    User myuser
    Port 22
```

## Troubleshooting

### 1Password agent not working

1. Ensure 1Password is running
2. Enable SSH agent in 1Password settings
3. Restart terminal

### Permission errors

SSH requires strict permissions:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

### Signing not working

1. Check key exists: `ls -la ~/.ssh/id_ed25519*`
2. Check allowed_signers: `cat ~/.ssh/allowed_signers`
3. Verify git config: `git config --get user.signingkey`
