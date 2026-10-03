#!/usr/bin/env bash
#
# rectangle/defaults.sh - Rectangle window manager preferences

set -euo pipefail

# General settings
defaults write com.knollsoft.Rectangle launchOnLogin -bool true
defaults write com.knollsoft.Rectangle hideMenubarIcon -bool false
# Rectangle stores gapSize as a float
defaults write com.knollsoft.Rectangle gapSize -float 16
defaults write com.knollsoft.Rectangle allowAnyShortcut -bool true
defaults write com.knollsoft.Rectangle alternateDefaultShortcuts -bool true
defaults write com.knollsoft.Rectangle subsequentExecutionMode -int 2

# Drag-to-snap areas for landscape displays
defaults write com.knollsoft.Rectangle landscapeSnapAreas -string '[2,{"action":2},1,{"action":15},3,{"action":16},5,{"compound":-3},8,{"action":14},4,{"compound":-2},6,{"action":13},7,{"compound":-4}]'

defaults write com.knollsoft.Rectangle todo -int 2

# Keyboard shortcuts
# modifierFlags 1835008 is the Hyper key (Ctrl+Option+Cmd); 786432 is Ctrl+Option
# Left half: Hyper+Left
defaults write com.knollsoft.Rectangle leftHalf -dict keyCode -int 123 modifierFlags -int 1835008
# Right half: Hyper+Right
defaults write com.knollsoft.Rectangle rightHalf -dict keyCode -int 124 modifierFlags -int 1835008
# Maximize: Hyper+Up
defaults write com.knollsoft.Rectangle maximize -dict keyCode -int 126 modifierFlags -int 1835008
# Center: Hyper+Down
defaults write com.knollsoft.Rectangle center -dict keyCode -int 125 modifierFlags -int 1835008
# Restore: Hyper+Delete
defaults write com.knollsoft.Rectangle restore -dict keyCode -int 51 modifierFlags -int 1835008
# Toggle Todo: Ctrl+Option+B
defaults write com.knollsoft.Rectangle toggleTodo -dict keyCode -int 11 modifierFlags -int 786432
# Reflow Todo: Ctrl+Option+N
defaults write com.knollsoft.Rectangle reflowTodo -dict keyCode -int 45 modifierFlags -int 786432

# Actions written as an empty dict
defaults write com.knollsoft.Rectangle topHalf -dict
defaults write com.knollsoft.Rectangle bottomHalf -dict
defaults write com.knollsoft.Rectangle centerHalf -dict
defaults write com.knollsoft.Rectangle topLeft -dict
defaults write com.knollsoft.Rectangle topRight -dict
defaults write com.knollsoft.Rectangle bottomLeft -dict
defaults write com.knollsoft.Rectangle bottomRight -dict
defaults write com.knollsoft.Rectangle larger -dict
defaults write com.knollsoft.Rectangle smaller -dict
defaults write com.knollsoft.Rectangle almostMaximize -dict
defaults write com.knollsoft.Rectangle maximizeHeight -dict
defaults write com.knollsoft.Rectangle nextDisplay -dict
defaults write com.knollsoft.Rectangle previousDisplay -dict
