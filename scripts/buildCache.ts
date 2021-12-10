import axios from 'axios';
import { DaoNetworkCache, DaoInfo } from '../src/types';
const FormData = require('form-data');
const fs = require('fs');
const Web3 = require('web3');
const hre = require('hardhat');
const prettier = require('prettier');
const Hash = require('ipfs-only-hash');

const { getUpdatedCache, getProposalTitlesFromIPFS } = require('../src/cache');
const { tryWhile } = require('../src/utils/cache');

const defaultCacheFile = require('../defaultCacheFile.json');

const arbitrum = require('../src/configs/arbitrum/config.json');
const arbitrumTestnet = require('../src/configs/arbitrumTestnet/config.json');
const mainnet = require('../src/configs/mainnet/config.json');
const xdai = require('../src/configs/xdai/config.json');
const rinkeby = require('../src/configs/rinkeby/config.json');
const localhost = require('../src/configs/localhost/config.json');

const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

const rl = readline.createInterface({ input, output });

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
    rl.question(text, async (input) => {
      resolve(input);
    });
  });
}

async function buildCacheForNetwork(networkName: string, toBlock: number, resetCache: boolean = false) : Promise<NetworkConfig> {

  const web3 = new Web3(hre.config.networks[networkName].url);
  const cachePath = `./cache/${networkName}.json`;

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
    if (resetCache) {
      networkConfig.cache.toBlock = networkConfig.cache.fromBlock;
      networkConfig.cache.ipfsHash = '';
      emptyCache.l1BlockNumber = networkConfig.cache.fromBlock;
      emptyCache.daoInfo.address = networkConfig.contracts.avatar;
      networkCacheFile = emptyCache;
    } else {
      console.log(
        `Getting config file from https://ipfs.io/ipfs/${defaultCacheFile[networkName].configHash}`
      );
      const networkConfigFileFetch = await axios.get(
        `https://ipfs.io/ipfs/${defaultCacheFile[networkName].configHash}`
      );
      console.log(
        `Getting cache file from https://ipfs.io/ipfs/${networkConfigFileFetch.data.cache.ipfsHash}`
      );
      const networkCacheFetch = await axios.get(
        `https://ipfs.io/ipfs/${networkConfigFileFetch.data.cache.ipfsHash}`
      );
      networkCacheFile = networkCacheFetch.data;
    }
  }

  // Set block range for the script to run, if cache to block is set that value is used, if not we use last block
  const fromBlock = networkCacheFile.l1BlockNumber;

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
    networkCacheFile = await getUpdatedCache(
      null,
      networkCacheFile,
      networkConfig.contracts,
      fromBlock,
      toBlock,
      web3
    );

    if (process.env.GET_PROPOSAL_TITLES == "true") {
      const newTitles = await getProposalTitlesFromIPFS(
        networkCacheFile,
        toBlock
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
    }

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

  // Update the appConfig file that stores the hashes of the dapp config and network caches

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
  const networkNames = process.env.ETH_NETWORKS.indexOf(',') > 0 
    ? process.env.ETH_NETWORKS.split(",")
    : [process.env.ETH_NETWORKS];

  // Update the cache and config for each network
  for (let i = 0; i < networkNames.length; i++) {

    const networkConfig = await buildCacheForNetwork(
      networkNames[i], defaultCacheFile[networkNames[i]].toBlock
    );
    appConfig[networkNames[i]] = networkConfig;

    defaultCacheFile[networkNames[i]].configHash = await Hash.of(
      prettier.format(JSON.stringify(networkConfig), jsonParserOptions)
    );
    defaultCacheFile[networkNames[i]].toBlock = networkConfig.cache.toBlock;
  }

  console.log('Default cache file:', defaultCacheFile);

  const upload = await requestInput("Upload to pinata? (y/n): ");
    
  if (upload == "y") {
    for (let i = 0; i < networkNames.length; i++) {
      fs.writeFileSync(
        `./src/configs/${networkNames[i]}/config.json`,
        prettier.format(JSON.stringify(appConfig[networkNames[i]]), jsonParserOptions),
        {
          encoding: 'utf8',
          flag: 'w',
        }
      );

      await uploadFileToPinata(
        `./cache/${networkNames[i]}.json`,
        `DXvote ${networkNames[i]} Cache`,
        `dxvote-${networkNames[i]}-cache`
      );
      await uploadFileToPinata(
        `./src/configs/${networkNames[i]}/config.json`,
        `DXvote ${networkNames[i]} Config`,
        `dxvote-${networkNames[i]}-config`
      );
      
    }

    fs.writeFileSync(
      './defaultCacheFile.json',
      JSON.stringify(defaultCacheFile, null, 2),
      { encoding: 'utf8', flag: 'w' }
    );
    await uploadFileToPinata(
      './defaultCacheFile.json',
      'DXvote Default Cache',
      'dxvote-cache'
    );    
  }

  rl.close();
}

tryWhile([main()])
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
