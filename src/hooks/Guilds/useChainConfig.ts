import { useWeb3React } from '@web3-react/core';
import { getNetworkById } from 'utils';

const configs = {
  arbitrum: require('configs/arbitrum/config.json'),
  arbitrumTestnet: require('configs/arbitrumTestnet/config.json'),
  mainnet: require('configs/mainnet/config.json'),
  xdai: require('configs/xdai/config.json'),
  rinkeby: require('configs/rinkeby/config.json'),
  localhost: require('configs/localhost/config.json'),
};

interface Token {
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  fetchPrice: boolean;
  logoURI: string;
}

interface Config {
  cache: {
    fromBlock: number;
    toBlock: number;
    ipfsHash: string;
  };

  contracts: {
    fromBlock: number;
    avatar: string;
    reputation: string;
    token: string;
    controller: string;
    permissionRegistry: string;
    schemes: {
      RegistrarWalletScheme: string;
      MasterWalletScheme: string;
      QuickWalletScheme: string;
    };
    utils: {
      multicall: string;
      dxDaoNFT: string;
      dxdVestingFactory: string;
      guildRegistry: string;
    };
    votingMachines: {
      [address: string]: {
        type: string;
        token: string;
      };
    };
    daostack: {
      [address: string]: {
        contractToCall: string;
        creationLogEncoding: any; // TODO: complete
        name: string;
        newProposalTopics: any[]; // TODO: complete
        redeemer: string;
        supported: boolean;
        type: string;
        voteParams: string;
        votingMachine: string;
      };
    };
  };
  recommendedCalls: any[];
  proposalTemplates: any[];
  proposalTypes: any[];
  contributionLevels: [
    {
      id: string;
      dxd: number;
      stable: number;
      rep: number;
    }
  ];
  tokens: Token[];
  guilds: string[];
}

const useChainConfig = (chain?: number): Config => {
  const { chainId } = useWeb3React();
  const { name } = getNetworkById(chain || chainId);
  return configs[name];
};

export default useChainConfig;
