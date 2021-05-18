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

  npx ganache-cli --gasLimit 9000000 --gasPrice 10000000000 -d -m "$mnemonic" -e 5000 > /dev/null &

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

# Compile your contracts and copy the compiled code into the src
yarn hardhat compile
cp artifacts/dxdao-contracts/contracts/dxdao/DxAvatar.sol/DxAvatar.json src/contracts/DxAvatar.json
cp artifacts/dxdao-contracts/contracts/dxdao/DxReputation.sol/DxReputation.json src/contracts/DxReputation.json
cp artifacts/dxdao-contracts/contracts/dxdao/DxController.sol/DxController.json src/contracts/DxController.json
cp artifacts/dxdao-contracts/contracts/dxdao/DXDVotingMachine.sol/DXDVotingMachine.json src/contracts/DXDVotingMachine.json
cp artifacts/dxdao-contracts/contracts/utils/Multicall.sol/Multicall.json src/contracts/Multicall.json
cp artifacts/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol/ERC20.json src/contracts/ERC20.json
cp artifacts/dxdao-contracts/contracts/schemes/WalletScheme.sol/WalletScheme.json src/contracts/WalletScheme.json
cp artifacts/dxdao-contracts/contracts/schemes/PermissionRegistry.sol/PermissionRegistry.json src/contracts/PermissionRegistry.json
yarn hardhat run --network localhost scripts/deployLocalContracts.js

# Copy dxdao contracts addresses in live networks
cp node_modules/dxdao-contracts/.contracts.json src/config/contracts.json

# Disable isolatedModules in tsconfig
contents="$(jq '.compilerOptions.isolatedModules = false' tsconfig.json)" && \
echo "${contents}" > tsconfig.json

# Run build cache
REACT_APP_AVATAR_ADDRESS=`jq .avatar .developmentAddresses.json` \
REACT_APP_CONTROLLER_ADDRESS=`jq .controller .developmentAddresses.json` \
REACT_APP_REPUTATION_ADDRESS=`jq .reputation .developmentAddresses.json` \
REACT_APP_VOTING_MACHINE_ADDRESS=`jq .votingMachine .developmentAddresses.json` \
REACT_APP_VOTING_MACHINE_TOKEN_ADDRESS=`jq .votingMachineToken .developmentAddresses.json` \
REACT_APP_PERMISSION_REGISTRY_ADDRESS=`jq .permissionRegistry .developmentAddresses.json` \
REACT_APP_MULTICALL_ADDRESS=`jq .multicall .developmentAddresses.json` \
yarn hardhat run --network localhost scripts/buildCache.ts
sleep 1

# Enable isolatedModules in tsconfig
contents="$(jq '.compilerOptions.isolatedModules = true' tsconfig.json)" && \
echo "${contents}" > tsconfig.json

# Run dapp with localhost contracts
FORCE_COLOR=true \
REACT_APP_AVATAR_ADDRESS=`jq .avatar .developmentAddresses.json` \
REACT_APP_CONTROLLER_ADDRESS=`jq .controller .developmentAddresses.json` \
REACT_APP_REPUTATION_ADDRESS=`jq .reputation .developmentAddresses.json` \
REACT_APP_VOTING_MACHINE_ADDRESS=`jq .votingMachine .developmentAddresses.json` \
REACT_APP_VOTING_MACHINE_TOKEN_ADDRESS=`jq .votingMachineToken .developmentAddresses.json` \
REACT_APP_PERMISSION_REGISTRY_ADDRESS=`jq .permissionRegistry .developmentAddresses.json` \
REACT_APP_MULTICALL_ADDRESS=`jq .multicall .developmentAddresses.json` \
SKIP_PREFLIGHT_CHECK=true FORCE_COLOR=true npx react-app-rewired start | cat
