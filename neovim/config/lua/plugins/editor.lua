return {
  -- Keybinding discovery
  {
    "folke/which-key.nvim",
    event = "VeryLazy",
    opts = {},
  },

  -- Toggle comments
  {
    "numToStr/Comment.nvim",
    event = { "BufReadPost", "BufNewFile" },
    opts = {},
  },

  -- Auto-close brackets
  {
    "windwp/nvim-autopairs",
    event = "InsertEnter",
    opts = {},
  },

  -- Seamless tmux/neovim pane navigation
  {
    "christoomey/vim-tmux-navigator",
    event = "VeryLazy",
  },

  -- Undo history visualization
  {
    "mbbill/undotree",
    cmd = "UndotreeToggle",
  },

  -- Session persistence (restore buffers on restart)
  {
    "folke/persistence.nvim",
    event = "BufReadPre",
    opts = {},
    keys = {
      { "<leader>rs", function() require("persistence").load() end, desc = "Restore session" },
    },
  },

  -- Highlight TODO/FIXME/NOTE comments
  {
    "folke/todo-comments.nvim",
    dependencies = { "nvim-lua/plenary.nvim" },
    event = { "BufReadPost", "BufNewFile" },
    opts = {},
  },
}
