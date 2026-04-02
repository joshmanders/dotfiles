return {
  "mfussenegger/nvim-lint",
  event = { "BufReadPost", "BufNewFile" },
  config = function()
    local lint = require("lint")

    lint.linters_by_ft = {
      javascript = { "eslint_d" },
      typescript = { "eslint_d" },
      javascriptreact = { "eslint_d" },
      typescriptreact = { "eslint_d" },
      vue = { "eslint_d" },
      astro = { "eslint_d" },
    }

    vim.api.nvim_create_autocmd({ "BufWritePost", "InsertLeave" }, {
      group = vim.api.nvim_create_augroup("nvim_lint", { clear = true }),
      callback = function()
        -- Only lint if the linter is available
        local linters = lint.linters_by_ft[vim.bo.filetype]
        if not linters then return end
        for _, name in ipairs(linters) do
          if vim.fn.executable(name) == 1 then
            lint.try_lint()
            return
          end
        end
      end,
    })
  end,
}
