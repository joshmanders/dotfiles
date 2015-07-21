# Where are my dotfiles?
export DOTFILES="$HOME/.files"

# I like to use Atom; for now.
export EDITOR=atom

# Central timezone, what's up?
export TZ=America/Chicago

# Custom PATH, nawm sayn.
export PATH=`cat /etc/paths | tr "\\n" ":" | sed 's/:$//'`

# Android Emulation.
export ANDROID_HOME=/usr/local/opt/android-sdk

# For historical purposes.
HISTSIZE=10000
SAVEHIST=8500

# Is antigen installed?
if [ ! -d "$HOME/.antigen" ]; then
  # Nope! Install it.
  git clone https://github.com/zsh-users/antigen.git $HOME/.antigen
fi

# Now source it.
source $HOME/.antigen/antigen.zsh

# Oh My ZSH!
COMPLETION_WAITING_DOTS="true"
antigen use oh-my-zsh

# Use my custom theme.
antigen theme killswitch/zsh-theme

# ZSH dokku helper.
export DOKKU_HOST='104.131.164.219'
antigen bundle killswitch/zsh-dokku

# Lets load up some bundles.
antigen bundle git
antigen bundle zsh-users/zsh-syntax-highlighting
antigen bundle zsh-users/zsh-history-substring-search

# bind UP and DOWN arrow keys
zmodload zsh/terminfo
bindkey "$terminfo[kcuu1]" history-substring-search-up
bindkey "$terminfo[kcud1]" history-substring-search-down

# Apply that shizzle!
antigen apply

# Not sure what this is, yet.
setopt nocorrectall

# Typing `edit .` is easier than anything else.
alias edit="$EDITOR"

# Because sometimes you gotta be harsh.
alias fucking="sudo"

# And sometimes you gotta be nice.
alias please="sudo"

# Edit my dotfiles!
alias dotfiles="edit $DOTFILES"

# Flush out the DNS cache.
alias flushDNS="dscacheutil -flushcache"

# Clean up pesky .DS_Store all over.
alias cleanupDS="find . -type f -name '*.DS_Store' -ls -delete"

# Clean up multiple launch services.
alias cleanupLS="/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user && killall Finder"

# Get my IP Address
function ip() {
  echo "IP Address: $(curl -s ip.appspot.com)"
}

# Reload this file
function reload() {
  echo "Reloading .zshrc"
  source $HOME/.zshrc
}

# All executable paths
function paths() {
  echo -e ${PATH//:/\\n}
}
