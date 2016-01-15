function script_name () {
  local base=$(basename "${1}")
  echo "${base/-/ }"
}

function git_config () {
  local key="${1}"
  git config --get "${key}"
}

function origin_url () {
  local remote=$(git_config "remote.origin.url")
  local url=$(echo "${remote}" | awk -F'git@github.com:' '{print $2}' | cut -d" " -f1)
  echo "${url}" | awk -F'.' '{print $1}'
}

function gh_http_request () {
  local user=$(git_config "github.user")
  local token=$(git_config "github.token")
  local method="${1}"
  local endpoint="${2}"
  local args="${3}"
  local result=$(curl --silent --user "${user}:${token}" -A "GH Scripts by /joshmanders" -H "Accept: application/json" -X "${method}" "${args}" "https://api.github.com/${endpoint}")
  local error=$(echo -n "${result}" | jq -r 'select(.message?)')
  if [ "${error}" != "" ]; then
    echo "ERROR: $(echo -n "${error}" | jq -r '.message')"
    exit 1
  else
    echo -n "${result}"
    exit 0
  fi

}

function gh_http_get () {
  gh_http_request "GET" "${1}"
}

function gh_http_post () {
  gh_http_request "POST" "${1}" '-d '"${2}"''
}

function gh_http_put () {
  gh_http_request "PUT" "${1}" '-d '"${2}"''
}

function gh_http_patch () {
  gh_http_request "PATCH" "${1}" '-d '"${2}"''
}

function gh_http_delete () {
  gh_http_request "DELETE" "${1}"
}
