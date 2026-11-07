-- Rex configuration, symlinked to ~/.config/rex/init.lua.
-- Apply changes with `rex config reload`.

local terminal = "com.superlogical.terminal"

-- A failed rex call returns nil, err instead of raising; raise so the action
-- fails and reports why rather than silently doing nothing.
local function call(method, args)
  local result, err = rex.block.call(terminal, method, args)
  if err ~= nil then error(err, 0) end
  return result
end

-- Claude Code keeps its own transcript, so clearing the terminal under it
-- does nothing useful; ask Claude to clear its context instead.
rex.action{
  name  = "smart_clear",
  title = "Clear Screen and Scrollback",
  description = "Sends /clear in Claude Code panes; otherwise clears screen and scrollback.",
  run   = function(ctx, args)
    local fg = call("process", { block_id = ctx.block_id }).foreground

    if fg and fg.name == "claude" then
      call("write", { block_id = ctx.block_id, data = "/clear\r" })
    else
      call("clear", { block_id = ctx.block_id })
    end
  end,
}

-- Cmd+K is Rex's session switcher, so clearing takes Shift+Cmd+K.
rex.bind("shift+cmd+k", "smart_clear")
