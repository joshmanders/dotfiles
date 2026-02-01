# Fish Shell (Alternative)

Fish shell configuration. This is an alternative to the bash setup and is **not run by the main installer**.

## Usage

If you prefer fish over bash:

```bash
bash fish/install.sh
```

## Files

- `config.fish` - Fish configuration (aliases, environment, etc.)
- `fishfile` - Fisher plugins list

## Plugins

Managed via [Fisher](https://github.com/jorgebucaran/fisher). The fishfile includes:

- `bobthefish` - Powerline-style prompt
- Other utilities

## Note

The main installer sets up bash with fish-like features (syntax highlighting, autosuggestions via ble.sh). This fish setup is kept as an alternative for those who prefer the real thing.
