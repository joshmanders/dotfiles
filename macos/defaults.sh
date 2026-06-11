#!/usr/bin/env bash
#
# macos/defaults.sh - macOS system preferences

# ============================================================================
# Dock
# ============================================================================

# Pretend the dock doesn't exist:
#   autohide              - hide the dock when not in use
#   autohide-delay        - effectively disable hover-to-reveal (huge delay)
defaults write com.apple.dock autohide -bool true
defaults write com.apple.dock autohide-delay -float 99999999

# ============================================================================
# Finder
# ============================================================================

# Default views: columns everywhere
defaults write com.apple.finder FXPreferredViewStyle -string "clmv"
defaults write com.apple.finder FXPreferredSearchViewStyle -string "clmv"

# Grouping
defaults write com.apple.finder FXPreferredGroupBy -string "Name"
defaults write com.apple.finder FXArrangeGroupViewBy -string "Name"

# Auto-empty Trash after 30 days
defaults write com.apple.finder FXRemoveOldTrashItems -bool true

# New Finder windows open to ~/Downloads
defaults write com.apple.finder NewWindowTarget -string "PfLo"
defaults write com.apple.finder NewWindowTargetPath -string "file://$HOME/Downloads/"

# Show path bar and status bar at the bottom of windows
defaults write com.apple.finder ShowPathbar -bool true
defaults write com.apple.finder ShowStatusBar -bool true

# Hide recent tags from the sidebar
defaults write com.apple.finder ShowRecentTags -bool false

# Sort folders before files when sorting by name
defaults write com.apple.finder _FXSortFoldersFirst -bool true

# ============================================================================
# Global (NSGlobalDomain)
# ============================================================================

# Dark mode
defaults write NSGlobalDomain AppleInterfaceStyle -string "Dark"

# Always show file extensions
defaults write NSGlobalDomain AppleShowAllExtensions -bool true

# Disable "natural" scrolling (traditional/reverse direction)
defaults write NSGlobalDomain com.apple.swipescrolldirection -bool false

# Title-bar double-click does nothing (no minimize)
defaults write NSGlobalDomain AppleMiniaturizeOnDoubleClick -bool false

# Medium table row size
defaults write NSGlobalDomain NSTableViewDefaultSizeMode -int 2

# Reduce Liquid Glass diffusion (macOS Tahoe)
defaults write NSGlobalDomain NSGlassDiffusionSetting -int 0

# ============================================================================
# Screenshots
# ============================================================================

# No drop shadow on window screenshots
defaults write com.apple.screencapture disable-shadow -bool true

# Save screenshots to ~/Downloads
defaults write com.apple.screencapture location -string "$HOME/Downloads"

# Output goes to a file (not clipboard/preview)
defaults write com.apple.screencapture target -string "file"

# PNG format
defaults write com.apple.screencapture type -string "png"

# ============================================================================
# Menu Bar Clock
# ============================================================================

# Flash the colons in the time display
defaults write com.apple.menuextra.clock FlashDateSeparators -bool true

# Always show date (1=always, 0=auto, 2=never)
defaults write com.apple.menuextra.clock ShowDate -int 1

# Hide day of week (Mon/Tue/etc)
defaults write com.apple.menuextra.clock ShowDayOfWeek -bool false

# ============================================================================
# Trackpad
# ============================================================================

# Tap to click (built-in trackpad)
defaults write com.apple.AppleMultitouchTrackpad Clicking -bool true
# Tap to click (Magic Trackpad)
defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad Clicking -bool true
# Tap to click at login screen / system-wide
defaults write NSGlobalDomain com.apple.mouse.tapBehavior -int 1
defaults -currentHost write NSGlobalDomain com.apple.mouse.tapBehavior -int 1

# ============================================================================
# Keyboard
# ============================================================================

# Faster key repeat
defaults write NSGlobalDomain KeyRepeat -int 2
# Shorter delay before key repeat kicks in
defaults write NSGlobalDomain InitialKeyRepeat -int 15
# Hold a key to repeat (not show the accent menu)
defaults write NSGlobalDomain ApplePressAndHoldEnabled -bool false

# ============================================================================
# Mission Control / Spaces
# ============================================================================

# Don't auto-rearrange Spaces based on most recent use
defaults write com.apple.dock mru-spaces -bool false

# Enable App Exposé (swipe down on a dock app to see its windows)
defaults write com.apple.dock showAppExposeGestureEnabled -bool true

# ============================================================================
# Software Update / App Store
# ============================================================================

# Check for software updates daily (vs weekly)
defaults write com.apple.SoftwareUpdate ScheduleFrequency -int 1
# Download macOS updates in the background
defaults write com.apple.SoftwareUpdate AutomaticDownload -bool true
# Auto-update apps from the App Store
defaults write com.apple.commerce AutoUpdate -bool true

# ============================================================================
# Screenshot keyboard shortcuts
# ============================================================================
#
# macOS stores keyboard shortcut overrides in com.apple.symbolichotkeys.
# Values are nested dicts: { enabled, value: { type, parameters: (ascii, keycode, modifier) } }
#
# Modifier flag bits (OR them together):
#   Shift   = 0x020000 (131072)
#   Control = 0x040000 (262144)
#   Option  = 0x080000 (524288)
#   Command = 0x100000 (1048576)
#
# Common combos:
#   Cmd+Shift          = 1179648
#   Cmd+Ctrl+Shift     = 1441792
#
# Key codes: 20=3, 21=4, 23=5 (matches the digit's ASCII as the first parameter)

set_hotkey() {
    local id=$1 enabled=$2 ascii=$3 keycode=$4 modifier=$5
    defaults write com.apple.symbolichotkeys AppleSymbolicHotKeys -dict-add "$id" \
        "{enabled = $enabled; value = { parameters = ($ascii, $keycode, $modifier); type = 'standard'; }; }"
}

# Invert the macOS screenshot defaults so the muscle-memory shortcuts copy to
# clipboard, and Cmd+Shift+5 saves a region to file instead of opening the toolbar.
#
#   Cmd+Shift+3  ->  copy full screen to clipboard
#   Cmd+Shift+4  ->  copy selected area to clipboard
#   Cmd+Shift+5  ->  save selected area to file
#
#   id  action                             enabled  ascii  key  modifier
set_hotkey 28  0  51 20 1441792   # save full screen to file (off; was Cmd+Shift+3)
set_hotkey 29  1  51 20 1179648   # copy full screen to clipboard       (Cmd+Shift+3)
set_hotkey 30  1  53 23 1179648   # save selected area to file          (Cmd+Shift+5)
set_hotkey 31  1  52 21 1179648   # copy selected area to clipboard     (Cmd+Shift+4)
set_hotkey 184 0  53 23 1179648   # screenshot toolbar UI (off; was Cmd+Shift+5)

# ============================================================================
# Restart affected services
# ============================================================================

killall Dock 2>/dev/null || true
killall Finder 2>/dev/null || true
killall SystemUIServer 2>/dev/null || true

# symbolichotkeys changes need cfprefsd reload + logout/login (or a re-activation)
# to take effect in the WindowServer.
killall cfprefsd 2>/dev/null || true
