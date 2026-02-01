# ripgrep Configuration

Fast recursive search tool (rg).

## Setup

```bash
bash ripgrep/install.sh
```

## Configuration

Edit `config` to customize:

- `--smart-case` - Case-insensitive unless uppercase used
- `--follow` - Follow symlinks
- `--glob=!pattern` - Ignore patterns (node_modules, vendor, etc.)
- `--colors` - Output colors
