#!/usr/bin/env bash
#
# dato/defaults.sh - Dato preferences

set -euo pipefail

# Menu bar icon: remaining events today
defaults write com.sindresorhus.Dato iconInMenuBar -string "remainingEventsToday"
# Upcoming event in the menu bar
defaults write com.sindresorhus.Dato upcomingEventInMenuBar_isEnabled -bool true
# No date or time in the menu bar
defaults write com.sindresorhus.Dato showDateInMenuBar -bool false
defaults write com.sindresorhus.Dato showTimeInMenuBar -bool false
