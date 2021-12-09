#!/usr/bin/env bash

# Compile contracts
yarn hardhat compile

# Disable isolatedModules and use commonjs in tsconfig
contents="$(jq '.compilerOptions.isolatedModules = false' tsconfig.json)" && \
echo "${contents}" > tsconfig.json
contents="$(jq '.compilerOptions.module = "commonjs"' tsconfig.json)" && \
echo "${contents}" > tsconfig.json

# Run build cache in all networks
export ETH_NETWORKS="mainnet,xdai,rinkeby,arbitrum,arbitrumTestnet"

# If next line is enabled it will reset the cache
# export RESET_CACHE="true"

# If next line is enabled it will fetch proposal titles and save them
# export GET_PROPOSAL_TITLES="true"

# If next line is enabled it will upload, cache and config files to IPFS using pinata 
# export UPLOAD_TO_IPFS="true"

yarn hardhat run scripts/buildCache.ts
sleep 1

# Enable isolatedModules and use esnext as module in tsconfig
contents="$(jq '.compilerOptions.isolatedModules = true' tsconfig.json)" && \
echo "${contents}" > tsconfig.json
contents="$(jq '.compilerOptions.module = "esnext"' tsconfig.json)" && \
echo "${contents}" > tsconfig.json
