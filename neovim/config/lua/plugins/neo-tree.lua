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
    source_selector = {
      truncation_character = "",
    },
    default_component_configs = {
      name = {
        root_folder_formatter = function(path)
          local parts = vim.split(path, "/")
          if #parts >= 2 then
            return parts[#parts - 1] .. "/" .. parts[#parts]
          end
          return parts[#parts]
        end,
      },
    },
    filesystem = {
      use_libuv_file_watcher = true,
      follow_current_file = { enabled = true },
      filtered_items = {
        hide_dotfiles = false,
        hide_gitignored = false,
        never_show = { ".git" },
      },
    },
    window = {
      width = 30,
      mappings = {
        ["<leader>n"] = "add",
      },
    },
  },
  init = function()
    vim.api.nvim_create_autocmd("VimEnter", {
      callback = function()
        vim.cmd("Neotree show")
        vim.cmd("wincmd p")
      end,
    })
  end,
}
