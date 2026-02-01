# DNS (dnsmasq)

Local DNS resolver for `*.dev.local` domains.

## What it does

Resolves any `*.dev.local` domain to `127.0.0.1` (localhost), enabling local development with real domain names.

Example:

- `myapp.dev.local` → `127.0.0.1`
- `api.myapp.dev.local` → `127.0.0.1`

## Files

| File           | Purpose               |
| -------------- | --------------------- |
| `dnsmasq.conf` | dnsmasq configuration |

## Installation

```bash
bash dnsmasq/install.sh
```

This will:

1. Symlink config to `/opt/homebrew/etc/dnsmasq.conf`
2. Create `/etc/resolver/dev.local` (requires sudo)
3. Start the dnsmasq service

## How it works

### dnsmasq.conf

```
address=/.dev.local/127.0.0.1
port=53
```

This tells dnsmasq to respond to any `*.dev.local` query with `127.0.0.1`.

### macOS Resolver

The file `/etc/resolver/dev.local` tells macOS to use `127.0.0.1:53` (dnsmasq) for any `.dev.local` domain lookup instead of the default DNS servers.

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
# Should show: nameserver 127.0.0.1
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
