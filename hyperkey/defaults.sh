#!/usr/bin/env bash
#
# hyperkey/defaults.sh - Hyperkey preferences (Caps Lock remapping)

# General settings
defaults write com.knollsoft.Hyperkey launchOnLogin -bool true
defaults write com.knollsoft.Hyperkey hideMenuBarIcon -bool false

# Remap Caps Lock to Hyper key (Ctrl+Option+Cmd+Shift)
defaults write com.knollsoft.Hyperkey keyRemap -int 1
defaults write com.knollsoft.Hyperkey capsLockRemapped -int 2
defaults write com.knollsoft.Hyperkey hyperFlags -int 1966080
defaults write com.knollsoft.Hyperkey physicalKeycode -int 57

# Quick press sends Escape (optional)
defaults write com.knollsoft.Hyperkey executeQuickHyperKey -bool true
