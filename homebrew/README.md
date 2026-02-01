# Homebrew

Package management for macOS.

## bundle

The `bundle` contains all packages to install:

- **Taps**: Third-party repositories
- **Brews**: Command-line tools
- **Casks**: GUI applications
- **MAS**: Mac App Store apps
- **VSCode**: VS Code extensions
- **Go**: Go packages

## Installation

```bash
# Full install
bash homebrew/install.sh

# Non-interactive
bash homebrew/install.sh --non-interactive --allow
```

## Managing Packages

### Add a package

Edit `bundle` and add:

```ruby
brew "package-name"           # CLI tool
cask "app-name"               # GUI app
mas "App Name", id: 123456    # Mac App Store
vscode "publisher.extension"  # VS Code extension
```

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

### Generate bundle from installed packages

```bash
brew bundle dump --file="$DOTFILES/homebrew/bundle" --force
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

| Package       | Purpose             |
| ------------- | ------------------- |
| `git`, `gh`   | Version control     |
| `node`, `bun` | JavaScript runtimes |
| `go`          | Go language         |
| `composer`    | PHP package manager |

### Infrastructure

| Package                               | Purpose                       |
| ------------------------------------- | ----------------------------- |
| `caddy`                               | Web server for local dev      |
| `dnsmasq`                             | DNS for `*.dev.local` domains |
| `mysql@8.4`, `postgresql@14`, `redis` | Databases                     |
| `kubernetes-cli`                      | Kubernetes                    |
