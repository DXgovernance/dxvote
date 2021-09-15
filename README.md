# DXvote

> DXdao recognizes the need to adapt and build new systems that reach consensus in a scalable, decentralized and effective way. Consensus is not an end, but a process.
>
> *DXdao Manifesto https://ipfs.io/ipfs/QmfGgQYwL4ZrXLVshYuwH2WHeSvPFQCDXeYTzPPFReCJqJ*

With the requirements mentioned above DXdao built DXvote, an application that instead of trusting external and centralized services commonly used by other dapps DXvote brings complete control and maintenance responsibilities to the DXdao members, a huge responsibility that brings the decentralized freedom that DXdao needs.

## Maintenance

Like we mention before the maintenance of the dapp is in charge of the users of it, this does not mean that they have to work full time to make the DAO worked, truth be told the maintenance of the application is not hard.
The application gets all the necessary configuration information from a single file (called config file), inside the file all the cache, contracts, and dapp information is stored. From this file the dapp knwos from which URL should fetch the cache hosted in IPFS for each network.

All maintenance actions are executed in the blockchain network trough transactions, this is extremely helpful to refund the maintenance cost instantly as well as providing an economic incentive to those who maintain the dapp.

### Cache

To update the cache a script need to be executed, this script will fetch and index all the necessary information to be served in the dapp when it starts, so the dapp will only need to fetch the remaining information to the last block.

Example: If the dapp is used in mainnet and the last block number is 11 million and the cache file has all the data till block number 10 million the application will get all the remaining data between block number 10 million and 11 million before starting, once it finish it will start the dapp.

**Pros and Cons**: The big Pro of this is that there wont be loading times between actions while the user is using the dapp, all actions would seem to be instant, and they are because the information is already there. The Con in this approach is that if the cache is not updated often (days or weeks depending on the network) it can cause low loading times when you open the application for the first time.

The cache script will gather all immutable information from the ethereum networks supported and save all of it in cache files, one file per network inside the `cache` folder.

`yarn build-cache`

To understand a bit better what the script will do you can see `scripts/builCache.sh` and `scripts/buildCache.ts`.

### Configuration

The configuration is even easier than the cache, it is just one file that stores all the smart contracts addresses, the tokens to be used, and the proposal templates and the calls to be recommended to be used in the new proposal.

Each network in the config file has a token array, recommended calls array and templates array, if you want to add new tokens, templates and recommended calls to the dapp just add them in the config file. You only change the file when you want to change the values mentioned before.

## Install

Install all dependencies with yarn.

`yarn`

## Development

First create an `env.development` file based on the ``.env.development.example` file.
The development script will start a local hardhat node, deploy all dxdao contracts with local development configuration and start the dapp with the development configuration in the port 3000.

`yarn dev`

To understand a bit better what the script will do you can see `scripts/dev.sh` and `scripts/deployDevContracts.ts`.

## Start

The script will start the dapp with the production configuration locally in the port 3000.

`yarn start`

## Build

The script build the dapp with the production configuration.

`yarn build`
