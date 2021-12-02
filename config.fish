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

# GPG Signing
set -Ux GPG_TTY (tty)

# Reset $PATH
set -g fish_user_paths

# Add dotfiles bin to $PATH
fish_add_path $DOTFILES/bin

# Add Homebrews bin to $PATH
fish_add_path /opt/homebrew/bin

# Add Homebrew's sbin to $PATH
fish_add_path /opt/homebrew/sbin


# Hack to auto expand aliases in sudo.
alias sudo="sudo "

# Because sometimes you gotta be harsh.
alias fucking="sudo"

# And sometimes you gotta be nice.
alias please="sudo"

# Get my IP Address.
alias ip="curl ifconfig.co"

# Run remote commands over ssh.
alias remote="ssh $1 -T $2"

# LOL don't be Jamon.
# https://twitter.com/jamonholmgren/status/967548502648668161
alias rm="trash"
