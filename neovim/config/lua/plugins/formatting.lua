return {
  "stevearc/conform.nvim",
  event = "BufWritePre",
  opts = {
    formatters_by_ft = {
      php = { "pint" },
      javascript = { "prettier" },
      typescript = { "prettier" },
      javascriptreact = { "prettier" },
      typescriptreact = { "prettier" },
    },
    format_on_save = function(bufnr)
      local ft = vim.bo[bufnr].filetype
      local conform_fts = require("conform").formatters_by_ft

      -- Use conform for filetypes with configured formatters, LSP for the rest
      if conform_fts[ft] then
        return { timeout_ms = 3000, lsp_fallback = false }
      end

      vim.lsp.buf.format({ bufnr = bufnr, timeout_ms = 3000 })
      return false
    end,
  },
}
