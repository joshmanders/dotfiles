# PHP

Custom PHP settings layered over Homebrew's stock configuration, plus the global Composer tools.

## What it does

Symlinks two drop-in files into the config directory of the installed PHP version (`$(brew --prefix)/etc/php/<version>/`). Homebrew's own `php.ini`, `php-fpm.conf`, and `php-fpm.d/www.conf` stay stock.

Installs the global Composer tools with `composer global require`:

- `laravel/pint` - An opinionated code formatter for PHP (`pint`)
- `laravel/installer` - Laravel application installer (`laravel`)
- `joshcirre/tweakflux` - Deep theming for Flux UI (`tweakflux`)

`laravel/lsp` is installed by the neovim module. The binaries land in `$COMPOSER_HOME/vendor/bin`, which `bash/path.sh` puts on `PATH`.

## Files

| File               | Purpose                                                              |
| ------------------ | -------------------------------------------------------------------- |
| `99-dotfiles.ini`  | PHP settings (symlinked into `conf.d/`)                              |
| `zz-dotfiles.conf` | PHP-FPM global and `www` pool settings (symlinked into `php-fpm.d/`) |
| `install.sh`       | Symlinks both files, restarts PHP-FPM, installs the Composer tools   |

## Installation

```bash
bash php/install.sh
```

This will:

1. Read the installed PHP version (`php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'`)
2. Symlink `99-dotfiles.ini` to `$(brew --prefix)/etc/php/<version>/conf.d/99-dotfiles.ini`
3. Symlink `zz-dotfiles.conf` to `$(brew --prefix)/etc/php/<version>/php-fpm.d/zz-dotfiles.conf`
4. Restart PHP-FPM with `brew services restart php` so it loads `zz-dotfiles.conf`; a failed restart prints a warning and the install carries on
5. Run `composer global require laravel/pint laravel/installer joshcirre/tweakflux`

It skips when `php` is not installed, and skips the global tools when `composer` is not installed. Run it again after upgrading to a new PHP minor version, since each version has its own config directory.

Restart PHP-FPM after editing `zz-dotfiles.conf`:

```bash
brew services restart php
```

## Configuration

### 99-dotfiles.ini

```ini
memory_limit = -1
error_reporting = E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED
```

- `memory_limit = -1` - No memory limit
- `error_reporting` - Report everything except deprecations

The `99-` prefix sorts the file after the extension inis in `conf.d/`, and files in `conf.d/` override `php.ini`.

### zz-dotfiles.conf

```ini
[global]
log_level = error

[www]
php_admin_value[error_reporting] = E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED

;Signal 11 workaround
env['PGGSSENCMODE'] = disable
env['LC_ALL'] = C
```

- `log_level = error` - PHP-FPM logs errors only
- `php_admin_value[error_reporting]` - Same error reporting for the `www` pool
- `env[...]` - Signal 11 workaround: sets `PGGSSENCMODE=disable` and `LC_ALL=C` for pool workers

The `zz-` prefix sorts the file after `www.conf`, so its `[www]` section adds to the stock pool that listens on `127.0.0.1:9000` (the address `caddy/snippets/laravel` proxies to).

Keep the quotes on the `env` keys. `LC_ALL` is also a PHP constant, and unquoted `env[LC_ALL]` is read as `env[0]`.

With `log_level = error`, `php-fpm -tt` prints nothing on success because the config dump is logged at notice level; check its exit code.

## Customization

Add settings to either file, then restart PHP-FPM. CLI `php` reads `99-dotfiles.ini` on its next run.

Verify what is loaded:

```bash
php --ini                                  # lists 99-dotfiles.ini under "Additional .ini files parsed"
"$(brew --prefix php)/sbin/php-fpm" -t     # tests the PHP-FPM configuration
```
