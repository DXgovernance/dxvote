#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the hardhat instance that we started (if we started one and if it's still running).
  if [ -n "$hardhat_pid" ] && ps -p $hardhat_pid > /dev/null; then
    kill -9 $hardhat_pid
  fi
}
mnemonic="cream core pear sure dinner indoor citizen divorce sudden captain subject remember"

hardhat_running() {
  nc -z localhost 8545
}

start-hardhat_node() {

  yarn hardhat compile
  
  npx hardhat node > /dev/null &

  hardhat_pid=$!

  echo "Waiting for hardhat to launch..."

  while ! hardhat_running; do
    sleep 0.1 # wait for 1/10 of the second before check again
  done

  echo "Harhat node launched!"
}

if hardhat_running; then
  echo "Killing existent hardhat"
  kill $(lsof -t -i:8545) 
fi

echo "Starting our own hardhat node instance"
start-hardhat_node

# Compile your contracts
yarn hardhat compile

# Disable isolatedModules and use commonjs in tsconfig
contents="$(jq '.compilerOptions.isolatedModules = false' tsconfig.json)" && \
echo "${contents}" > tsconfig.json
contents="$(jq '.compilerOptions.module = "commonjs"' tsconfig.json)" && \
echo "${contents}" > tsconfig.json

node scripts/beforeBuild.js

# Deploy local contracts
yarn hardhat run --network localhost scripts/dev.ts

# Enable isolatedModules and use esnext as module in tsconfig
contents="$(jq '.compilerOptions.isolatedModules = true' tsconfig.json)" && \
echo "${contents}" > tsconfig.json
contents="$(jq '.compilerOptions.module = "esnext"' tsconfig.json)" && \
echo "${contents}" > tsconfig.json

# Run dapp with localhost contracts
export REACT_APP_GIT_SHA=$(echo $(git rev-parse  HEAD) | cut -c1-9)
export SKIP_PREFLIGHT_CHECK=true

if [[ $* == *--no-browser* ]]; then
    echo "Setting BROWSER=none. No browser window will pop up"
    export BROWSER=none
fi

FORCE_COLOR=true yarn react-app-rewired start | cat