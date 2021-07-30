# DXvote

Application for voting and govern DXdao, focused on technical decentralization (fetching all data from ethereum network, ipfs or static configuration files).

## Cache

The cache script will gather all immutable information from the ethereum networks supported and save all of it in cache files, one file per network inside the `src/cache/data` folder.

`yarn build-cache`

To understand a bit better what the script will do you can see `scripts/builCache.sh` and `scripts/buildCache.ts`.

## Development

The development script will start a local hardhat node, deploy all dxdao contracts with local development configuration and start the dapp with the development configuration in the port 3000.

`yarn dev`

To understand a bit better what the script will do you can see `scripts/dev.sh` and `scripts/deployDevContracts.ts`.

## Start

The script will start the dapp with the production configuration locally in the port 3000.

`yarn start`

## Build

The script build the dapp with the production configuration.

`yarn build`
