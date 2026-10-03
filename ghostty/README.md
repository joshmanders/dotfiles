# Ghostty Configuration

Ghostty terminal emulator configuration.

## Setup

```bash
bash ghostty/install.sh
```

Symlinks `config` to `~/.config/ghostty/config`. It skips when `/Applications/Ghostty.app` is not installed.

## Configuration

Edit `config` to customize:

- `background` - Background color
- `font-family` - Font (requires Nerd Font for powerline)
- `font-size` - Font size
- `adjust-cell-height` - Line height (percentage)
- `keybind` - Custom keybindings
- `macos-option-as-alt` - Treat Option as Alt
- `window-new-tab-position` - Where new tabs open
- `tab-inherit-working-directory` - Whether new tabs start in the current tab's directory
