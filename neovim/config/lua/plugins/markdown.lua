return {
  -- Inline markdown rendering in-buffer
  {
    "MeanderingProgrammer/render-markdown.nvim",
    dependencies = { "nvim-treesitter/nvim-treesitter", "nvim-tree/nvim-web-devicons" },
    ft = { "markdown" },
    opts = {
      on = {
        attach = function()
          vim.wo.wrap = true
          vim.wo.linebreak = true
        end,
      },
    },
  },
}
