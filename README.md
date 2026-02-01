# Dotfiles

These are my dotfiles. There are many like them, but these are mine.

My dotfiles are my best friend. They are my life. I must master them as I master my life.

My dotfiles, without me, are useless. Without my dotfiles, I am useless. I must use my dotfiles true.

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/joshmanders/.files ~/.files

# Create your config file
cp ~/.files/config.sh.example ~/.files/config.sh
$EDITOR ~/.files/config.sh  # Set your name, email, etc.

# Run the installer
bash ~/.files/install.sh
```

## What's Included

### Shell (Bash)

Fish-like experience in bash with syntax highlighting, autosuggestions, and a modern prompt.

- **ble.sh** - Syntax highlighting and autosuggestions
- **Starship** - Fast, customizable prompt
- **fzf** - Fuzzy finder for history (Ctrl+R)
- **zoxide** - Smart directory jumping (`z`)

### Git

- SSH commit signing (simpler than GPG)
- macOS Keychain credential storage
- Custom diff tool (icdiff)
- 36+ utility scripts in `bin/`

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
├── bin/               # Custom scripts (37 total)
├── caddy/             # Web server config
├── dnsmasq/           # DNS resolver config
├── git/               # Git configuration
├── homebrew/          # Package management
├── lib/               # Installer utilities
├── ssh/               # SSH configuration
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

### Module-specific Installation

```bash
bash homebrew/install.sh    # Just Homebrew packages
bash bash/install.sh        # Just shell config
bash git/install.sh         # Just git config
bash ssh/install.sh         # Just SSH config
bash dnsmasq/install.sh     # Just DNS setup
bash caddy/install.sh       # Just web server
```

## Documentation

Each directory has its own README with detailed documentation:

- [bash/README.md](bash/README.md) - Shell configuration
- [bin/README.md](bin/README.md) - Custom scripts
- [caddy/README.md](caddy/README.md) - Web server
- [dnsmasq/README.md](dnsmasq/README.md) - DNS resolver
- [git/README.md](git/README.md) - Git configuration
- [homebrew/README.md](homebrew/README.md) - Package management
- [lib/README.md](lib/README.md) - Installer utilities
- [ssh/README.md](ssh/README.md) - SSH configuration

## Key Commands

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `concierge add`  | Add current project as a dev site |
| `concierge list` | List all dev sites                |
| `z <dir>`        | Smart directory jump              |
| `Ctrl+R`         | Fuzzy history search              |
| `git save "msg"` | Quick commit                      |
| `git sync`       | Fetch and rebase on upstream      |
| `git undo`       | Undo last commit                  |
