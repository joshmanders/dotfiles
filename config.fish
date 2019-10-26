# Disable fish greeting on startup
function fish_greeting
end

# Don't display date on bobthefish theme 
set -g theme_display_date no

# Set bobthefish color
set -g theme_color_scheme dracula

# Where are my dotfiles?
set -Ux DOTFILES $HOME/.files

# I like to use VSCode; for now.
set -Ux EDITOR code

# Central timezone, what's up?
set -Ux TZ America/Chicago

# Add dotfiles bin to $PATH
set -U fish_user_paths $fish_user_paths $DOTFILES/bin

# Add Homebrew's sbin to $PATH
set -U fish_user_paths $fish_user_paths /usr/local/sbin

# Add local node modules to $PATH
set -U fish_user_paths $fish_user_paths ./node_modules/.bin
