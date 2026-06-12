return {
  "dmtrKovalenko/fff.nvim",
  tag = "v0.9.4",
  build = function()
    -- Downloads a prebuilt binary; falls back to cargo build if cargo is present.
    require("fff.download").download_or_build_binary()
  end,
  lazy = false,
  opts = {},
  keys = {
    { "<leader>p", function() require("fff").find_files() end, desc = "Find files" },
    { "<leader>P", function() require("fff").live_grep() end, desc = "Live grep" },
  },
}
