# Caddy Web Server

Local web server for Laravel development with automatic HTTPS.

## What it does

Serves Laravel applications at `*.dev.local` domains with:

- Automatic internal TLS certificates
- PHP-FPM integration
- Wildcard subdomain support
- Laravel Reverb websocket proxy

## Files

| File/Dir    | Purpose                                               |
| ----------- | ----------------------------------------------------- |
| `Caddyfile` | Main Caddy configuration                              |
| `sites/`    | Site-specific configurations (managed by `concierge`) |

## Installation

```bash
bash caddy/install.sh
```

## Managing Sites

Use the `concierge` command to manage sites:

```bash
# Add a site (from project directory)
cd ~/Code/myproject
concierge add

# Add a site with custom name
concierge add mysite

# Add a site with custom path
concierge add mysite ~/Code/myproject

# List all sites
concierge list

# Remove a site
concierge remove mysite
```

## How it works

### Caddyfile

The main config defines a `(laravel)` snippet that:

1. Listens on `*.{name}.dev.local` and `{name}.dev.local`
2. Uses internal CA for TLS certificates
3. Serves from `{path}/public`
4. Proxies PHP to `127.0.0.1:9000`
5. Proxies `/reverb/*` to Laravel Reverb websockets

### Site files

Each site is a file in `sites/` containing:

```
import laravel mysite /path/to/project
```

This creates:

- `mysite.dev.local`
- `*.mysite.dev.local` (for subdomains)

## Example

```bash
# Create a Laravel site
cd ~/Code/myapp
concierge add

# Access at
# https://myapp.dev.local
# https://api.myapp.dev.local
```

## Trusting the CA

Caddy uses an internal CA. To trust it:

1. Open Keychain Access
2. Find "Caddy Local Authority"
3. Double-click → Trust → Always Trust

Or via command line:

```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain \
    ~/Library/Application\ Support/Caddy/pki/authorities/local/root.crt
```

## Troubleshooting

### Site not loading

1. Check Caddy is running:

   ```bash
   brew services list | grep caddy
   ```

2. Reload config:

   ```bash
   caddy reload --config /opt/homebrew/etc/Caddyfile
   ```

3. Check logs:
   ```bash
   tail -f /opt/homebrew/var/log/caddy.log
   ```

### PHP not working

Ensure PHP-FPM is running on port 9000:

```bash
brew services start php
```

### DNS not resolving

See `dnsmasq/README.md` for DNS troubleshooting.
