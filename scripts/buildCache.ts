import axios from 'axios';
import { DaoNetworkCache, DaoInfo } from '../src/types';
const fs = require('fs');
const hre = require('hardhat');
const stringify = require('json-stable-stringify');

const web3 = hre.web3;
const { getUpdatedCache, getProposalTitlesFromIPFS } = require('../src/cache');
const { tryWhile } = require('../src/utils/cache');

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

const FormData = require('form-data');

const networkName = hre.network.name;
const proposalTitlesFileName = 'proposalTitles';

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
};

let proposalTitles: Record<string, string> = {};

async function main() {
  if (process.env.EMPTY_CACHE) {
    fs.writeFileSync(
      './cache/' + networkName + '.json',
      JSON.stringify(emptyCache, null, 2),
      { encoding: 'utf8', flag: 'w' }
    );
    fs.writeFileSync(
      './cache/' + proposalTitlesFileName + '.json',
      JSON.stringify({}, null, 2),
      {
        encoding: 'utf8',
        flag: 'w',
      }
    );
  } else {
    // Get the network configuration
    let networkConfig = appConfig[networkName];
    let networkCacheFile: DaoNetworkCache;

    // Read the existing proposal titles file
    if (fs.existsSync('./cache/' + proposalTitlesFileName + '.json')) {
      proposalTitles = JSON.parse(
        fs.readFileSync('./cache/' + proposalTitlesFileName + '.json', {
          encoding: 'utf8',
          flag: 'r',
        })
      );
    }

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
        const networkCacheFetch = await axios({
          method: 'GET',
          url:
            'https://gateway.pinata.cloud/ipfs/' + networkConfig.cache.ipfsHash,
        });
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
        'Runing cache script from block',
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

    fs.writeFileSync(
      './cache/' + networkName + '.json',
      stringify(networkCacheFile),
      { encoding: 'utf8', flag: 'w' }
    );

    fs.writeFileSync(
      './cache/' + proposalTitlesFileName + '.json',
      stringify(proposalTitles),
      { encoding: 'utf8', flag: 'w' }
    );

    networkConfig.cache.toBlock = toBlock;

    // Upload the cache file
    let data = new FormData();
    data.append(
      'file',
      fs.createReadStream('./cache/' + networkName + '.json')
    );
    data.append(
      'pinataMetadata',
      JSON.stringify({
        name: `DXvote ${networkName} Cache`,
        keyvalues: {
          type: 'dxvote-cache',
          network: networkName,
        },
      })
    );

    await axios
      .post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
        maxBodyLength: Number(Infinity),
        headers: {
          'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_API_SECRET_KEY,
        },
      })
      .then(function (response) {
        console.log(response.data);
        if (response.data.IpfsHash) {
          networkConfig.cache.ipfsHash = response.data.IpfsHash;
          appConfig[networkName] = networkConfig;
          console.debug(
            `IPFS hash for cache in ${networkName} network: ${appConfig[networkName].cache.ipfsHash}`
          );
        } else {
          console.error('Error uploading cache to pinata');
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  // Update the appConfig file that stores the hashes of the dapp config and network caches
  fs.writeFileSync(
    './src/configs/' + networkName + '/config.json',
    JSON.stringify(appConfig[networkName], null, 2),
    {
      encoding: 'utf8',
      flag: 'w',
    }
  );

  fs.writeFileSync(
    './src/configs/' + proposalTitlesFileName + '.json',
    JSON.stringify(proposalTitles, null, 2),
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
