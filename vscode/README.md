# VS Code

VS Code editor settings managed via dotfiles.

## Files

| File            | Description          |
| --------------- | -------------------- |
| `settings.json` | User settings        |
| `install.sh`    | Symlinks into place  |

## Installation

```bash
bash vscode/install.sh
```

## Key Settings

- **Terminal**: Uses Homebrew bash (`/opt/homebrew/bin/bash`) as default profile
- **Theme**: GitHub Dark Default
- **Font**: Fira Code with ligatures
- **Formatters**: Prettier (default), language-specific overrides for Go, Astro, YAML
- **Claude Code**: Sidebar mode, plan permission mode
