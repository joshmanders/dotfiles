# Bash Configuration

Fish-like bash setup with syntax highlighting, autosuggestions, and a modern prompt.

## Features

| Feature             | Tool     | Description                                     |
| ------------------- | -------- | ----------------------------------------------- |
| Syntax highlighting | ble.sh   | Commands colored as you type                    |
| Autosuggestions     | ble.sh   | Ghost text from history (Right arrow to accept) |
| Git prompt          | Starship | Shows branch, status, ahead/behind              |
| Fuzzy history       | fzf      | Better Ctrl+R for history search                |
| Smart cd            | zoxide   | `z` command learns your directories             |

## Files

| File            | Purpose                                     |
| --------------- | ------------------------------------------- |
| `bashrc`        | Main entry point, sources all other files   |
| `exports.sh`    | Environment variables (EDITOR, TZ, etc.)    |
| `path.sh`       | PATH configuration                          |
| `aliases.sh`    | Shell aliases                               |
| `plugins.sh`    | Plugin initialization (ble.sh, fzf, zoxide) |
| `completion.sh` | Tab completions (kubectl, gh, etc.)         |
| `prompt.sh`     | Starship prompt initialization              |
| `starship.toml` | Prompt configuration                        |
| `install.sh`    | Installation script                         |

## Customization

### Adding aliases

Edit `aliases.sh`:

```bash
alias myalias='my command'
```

### Adding environment variables

Edit `exports.sh`:

```bash
export MY_VAR="value"
```

### Modifying PATH

Edit `path.sh`:

```bash
PATH="${PATH}:/my/custom/path"
```

## Keybindings

| Key         | Action                         |
| ----------- | ------------------------------ |
| Right Arrow | Accept autosuggestion          |
| Ctrl+F      | Accept next word of suggestion |
| Ctrl+R      | Fuzzy history search (fzf)     |
| Tab         | Intelligent completion         |

## Installation

```bash
# Full install
bash bash/install.sh

# Non-interactive (skip conflicts, run commands)
bash bash/install.sh --non-interactive --skip --allow
```

## Dependencies

Installed via Homebrew (see `homebrew/Brewfile`):

- `bash` - Modern bash 5.x (macOS ships with 3.2)
- `bash-completion@2` - Tab completions
- `starship` - Cross-shell prompt
- `fzf` - Fuzzy finder
- `zoxide` - Smart directory jumping

Installed by `install.sh`:

- `ble.sh` - Bash Line Editor (syntax highlighting + autosuggestions)
