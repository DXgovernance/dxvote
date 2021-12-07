import axios from 'axios';
import { DaoNetworkCache, DaoInfo } from '../src/types';
const fs = require('fs');
const hre = require('hardhat');
const prettier = require('prettier');
const Hash = require('ipfs-only-hash');

const web3 = hre.web3;
const { getUpdatedCache, getProposalTitlesFromIPFS } = require('../src/cache');
const { tryWhile } = require('../src/utils/cache');

const defaultCacheFile = require('../defaultCacheFile.json');

const arbitrum = require('../src/configs/arbitrum/config.json');
const arbitrumTestnet = require('../src/configs/arbitrumTestnet/config.json');
const mainnet = require('../src/configs/mainnet/config.json');
const xdai = require('../src/configs/xdai/config.json');
const rinkeby = require('../src/configs/rinkeby/config.json');
const localhost = require('../src/configs/localhost/config.json');

const appConfig: AppConfig = {
  arbitrum,
  arbitrumTestnet,
  mainnet,
  xdai,
  rinkeby,
  localhost,
};

const networkName = hre.network.name;

const networkIds = {
  arbitrum: 42161,
  arbitrumTestnet: 421611,
  mainnet: 1,
  xdai: 100,
  rinkeby: 4,
  localhost: 1337,
};

const emptyCache: DaoNetworkCache = {
  networkId: networkIds[networkName],
  l1BlockNumber: 1,
  l2BlockNumber: 1,
  daoInfo: {} as DaoInfo,
  schemes: {},
  proposals: {},
  callPermissions: {},
  votingMachines: {},
  ipfsHashes: [],
  vestingContracts: [],
};

let proposalTitles: Record<string, string> = {};

async function main() {
  const cachePath = `./cache/${networkName}.json`;
  const configPath = `./src/configs/${networkName}/config.json`;
  const proposalTitlesPath = './cache/proposalTitles.json';

  const jsonParserOptions = {
    singleQuote: true,
    trailingComma: 'es5',
    arrowParens: 'avoid',
    endOfLine: 'crlf',
    printWidth: 80,
    useTabs: false,
    parser: 'json',
  };

  if (process.env.EMPTY_CACHE) {
    fs.writeFileSync(cachePath, JSON.stringify(emptyCache, null, 2), {
      encoding: 'utf8',
      flag: 'w',
    });
  } else {
    // Get the network configuration
    let networkConfig = appConfig[networkName];
    let networkCacheFile: DaoNetworkCache;

    // Read the existing proposal titles file
    if (fs.existsSync(proposalTitlesPath)) {
      proposalTitles = JSON.parse(
        fs.readFileSync(proposalTitlesPath, {
          encoding: 'utf8',
          flag: 'r',
        })
      );
    }

    // Set network cache and config objects
    if (networkName === 'localhost') {
      networkCacheFile = emptyCache;
    } else {
      if (process.env.RESET_CACHE) {
        networkConfig.cache.toBlock = networkConfig.cache.fromBlock;
        networkConfig.cache.ipfsHash = '';
        emptyCache.l1BlockNumber = networkConfig.cache.fromBlock;
        emptyCache.daoInfo.address = networkConfig.contracts.avatar;
        networkCacheFile = emptyCache;
      } else {
        console.log(
          `Getting cache file from https://dweb.link/ipfs/${defaultCacheFile[networkName]}`
        );
        const networkCacheFetch = await axios.get(
          `https://dweb.link/ipfs/${defaultCacheFile[networkName]}`
        );
        networkCacheFile = networkCacheFetch.data;
      }
    }

    // Set block range for the script to run, if cache to block is set that value is used, if not we use last block
    const fromBlock = networkCacheFile.l1BlockNumber;
    const blockNumber = await web3.eth.getBlockNumber();
    const toBlock = Number(process.env.CACHE_TO_BLOCK || blockNumber);

    if (
      process.env.RESET_CACHE ||
      (fromBlock <= toBlock && toBlock <= blockNumber)
    ) {
      // The cache file is updated with the data that had before plus new data in the network cache file
      console.debug(
        'Running cache script from block',
        fromBlock,
        'to block',
        toBlock,
        'in network',
        networkName
      );
      networkCacheFile = await getUpdatedCache(
        null,
        networkCacheFile,
        networkConfig.contracts,
        fromBlock,
        toBlock,
        web3
      );
      const newTitles = await getProposalTitlesFromIPFS(
        networkCacheFile,
        toBlock
      );
      Object.assign(proposalTitles, newTitles);
    }

    // Write network cache file
    fs.writeFileSync(
      cachePath,
      prettier.format(JSON.stringify(networkCacheFile), jsonParserOptions),
      { encoding: 'utf8', flag: 'w' }
    );

    // Update appConfig file with the latest network config
    networkConfig.cache.toBlock = toBlock;
    networkConfig.cache.ipfsHash = await Hash.of(fs.readFileSync(cachePath));
    appConfig[networkName] = networkConfig;
    console.debug(
      `IPFS hash for cache in ${networkName} network: ${appConfig[networkName].cache.ipfsHash}`
    );
  }

  // Update the appConfig file that stores the hashes of the dapp config and network caches
  fs.writeFileSync(
    configPath,
    prettier.format(JSON.stringify(appConfig[networkName]), jsonParserOptions),
    {
      encoding: 'utf8',
      flag: 'w',
    }
  );

  // Write proposals titles file
  fs.writeFileSync(
    proposalTitlesPath,
    prettier.format(JSON.stringify(proposalTitles), jsonParserOptions),
    {
      encoding: 'utf8',
      flag: 'w',
    }
  );
}

tryWhile([main()])
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
