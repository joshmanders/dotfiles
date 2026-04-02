return {
  "adalessa/laravel.nvim",
  dependencies = {
    "MunifTanjim/nui.nvim",
    "nvim-lua/plenary.nvim",
    "nvim-neotest/nvim-nio",
  },
  event = { "BufReadPost composer.json" },
  cmd = "Laravel",
  keys = {
    { "<leader>la", function() Laravel.pickers.artisan() end, desc = "Laravel: Artisan" },
    { "<leader>lr", function() Laravel.pickers.routes() end, desc = "Laravel: Routes" },
    { "<leader>lm", function() Laravel.pickers.make() end, desc = "Laravel: Make" },
    { "<leader>lc", function() Laravel.pickers.commands() end, desc = "Laravel: Commands" },
    { "<leader>lo", function() Laravel.pickers.resources() end, desc = "Laravel: Resources" },
    { "<leader>lu", function() Laravel.commands.run("hub") end, desc = "Laravel: Hub" },
  },
  opts = {
    features = {
      pickers = {
        provider = "telescope",
      },
    },
  },
}
