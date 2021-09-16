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
mnemonic="$REACT_APP_KEY_MNEMONIC"

ganache_running() {
  nc -z localhost 8545
}

time=date

start-hardhat_node() {

  npx hardhat node > /dev/null &

  ganache_pid=$!

  echo "Waiting for ganache to launch..."

  while ! ganache_running; do
    sleep 0.1 # wait for 1/10 of the second before check again
  done

  echo "Harhat node launched!"
}

if ganache_running; then
  echo "Using existing hardhat node instance"
else
  echo "Starting our own hardhat node instance"
  start-hardhat_node
fi

# Compile your contracts and copy the compiled code into the src
yarn hardhat compile
cp artifacts/dxdao-contracts/contracts/dxdao/DxAvatar.sol/DxAvatar.json src/contracts/DxAvatar.json
cp artifacts/dxdao-contracts/contracts/dxdao/DxReputation.sol/DxReputation.json src/contracts/DxReputation.json
cp artifacts/dxdao-contracts/contracts/dxdao/DxController.sol/DxController.json src/contracts/DxController.json
cp artifacts/dxdao-contracts/contracts/dxvote/DXDVotingMachine.sol/DXDVotingMachine.json src/contracts/DXDVotingMachine.json
cp artifacts/dxdao-contracts/contracts/utils/Multicall.sol/Multicall.json src/contracts/Multicall.json
cp artifacts/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol/ERC20.json src/contracts/ERC20.json
cp artifacts/dxdao-contracts/contracts/dxvote/WalletScheme.sol/WalletScheme.json src/contracts/WalletScheme.json
cp artifacts/dxdao-contracts/contracts/dxvote/PermissionRegistry.sol/PermissionRegistry.json src/contracts/PermissionRegistry.json
cp artifacts/dxdao-contracts/contracts/daostack/universalSchemes/ContributionReward.sol/ContributionReward.json src/contracts/ContributionReward.json
cp artifacts/dxdao-contracts/contracts/daostack/universalSchemes/SchemeRegistrar.sol/SchemeRegistrar.json src/contracts/SchemeRegistrar.json
cp artifacts/dxdao-contracts/contracts/daostack/utils/Redeemer.sol/Redeemer.json src/contracts/Redeemer.json
cp artifacts/@daostack/infra/contracts/votingMachines/GenesisProtocol.sol/GenesisProtocol.json src/contracts/GenesisProtocol.json

# Disable isolatedModules and use commonjs in tsconfig
contents="$(jq '.compilerOptions.isolatedModules = false' tsconfig.json)" && \
echo "${contents}" > tsconfig.json
contents="$(jq '.compilerOptions.module = "commonjs"' tsconfig.json)" && \
echo "${contents}" > tsconfig.json

# Deploy local contracts
yarn hardhat run --network localhost scripts/deployDevContracts.ts

# Copy dxdao contracts addresses in live networks
# cp node_modules/dxdao-contracts/.contracts.json src/config/contracts.json

# Run build cache
yarn hardhat run --network localhost scripts/buildCache.ts
sleep 1

# Enable isolatedModules and use esnext as module in tsconfig
contents="$(jq '.compilerOptions.isolatedModules = true' tsconfig.json)" && \
echo "${contents}" > tsconfig.json
contents="$(jq '.compilerOptions.module = "esnext"' tsconfig.json)" && \
echo "${contents}" > tsconfig.json

# Run dapp with localhost contracts
FORCE_COLOR=true \
SKIP_PREFLIGHT_CHECK=true FORCE_COLOR=true npx react-app-rewired start | cat
