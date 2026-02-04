# Primcloud Claude Config

Shared Claude skills and rules for all primcloud projects.

## Usage

Install shared config into a project:

```bash
./install.sh ~/Code/primcloud/platform
./install.sh ~/Code/primcloud/ingress
./install.sh ~/Code/primcloud/builder
./install.sh ~/Code/primcloud/agent
```

## What's Here

- `install.sh` — Symlinks shared config into projects
- `skills/` — Shared skills (symlinked into each project's `.claude/skills/`)

## Skills

| Skill            | Description                                       |
| ---------------- | ------------------------------------------------- |
| `github-project` | Primcloud project board config, IDs, and commands |
