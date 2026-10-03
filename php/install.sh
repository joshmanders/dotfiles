#!/usr/bin/env bash
#
# php/install.sh - PHP settings and global Composer tools setup
#
# This script layers custom PHP settings over Homebrew's stock configuration
# and installs the global Composer tools.
# Can be run standalone or sourced from the main install.sh.
#
# What it does:
#   1. Symlinks 99-dotfiles.ini to $(brew --prefix)/etc/php/<version>/conf.d/
#   2. Symlinks zz-dotfiles.conf to $(brew --prefix)/etc/php/<version>/php-fpm.d/
#   3. Restarts PHP-FPM so it loads the drop-in
#   4. Installs laravel/pint, laravel/installer and joshcirre/tweakflux globally via composer
#
# Usage:
#   bash php/install.sh
#   bash php/install.sh --non-interactive --overwrite --allow

set -euo pipefail

source "$DOTFILES/lib/index.sh"

echo ""
echo "=== PHP Setup ==="
echo ""

skip_unless brew "Homebrew not installed" \
    || skip_unless php "php not installed" || {
    # Homebrew keeps one config directory per minor version
    PHP_VERSION="$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')"
    PHP_ETC="$(brew --prefix)/etc/php/$PHP_VERSION"

    if [[ -d "$PHP_ETC" ]]; then
        symlink "$DOTFILES/php/99-dotfiles.ini" "$PHP_ETC/conf.d/99-dotfiles.ini"
        symlink "$DOTFILES/php/zz-dotfiles.conf" "$PHP_ETC/php-fpm.d/zz-dotfiles.conf"

        # The bundle starts php-fpm before the drop-in is linked. A failure
        # must not abort the other modules.
        run "Restart PHP-FPM" \
            brew services restart php \
            || echo "Warning: PHP-FPM restart failed; run 'brew services restart php'" >&2
    else
        echo "Skip: $PHP_ETC not found"
    fi

    skip_unless composer "composer not installed" || {
        run "Install global Composer tools" composer global require laravel/pint laravel/installer joshcirre/tweakflux
    }

    echo ""
    echo "PHP setup complete!"
}
