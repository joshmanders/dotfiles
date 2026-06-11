# macOS Defaults

System preference tweaks applied via `defaults write`.

## Setup

```bash
bash macos/install.sh
```

## What's Configured

| Section         | What it does                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| Dock            | Auto-hide on, hover-reveal effectively disabled (the dock is "gone")                                         |
| Finder          | Column view default, path/status bars, new windows open to ~/Downloads, sort folders first, auto-empty Trash |
| Global          | Dark mode, always show extensions, reverse scroll, no double-click minimize, reduced Liquid Glass            |
| Screenshots     | PNG to ~/Downloads, no window shadow                                                                         |
| Menu Bar Clock  | Flash colons, always show date, hide day name                                                                |
| Trackpad        | Tap to click (built-in, Magic, login screen)                                                                 |
| Keyboard        | Faster key repeat, shorter delay, hold-to-repeat (no accent menu)                                            |
| Mission Control | Don't auto-rearrange Spaces, App Exposé gesture on                                                           |
| Software Update | Check daily, background download, auto-update App Store apps                                                 |
| Screenshot keys | Invert macOS defaults so Cmd+Shift+3/4 copy to clipboard, Cmd+Shift+5 saves a region to file                 |

Restarts `Dock`, `Finder`, `SystemUIServer`, and `cfprefsd` at the end so changes take effect immediately. Keyboard shortcut overrides require a logout/login to fully apply.

## Adding Settings

Edit `defaults.sh` and group new entries under a `# ===` header for the subsystem (Dock, Finder, Keyboard, etc.).

To find the right key for a setting, change it via System Settings, then run:

```bash
defaults read <domain>
```

Common domains: `com.apple.dock`, `com.apple.finder`, `NSGlobalDomain`, `com.apple.screencapture`, `com.apple.menuextra.clock`.
