# macOS Defaults

System preference tweaks applied via `defaults write`, and power settings applied via `pmset`.

## Setup

```bash
bash macos/install.sh
```

## What's Configured

| Section          | What it does                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dock             | Auto-hide on, hover-reveal effectively disabled (the dock is "gone"), no animation, tiny icons, no recents or running-app dots, minimize into the app icon                                  |
| Finder           | Column view default, path/status bars, new windows open to ~/Downloads, sort folders first, auto-empty Trash                                                                                |
| Desktop / Tiling | No click-wallpaper-to-show-desktop, window tiling off, desktop items and hard disks hidden, Stage Manager off                                                                               |
| Global           | Dark mode, always show extensions, reverse scroll, no double-click minimize, reduced Liquid Glass, always tab documents, no wallpaper tinting, dark icons, scroll bars only while scrolling |
| Screenshots      | PNG to ~/Downloads, no window shadow                                                                                                                                                        |
| Menu Bar Clock   | Flash colons, always show date, hide day name, show day of month and AM/PM                                                                                                                  |
| Menu Bar         | Battery percentage shown; Sound, Wi-Fi, Bluetooth, Now Playing, and Display hidden                                                                                                          |
| Trackpad         | Tap to click (built-in, Magic, login screen)                                                                                                                                                |
| Keyboard         | Faster key repeat, shorter delay, hold-to-repeat (no accent menu), Fn/Globe key opens Emoji & Symbols                                                                                       |
| Mission Control  | Don't auto-rearrange Spaces, App Exposé gesture on                                                                                                                                          |
| Software Update  | Check daily, background download, auto-update App Store apps                                                                                                                                |
| Screenshot keys  | Invert macOS defaults so Cmd+Shift+3/4 copy to clipboard and Cmd+Opt+Shift+3/4 save to file; Cmd+Shift+5 opens the toolbar                                                                  |
| Power            | Display never sleeps on charger and sleeps after 30 minutes on battery (`install.sh` runs `sudo pmset -c` and `sudo pmset -b`)                                                              |
| Default browser  | Brave, when installed (`install.sh` runs `open -a "Brave Browser" --args --make-default-browser`)                                                                                           |

Restarts `Dock`, `Finder`, `SystemUIServer`, `ControlCenter`, and `cfprefsd` at the end so changes take effect immediately, then runs `activateSettings -u` so the keyboard shortcut overrides apply to the current login session.

## Adding Settings

Edit `defaults.sh` and group new entries under a `# ===` header for the subsystem (Dock, Finder, Keyboard, etc.).

To find the right key for a setting, change it via System Settings, then run:

```bash
defaults read <domain>
```

Common domains: `com.apple.dock`, `com.apple.finder`, `NSGlobalDomain`, `com.apple.screencapture`, `com.apple.menuextra.clock`, `com.apple.WindowManager`, `com.apple.controlcenter`.

Some settings are stored per host. Read those with `defaults -currentHost read <domain>` and write them with `defaults -currentHost write`.

Power settings live in `install.sh`, one `sudo pmset` step per power source (`-c` charger, `-b` battery). `pmset -g custom` prints the current values for each source. A failed step prints a warning and the installer carries on.
