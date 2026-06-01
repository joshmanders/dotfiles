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

  -- Seamless tmux/neovim pane navigation.
  -- Disable the plugin's default mappings — its terminal-mode tnoremaps use
  -- `<C-w>:` (Vim's terminal escape), which doesn't escape in Neovim, so the
  -- RHS leaks as literal input to focused terminal apps (e.g. lazygit).
  {
    "christoomey/vim-tmux-navigator",
    init = function()
      vim.g.tmux_navigator_no_mappings = 1
    end,
    cmd = {
      "TmuxNavigateLeft",
      "TmuxNavigateDown",
      "TmuxNavigateUp",
      "TmuxNavigateRight",
      "TmuxNavigatePrevious",
    },
    keys = {
      { "<C-h>", "<cmd>TmuxNavigateLeft<cr>", desc = "Navigate left (window/tmux pane)" },
      { "<C-j>", "<cmd>TmuxNavigateDown<cr>", desc = "Navigate down (window/tmux pane)" },
      { "<C-k>", "<cmd>TmuxNavigateUp<cr>", desc = "Navigate up (window/tmux pane)" },
      { "<C-l>", "<cmd>TmuxNavigateRight<cr>", desc = "Navigate right (window/tmux pane)" },
    },
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
