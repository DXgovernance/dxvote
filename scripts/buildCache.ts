const fs = require("fs");
const hre = require("hardhat");
const web3 = hre.web3;
const { NETWORK_IDS } = require("../src/provider/connectors");

const networkName = hre.network.name;
const emptyCache: DaoNetworkCache = {
  networkId: NETWORK_IDS[networkName],
  l1BlockNumber: 1,
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
  if (!fs.existsSync("./data/cache/"+networks[i]+".json"))
    fs.writeFileSync(
      "./data/cache/"+networks[i]+".json",
      JSON.stringify(emptyCache),
      { encoding: "utf8", flag: "w" }
    );
}

const { getNetworkConfig } = require("../src/utils");
const { getUpdatedCache } = require("../src/cache");
import IPFS from 'ipfs-core';
const appConfig = require("../src/appConfig.json");
import { DaoNetworkCache, DaoInfo} from "../src/types";

async function main() {
  
  if (process.env.EMPTY_CACHE) {
    
    fs.writeFileSync(
      "./data/cache/"+networkName+".json",
      JSON.stringify( emptyCache , null, 2),
      { encoding: "utf8", flag: "w" }
    );
    
  } else {
    
    const ipfs = await IPFS.create();

    // Update config file hash if needed
    const configHash = (await ipfs.add(
      fs.readFileSync("./data/config.json"),
      { pin: true, onlyHash: false }
    )).cid.toString();
    if (configHash != appConfig.configHash)
      appConfig.configHash = appConfig.configHash;
    
    // Get the network configuration
    const networkConfig = await getNetworkConfig(networkName);
    emptyCache.l1BlockNumber = networkConfig.contracts.fromBlock;
    emptyCache.daoInfo.address = networkConfig.contracts.avatar;
    
    let networkCacheFile: DaoNetworkCache = 
      (fs.existsSync("./data/cache/"+networkName+".json") && !process.env.RESET_CACHE)
        ? JSON.parse(fs.readFileSync("./data/cache/"+networkName+".json", "utf-8"))
        : emptyCache;
      
    // Set block range for the script to run, if cache to blcok is set that value is used, if not we use last block 
    const fromBlock = Math.max(networkCacheFile.l1BlockNumber + 1, networkConfig.contracts.fromBlock);
    let toBlock = process.env.CACHE_TO_BLOCK || appConfig.cacheToBlock[networkName];

    if (!toBlock || toBlock == 0)
      toBlock = await web3.eth.getBlockNumber();
    
    if (fromBlock < toBlock) {
      // The cache file is updated with the data that had before plus new data in the network cache file
      console.debug("Runing cache script from block", fromBlock, "to block", toBlock, "in network", networkName);
      networkCacheFile = await getUpdatedCache(networkCacheFile, networkConfig.contracts, fromBlock, toBlock, web3);
    }
    
    // Rewrite the cache file
    fs.writeFileSync(
      "./data/cache/"+networkName+".json",
      JSON.stringify(networkCacheFile),
      { encoding: "utf8", flag: "w" }
    );
    
    appConfig.cacheToBlock[networkName] = toBlock;
    appConfig.cacheHash[networkName] = (await ipfs.add(
      fs.readFileSync("./data/cache/"+networkName+".json"),
      { pin: true, onlyHash: false }
    )).cid.toString();
    
    console.debug(`IPFS hash for cache in ${networkName} network: ${appConfig.cacheHash[networkName]}`);
  }
  
  // Update the appConfig file that stores the hashes of the dapp config and network caches
  fs.writeFileSync("./src/appConfig.json", JSON.stringify(appConfig, null, 2), { encoding: "utf8", flag: "w" });

} 

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
