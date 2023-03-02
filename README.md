# DXvote

> DXdao recognizes the need to adapt and build new systems that reach consensus in a scalable, decentralized and effective way. Consensus is not an end, but a process.
>
> *DXdao Manifesto https://ipfs.io/ipfs/QmfGgQYwL4ZrXLVshYuwH2WHeSvPFQCDXeYTzPPFReCJqJ*

With the requirements mentioned above, DXdao built DXvote, an application that, instead of trusting external and centralized services commonly used by other dapps, DXvote brings complete control and maintenance responsibilities to the DXdao members. This considerable responsibility brings the decentralized freedom that DXdao needs.

## Versions

### Stable Release

Hosted in https://dxvote.eth.limo/ and under control of dxdao.

### Release Candidate

Source code of `master` branch built and hosted on IPFS in https://dxvote.dev/ and under control of DXgovernance code owners.

### Developer Version

Source code of `develop` branch built and hosted on IPFS in https://dxgovernance.github.io/dxvote/ and under control of DXgovernance developers.

## Maintenance

As we mentioned before, the maintenance of the dapp is in charge of the users of it; this does not mean that they have to work full time to make the DAO work; truth be told, the maintenance of the application is not complicated.
The application gets all the necessary configuration information from a single file (config file); inside the file, all the cache, contracts, and dapp information are stored. This file lets the dapp know which URL should fetch the cache hosted in IPFS for each network.

All maintenance actions are executed in the blockchain network through transactions; this is extremely helpful to refund the maintenance cost instantly and provide an economic incentive to those who maintain the dapp.

### Cache

To update the cache, the app needs to be open on the /cache page and fill the block numbers of the latest networks, the cache would be generated to that blocks. Once the build of the cache finishes you can paste the cache hash obtained on each network on the target hash fields and then click on the download all button. The file on the files on the cache folder has to be uploaded to ipfs and the ones in configs are to be placed in the `src/configs` folder.

Example: If the dapp is used in mainnet and the last block number is 11 million, and the cache file has all the data till block number 10 million, the application will get all the remaining data between block number 10 million and 11 million before starting, once it finishes it will begin to the dapp.

**Pros and Cons**: The big pro is that there won't be loading times between actions while the user is using the dapp; all efforts seem to be instant, and they are because the information is already there. The Con in this approach is that if the cache is not updated often (days or weeks, depending on the network), it can cause low loading times when you open the application for the first time.

The cache script will gather all immutable information from the ethereum networks supported and save all of it in cache files uploaded in IPFS. This script is ran

To understand a bit better what the script will do you can see `src/services/cacheService.ts`.

### Configuration

The configuration is even easier than the cache; it is just one file that stores all the smart contract addresses, the tokens to be used, and the proposal templates and the calls recommended for the new proposal.

Each network in the config file has a token array, recommended calls array, and templates array; if you want to add new tokens, templates, and recommended calls to the dapp, add them in the config file. You only change the file when you want to change the values mentioned before.

## Install

Be sure you are using correct node version listed in `./package.json` (`engines.node`)

`nvm use`

Install all dependencies with yarn.

`yarn`

## Development

The development script will start a local hardhat node, deploy all dxdao contracts with local development configuration and start the dapp with the development configuration in the port 3000.

`yarn dev`

To understand a bit better what the script will do you can see `scripts/dev.sh`.

## Start

The script will start the dapp with the production configuration locally on port 8080 serving the folder build after running the production build.

`yarn start`

## Build

The script build the dapp with the production configuration and save it in the build folder.

`yarn build`
