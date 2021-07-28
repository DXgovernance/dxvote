const fs = require("fs");
const hre = require("hardhat");
const web3 = hre.web3;
const { getNetworkConfig } = require("../src/config");
const { getUpdatedCache } = require("../src/cache");
const { NETWORK_IDS } = require("../src/provider/connectors");
import IPFS from 'ipfs-core';

import { DaoNetworkCache, DaoInfo} from "../src/types";

async function main() {
  
  // Initializing cache based on stored cache file and network used, if used localhost the cache is always restarted
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
  
  if (process.env.EMPTY_CACHE) {
    
    fs.writeFileSync(
      "./src/cache/data/"+networkName+".json",
      JSON.stringify( emptyCache , null, 2),
      { encoding: "utf8", flag: "w" }
    );
    
  } else {
    const contractsConfig = getNetworkConfig(networkName);
    emptyCache.l1BlockNumber = contractsConfig.fromBlock;
    emptyCache.daoInfo.address = contractsConfig.avatar;
    
    const networkCacheFile: DaoNetworkCache = 
      (fs.existsSync("./src/cache/data/"+networkName+".json") && !process.env.RESET_CACHE)
        ? JSON.parse(fs.readFileSync("./src/cache/data/"+networkName+".json", "utf-8"))
        : emptyCache;
      
    // Set block range for the script to run, if cache to blcok is set that value is used, if not we use last block 
    const fromBlock = Math.max(networkCacheFile.l1BlockNumber + 1, contractsConfig.fromBlock);
    const toBlock = process.env.CACHE_TO_BLOCK || await web3.eth.getBlockNumber();
    
    if (fromBlock < toBlock) {
      console.debug("Runing cache script from block", fromBlock, "to block", toBlock, "in network", networkName);

      // The cache file is updated with the data taht had before plus new data in the network cache file
      fs.writeFileSync(
        "./src/cache/data/"+networkName+".json",
        JSON.stringify( await getUpdatedCache(networkCacheFile, networkName, fromBlock, toBlock, web3) , null, 2),
        { encoding: "utf8", flag: "w" }
      );
      const ipfs = await IPFS.create();
      const result = await ipfs.add(
        { path: "./src/cache/data/"+networkName+".json" },
        { pin: false, onlyHash: true }
      );
      console.debug(`IPFS hash for cache in ${networkName} network: ${result.cid.toString()}`);
    }
    
  }
} 

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
