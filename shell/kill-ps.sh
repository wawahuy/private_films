#!/usr/bin/env bash

help() {
  cat <<EOF
  Arguments:
  +\$1 given username

  Usage example:
  $ ./kill-ps.sh jenkins
EOF
}

# init vars
USR=$1
if [[ -z $USR ]]; then
  help
  exit 1
fi

ps -aux | awk '{print $1, $2}' | grep "${USR}" | awk '{print $2}' |xargs -I {} kill -9 {}