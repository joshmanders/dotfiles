# Where are my dotfiles?
export DOTFILES="${HOME}/.files"

# I like to use VSCode; for now.
export EDITOR=code

# Central timezone, what's up?
export TZ=America/Chicago

# Consistent default $PATH, nawm sayn.
export PATH=`cat /etc/paths | tr "\\n" ":" | sed 's/:$//'`
export PATH="/usr/local/sbin:${PATH}"

# Go-lang PATH.
export GOPATH="${HOME}/Public/golang-code"

# Yarn global bin prefix.
export PREFIX="/usr/local"

# Global Composer bin.
export GLOBAL_COMPOSER_BIN="${HOME}/.composer/vendor/bin"

# Global yarn bin.
YARN_GLOBAL_DIR=`yarn global dir`
export GLOBAL_YARN_BIN="${YARN_GLOBAL_DIR}/node_modules/.bin"

# Local Node Modules bin.
export LOCAL_NODE_MODULES_BIN="./node_modules/.bin"

# Local Composer bin.
export LOCAL_COMPOSER_BIN="./vendor/bin"

# Now lets add our own to $PATH.
export PATH="${PATH}:${GOPATH}/bin"
export PATH="${PATH}:${DOTFILES}/bin"
export PATH="${PATH}:${GLOBAL_COMPOSER_BIN}"
export PATH="${PATH}:${LOCAL_COMPOSER_BIN}"
export PATH="${PATH}:${GLOBAL_YARN_BIN}"
export PATH="${PATH}:${LOCAL_NODE_MODULES_BIN}"
export PATH="${PATH}:${ANDROID_HOME}/tools"
export PATH="${PATH}:${ANDROID_HOME}/platform-tools"

# Cask needs to keep all applications together.
export HOMEBREW_CASK_OPTS="--appdir=/Applications"

# Android Emulation.
export ANDROID_HOME="$HOME/Library/Android/sdk"

# For historical purposes.
export HISTSIZE=10000
export SAVEHIST=8500

# Is antigen installed?
if [ ! -d "${HOME}/.antigen" ]; then
  # Nope! Install it.
  git clone https://github.com/zsh-users/antigen.git ${HOME}/.antigen
fi

# Now source it.
source ${HOME}/.antigen/antigen.zsh

# Oh My ZSH!
COMPLETION_WAITING_DOTS="true"
antigen use oh-my-zsh

# Load themes.
antigen theme https://gist.github.com/joshmanders/3d6a1fae12cafb52b9346c4ace705db9 bos-style
# Lets load up some bundles.
antigen bundle git
antigen bundle zsh-users/zsh-history-substring-search
antigen bundle rupa/z
antigen bundle zsh-users/zsh-syntax-highlighting

# bind UP and DOWN arrow keys.
zmodload zsh/terminfo
bindkey "$terminfo[kcuu1]" history-substring-search-up
bindkey "$terminfo[kcud1]" history-substring-search-down

# Apply that shizzle!
antigen apply

# Not sure what this is, yet.
setopt nocorrectall

# Auto suggestions, woohoo!
source /usr/local/share/zsh-autosuggestions/zsh-autosuggestions.zsh

# Load aliases.
source ${DOTFILES}/aliases

# Use direnv
eval "$(direnv hook zsh)"
