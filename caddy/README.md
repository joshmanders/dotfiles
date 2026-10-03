# Caddy Web Server

Local web server for Laravel development with automatic HTTPS.

## What it does

Serves Laravel applications at `*.dev.local` domains with:

- Automatic internal TLS certificates
- PHP-FPM integration
- Wildcard subdomain support
- Laravel Reverb websocket proxy

`https://concierge.dev.local` is an internal site defined in the `Caddyfile`, serving the Concierge Dashboard placeholder from `dashboard/`. `concierge` does not manage it, and the site name `concierge` is reserved for it: a `concierge` site must not be named `concierge`.

## Files

| File/Dir     | Purpose                                                                      |
| ------------ | ---------------------------------------------------------------------------- |
| `Caddyfile`  | Main Caddy configuration, including the `concierge.dev.local` site           |
| `snippets/`  | Shared snippets, one file per concern (see [Snippets](#snippets))            |
| `sites/`     | Site-specific configurations (managed by `concierge`)                        |
| `dashboard/` | Concierge Dashboard placeholder page served at `https://concierge.dev.local` |

## Installation

```bash
bash caddy/install.sh
```

The installer:

1. Symlinks `Caddyfile` to `$(brew --prefix)/etc/Caddyfile`, and `snippets/`, `sites/` and `dashboard/` into `$(brew --prefix)/etc/caddy/`
2. Starts the Caddy service
3. Runs `caddy trust`, which adds Caddy's root certificate to the system keychain so `https://*.dev.local` sites are trusted

It skips when Homebrew or `caddy` is not installed.

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

The main config imports `snippets/*` and `sites/*`, and defines the internal `concierge.dev.local` site, which serves `dashboard/` with Caddy's static file server. `concierge` reads and writes only the files in `sites/`, so `concierge add`, `remove` and `list` leave the `concierge.dev.local` site alone. A site file named `concierge` would claim the same host, so that name is reserved.

### Snippets

The `Caddyfile` imports every file in `snippets/`. A snippet can import one defined in another file whatever order the files load in.

| File        | Snippet      | Usage                                  | Purpose                                                                                                     |
| ----------- | ------------ | -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `tls`       | `dev-tls`    | `import dev-tls`                       | Internal CA certificate with a 365 day lifetime                                                             |
| `client-ip` | `client-ip`  | `import client-ip <ip>`                | Sets `X-Forwarded-For` and `X-Real-IP` to `<ip>`; import it inside a `php_fastcgi` or `reverse_proxy` block |
| `laravel`   | `reverb`     | `import reverb`                        | Proxies `/reverb/*` to Laravel Reverb websockets on `127.0.0.1:8081`                                        |
| `laravel`   | `laravel`    | `import laravel <name> <path>`         | Laravel site                                                                                                |
| `laravel`   | `laravel-ip` | `import laravel-ip <name> <path> <ip>` | Laravel site that imports `client-ip <ip>` in its `php_fastcgi` block                                       |

The `(laravel)` snippet:

1. Listens on `*.{name}.dev.local` and `{name}.dev.local`
2. Imports `dev-tls` for an internal CA certificate
3. Serves from `{path}/public`
4. Proxies PHP to `127.0.0.1:9000`
5. Imports `reverb` to proxy `/reverb/*` to Laravel Reverb websockets

### Site files

Each site is a file in `sites/` containing:

```
import laravel mysite /path/to/project
```

A site added with `--ip <address>` contains:

```
import laravel-ip mysite /path/to/project <address>
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

Caddy uses an internal CA. The installer trusts it by running:

```bash
caddy trust
```

This fetches the root certificate from the running Caddy's admin API (`localhost:2019`) and adds it to the system keychain, so Caddy has to be running. Caddy calls `sudo` itself for the keychain write; run the command as your own user.

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

See `php/README.md` for the PHP and PHP-FPM settings.

### DNS not resolving

See `dnsmasq/README.md` for DNS troubleshooting.
