# Dotfiles

These are my dotfiles. There are many like them, but these are mine.

My dotfiles are my best friend. They are my life. I must master them as I master my life.

My dotfiles, without me, are useless. Without my dotfiles, I am useless. I must use my dotfiles true.

---

## Quick Start

```bash
# Clone the repo (anywhere — see "Install location" below)
git clone https://github.com/YOUR_USERNAME/.files ~/.files

# Create your config file
cp ~/.files/config.sh.example ~/.files/config.sh
$EDITOR ~/.files/config.sh  # Set your name, email, etc.

# Run the installer
bash ~/.files/install.sh
```

## Install location

The dotfiles repo can live anywhere on disk — `~/.files`, `~/Code/<username>/dotfiles`, `/opt/dotfiles`, whatever. The installer derives `$DOTFILES` from its own script location, so symlinks, env vars, and hooks all resolve correctly relative to wherever you cloned it.

How it works:

- `install.sh` sets `DOTFILES="$SCRIPT_DIR"` and propagates it to every module install script.
- `bash/bashrc` resolves its own symlinked location to set `$DOTFILES` for every interactive (and `BASH_ENV`-loaded) shell.
- `claude/settings.json` is generated at install time from `claude/settings.json.template`, substituting the actual `$DOTFILES` path into the hardcoded slots Claude Code requires (env vars, hook commands).
- All bin scripts and module installers read `$DOTFILES` directly from the environment. They don't fall back to a hardcoded default — if `$DOTFILES` isn't set when you run one, that's a setup problem (your shell isn't loading bashrc, or you didn't go through `install.sh`).

If you move the repo after install, re-run `bash install.sh` from the new location to refresh symlinks and regenerate the templated files.

## What's Included

### Shell (Bash)

Modern bash setup with a customizable prompt and enhanced navigation.

- **oh-my-posh** - Customizable prompt with git status
- **fzf** - Fuzzy finder for history (Ctrl+R)
- **zoxide** - Smart directory jumping (`z`)

### Git

- SSH commit signing (simpler than GPG)
- macOS Keychain credential storage
- 36 utility scripts in `bin/`

### Local Development

- **Caddy** - Web server with automatic HTTPS
- **dnsmasq** - Resolves `*.dev.local` to localhost
- **concierge** - CLI for managing dev sites

```bash
# Add a Laravel site
cd ~/Code/myproject
concierge add

# Access at https://myproject.dev.local
```

## Directory Structure

```
~/.files/
├── bash/              # Shell configuration
├── bin/               # Custom scripts
├── caddy/             # Web server config
├── caffeine/          # Caffeine preferences
├── claude/            # Claude Code config, rules, and skills; Claude desktop app preferences
├── cpanel/            # Claude Panel TUI (Bun/React)
├── dato/              # Dato preferences
├── dnsmasq/           # DNS resolver config
├── fzf/               # Fuzzy finder config
├── gh/                # GitHub CLI config
├── ghostty/           # Ghostty terminal config
├── git/               # Git configuration
├── homebrew/          # Package management
├── hyperkey/          # Hyperkey config
├── lazygit/           # Lazygit config
├── lib/               # Installer utilities
├── macos/             # macOS system preferences
├── neovim/            # Neovim configuration
├── npm/               # NPM configuration
├── orbstack/          # OrbStack preferences
├── php/               # PHP and PHP-FPM settings
├── rectangle/         # Window manager config
├── ripgrep/           # Ripgrep config
├── solo/              # Process-runner TUI (Bun/React)
├── ssh/               # SSH configuration
├── tmux/              # Terminal multiplexer
├── config.sh.example  # Config template (copy to config.sh)
├── install.sh         # Main installer
└── README.md          # This file
```

## Installation Modes

```bash
# Interactive (prompts for everything)
bash install.sh

# Non-interactive, skip conflicts, skip commands (dry run)
bash install.sh --non-interactive --skip --deny

# Non-interactive, overwrite everything, run everything
bash install.sh --non-interactive --overwrite --allow
```

The installer asks for your sudo password once at the start and keeps it alive until it finishes, so steps that need root don't stop to prompt. With `--non-interactive` it asks only when `--allow` is set and the credentials aren't already cached.

### Module-specific Installation

`install.sh` runs every module below, in this order. Each one also runs on its own:

```bash
bash homebrew/install.sh    # Just Homebrew packages
bash bash/install.sh        # Just shell config
bash fzf/install.sh         # Just fzf keybindings
bash git/install.sh         # Just git config
bash gh/install.sh          # Just GitHub CLI config
bash ssh/install.sh         # Just SSH config
bash dnsmasq/install.sh     # Just DNS setup
bash caddy/install.sh       # Just web server
bash php/install.sh         # Just PHP settings
bash npm/install.sh         # Just npm config
bash ripgrep/install.sh     # Just ripgrep global ignore
bash claude/install.sh      # Just Claude Code config and Claude desktop app preferences
bash cpanel/install.sh      # Just Claude Panel TUI (config symlink + bun install)
bash solo/install.sh        # Just solo TUI (configs symlink + bun install)
bash lazygit/install.sh     # Just Lazygit config
bash neovim/install.sh      # Just Neovim config
bash tmux/install.sh        # Just tmux config
bash ghostty/install.sh     # Just Ghostty config
bash macos/install.sh       # Just macOS system preferences
bash rectangle/install.sh   # Just Rectangle preferences
bash hyperkey/install.sh    # Just Hyperkey preferences
bash caffeine/install.sh    # Just Caffeine preferences
bash dato/install.sh        # Just Dato preferences
bash orbstack/install.sh    # Just OrbStack preferences
```

## Documentation

Each directory has its own README with detailed documentation:

- [bash/README.md](bash/README.md) - Shell configuration
- [bin/README.md](bin/README.md) - Custom scripts
- [caddy/README.md](caddy/README.md) - Web server
- [caffeine/README.md](caffeine/README.md) - Caffeine
- [claude/README.md](claude/README.md) - Claude Code config and Claude desktop app preferences
- [cpanel/README.md](cpanel/README.md) - Claude Panel TUI (browse/mine `~/.claude`)
- [dato/README.md](dato/README.md) - Dato
- [dnsmasq/README.md](dnsmasq/README.md) - DNS resolver
- [fzf/README.md](fzf/README.md) - Fuzzy finder
- [gh/README.md](gh/README.md) - GitHub CLI
- [ghostty/README.md](ghostty/README.md) - Ghostty terminal
- [git/README.md](git/README.md) - Git configuration
- [homebrew/README.md](homebrew/README.md) - Package management
- [hyperkey/README.md](hyperkey/README.md) - Hyperkey
- [lib/README.md](lib/README.md) - Installer utilities
- [macos/README.md](macos/README.md) - macOS system preferences
- [neovim/README.md](neovim/README.md) - Neovim configuration
- [lazygit/README.md](lazygit/README.md) - Lazygit
- [npm/README.md](npm/README.md) - NPM configuration
- [orbstack/README.md](orbstack/README.md) - OrbStack
- [php/README.md](php/README.md) - PHP and PHP-FPM settings
- [rectangle/README.md](rectangle/README.md) - Window manager
- [ripgrep/README.md](ripgrep/README.md) - Ripgrep
- [solo/README.md](solo/README.md) - Process-runner TUI (per-cwd command set)
- [ssh/README.md](ssh/README.md) - SSH configuration
- [tmux/README.md](tmux/README.md) - Terminal multiplexer

## Key Commands

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `concierge add`  | Add current project as a dev site  |
| `concierge list` | List all dev sites                 |
| `z <dir>`        | Smart directory jump               |
| `Ctrl+R`         | Fuzzy history search               |
| `nvim`           | Open Neovim (plugins auto-install) |
| `git save "msg"` | Quick commit                       |
| `git sync`       | Fetch and rebase on upstream       |
| `git undo`       | Undo last commit                   |
| `cpanel`         | TUI for everything in `~/.claude`  |
| `solo`           | Per-cwd process-runner TUI         |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
