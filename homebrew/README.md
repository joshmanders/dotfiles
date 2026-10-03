# Homebrew

Package management for macOS.

## bundle

The `bundle` contains all packages to install:

- **Taps**: Third-party repositories
- **Brews**: Command-line tools
- **Casks**: GUI applications
- **MAS**: Mac App Store apps
- **Go**: Go packages

## Installation

```bash
# Full install
bash homebrew/install.sh

# Non-interactive
bash homebrew/install.sh --non-interactive --allow
```

Running the module on its own reads `$DOTFILES` from the environment, which bashrc exports. On a new Mac, before bashrc is linked, run the root `bash install.sh`, which sets it.

## Managing Packages

### Add a package

Edit `bundle` and add:

```ruby
brew "package-name"           # CLI tool
cask "app-name"               # GUI app
mas "App Name", id: 123456    # Mac App Store
```

A third-party tap is trusted either on its `tap` line (`tap "owner/repo", trusted: true`) or on the formula line that uses it (`brew "owner/repo/formula", trusted: true`), so `brew bundle` can load its formulae on a new machine.

Then run:

```bash
brew bundle --file="$DOTFILES/homebrew/bundle"
```

### Remove a package

1. Remove the line from `bundle`
2. Uninstall manually: `brew uninstall package-name`

### Update packages

```bash
brew update && brew upgrade
```

## Key Packages

### Shell enhancements

| Package             | Purpose                           |
| ------------------- | --------------------------------- |
| `bash`              | Modern bash 5.x (macOS ships 3.2) |
| `bash-completion@2` | Tab completions                   |
| `oh-my-posh`        | Customizable prompt               |
| `fzf`               | Fuzzy finder                      |
| `zoxide`            | Smart directory jumping           |

### Development

| Package                | Purpose             |
| ---------------------- | ------------------- |
| `git`, `gh`, `lazygit` | Version control     |
| `node`, `bun`          | JavaScript runtimes |
| `go`                   | Go language         |
| `rust`                 | Rust language       |
| `php`                  | PHP 8.5 and php-fpm |
| `composer`             | PHP package manager |

### Infrastructure

| Package                               | Purpose                       |
| ------------------------------------- | ----------------------------- |
| `caddy`                               | Web server for local dev      |
| `dnsmasq`                             | DNS for `*.dev.local` domains |
| `mariadb`, `postgresql`, `redis`      | Databases                     |
| `kubernetes-cli`                      | Kubernetes                    |
