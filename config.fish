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

# Pacific timezone, what's up?
set -Ux TZ America/Los_Angeles


# GPG Signing
set -Ux GPG_TTY (tty)

# Reset $PATH
set -g fish_user_paths

# Add Homebrews bin to $PATH
fish_add_path /opt/homebrew/bin

# Add Homebrew's sbin to $PATH
fish_add_path /opt/homebrew/sbin

# Add Composer global bin to $PATH
fish_add_path $HOME/.composer/vendor/bin

# Setup Android Studio
set -Ux JAVA_HOME /Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
set -Ux ANDROID_HOME $HOME/Library/Android/sdk
fish_add_path $ANDROID_HOME/emulator
fish_add_path $ANDROID_HOME/platform-tools

# Add dotfiles bin to $PATH
fish_add_path $DOTFILES/bin

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

# Kubernetes helper
alias k="kubectl"

# Laravel Artisan helpers
alias art="artisan"
alias tinker="artisan tinker"
alias fresh="artisan migrate:fresh"
alias migrate="artisan migrate"
alias rollback="artisan migrate:rollback"
alias solo="artisan solo"

# Git helpers
alias wip="git save \"WIP\""
alias push="git push"

# I use neovim, btw
alias neovim="vscode"
alias nvim=neovim

# uWu big papi
function vscode
    eval $EDITOR;
end