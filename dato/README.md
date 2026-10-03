# Dato Configuration

Preferences for Dato, the menu bar calendar.

## Files

| File          | Purpose                                            |
| ------------- | -------------------------------------------------- |
| `install.sh`  | Runs `defaults.sh` and adds the Dato login item    |
| `defaults.sh` | Writes the preferences to `com.sindresorhus.Dato`  |

## Setup

```bash
bash dato/install.sh
```

Dato itself comes from `homebrew/bundle` (Mac App Store, via `mas`). The installer skips when `/Applications/Dato.app` is missing. Restart Dato for changes to take effect.

## Configuration

| Key                                | Type    | Value                  |
| ---------------------------------- | ------- | ---------------------- |
| `iconInMenuBar`                    | string  | `remainingEventsToday` |
| `upcomingEventInMenuBar_isEnabled` | boolean | `true`                 |
| `showDateInMenuBar`                | boolean | `false`                |
| `showTimeInMenuBar`                | boolean | `false`                |

`defaults.sh` writes no calendar or reminder list selection (`enabledCalendars`, `enabledRemindersLists`, `upcomingEventInMenuBarCalendars`, `notifyForVideoCalls_calendars`); choose those in Dato's settings.

## Launch at Login

Dato starts at login. The installer adds `/Applications/Dato.app` to the login items through System Events, not hidden, and skips the step when a login item with that path exists. When the step fails the installer prints a warning and carries on.

## Customization

Edit `defaults.sh`. Read the current values with `defaults read com.sindresorhus.Dato` and a key's type with `defaults read-type com.sindresorhus.Dato <key>`.
