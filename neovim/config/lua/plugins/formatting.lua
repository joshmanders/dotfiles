-- Format on save via LSP
-- Formatter changes (e.g. switching to oxfmt) are handled by the LSP server,
-- not this config. Just ensure your LSP supports formatting.
vim.api.nvim_create_autocmd("BufWritePre", {
  callback = function()
    vim.lsp.buf.format({ timeout_ms = 3000 })
  end,
})

return {}
