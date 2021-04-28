#!/usr/bin/env bash

# Compile contracts
yarn hardhat compile

# Disable isolatedModules in tsconfig
contents="$(jq '.compilerOptions.isolatedModules = false' tsconfig.json)" && \
echo "${contents}" > tsconfig.json

# Run build cache
yarn hardhat run --network rinkeby scripts/buildCache.ts
sleep 1

# Enable isolatedModules in tsconfig
contents="$(jq '.compilerOptions.isolatedModules = true' tsconfig.json)" && \
echo "${contents}" > tsconfig.json
