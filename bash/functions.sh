#!/usr/bin/env bash
#
# functions.sh - Shell functions
#
# Interactive-only helper functions. Sourced by bashrc.

# Confirm before exiting an interactive tmux pane. A reflexive `exit` closes the
# pane — dropping its layout and scrollback with no undo — so add a y/N guard.
# Only the typed `exit` command is intercepted; scripts and subshells keep the
# real builtin because the function isn't exported.
exit() {
    if [[ -n "$TMUX" && $- == *i* && -t 0 ]]; then
        local _ans
        read -r -p "Exit pane? (y/N) " _ans
        [[ "$_ans" == [Yy]* ]] || return 0
    fi
    builtin exit "$@"
}
