# Rectangle Configuration

Window management with keyboard shortcuts.

## Setup

```bash
bash rectangle/install.sh
```

## Keyboard Shortcuts

Hyper is Ctrl+Option+Cmd, mapped to Caps Lock by `hyperkey/`. Shift is not part of Hyper.

| Shortcut       | Action      |
| -------------- | ----------- |
| Hyper+Left     | Left half   |
| Hyper+Right    | Right half  |
| Hyper+Up       | Maximize    |
| Hyper+Down     | Center      |
| Hyper+Delete   | Restore     |
| Ctrl+Option+B  | Toggle Todo |
| Ctrl+Option+N  | Reflow Todo |

`defaults.sh` writes an empty dict for these actions: top half, bottom half, center half, the four corners, larger, smaller, almost maximize, maximize height, next display, previous display.

## Configuration

Edit `defaults.sh` to customize:

- `launchOnLogin` - Start on login
- `hideMenubarIcon` - Hide the menu bar icon
- `gapSize` - Gap between windows (pixels)
- `allowAnyShortcut` - `true`
- `alternateDefaultShortcuts` - `true`
- `subsequentExecutionMode` - `2`
- `landscapeSnapAreas` - Drag-to-snap areas for landscape displays
- `todo` - `2`
- Keyboard shortcuts via keyCode and modifierFlags
