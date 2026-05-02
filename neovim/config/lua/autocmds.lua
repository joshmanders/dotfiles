local augroup = vim.api.nvim_create_augroup
local autocmd = vim.api.nvim_create_autocmd

-- Highlight on yank
autocmd("TextYankPost", {
  group = augroup("highlight_yank", { clear = true }),
  callback = function()
    vim.hl.on_yank()
  end,
})

-- Remove trailing whitespace on save
autocmd("BufWritePre", {
  group = augroup("trim_whitespace", { clear = true }),
  pattern = "*",
  command = [[%s/\s\+$//e]],
})

-- Return to last edit position on file open
autocmd("BufReadPost", {
  group = augroup("last_position", { clear = true }),
  callback = function()
    local mark = vim.api.nvim_buf_get_mark(0, '"')
    local line_count = vim.api.nvim_buf_line_count(0)
    if mark[1] > 0 and mark[1] <= line_count then
      pcall(vim.api.nvim_win_set_cursor, 0, mark)
    end
  end,
})

-- Show diagnostics on cursor hold
autocmd("CursorHold", {
  group = augroup("diagnostic_float", { clear = true }),
  callback = function()
    vim.diagnostic.open_float({ scope = "cursor", focusable = false })
  end,
})

-- Register blade filetype for tree-sitter-blade
autocmd({ "BufRead", "BufNewFile" }, {
  group = augroup("blade_filetype", { clear = true }),
  pattern = "*.blade.php",
  callback = function()
    vim.bo.filetype = "blade"
  end,
})

-- Suppress neovim defaults.lua "Did not detect DSR response" warning.
-- Fired before user config loads, so we clear it right after UI attaches.
autocmd("UIEnter", {
  group = augroup("suppress_dsr_warning", { clear = true }),
  once = true,
  callback = function()
    local ok, msgs = pcall(vim.api.nvim_exec2, "messages", { output = true })
    if ok and msgs.output and msgs.output:find("DSR response", 1, true) then
      vim.cmd("messages clear")
      vim.cmd("redraw")
    end
  end,
})
