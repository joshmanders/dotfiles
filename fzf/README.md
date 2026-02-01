# fzf Configuration

Fuzzy finder for command history, files, and more.

## Setup

```bash
bash fzf/install.sh
```

## Features

- **Ctrl+R** - Fuzzy search command history
- **Ctrl+T** - Fuzzy find files
- **Alt+C** - Fuzzy cd into directories

## Configuration

Edit `config.sh` to customize:

- `FZF_DEFAULT_OPTS` - Default options and colors
- `FZF_DEFAULT_COMMAND` - Command to generate file list (uses `fd` if available)
