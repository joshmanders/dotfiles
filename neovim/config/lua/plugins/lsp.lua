return {
  -- Completion
  {
    "saghen/blink.cmp",
    version = "1.*",
    dependencies = { "rafamadriz/friendly-snippets" },
    opts = {
      keymap = { preset = "super-tab" },
      appearance = { nerd_font_variant = "mono" },
      completion = { documentation = { auto_show = true } },
      sources = {
        default = { "lsp", "path", "snippets", "buffer" },
      },
      fuzzy = { implementation = "prefer_rust_with_warning" },
    },
    opts_extend = { "sources.default" },
  },

  -- Mason + mason-lspconfig (auto-install and enable LSP servers)
  {
    "mason-org/mason-lspconfig.nvim",
    dependencies = {
      { "mason-org/mason.nvim", opts = {} },
      "neovim/nvim-lspconfig",
      "saghen/blink.cmp",
    },
    opts = {
      ensure_installed = {
        "lua_ls",
        "ts_ls",
        "gopls",
        "intelephense",
        "rust_analyzer",
        "tailwindcss",
        "astro",
        "vue_ls",
        "yamlls",
      },
      automatic_enable = true,
    },
    config = function(_, opts)
      -- Set blink.cmp capabilities for all LSP servers
      vim.lsp.config("*", {
        capabilities = require("blink.cmp").get_lsp_capabilities(),
      })

      -- Per-server configuration
      vim.lsp.config("lua_ls", {
        settings = {
          Lua = {
            workspace = { checkThirdParty = false },
            telemetry = { enable = false },
          },
        },
      })

      -- Intelephense ignores any document whose languageId isn't "php", so blade
      -- buffers need both the filetype and the language id remapped to get PHP
      -- intelligence inside their <?php ?> blocks.
      vim.lsp.config("intelephense", {
        filetypes = { "php", "blade" },
        get_language_id = function(_, ft)
          return ft == "blade" and "php" or ft
        end,
      })

      -- Laravel LSP, installed via composer rather than Mason. Framework awareness
      -- only (routes, config keys, views, translations), so it layers on top of
      -- intelephense instead of competing with it. The server refuses to initialize
      -- without a workspace root, so leave it unstarted when there's no artisan
      -- above the file rather than letting it error out.
      vim.lsp.config("laravel_lsp", {
        cmd = { "laravel-lsp" },
        filetypes = { "php", "blade" },
        root_dir = function(bufnr, on_dir)
          local start = vim.fs.dirname(vim.api.nvim_buf_get_name(bufnr))
          local artisan = vim.fs.find("artisan", { path = start, upward = true })[1]
          if artisan then
            on_dir(vim.fs.dirname(artisan))
          end
        end,
      })
      vim.lsp.enable("laravel_lsp")

      require("mason-lspconfig").setup(opts)

      -- LSP keymaps (attach on LSP connect)
      vim.api.nvim_create_autocmd("LspAttach", {
        callback = function(event)
          -- Show LSP colors as inline colored square instead of background
          vim.lsp.document_color.enable(true, { buf = event.buf }, { style = "■" })

          local map = function(keys, func, desc)
            vim.keymap.set("n", keys, func, { buffer = event.buf, desc = desc })
          end

          map("gd", vim.lsp.buf.definition, "Go to definition")
          map("gr", vim.lsp.buf.references, "Go to references")
          map("gi", vim.lsp.buf.implementation, "Go to implementation")
          map("K", vim.lsp.buf.hover, "Hover documentation")
          map("<leader>.", vim.lsp.buf.code_action, "Code action")
          map("<leader>rn", vim.lsp.buf.rename, "Rename symbol")
          map("<leader>D", vim.lsp.buf.type_definition, "Type definition")
          map("[d", function() vim.diagnostic.jump({ count = -1 }) end, "Previous diagnostic")
          map("]d", function() vim.diagnostic.jump({ count = 1 }) end, "Next diagnostic")
        end,
      })
    end,
  },
}
