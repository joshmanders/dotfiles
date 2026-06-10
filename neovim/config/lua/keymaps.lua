local map = vim.keymap.set

-- Exit insert mode
map("i", "jk", "<Esc>", { desc = "Exit insert mode" })

-- Ctrl+Click: go to definition, or references if already at definition
map("n", "<C-LeftMouse>", function()
  vim.cmd("normal! \\<LeftMouse>")
  local cursor = vim.api.nvim_win_get_cursor(0)
  local params = vim.lsp.util.make_position_params(0)
  vim.lsp.buf_request(0, "textDocument/definition", params, function(_, result)
    if not result or vim.tbl_isempty(result) then
      vim.lsp.buf.references()
      return
    end
    local target = result[1] or result
    local target_uri = target.targetUri or target.uri
    local target_range = target.targetRange or target.range
    local current_uri = vim.uri_from_bufnr(0)
    if target_uri == current_uri and target_range.start.line == cursor[1] - 1 then
      vim.lsp.buf.references()
    else
      vim.lsp.buf.definition()
    end
  end)
end, { desc = "Go to definition/references" })

-- Save & quit
map("n", "<leader>s", "<cmd>silent w<cr>", { desc = "Save file" })
map("n", "<leader>q", "<cmd>qa<cr>", { desc = "Quit all" })

-- New file relative to project root
map("n", "<leader>n", function()
  vim.ui.input({ prompt = "New file: " }, function(name)
    if not name or name == "" then return end
    local path = vim.fn.getcwd() .. "/" .. name
    vim.fn.mkdir(vim.fn.fnamemodify(path, ":h"), "p")
    vim.cmd("edit " .. vim.fn.fnameescape(path))
  end)
end, { desc = "New file" })

-- Buffer navigation
map("n", "[b", "<cmd>bprevious<cr>", { desc = "Previous buffer" })
map("n", "]b", "<cmd>bnext<cr>", { desc = "Next buffer" })
map("n", "<leader>w", function()
  local cur = vim.api.nvim_get_current_buf()
  if vim.bo[cur].modified then
    vim.ui.select({ "Save", "Discard", "Cancel" }, { prompt = "Unsaved changes:" }, function(choice)
      if not choice or choice == "Cancel" then return end
      if choice == "Save" then vim.cmd("write") end
      local bufs = vim.tbl_filter(function(b) return vim.bo[b].buflisted end, vim.api.nvim_list_bufs())
      if #bufs <= 1 then vim.cmd("enew") else vim.cmd("bprevious") end
      vim.api.nvim_buf_delete(cur, { force = true })
    end)
  else
    local bufs = vim.tbl_filter(function(b) return vim.bo[b].buflisted end, vim.api.nvim_list_bufs())
    if #bufs <= 1 then vim.cmd("enew") else vim.cmd("bprevious") end
    vim.api.nvim_buf_delete(cur, { force = false })
  end
end, { desc = "Close buffer" })

map("n", "<leader>W", function()
  local bufs = vim.tbl_filter(function(b) return vim.bo[b].buflisted end, vim.api.nvim_list_bufs())
  local has_modified = false
  for _, b in ipairs(bufs) do
    if vim.bo[b].modified then has_modified = true; break end
  end

  local function close_all(force)
    vim.cmd("enew")
    for _, b in ipairs(bufs) do
      if vim.api.nvim_buf_is_valid(b) then
        vim.api.nvim_buf_delete(b, { force = force })
      end
    end
  end

  if has_modified then
    vim.ui.select({ "Save all", "Discard all", "Cancel" }, { prompt = "Unsaved changes:" }, function(choice)
      if not choice or choice == "Cancel" then return end
      if choice == "Save all" then vim.cmd("wall") end
      close_all(true)
    end)
  else
    close_all(false)
  end
end, { desc = "Close all buffers" })

-- Move lines in visual mode
map("v", "J", ":m '>+1<cr>gv=gv", { desc = "Move selection down" })
map("v", "K", ":m '<-2<cr>gv=gv", { desc = "Move selection up" })

-- Keep cursor centered when scrolling
map("n", "<C-d>", "<C-d>zz")
map("n", "<C-u>", "<C-u>zz")

-- Keep cursor centered when searching
map("n", "n", "nzzzv")
map("n", "N", "Nzzzv")

-- Clear search highlight
map("n", "<Esc>", "<cmd>nohlsearch<cr>", { desc = "Clear search highlight" })

-- File explorer
map("n", "<leader>e", "<cmd>Neotree toggle<cr>", { desc = "Toggle file explorer" })

-- Telescope
map("n", "<leader>p", "<cmd>Telescope find_files<cr>", { desc = "Find files" })

-- Quickfix list
map("n", "]q", "<cmd>cnext<cr>zz", { desc = "Next quickfix item" })
map("n", "[q", "<cmd>cprev<cr>zz", { desc = "Previous quickfix item" })
map("n", "<leader>co", "<cmd>copen<cr>", { desc = "Open quickfix list" })
map("n", "<leader>cc", "<cmd>cclose<cr>", { desc = "Close quickfix list" })

-- Undotree
map("n", "<leader>u", "<cmd>UndotreeToggle<cr>", { desc = "Toggle undotree" })

-- Lazygit
vim.api.nvim_create_user_command("Lazygit", function()
  local buf = vim.api.nvim_create_buf(false, true)
  local width = math.floor(vim.o.columns * 0.9)
  local height = math.floor(vim.o.lines * 0.9)
  vim.api.nvim_open_win(buf, true, {
    relative = "editor",
    width = width,
    height = height,
    col = math.floor((vim.o.columns - width) / 2),
    row = math.floor((vim.o.lines - height) / 2),
    style = "minimal",
    border = "rounded",
  })
  vim.fn.termopen("lazygit", {
    on_exit = function()
      vim.api.nvim_buf_delete(buf, { force = true })
    end,
  })
  vim.cmd("startinsert")
end, {})
map("n", "<leader>g", "<cmd>Lazygit<cr>", { desc = "Open lazygit" })
