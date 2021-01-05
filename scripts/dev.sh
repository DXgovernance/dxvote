#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the ganache instance that we started (if we started one and if it's still running).
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}
set -o allexport; source .env; set +o allexport
mnemonic="$REACT_APP_KEY_MNEMONIC"

ganache_running() {
  nc -z localhost 8545
}

time=date

start_ganache() {

  # Using 9000000 as gas limit and 10Gwei as gas price
  npx ganache-cli --gasLimit 0x895440 --gasPrice 0x2540BE400 -d -m "$mnemonic" -e 5000 --time `date +"%F"T"%T"` > /dev/null &

  ganache_pid=$!

  echo "Waiting for ganache to launch..."

  while ! ganache_running; do
    sleep 0.1 # wait for 1/10 of the second before check again
  done

  echo "Ganache launched!"
}

if ganache_running; then
  echo "Using existing ganache instance"
else
  echo "Starting our own ganache instance"
  start_ganache
fi

npx truffle version
npx truffle compile --network development
cp contracts/build/DxAvatar.json src/contracts/DxAvatar.json
cp contracts/build/DxReputation.json src/contracts/DxReputation.json
cp contracts/build/DxController.json src/contracts/DxController.json
cp contracts/build/DXDVotingMachine.json src/contracts/DXDVotingMachine.json
cp contracts/build/Multicall.json src/contracts/Multicall.json
cp contracts/build/ERC20.json src/contracts/ERC20.json
cp contracts/build/WalletScheme.json src/contracts/WalletScheme.json
node scripts/deployContracts.js -- --network development
sleep 1
FORCE_COLOR=true \
REACT_APP_AVATAR_ADDRESS=`jq .avatar .developmentAddresses.json` \
REACT_APP_CONTROLLER_ADDRESS=`jq .controller .developmentAddresses.json` \
REACT_APP_REPUTATION_ADDRESS=`jq .reputation .developmentAddresses.json` \
REACT_APP_VOTING_MACHINE_ADDRESS=`jq .votingMachine .developmentAddresses.json` \
REACT_APP_VOTING_MACHINE_TOKEN_ADDRESS=`jq .votingMachineToken .developmentAddresses.json` \
REACT_APP_MULTICALL_ADDRESS=`jq .multicall .developmentAddresses.json` \
REACT_APP_MASTER_WALLET_SCHEME_ADDRESS=`jq .masterWalletScheme .developmentAddresses.json` \
REACT_APP_QUICK_WALLET_SCHEME_ADDRESS=`jq .quickWalletScheme .developmentAddresses.json` \
SKIP_PREFLIGHT_CHECK=true FORCE_COLOR=true npx react-app-rewired start | cat
