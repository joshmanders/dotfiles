# Primcloud Claude Config

Shared Claude skills and rules for all primcloud projects.

## Usage

Install shared config into a project:

```bash
./install.sh                           # All projects
./install.sh platform                  # Single project
./install.sh platform,agent            # Multiple projects
```

Projects: `platform`, `agent`, `ingress`, `builder`, `placeholder`

## Configuration

| Variable               | Default              | Description              |
| ---------------------- | -------------------- | ------------------------ |
| `DOTFILES_PRIMCLOUD_DIR` | `~/Code/primcloud` | Path to primcloud repos  |

## What's Here

- `install.sh` — Symlinks shared config into projects
- `skills/` — Shared skills (symlinked into each project's `.claude/skills/`)

## Skills

| Skill            | Description                                       |
| ---------------- | ------------------------------------------------- |
| `github-project` | Primcloud project board config, IDs, and commands |
