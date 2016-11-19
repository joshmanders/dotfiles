# Where are my dotfiles?
export DOTFILES="${HOME}/.files"

# I like to use Atom; for now.
export EDITOR=atom

# Central timezone, what's up?
export TZ=America/Chicago

# Consistent default $PATH, nawm sayn.
export PATH=`cat /etc/paths | tr "\\n" ":" | sed 's/:$//'`

# Go-lang PATH.
export GOPATH="${HOME}/.go"

# Now lets add our own to $PATH.
export PATH="${PATH}:/usr/local/sbin:${DOTFILES}/bin:${GOPATH}/bin:${HOME}/.yarn-config/global/node_modules/.bin"

# Cask needs to keep all applications together.
export HOMEBREW_CASK_OPTS="--appdir=/Applications"

# Docker is life.
# export DOCKER_MACHINE="default"
# if docker-machine status $DOCKER_MACHINE | grep "Running" &> /dev/null; then
#   eval "$(docker-machine env $DOCKER_MACHINE)"
# else
#   docker-machine start $DOCKER_MACHINE && eval "$(docker-machine env $DOCKER_MACHINE)"
# fi

# Automatic GPG signing.
if [ -f ~/.gnupg/.gpg-agent-info ] && [ -n "$(pgrep gpg-agent)" ]; then
    source ~/.gnupg/.gpg-agent-info
    export GPG_AGENT_INFO
else
    eval $(gpg-agent --daemon --write-env-file ~/.gnupg/.gpg-agent-info)
fi

# NPM, yo.
export NPM_TOKEN=$(cat $HOME/.npm-as/default)

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

# Use my custom theme.
antigen theme https://gist.github.com/joshmanders/3d6a1fae12cafb52b9346c4ace705db9 joshmanders

# Lets load up some bundles.
antigen bundle git
antigen bundle zsh-users/zsh-syntax-highlighting
antigen bundle zsh-users/zsh-history-substring-search
antigen bundle jocelynmallon/zshmarks

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
