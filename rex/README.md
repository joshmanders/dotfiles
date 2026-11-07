# Rex

[Rex](https://www.superlogical.com/rex) terminal multiplexer configuration.

## Files

| File          | Description                                        |
| ------------- | -------------------------------------------------- |
| `init.lua`    | Config (symlinked to ~/.config/rex/init.lua)       |
| `defaults.sh` | App preferences, written to `com.superlogical.rex` |
| `install.sh`  | Symlinks config, runs `defaults.sh`                |

## Installation

Install Rex for Mac from [superlogical.com/rex](https://www.superlogical.com/rex/docs/installation); it isn't in Homebrew. Then:

```bash
bash rex/install.sh
```

The installer skips when `/Applications/Rex Beta.app` isn't present.

The `rex` CLI ships inside the app. Rex puts it on `PATH` in every terminal it opens, and `bash/path.sh` keeps it there, so `rex` works inside Rex but not in other terminals.

## Configuration

`init.lua` is Lua, read by the Rex server. It defines one custom action and its binding:

| Binding       | Action                                                          |
| ------------- | --------------------------------------------------------------- |
| `Shift+Cmd+K` | Clear screen + scrollback (sends `/clear` in Claude Code panes) |

### App preferences

Rex for Mac keeps its Settings window values in the `com.superlogical.rex` defaults domain, not in a file, so `defaults.sh` writes them with `defaults write`. It carries only settings that belong on every machine:

- `Workspace.*` keys: light and dark themes (`merino-light`, `merino-dark`), terminal font size, pane, tab and app icon settings
- `rex.agents.*`, `rex.client.*` and `rex.server.*` behavior keys
- Sparkle's `SUEnableAutomaticChecks` and `SUAutomaticallyUpdate`

Window frames, the last focused session, the cached server route, onboarding, sync servers, sync migration and Sparkle's own bookkeeping are per-machine state and stay out.

## Customization

Edit `init.lua`, then check and apply it from a Rex terminal:

```bash
rex config check    # validate without applying
rex config reload   # make the running server read it again
```

Rex doesn't watch the file, so changes take effect only after `rex config reload`. See the [configuration docs](https://www.superlogical.com/rex/docs/customize/config) and the [Lua API reference](https://www.superlogical.com/rex/docs/reference/lua).

To change an app preference, change it in Rex's Settings window, read the new value with `defaults read com.superlogical.rex <key>`, and update `defaults.sh` to match. The [Mac Settings reference](https://www.superlogical.com/rex/docs/reference/mac-settings) describes each setting.
