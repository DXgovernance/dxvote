import IPFS from 'ipfs-core';
import axios from 'axios';
import { DaoNetworkCache, DaoInfo } from '../src/types';
const fs = require('fs');
const hre = require('hardhat');
const web3 = hre.web3;
const { NETWORK_IDS } = require('../src/utils');
const { getUpdatedCache } = require('../src/cache');
const appConfig = require('../src/config.json');
const FormData = require('form-data');

const minimumAmountOfBlocksToUpdate = {
  mainnet: 50000,
  xdai: 150000,
  rinkeby: 500000,
  arbitrum: 500000,
  arbitrumTestnet: 5000000,
  localhost: 100,
};

const networkName = hre.network.name;
const emptyCache: DaoNetworkCache = {
  networkId: NETWORK_IDS[networkName],
  l1BlockNumber: 0,
  l2BlockNumber: 0,
  daoInfo: {} as DaoInfo,
  schemes: {},
  proposals: {},
  callPermissions: {},
  votingMachines: {},
  ipfsHashes: [],
};

// Add missing network cache files in the data/cache folder
const networks = process.env.REACT_APP_ETH_NETWORKS.split(',');
for (let i = 0; i < networks.length; i++) {
  if (!fs.existsSync('./cache/' + networks[i] + '.json'))
    fs.writeFileSync(
      './cache/' + networks[i] + '.json',
      JSON.stringify(emptyCache),
      { encoding: 'utf8', flag: 'w' }
    );
}

async function main() {
  if (process.env.EMPTY_CACHE) {
    fs.writeFileSync(
      './cache/' + networkName + '.json',
      JSON.stringify(emptyCache, null, 2),
      { encoding: 'utf8', flag: 'w' }
    );
  } else {
    const ipfs = await IPFS.create();

    // Get the network configuration
    let networkConfig = appConfig[networkName];
    let networkCacheFile: DaoNetworkCache;
    if (networkName === 'localhost') {
      networkConfig = JSON.parse(
        await fs.readFileSync('./.developmentNetwork.json')
      );
      console.log(networkConfig);
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
    const fromBlock = Math.max(
      networkCacheFile.l1BlockNumber + 1,
      networkConfig.cache.toBlock
    );
    const blockNumber = await web3.eth.getBlockNumber();
    const toBlock = process.env.RESET_CACHE
      ? fromBlock
      : process.env.CACHE_TO_BLOCK ||
        networkConfig.cache.toBlock +
          minimumAmountOfBlocksToUpdate[networkName];

    if (process.env.RESET_CACHE || toBlock < blockNumber) {
      // The cache file is updated with the data that had before plus new data in the network cache file
      console.debug(
        'Runing cache script from block',
        networkConfig.cache.toBlock,
        'to block',
        blockNumber,
        'in network',
        networkName
      );
      networkCacheFile = await getUpdatedCache(
        networkCacheFile,
        networkConfig.contracts,
        networkConfig.cache.toBlock,
        blockNumber,
        web3
      );
    }

    fs.writeFileSync(
      './cache/' + networkName + '.json',
      JSON.stringify(networkCacheFile),
      { encoding: 'utf8', flag: 'w' }
    );

    networkConfig.cache.toBlock = blockNumber;
    const newIpfsHash = (
      await ipfs.add(fs.readFileSync('./cache/' + networkName + '.json'), {
        pin: true,
        onlyHash: false,
      })
    ).cid.toString();

    // Upload the cache file
    if (newIpfsHash !== networkConfig.cache.ipfsHash) {
      networkConfig.cache.ipfsHash = newIpfsHash;

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
        })
        .catch(function (error) {
          console.error(error);
        });

      appConfig[networkName] = networkConfig;
    }

    console.debug(
      `IPFS hash for cache in ${networkName} network: ${appConfig[networkName].cache.ipfsHash}`
    );
  }

  // Update the appConfig file that stores the hashes of the dapp config and network caches
  fs.writeFileSync('./src/config.json', JSON.stringify(appConfig, null, 2), {
    encoding: 'utf8',
    flag: 'w',
  });
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
