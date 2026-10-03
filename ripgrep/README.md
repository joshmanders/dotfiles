# ripgrep Configuration

Fast recursive search tool (rg).

## Setup

```bash
bash ripgrep/install.sh
```

## Files

| File     | Used via                                              | Purpose                                    |
| -------- | ----------------------------------------------------- | ------------------------------------------ |
| `config` | `RIPGREP_CONFIG_PATH` (exported by `bash/exports.sh`) | ripgrep CLI flags (rg only)                |
| `ignore` | `~/.ignore` symlink                                   | Global filesystem ignore (rg, fd, **fff**) |

`rg` reads `config` straight from the repo through `RIPGREP_CONFIG_PATH`; the installer links only `ignore`.

## Configuration

Edit `config` to customize the `rg` CLI:

- `--smart-case` - Case-insensitive unless uppercase used
- `--follow` - Follow symlinks
- `--glob=!pattern` - Ignore patterns (node_modules, vendor, etc.)
- `--colors` - Output colors

## Global ignore (`~/.ignore`)

`config` flags only affect the `rg` command. Tools that walk the filesystem via the `ignore` crate — `rg`, `fd`, and fff (the Neovim picker) — also read `.ignore` files, which rank **above** `.gitignore`.

Edit `ignore` to re-include gitignored files without disabling the rest of `.gitignore`:

- `!.env` / `!.env.*` - surface env files in fff (`<leader>p`) even though projects gitignore them
