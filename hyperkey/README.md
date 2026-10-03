# Hyperkey Configuration

Remap Caps Lock to Hyper key (Ctrl+Option+Cmd).

## Setup

```bash
bash hyperkey/install.sh
```

## Features

- Holding Caps Lock acts as Hyper key (Ctrl+Option+Cmd)
- `hyperFlags` 1835008 is Ctrl+Option+Cmd; Shift is not part of it
- Quick tap sends Escape (configurable)
- Enables powerful keyboard shortcuts without conflicts

## Configuration

Edit `defaults.sh` to customize:

- `executeQuickHyperKey` - Quick tap behavior (Escape)
- `launchOnLogin` - Start on login
