# Neovim

Modern Neovim setup with LSP, completion, fuzzy finding, and format-on-save.

## Files

| File                      | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `config/init.lua`         | Entry point (symlinked to ~/.config/nvim)          |
| `config/lua/options.lua`  | Editor settings (tabs, search, splits, undo)       |
| `config/lua/keymaps.lua`  | Key mappings                                       |
| `config/lua/autocmds.lua` | Autocommands (yank highlight, trim whitespace)     |
| `config/lua/plugins/`     | Plugin specs (auto-discovered by lazy.nvim)         |
| `install.sh`              | Symlinks config directory                          |

## Installation

```bash
bash neovim/install.sh
```

Plugins are auto-installed on first `nvim` launch via lazy.nvim.

## Keybindings

Leader key is `Space`.

### General

| Binding          | Action                |
| ---------------- | --------------------- |
| `jk`             | Exit insert mode      |
| `Space w`        | Save file             |
| `Space q`        | Quit                  |
| `Ctrl+h/j/k/l`  | Navigate windows/tmux |
| `[b` / `]b`      | Previous/next buffer  |
| `Space x`        | Close buffer          |
| `Ctrl+d/u`       | Scroll down/up        |
| `Esc`            | Clear search          |

### Finding Things

| Binding          | Action         |
| ---------------- | -------------- |
| `Space ff`       | Find files     |
| `Space fg`       | Live grep      |
| `Space fb`       | Find buffers   |
| `Space fh`       | Help tags      |
| `Space fr`       | Recent files   |
| `Space ft`       | Find TODOs     |

### Code

| Binding          | Action             |
| ---------------- | ------------------ |
| `gd`             | Go to definition   |
| `gr`             | Go to references   |
| `gi`             | Go to impl         |
| `K`              | Hover docs         |
| `Space ca`       | Code action        |
| `Space rn`       | Rename symbol      |
| `Space D`        | Type definition    |
| `[d` / `]d`      | Previous/next diag |

### Git

| Binding          | Action         |
| ---------------- | -------------- |
| `]h` / `[h`      | Next/prev hunk |
| `Space hs`       | Stage hunk     |
| `Space hr`       | Reset hunk     |
| `Space hp`       | Preview hunk   |
| `Space hb`       | Blame line     |

### Tools

| Binding          | Action              |
| ---------------- | ------------------- |
| `Space e`        | Toggle file explorer|
| `Space u`        | Toggle undotree     |
| `Space lg`       | Open lazygit        |
| `J` / `K` (vis)  | Move selection      |

### Laravel (in PHP/Blade files)

| Binding          | Action           |
| ---------------- | ---------------- |
| `Space la`       | Artisan picker   |
| `Space lr`       | Routes picker    |
| `Space lm`       | Make picker      |
| `Space lc`       | Commands picker  |
| `Space lo`       | Resources picker |
| `Space lu`       | Artisan hub      |

## Plugins

| Plugin              | Purpose                                   |
| ------------------- | ----------------------------------------- |
| lazy.nvim           | Plugin manager (self-bootstraps)          |
| telescope.nvim      | Fuzzy finder                              |
| nvim-treesitter     | Syntax highlighting                       |
| tree-sitter-blade   | Blade template support                    |
| nvim-ts-autotag     | Auto-rename HTML/JSX tags                 |
| nvim-lspconfig      | LSP client                                |
| mason.nvim          | LSP server installer                      |
| blink.cmp           | Autocompletion                            |
| conform.nvim        | Format on save                            |
| nvim-lint           | Async linting (eslint_d)                  |
| neo-tree.nvim       | File explorer                             |
| github-nvim-theme   | GitHub Dark Default theme                 |
| lualine.nvim        | Status line                               |
| gitsigns.nvim       | Git gutter signs + blame                  |
| which-key.nvim      | Keybinding discovery (press Space, wait)  |
| Comment.nvim        | Toggle comments (`gcc` line, `gc` visual) |
| nvim-autopairs      | Auto-close brackets                       |
| vim-tmux-navigator  | Seamless tmux pane navigation             |
| undotree            | Undo history visualization                |
| todo-comments.nvim  | Highlight TODO/FIXME/NOTE                 |
| laravel.nvim        | Laravel artisan, routes, resources        |

## LSP Servers

Auto-installed via Mason on first launch:

- `lua_ls` — Lua
- `ts_ls` — TypeScript/JavaScript
- `gopls` — Go
- `intelephense` — PHP
- `rust_analyzer` — Rust
- `tailwindcss` — Tailwind CSS
- `astro` — Astro
- `volar` — Vue
- `yamlls` — YAML

## Configuration

- **Options:** Edit `config/lua/options.lua`
- **Keymaps:** Edit `config/lua/keymaps.lua`
- **Add a plugin:** Create a new file in `config/lua/plugins/` returning a lazy.nvim spec
- **Add an LSP server:** Add to the `servers` table in `config/lua/plugins/lsp.lua`
- **Add a formatter:** Add to `formatters_by_ft` in `config/lua/plugins/formatting.lua`
- **Add a linter:** Add to `linters_by_ft` in `config/lua/plugins/linting.lua`
