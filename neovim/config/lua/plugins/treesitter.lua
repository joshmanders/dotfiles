return {
  {
    "nvim-treesitter/nvim-treesitter",
    branch = "main",
    lazy = false,
    build = ":TSUpdate",
    config = function()
      -- Register blade parser
      local parsers = require("nvim-treesitter.parsers")
      parsers.blade = {
        install_info = {
          url = "https://github.com/EmranMR/tree-sitter-blade",
          branch = "main",
        },
      }
      vim.treesitter.language.register("blade", "blade")

      -- Ensure parsers are installed
      local ensure_installed = {
        "bash",
        "blade",
        "css",
        "diff",
        "dockerfile",
        "go",
        "html",
        "javascript",
        "json",
        "lua",
        "markdown",
        "markdown_inline",
        "php",
        "python",
        "rust",
        "sql",
        "toml",
        "tsx",
        "typescript",
        "vue",
        "yaml",
      }
      local installed = require("nvim-treesitter.config").get_installed()
      local to_install = vim.iter(ensure_installed)
        :filter(function(parser)
          return not vim.tbl_contains(installed, parser)
        end)
        :totable()
      if #to_install > 0 then
        require("nvim-treesitter").install(to_install)
      end

      -- Enable highlighting and indentation
      vim.api.nvim_create_autocmd("FileType", {
        callback = function()
          pcall(vim.treesitter.start)
          vim.bo.indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
        end,
      })
    end,
  },
  {
    "windwp/nvim-ts-autotag",
    event = { "BufReadPost", "BufNewFile" },
    opts = {},
  },
}
