# DNS (dnsmasq)

Local DNS resolver for `*.dev.local` domains.

## What it does

Resolves `dev.local` and any `*.dev.local` domain to `127.0.0.1` (localhost), enabling local development with real domain names.

Example:

- `dev.local` → `127.0.0.1`
- `myapp.dev.local` → `127.0.0.1`
- `api.myapp.dev.local` → `127.0.0.1`

## Files

| File           | Purpose                                                  |
| -------------- | -------------------------------------------------------- |
| `dnsmasq.conf` | dnsmasq configuration                                    |
| `resolver`     | macOS resolver file, copied to `/etc/resolver/dev.local` |

## Installation

```bash
bash dnsmasq/install.sh
```

This will:

1. Symlink config to `$(brew --prefix)/etc/dnsmasq.conf`
2. Copy `resolver` to `/etc/resolver/dev.local` with `sudo install -m 644`, unless the file already exists
3. Start the dnsmasq service with `sudo brew services start dnsmasq`, which registers it as the boot-time launch daemon `/Library/LaunchDaemons/homebrew.mxcl.dnsmasq.plist`

It skips when Homebrew or `dnsmasq` is not installed.

Homebrew installs its example config as a regular file at `$(brew --prefix)/etc/dnsmasq.conf`. The installer replaces it with the symlink without prompting, whichever flags are passed.

## How it works

### dnsmasq.conf

```
address=/dev.local/127.0.0.1
```

This tells dnsmasq to respond to a query for `dev.local` or any `*.dev.local` name with `127.0.0.1`. dnsmasq listens on its default DNS port, 53.

### macOS Resolver

```
nameserver 127.0.0.1
domain dev.local
search_order 1
```

The file `/etc/resolver/dev.local` tells macOS to use `127.0.0.1:53` (dnsmasq) for any `.dev.local` domain lookup instead of the default DNS servers. Its content is the tracked file `resolver`.

`/etc/resolver/dev.local` is a root-owned copy, so an edit to `resolver` reaches it only when the copy is replaced. The installer skips an existing file; apply an edit with:

```bash
sudo install -m 644 "$DOTFILES/dnsmasq/resolver" /etc/resolver/dev.local
```

## Testing

```bash
# Should resolve to 127.0.0.1
ping test.dev.local

# Check DNS resolution
scutil --dns | grep dev.local -A 5
```

## Troubleshooting

### DNS not resolving

1. Check dnsmasq is running:

   ```bash
   sudo brew services list | grep dnsmasq
   ```

2. Restart dnsmasq:

   ```bash
   sudo brew services restart dnsmasq
   ```

3. Flush DNS cache:
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

### Resolver not working

Check the resolver file exists:

```bash
cat /etc/resolver/dev.local
# Should show:
# nameserver 127.0.0.1
# domain dev.local
# search_order 1
```

### Port 53 in use

Check what's using port 53:

```bash
sudo lsof -i :53
```

## Why .dev.local?

- `.local` is reserved for mDNS/Bonjour
- `.dev` is a real TLD owned by Google (requires HTTPS)
- `.dev.local` is safe and won't conflict with real domains
