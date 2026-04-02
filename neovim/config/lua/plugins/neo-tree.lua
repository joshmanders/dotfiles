return {
  "nvim-neo-tree/neo-tree.nvim",
  branch = "v3.x",
  dependencies = {
    "nvim-lua/plenary.nvim",
    "nvim-tree/nvim-web-devicons",
    "MunifTanjim/nui.nvim",
  },
  lazy = false,
  opts = {
    filesystem = {
      follow_current_file = { enabled = true },
      filtered_items = {
        hide_dotfiles = false,
        hide_gitignored = false,
        never_show = { ".git" },
      },
    },
    window = {
      width = 35,
    },
  },
  init = function()
    vim.api.nvim_create_autocmd("VimEnter", {
      callback = function()
        vim.cmd("Neotree show")
      end,
    })
  end,
}
