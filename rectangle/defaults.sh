#!/usr/bin/env bash
#
# rectangle/defaults.sh - Rectangle window manager preferences

# General settings
defaults write com.knollsoft.Rectangle launchOnLogin -bool true
defaults write com.knollsoft.Rectangle gapSize -int 16
defaults write com.knollsoft.Rectangle allowAnyShortcut -bool true
defaults write com.knollsoft.Rectangle alternateDefaultShortcuts -bool true

# Keyboard shortcuts (Ctrl+Option+Arrow)
# Left half: Ctrl+Option+Left
defaults write com.knollsoft.Rectangle leftHalf -dict keyCode -int 123 modifierFlags -int 1966080
# Right half: Ctrl+Option+Right
defaults write com.knollsoft.Rectangle rightHalf -dict keyCode -int 124 modifierFlags -int 1966080
# Maximize: Ctrl+Option+Up
defaults write com.knollsoft.Rectangle maximize -dict keyCode -int 126 modifierFlags -int 1966080
# Center: Ctrl+Option+Down
defaults write com.knollsoft.Rectangle center -dict keyCode -int 125 modifierFlags -int 1966080
