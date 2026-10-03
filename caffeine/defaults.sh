#!/usr/bin/env bash
#
# caffeine/defaults.sh - Caffeine preferences

set -euo pipefail

# Default duration
defaults write net.domzilla.caffeine CADefaultDuration -int 120
# Launch message suppressed
defaults write net.domzilla.caffeine CASuppressLaunchMessage -bool true
