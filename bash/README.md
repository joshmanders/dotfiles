# Bash Configuration

Modern bash setup with a customizable prompt and enhanced navigation.

## Features

| Feature       | Tool       | Description                         |
| ------------- | ---------- | ----------------------------------- |
| Git prompt    | oh-my-posh | Shows branch, status, ahead/behind  |
| Fuzzy history | fzf        | Better Ctrl+R for history search    |
| Smart cd      | zoxide     | `z` command learns your directories |

## Files

| File            | Purpose                                   |
| --------------- | ----------------------------------------- |
| `bashrc`        | Main entry point, sources all other files |
| `exports.sh`    | Environment variables (EDITOR, TZ, etc.)  |
| `path.sh`       | PATH configuration                        |
| `aliases.sh`    | Shell aliases                             |
| `plugins.sh`    | Plugin initialization (fzf, zoxide)       |
| `completion.sh` | Tab completions (kubectl, gh, etc.)       |
| `prompt.sh`     | oh-my-posh prompt initialization          |
| `theme.json`    | Prompt theme configuration                |
| `install.sh`    | Installation script                       |

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

| Key    | Action                     |
| ------ | -------------------------- |
| Ctrl+R | Fuzzy history search (fzf) |
| Tab    | Tab completion             |

## Installation

```bash
# Full install
bash bash/install.sh

# Non-interactive (skip conflicts, run commands)
bash bash/install.sh --non-interactive --skip --allow
```

## Dependencies

Installed via Homebrew (see `homebrew/bundle`):

- `bash` - Modern bash 5.x (macOS ships with 3.2)
- `bash-completion@2` - Tab completions
- `oh-my-posh` - Customizable prompt
- `fzf` - Fuzzy finder
- `zoxide` - Smart directory jumping
