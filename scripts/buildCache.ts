const fs = require("fs");
const hre = require("hardhat");
const web3 = hre.web3;
const { NETWORK_IDS } = require("../src/utils");
const { getUpdatedCache } = require("../src/cache");
import IPFS from 'ipfs-core';
import axios from 'axios';
const appConfig = require("../src/config.json");
import { DaoNetworkCache, DaoInfo} from "../src/types";
const FormData = require('form-data');

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
  ipfsHashes: []
};

// Add missing network cache files in the data/cache folder
const networks = process.env.REACT_APP_ETH_NETWORKS.split(',');
for (let i = 0; i < networks.length; i++) {
  if (!fs.existsSync("./cache/"+networks[i]+".json"))
    fs.writeFileSync(
      "./cache/"+networks[i]+".json",
      JSON.stringify(emptyCache),
      { encoding: "utf8", flag: "w" }
    );
}


async function main() {
  
  if (process.env.EMPTY_CACHE) {
    
    fs.writeFileSync(
      "./data/cache/"+networkName+".json",
      JSON.stringify( emptyCache , null, 2),
      { encoding: "utf8", flag: "w" }
    );
    
  } else {
    
    const ipfs = await IPFS.create();
    
    // Get the network configuration
    let networkConfig = appConfig[networkName];
    let networkCacheFile: DaoNetworkCache;
    if (networkName === "localhost"){
      networkConfig = JSON.parse(await fs.readFileSync("./.developmentNetwork.json"));
      console.log(networkConfig)
      networkCacheFile = emptyCache;
    } else {
      emptyCache.l1BlockNumber = networkConfig.cache.fromBlock;
      emptyCache.daoInfo.address = networkConfig.contracts.avatar;
      const networkCacheFetch = await axios({
        method: 'GET',
        url: 'https://gateway.pinata.cloud/ipfs/' + networkConfig.cache.ipfsHash,
      });
      networkCacheFile = 
        (networkCacheFetch.data && !process.env.RESET_CACHE)
        ? networkCacheFetch.data
        : emptyCache;
    }
      
    // Set block range for the script to run, if cache to blcok is set that value is used, if not we use last block 
    const fromBlock = Math.max(networkCacheFile.l1BlockNumber + 1, networkConfig.cache.fromBlock);
    let toBlock = process.env.CACHE_TO_BLOCK || networkConfig.cache.toBlock;

    if (!toBlock || toBlock == 0)
      toBlock = await web3.eth.getBlockNumber();
    
    if (fromBlock < toBlock) {
      // The cache file is updated with the data that had before plus new data in the network cache file
      console.debug("Runing cache script from block", fromBlock, "to block", toBlock, "in network", networkName);
      networkCacheFile = await getUpdatedCache(networkCacheFile, networkConfig.contracts, fromBlock, toBlock, web3);
    }
    
    fs.writeFileSync(
      "./cache/"+networkName+".json",
      JSON.stringify(networkCacheFile),
      { encoding: "utf8", flag: "w" }
    );
    
    networkConfig.cache.toBlock = toBlock;
    const newIpfsHash = (await ipfs.add(
      fs.readFileSync("./cache/"+networkName+".json"),
      { pin: true, onlyHash: false }
    )).cid.toString();
    
    // Upload the cache file
    if (newIpfsHash !== networkConfig.cache.ipfsHash) {
      networkConfig.cache.ipfsHash = newIpfsHash;
      
      let data = new FormData();
      data.append('file', fs.createReadStream("./cache/"+networkName+".json"));
      data.append('pinataMetadata',JSON.stringify({
        name: `DXvote ${networkName} Cache`,
        keyvalues: {
          type: 'dxvote-cache',
          network: networkName
        }
      }));
      
      await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
        maxBodyLength: Number(Infinity), 
        headers: {
          'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_API_SECRET_KEY
        }
      }).then(function (response) {
        console.log(response.data)
      })
      .catch(function (error) {
        console.error(error)
      });
      
      appConfig[networkName] = networkConfig;
    }
    
    console.debug(`IPFS hash for cache in ${networkName} network: ${appConfig[networkName].cache.ipfsHash}`);
  }
  
  // Update the appConfig file that stores the hashes of the dapp config and network caches
  fs.writeFileSync("./src/config.json", JSON.stringify(appConfig, null, 2), { encoding: "utf8", flag: "w" });

} 

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
