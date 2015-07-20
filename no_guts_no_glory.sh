function heading () {
  printf "💯  \e[00;36m$1\e[00m\n"
}

function notify () {
  printf "⚡️  \e[00;33m$1\e[00m\n"
}

function success () {
  printf "👍🏻  \e[00;32m$1\e[00m $2\n"
}

function fail () {
  printf "👎🏻  \e[00;31m$1\e[00m $2\n"
}

function footing () {
  printf "🙏🏼  \e[00;31m$1\e[00m $2\n"
}

function linebreak () {
  printf "\n"
}

function welcome () {
  heading "Welcome to Setemupatron™ 9001®!"
  linebreak
  sleep 1
}

function can_i_has_sudo () {
  if [ "$(sudo -n uptime 2>&1 | grep "load" | wc -l)" -lt 1 ]; then
    notify "We need sudo to do a few things"
    sleep 2
    sudo -v
    linebreak
    # Update existing `sudo` time stamp until we finish
    while true; do
      sudo -n true
      sleep 60
      kill -0 "$$" || exit
    done 2>/dev/null &
  fi
}

function install_homebrew () {
  notify "Installing Homebrew"
  sleep 1
  # ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" 1&2>/dev/null
  brew tap homebrew/dupes
  brew tap homebrew/versions
  success "Installed" "Homebrew"
  sleep 1
  linebreak
}

function brew_packages () {
  notify "Installing Brew Packages"
  sleep 1
  cat $(pwd)/data/brew | while read package; do
    success "Installed" $package
    sleep 1
    # brew install $package 1&2>/dev/null
  done
  linebreak
}

function cask_applications () {
  notify "Installing Brew Cask Applications"
  sleep 1
  cat $(pwd)/data/cask | while read application; do
    success "Installed" $application
    sleep 1
    # brew cask install $application 1&2>/dev/null
  done
  linebreak
}

function atom_packages () {
  notify "Installing Atom Packages"
  sleep 1
  cat $(pwd)/data/atom | while read package; do
    success "Installed" $package
    sleep 1
    # atom install $package 1&2>/dev/null
  done
  linebreak
}

function npm_packages () {
  notify "Installing NPM Packages"
  sleep 1
  cat $(pwd)/data/npm | while read package; do
    success "Installed" $package
    sleep 1
    # atom install $package 1&2>/dev/null
  done
  linebreak
}

function remove_file () {
  if [ -a $1 ]; then
    success "Removed" $1
    # rm -f $1
  else
    fail "Ignored" $1
  fi
}

function remove_files () {
  notify "Removing all files"
  sleep 1

  remove_file $HOME/.gitconfig
  sleep 1

  remove_file $HOME/.gitignore
  sleep 1

  remove_file $HOME/.ssh/config
  sleep 1

  remove_file $HOME/.zshrc
  sleep 1

  remove_file $HOME/.atom/config.cson
  sleep 1

  remove_file $HOME/.atom/keymap.cson
  sleep 1

  remove_file $HOME/.atom/snippets.cson
  linebreak
  sleep 2
}

function symlink_file () {
  if [ -a $1 ]; then
    fail "Ignored" $1
  else
    success "Symlinked" ${1//$HOME\/./\~/}
    # ln -s ${1//$HOME\//$(pwd)/} $1
  fi
}

function symlink_files () {
  notify "Symlinking all files"
  sleep 1

  symlink_file $HOME/.gitconfig
  sleep 1

  symlink_file $HOME/.gitignore
  sleep 1

  # if [ -d "$HOME/.ssh" ]; then
  #   mkdir $HOME/.ssh
  # fi
  symlink_file $HOME/.ssh/config
  sleep 1

  symlink_file $HOME/.gitconfig
  linebreak
  sleep 2
}

function thank_youuuuu () {
  sleep 3
  linebreak
  footing "Skynet installed successfully!"
  sudo -k
}
