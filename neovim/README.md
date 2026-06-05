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

### Dependencies

Install via Homebrew (included in `homebrew/bundle`):

- `tree-sitter-cli` — required by nvim-treesitter to compile parsers
- `fd` — file finder for Telescope
- `ripgrep` — content search for Telescope

## Keybindings

`<leader>` is `Space`.

### General

| Binding            | Action                |
| ------------------ | --------------------- |
| `jk`               | Exit insert mode      |
| `<leader>s`        | Save file             |
| `<leader>w`        | Close buffer          |
| `<leader>q`        | Quit all              |
| `Ctrl+h/j/k/l`    | Navigate windows/tmux |
| `[b` / `]b`        | Previous/next buffer  |
| `Ctrl+d/u`         | Scroll down/up        |
| `Esc`              | Clear search          |

### Finding Things

| Binding            | Action         |
| ------------------ | -------------- |
| `<leader>p`        | Find files     |

### Code

| Binding            | Action             |
| ------------------ | ------------------ |
| `Ctrl+Click`       | Go to definition/references |
| `K`                | Hover docs         |
| `<leader>ca`       | Code action        |
| `<leader>rn`       | Rename symbol      |
| `<leader>D`        | Type definition    |
| `[d` / `]d`        | Previous/next diag |

### Git

| Binding            | Action         |
| ------------------ | -------------- |
| `]h` / `[h`        | Next/prev hunk |
| `<leader>hs`       | Stage hunk     |
| `<leader>hr`       | Reset hunk     |
| `<leader>hp`       | Preview hunk   |
| `<leader>hb`       | Blame line     |

### Tools

| Binding            | Action               |
| ------------------ | -------------------- |
| `<leader>e`        | Toggle file explorer |
| `<leader>u`        | Toggle undotree      |
| `<leader>lg`       | Open lazygit         |
| `J` / `K` (vis)    | Move selection       |

### Laravel (in PHP/Blade files)

| Binding            | Action           |
| ------------------ | ---------------- |
| `<leader>la`       | Artisan picker   |
| `<leader>lr`       | Routes picker    |
| `<leader>lm`       | Make picker      |
| `<leader>lc`       | Commands picker  |
| `<leader>lo`       | Resources picker |
| `<leader>lu`       | Artisan hub      |

## Features

- **Diagnostics on hover** — floating diagnostic message shown automatically when cursor rests on a warning/error
- **Inline color swatches** — LSP color values (e.g. Tailwind classes) shown as colored `■` icons instead of background highlighting

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
| render-markdown.nvim| Inline markdown rendering                 |
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
- `vue_ls` — Vue
- `yamlls` — YAML

## Configuration

- **Options:** Edit `config/lua/options.lua`
- **Keymaps:** Edit `config/lua/keymaps.lua`
- **Add a plugin:** Create a new file in `config/lua/plugins/` returning a lazy.nvim spec
- **Add an LSP server:** Add to the `ensure_installed` table in `config/lua/plugins/lsp.lua`
- **Add a linter:** Add to `linters_by_ft` in `config/lua/plugins/linting.lua`
