import axios from 'axios';
import { DaoNetworkCache, DaoInfo } from '../src/types/types';
const FormData = require('form-data');
const fs = require('fs');
const Web3 = require('web3');
const hre = require('hardhat');
const prettier = require('prettier');
const Hash = require('ipfs-only-hash');
const jsonSort = require('json-keys-sort');

const { getUpdatedCache, getProposalTitlesFromIPFS } = require('../src/cache');
const { tryWhile } = require('../src/utils/cache');

const defaultConfigHashes = require('../src/configs/default.json');

const arbitrum = require('../src/configs/arbitrum/config.json');
const arbitrumTestnet = require('../src/configs/arbitrumTestnet/config.json');
const mainnet = require('../src/configs/mainnet/config.json');
const xdai = require('../src/configs/xdai/config.json');
const rinkeby = require('../src/configs/rinkeby/config.json');
const localhost = require('../src/configs/localhost/config.json');

const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

const rl = readline.createInterface({ input, output });

const buildConfig = {
  mainnet: {
    toBlock: 13894185,
    reset: false,
  },
  xdai: {
    toBlock: 19815055,
    reset: false,
  },
  arbitrum: {
    toBlock: 4135119,
    reset: false,
  },
  rinkeby: {
    toBlock: 9893720,
    reset: false,
  },
  arbitrumTestnet: {
    toBlock: 7966665,
    reset: false,
  },
};

const getProposalTitles = true;

const appConfig: AppConfig = {
  arbitrum,
  arbitrumTestnet,
  mainnet,
  xdai,
  rinkeby,
  localhost,
};

const networkIds = {
  arbitrum: 42161,
  arbitrumTestnet: 421611,
  mainnet: 1,
  xdai: 100,
  rinkeby: 4,
  localhost: 1337,
};

const jsonParserOptions = {
  singleQuote: true,
  trailingComma: 'es5',
  arrowParens: 'avoid',
  endOfLine: 'crlf',
  printWidth: 80,
  useTabs: false,
  parser: 'json',
};

let proposalTitles: Record<string, string> = {};
const proposalTitlesPath = './cache/proposalTitles.json';

async function requestInput(text: string) {
  return new Promise((resolve, error) => {
    rl.question(text, async input => {
      resolve(input);
    });
  });
}

async function buildCacheForNetwork(
  networkName: string,
  toBlock: number,
  resetCache: boolean = false
): Promise<NetworkConfig> {
  const web3 = new Web3(hre.config.networks[networkName].url);
  const cachePath = `./cache/${networkName}.json`;

  const emptyCache: DaoNetworkCache = {
    networkId: networkIds[networkName],
    blockNumber: 1,
    daoInfo: {} as DaoInfo,
    schemes: {},
    proposals: {},
    callPermissions: {},
    votingMachines: {},
    ipfsHashes: [],
    vestingContracts: [],
  };

  // Get the network configuration
  let networkConfig = appConfig[networkName];
  let networkCache: DaoNetworkCache;

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
    networkCache = emptyCache;
  } else {
    if (resetCache) {
      networkConfig.cache.toBlock = networkConfig.cache.fromBlock;
      networkConfig.cache.ipfsHash = '';
      emptyCache.blockNumber = networkConfig.cache.fromBlock;
      emptyCache.daoInfo.address = networkConfig.contracts.avatar;
      networkCache = emptyCache;
    } else {
      console.log(
        `Getting config file from https://ipfs.io/ipfs/${defaultConfigHashes[networkName]}`
      );
      const networkConfigFileFetch = await axios.get(
        `https://ipfs.io/ipfs/${defaultConfigHashes[networkName]}`
      );
      console.log(
        `Getting cache file from https://ipfs.io/ipfs/${networkConfigFileFetch.data.cache.ipfsHash}`
      );
      const networkCacheFetch = await axios.get(
        `https://ipfs.io/ipfs/${networkConfigFileFetch.data.cache.ipfsHash}`
      );
      networkCache = networkCacheFetch.data;
    }
  }

  // Set block range for the script to run, if cache to block is set that value is used, if not we use last block
  const fromBlock = networkCache.blockNumber;

  if (fromBlock <= toBlock) {
    // The cache file is updated with the data that had before plus new data in the network cache file
    console.debug(
      'Running cache script from block',
      fromBlock,
      'to block',
      toBlock,
      'in network',
      networkName
    );
    networkCache = await getUpdatedCache(
      null,
      networkCache,
      networkConfig.contracts,
      fromBlock,
      toBlock,
      web3
    );

    // Get proposal titles
    if (getProposalTitles) {
      const newTitles = await getProposalTitlesFromIPFS(
        networkCache,
        proposalTitles
      );
      Object.assign(proposalTitles, newTitles);
      fs.writeFileSync(
        proposalTitlesPath,
        prettier.format(JSON.stringify(proposalTitles), jsonParserOptions),
        {
          encoding: 'utf8',
          flag: 'w',
        }
      );
      // Update proposals with no titles if title is available
      Object.keys(networkCache.proposals).map(proposalId => {
        if (!networkCache.proposals[proposalId].title) {
          networkCache.proposals[proposalId].title =
            proposalTitles[proposalId] || '';
        }
      });
    }
  }

  // Write network cache file
  networkCache = await jsonSort.sortAsync(networkCache, true);
  fs.writeFileSync(
    cachePath,
    prettier.format(JSON.stringify(networkCache), jsonParserOptions),
    { encoding: 'utf8', flag: 'w' }
  );

  // Update appConfig file with the latest network config
  networkConfig.cache.toBlock = toBlock;
  networkConfig.cache.ipfsHash = await Hash.of(fs.readFileSync(cachePath));
  networkConfig = await jsonSort.sortAsync(networkConfig, true);

  return networkConfig;
}

async function uploadFileToPinata(filePath, name, keyValue) {
  let data = new FormData();
  data.append('file', fs.createReadStream(filePath));
  data.append(
    'pinataMetadata',
    JSON.stringify({
      name: name,
      keyvalues: {
        type: keyValue,
      },
    })
  );
  return await axios
    .post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
      maxBodyLength: Number(Infinity),
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_API_SECRET_KEY,
      },
    })
    .then(function (response) {
      console.debug(`${name} hash: ${response.data.IpfsHash}`);
      return response.data.IpfsHash;
    })
    .catch(function (error) {
      console.error(error);
    });
}

async function main() {
  // Update the cache and config for each network
  for (let i = 0; i < Object.keys(buildConfig).length; i++) {
    const networkName = Object.keys(buildConfig)[i];

    const networkConfig = await buildCacheForNetwork(
      networkName,
      buildConfig[networkName].toBlock,
      buildConfig[networkName].reset
    );

    // Update the appConfig file that stores the hashes of the dapp config and network caches
    appConfig[networkName] = networkConfig;

    defaultConfigHashes[networkName] = await Hash.of(
      prettier.format(JSON.stringify(networkConfig), jsonParserOptions)
    );
  }

  console.log('Default cache file:', defaultConfigHashes);

  const writeFiles = await requestInput('Save files? (y/n): ');
  if (writeFiles == 'y') {
    const uploadFiles = await requestInput('Upload to pinata? (y/n): ');

    for (let i = 0; i < Object.keys(buildConfig).length; i++) {
      const networkName = Object.keys(buildConfig)[i];
      fs.writeFileSync(
        `./src/configs/${networkName}/config.json`,
        prettier.format(
          JSON.stringify(appConfig[networkName]),
          jsonParserOptions
        ),
        {
          encoding: 'utf8',
          flag: 'w',
        }
      );
      if (uploadFiles == 'y') {
        await uploadFileToPinata(
          `./cache/${networkName}.json`,
          `DXvote ${networkName} Cache`,
          `dxvote-${networkName}-cache`
        );
        await uploadFileToPinata(
          `./src/configs/${networkName}/config.json`,
          `DXvote ${networkName} Config`,
          `dxvote-${networkName}-config`
        );
      }
    }

    // Write and upload the default config file
    fs.writeFileSync(
      './src/configs/default.json',
      JSON.stringify(defaultConfigHashes, null, 2),
      { encoding: 'utf8', flag: 'w' }
    );
    if (uploadFiles == 'y') {
      await uploadFileToPinata(
        './src/configs/default.json',
        'DXvote Default Cache',
        'dxvote-cache'
      );
    }
  }

  rl.close();
}

tryWhile([main()])
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
