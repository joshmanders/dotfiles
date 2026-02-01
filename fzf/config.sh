#!/usr/bin/env bash
#
# fzf/config.sh - fzf fuzzy finder configuration

export FZF_DEFAULT_OPTS="
  --height=40%
  --layout=reverse
  --border=rounded
  --info=inline
  --color=dark
  --color=fg:-1,bg:-1,hl:#5fff87
  --color=fg+:#ffffff,bg+:#4d4d4d,hl+:#5fff87
  --color=info:#afaf87,prompt:#d7005f,pointer:#af5fff
  --color=marker:#87ff00,spinner:#af5fff,header:#87afaf
"

# Use fd if available (faster than find)
if command -v fd &>/dev/null; then
    export FZF_DEFAULT_COMMAND='fd --type f --hidden --follow --exclude .git'
    export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"
fi
