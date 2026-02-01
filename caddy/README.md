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
concierge add [name] [path] [--ip <address>]   # Add a site
concierge remove <name>                         # Remove a site
concierge list                                  # List all sites
concierge help                                  # Show help
```

### Adding Sites

```bash
# Add current directory (uses basename as name)
cd ~/Code/myproject
concierge add

# Add with custom name
concierge add mysite

# Add with custom name and path
concierge add mysite ~/Code/myproject

# Add with IP forwarding (uses `ip` alias to get public IP)
concierge add --ip "$(ip)"
concierge add mysite --ip "$(ip)"
```

### Listing Sites

```bash
concierge list
```

Shows all configured sites with their URLs and paths.

### Removing Sites

```bash
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

Caddy uses an internal CA. Trust it with:

```bash
caddy trust
```

This adds the Caddy root certificate to your system trust store.

## Troubleshooting

### Site not loading

1. Check Caddy is running:

   ```bash
   brew services list | grep caddy
   ```

2. Reload config:

   ```bash
   caddy reload --config "$(brew --prefix)/etc/Caddyfile"
   ```

3. Check logs:
   ```bash
   tail -f "$(brew --prefix)/var/log/caddy.log"
   ```

### PHP not working

Ensure PHP-FPM is running on port 9000:

```bash
brew services start php
```

### DNS not resolving

See `dnsmasq/README.md` for DNS troubleshooting.
