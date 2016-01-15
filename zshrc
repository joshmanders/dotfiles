# Where are my dotfiles?
export DOTFILES="${HOME}/.files"

# I like to use Atom; for now.
export EDITOR=atom

# Central timezone, what's up?
export TZ=America/Chicago

# Consistent default $PATH, nawm sayn.
export PATH=`cat /etc/paths | tr "\\n" ":" | sed 's/:$//'`

# Now lets add our own to $PATH.
export PATH="${HOME}/.files/bin:${PATH}"

# Cask needs to keep all applications together.
export HOMEBREW_CASK_OPTS="--appdir=/Applications"

# Docker is life.
export DOCKER_IP=192.168.99.100
export DOCKER_PORT=2376
export DOCKER_HOST=tcp://${DOCKER_IP}:${DOCKER_PORT}
export DOCKER_CERT_PATH=${HOME}/.docker/machine/machines/default
export DOCKER_TLS_VERIFY=1

# Android Emulation.
export ANDROID_HOME=/usr/local/opt/android-sdk

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

# Use my custom theme.
antigen theme joshmanders/zsh-theme

# Lets load up some bundles.
antigen bundle git
antigen bundle zsh-users/zsh-syntax-highlighting
antigen bundle zsh-users/zsh-history-substring-search

# bind UP and DOWN arrow keys.
zmodload zsh/terminfo
bindkey "$terminfo[kcuu1]" history-substring-search-up
bindkey "$terminfo[kcud1]" history-substring-search-down


# Fuck.
# Magnificent app which corrects your previous console command.
# https://github.com/nvbn/thefuck
antigen bundle robbyrussell/oh-my-zsh plugins/thefuck

# Apply that shizzle!
antigen apply

# Not sure what this is, yet.
setopt nocorrectall

# Load aliases.
source ${DOTFILES}/aliases

# Load functions.
source ${DOTFILES}/functions
