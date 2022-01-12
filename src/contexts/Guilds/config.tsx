import React from 'react';
import { providers, BigNumber } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { matchPath } from 'react-router';
import { getContract as getContractUtil } from '../../utils/contracts';
import { abi as ERC20Guild_ABI } from '../../contracts/ERC20Guild.json';
import { ERC20Guild } from '../../types/ERC20Guild';

const getContract = (
  web3Context: Web3ReactContextInterface,
  address: string
): ERC20Guild | null => {
  try {
    const currentProvider = web3Context?.library?.currentProvider;
    if (!currentProvider) {
      console.debug(
        '[GuildServiceContext - _getContract]: currentProvider null'
      );
      return null;
    }
    const provider = new providers.Web3Provider(currentProvider);
    const contract = getContractUtil(
      address,
      ERC20Guild_ABI,
      provider
    ) as ERC20Guild;
    return contract;
  } catch (e) {
    console.error(
      '[GuildServiceContext - _getContract]: Error getting contract instance',
      e
    );
    return null;
  }
};

const getGuildConfig = async (contract: ERC20Guild) => {
  if (!contract) {
    console.debug(
      '[GuildServiceContext - updateGuildConfig]: No contract found'
    );
    return {};
  }
  try {
    const [
      token,
      permissionRegistry,
      name,
      proposalTime,
      timeForExecution,
      maxActiveProposals,
    ] = await Promise.all([
      contract.getToken(),
      contract.getPermissionRegistry(),
      contract.getName(),
      contract.getProposalTime(),
      contract.getTimeForExecution(),
      contract.getMaxActiveProposals(),
    ]);
    return {
      token,
      permissionRegistry,
      name,
      proposalTime,
      timeForExecution,
      maxActiveProposals,
    };
  } catch (e) {
    console.error('[GuildProviderService - updateGuildConfig]', e);
    return {};
  }
};

export interface ConfigContext extends GuildServiceProviderState {}

export const GuildConfigContext = React.createContext<ConfigContext>(null);

interface GuildServiceProviderState {
  web3Context: Web3ReactContextInterface;
  contract: ERC20Guild;
  address: string;
  token: string;
  permissionRegistry: string;
  name: string;
  proposalTime: BigNumber;
  timeForExecution: BigNumber;
  maxActiveProposals: BigNumber;
}
interface GuildConfigProviderProps {
  children: React.ReactNode;
}

export const GuildConfigProvider: React.FunctionComponent<
  GuildConfigProviderProps
> = (props: GuildConfigProviderProps) => {
  const web3Context = useWeb3React();

  const [state, setState] = React.useState<GuildServiceProviderState>({
    web3Context: null,
    contract: null,
    address: '',
    token: '',
    permissionRegistry: '',
    name: '',
    proposalTime: null,
    timeForExecution: null,
    maxActiveProposals: null,
  });

  const location = matchPath<{ address: string; chain: string }>(
    window?.location?.hash,
    {
      path: '#/guilds/:chain/:address',
    }
  );
  const address = location?.params?.address;

  React.useEffect(() => {
    const initialize = async () => {
      console.debug('[GuildServiceContext - initialize]', web3Context, address);
      if (!address) {
        console.debug(
          '[GuildServiceContext - initialize] - Cannot find address'
        );
        return;
      }
      const contract = getContract(web3Context, address);
      const config = await getGuildConfig(contract);

      setState({
        contract,
        web3Context,
        address,
        token: config.token,
        permissionRegistry: config.permissionRegistry,
        name: config.name,
        proposalTime: config.proposalTime,
        timeForExecution: config.timeForExecution,
        maxActiveProposals: config.maxActiveProposals,
      });
    };
    initialize();
  }, [web3Context, address]);

  return (
    <GuildConfigContext.Provider value={state}>
      {props.children}
    </GuildConfigContext.Provider>
  );
};
