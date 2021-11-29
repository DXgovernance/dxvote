#!/usr/bin/env bash

# Compile contracts
yarn hardhat compile

# Disable isolatedModules and use commonjs in tsconfig
contents="$(jq '.compilerOptions.isolatedModules = false' tsconfig.json)" && \
echo "${contents}" > tsconfig.json
contents="$(jq '.compilerOptions.module = "commonjs"' tsconfig.json)" && \
echo "${contents}" > tsconfig.json

# Run build cache in all networks
# Use RESET_CACHE=1 to reset the cache and ignore existing content
# Use EMPTY_CACHE=1 to save an empty cache
CACHE_TO_BLOCK=13708329 yarn hardhat run --network mainnet scripts/buildCache.ts
CACHE_TO_BLOCK=19318266 yarn hardhat run --network xdai scripts/buildCache.ts
CACHE_TO_BLOCK=3430998 yarn hardhat run --network arbitrum scripts/buildCache.ts
CACHE_TO_BLOCK=9726830 yarn hardhat run --network rinkeby scripts/buildCache.ts
CACHE_TO_BLOCK=6264591 yarn hardhat run --network arbitrumTestnet scripts/buildCache.ts
yarn prettier --write src/configs/**/*.json
sleep 1

# Enable isolatedModules and use esnext as module in tsconfig
contents="$(jq '.compilerOptions.isolatedModules = true' tsconfig.json)" && \
echo "${contents}" > tsconfig.json
contents="$(jq '.compilerOptions.module = "esnext"' tsconfig.json)" && \
echo "${contents}" > tsconfig.json
