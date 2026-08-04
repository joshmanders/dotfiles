-- The buffer the last single click put on screen.
local previewed

-- Retiring a preview reads 'modified' at the moment it happens, so an edit from
-- any source -- typing, an LSP formatter, another plugin -- keeps the buffer.
local retire = function(bufnr)
  if not bufnr or bufnr == previewed then return end
  if not vim.api.nvim_buf_is_valid(bufnr) then return end
  if vim.bo[bufnr].modified or #vim.fn.win_findbuf(bufnr) > 0 then return end
  vim.api.nvim_buf_delete(bufnr, {})
end

-- Single click: show the file without keeping it around. Focus stays in the
-- tree so the next click replaces the preview instead of opening a new buffer.
local preview = function(state)
  local ok, node = pcall(state.tree.get_node, state.tree)
  if not (ok and node) then return end

  if node.type ~= "file" then
    require("neo-tree.sources.filesystem").toggle_directory(state, node)
    return
  end

  local tree_win = vim.api.nvim_get_current_win()
  local outgoing = previewed
  require("neo-tree.utils").open_file(state, node.path or node:get_id())

  if vim.api.nvim_get_current_win() == tree_win then return end

  previewed = vim.api.nvim_get_current_buf()
  retire(outgoing)

  vim.api.nvim_set_current_win(tree_win)
end

-- The window a double click opened, waiting for the click to finish.
local pinned_win

-- Double click: keep the file open for good, and take focus with it.
local pin = function(state)
  local ok, node = pcall(state.tree.get_node, state.tree)
  if not (ok and node) then return end

  -- <LeftRelease> fires on the first half of a double click, so the preview
  -- handler already toggled this directory. Toggling again would undo it.
  if node.type ~= "file" then return end

  local tree_win = vim.api.nvim_get_current_win()
  require("neo-tree.utils").open_file(state, node.path or node:get_id())

  local file_win = vim.api.nvim_get_current_win()
  if file_win == tree_win then return end

  if vim.api.nvim_get_current_buf() == previewed then previewed = nil end

  -- The click still has a <2-LeftRelease> to come. Holding focus in the tree
  -- keeps that event out of the file window, where it would select a word.
  vim.api.nvim_set_current_win(tree_win)
  pinned_win = file_win
end

-- End of a double click: the tree consumes the event, so Vim's default word
-- selection never runs, and the file the click opened takes focus.
local settle = function()
  local win = pinned_win
  pinned_win = nil
  if win and vim.api.nvim_win_is_valid(win) then
    vim.api.nvim_set_current_win(win)
  end
end

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
      hijack_netrw_behavior = "disabled",
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
        ["<LeftRelease>"] = preview,
        ["<2-LeftMouse>"] = pin,
        ["<2-LeftRelease>"] = settle,
        ["<2-LeftDrag>"] = settle,
      },
    },
  },
}
