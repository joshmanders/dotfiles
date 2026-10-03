#!/usr/bin/env bash
#
# sudo.sh - Ask for sudo once and keep it alive for the whole run
#
# This script provides the `hold_sudo` function. The main install.sh calls it
# before the first module so steps that need root don't stop to prompt.
# Modules never depend on it: they call `sudo` themselves, and when a module
# runs on its own sudo simply prompts.
#
# Usage:
#   hold_sudo
#
# Behavior:
#   - Non-interactive without DOTFILES_ALLOW: does nothing (no command runs)
#   - Credentials already cached (`sudo -n true` succeeds): no prompt
#   - Otherwise: explains why, then prompts with `sudo -v`
#   - Prompt fails or is cancelled: prints a warning and returns 0, so steps
#     that need root prompt or fail on their own
#   - On success: a background loop runs `sudo -n -v` every 60 seconds (sudo
#     caches credentials for 5 minutes by default). It never prompts, stops
#     when the calling script exits, and is killed by an EXIT trap.
#
# Environment variables:
#   DOTFILES_NON_INTERACTIVE  If set, only hold sudo when DOTFILES_ALLOW is set
#   DOTFILES_ALLOW            If set with non-interactive, commands will run
#
# Examples:
#   hold_sudo    # called once from the main install.sh

hold_sudo() {
    # Same rule as `run`: non-interactive without --allow skips every command,
    # so nothing will need root
    if [[ -n "${DOTFILES_NON_INTERACTIVE:-}" && -z "${DOTFILES_ALLOW:-}" ]]; then
        return 0
    fi

    if ! sudo -n true 2>/dev/null; then
        echo "Some steps need administrator rights (system files, services, trusting the local CA)."
        echo "Enter your password once; it is kept alive until the installer finishes."

        if ! sudo -v; then
            echo "Warning: sudo was not granted; steps that need it will ask again or fail" >&2
            return 0
        fi
    fi

    local nap
    (
        trap 'kill "$nap" 2>/dev/null; exit 0' TERM

        # $$ is the calling script, so the loop ends with it even if the
        # EXIT trap below gets replaced
        while kill -0 "$$" 2>/dev/null; do
            # -v is the documented way to extend the timestamp; -n keeps it
            # from prompting once the credentials have lapsed
            sudo -n -v &>/dev/null || true
            # Backgrounded so TERM is handled at once instead of after the sleep
            sleep 60 &
            nap=$!
            wait "$nap"
        done
    ) &
    _DOTFILES_SUDO_HOLD_PID=$!

    trap 'kill "$_DOTFILES_SUDO_HOLD_PID" 2>/dev/null || true' EXIT
}
