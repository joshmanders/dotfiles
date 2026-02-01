# Rectangle Configuration

Window management with keyboard shortcuts.

## Setup

```bash
bash rectangle/install.sh
```

## Keyboard Shortcuts

| Shortcut          | Action     |
| ----------------- | ---------- |
| Ctrl+Option+Left  | Left half  |
| Ctrl+Option+Right | Right half |
| Ctrl+Option+Up    | Maximize   |
| Ctrl+Option+Down  | Center     |

## Configuration

Edit `defaults.sh` to customize:

- `gapSize` - Gap between windows (pixels)
- `launchOnLogin` - Start on login
- Keyboard shortcuts via keyCode and modifierFlags
