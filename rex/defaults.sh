#!/usr/bin/env bash
#
# rex/defaults.sh - Rex for Mac app preferences
#
# Only settings that belong on every machine. Window frames, session focus,
# server routes, sync state, onboarding and Sparkle bookkeeping stay out.

set -euo pipefail

# ============================================================================
# Workspace
# ============================================================================

defaults write com.superlogical.rex Workspace.lightThemeID -string "merino-light"
defaults write com.superlogical.rex Workspace.darkThemeID -string "merino-dark"
defaults write com.superlogical.rex Workspace.interfaceStyle -string "useTheme"
# Rex stores the font size as a float
defaults write com.superlogical.rex Workspace.terminalFontPointSize -float 16
defaults write com.superlogical.rex Workspace.tabIconTintMode -string "off"
defaults write com.superlogical.rex Workspace.appIconVisibility -string "dockOnly"

defaults write com.superlogical.rex Workspace.paneDensity -string "comfortable"
defaults write com.superlogical.rex Workspace.showsPaneHeaders -bool false
defaults write com.superlogical.rex Workspace.inactivePaneFadeMode -string "none"
defaults write com.superlogical.rex Workspace.usesStandardInactiveWindowPaneStyles -bool false

# ============================================================================
# Agents, client and server
# ============================================================================

defaults write com.superlogical.rex rex.agents.names-sessions -bool false
defaults write com.superlogical.rex rex.client.remoteControl -bool true

defaults write com.superlogical.rex rex.server.run-mode -string "bundled"
defaults write com.superlogical.rex rex.server.tailnet-enabled -bool true
defaults write com.superlogical.rex rex.server.automatic-restart-enabled -bool true
defaults write com.superlogical.rex rex.server.block-plugin-reload-enabled -bool false
defaults write com.superlogical.rex rex.server.web-client-origin-patterns -array "https://rex.superlogical.com"

# Sparkle updates
defaults write com.superlogical.rex SUEnableAutomaticChecks -bool true
defaults write com.superlogical.rex SUAutomaticallyUpdate -bool true
