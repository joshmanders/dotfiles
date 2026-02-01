#!/usr/bin/env bash
#
# env.sh - Environment variable helpers
#
# Provides functions for safely handling configuration variables.
# Sourced by lib/index.sh after config.sh is loaded.
#
# Functions:
#   env_get <var> [default]              Get variable value or default
#   env_require <var> <prompt> [default] Require variable, prompt if missing
#

# Get an environment variable with a default fallback
#
# Usage:
#   email=$(env_get "DOTFILES_EMAIL" "user@example.com")
#
# Arguments:
#   $1 - Variable name (without $)
#   $2 - Default value (optional)
#
# Returns:
#   The variable value, or default, or empty string
env_get() {
    local var_name="$1"
    local default="${2:-}"
    local value="${!var_name:-$default}"
    echo "$value"
}

# Require an environment variable, prompting if not set
#
# Usage:
#   env_require "DOTFILES_NAME" "Your name" "John Doe"
#   env_require "DOTFILES_EMAIL" "Your email"
#
# Arguments:
#   $1 - Variable name (without $)
#   $2 - Prompt message (shown to user)
#   $3 - Default value (optional, shown in prompt)
#
# Behavior:
#   - If variable is set: returns successfully
#   - If not set + interactive: prompts user, exports value
#   - If not set + non-interactive: exits with error
#
env_require() {
    local var_name="$1"
    local prompt="${2:-$var_name}"
    local default="${3:-}"
    local value="${!var_name:-}"

    # Already set, nothing to do
    if [[ -n "$value" ]]; then
        return 0
    fi

    # Non-interactive mode: fail
    if [[ -n "${DOTFILES_NON_INTERACTIVE:-}" ]]; then
        echo "Error: $var_name is required but not set" >&2
        echo "" >&2
        echo "Set it in config.sh or pass via environment:" >&2
        echo "  export $var_name=\"value\"" >&2
        exit 1
    fi

    # Interactive mode: prompt user
    echo ""
    if [[ -n "$default" ]]; then
        read -r -p "$prompt [$default]: " value
        value="${value:-$default}"
    else
        read -r -p "$prompt: " value
    fi

    # Still empty after prompt
    if [[ -z "$value" ]]; then
        echo "Error: $var_name is required" >&2
        exit 1
    fi

    # Export for rest of session
    export "$var_name=$value"

    # Also save to config.sh if it exists
    local config_file="$DOTFILES/config.sh"
    if [[ -f "$config_file" ]]; then
        # Check if variable already exists in config (commented or not)
        if grep -q "^#*\s*export $var_name=" "$config_file" 2>/dev/null; then
            # Update existing line (uncomment and set value)
            sed -i '' "s|^#*\s*export $var_name=.*|export $var_name=\"$value\"|" "$config_file"
        else
            # Append to config
            echo "export $var_name=\"$value\"" >> "$config_file"
        fi
    fi
}

# Check if config.sh exists, prompt to create if not
#
# Usage:
#   ensure_config
#
# Returns 0 if config exists (or was just created), exits on failure
ensure_config() {
    local config_file="$DOTFILES/config.sh"
    local example_file="$DOTFILES/config.sh.example"

    if [[ -f "$config_file" ]]; then
        return 0
    fi

    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║  config.sh not found                                              ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "This file stores your personal settings."
    echo ""

    if [[ -n "${DOTFILES_NON_INTERACTIVE:-}" ]]; then
        echo "Error: config.sh is required. Create it from config.sh.example:" >&2
        echo "  cp $example_file $config_file" >&2
        exit 1
    fi

    # Create config.sh from example
    cp "$example_file" "$config_file"
    echo "Created: $config_file"
    echo ""
    echo "You'll be prompted for required values..."
}
