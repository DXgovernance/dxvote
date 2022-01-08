import React from 'react';
import { BigNumber } from 'ethers';
import { matchPath } from 'react-router';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { ERC20Guild } from '../../../types/ERC20Guild';
import { useGuildProviderService } from '../providerService';
import { useWeb3React } from '@web3-react/core';

interface ConfigContext {
  contract: ERC20Guild;
  initialize: (context: Web3ReactContextInterface, address: string) => void;
  web3Context: Web3ReactContextInterface;
  address: string;
  token: string;
  permissionRegistry: string;
  name: string;
  proposalTime: BigNumber;
  timeForExecution: BigNumber;
  maxActiveProposals: BigNumber;
}

export const GuildConfigContext = React.createContext<ConfigContext>(null);

interface GuildConfigProviderProps {
  guildAddress?: string;
  children?: React.ReactNode;
}

export const GuildConfigProvider = (props: GuildConfigProviderProps) => {
  const web3React = useWeb3React();
  const providerService = useGuildProviderService();

  const location = matchPath<{ address: string }>(window?.location?.hash, {
    path: '#/guilds/:chain_name/:address',
  });

  React.useEffect(() => {
    providerService.initialize(web3React, location?.params?.address);
  }, [web3React, location?.params?.address]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GuildConfigContext.Provider
      value={{
        contract: providerService.contract,
        initialize: providerService.initialize,
        address: props.guildAddress,
        web3Context: providerService.web3Context,
        token: providerService.token,
        permissionRegistry: providerService.permissionRegistry,
        name: providerService.name,
        proposalTime: providerService.proposalTime,
        timeForExecution: providerService.timeForExecution,
        maxActiveProposals: providerService.maxActiveProposals,
      }}
    >
      {props.children}
    </GuildConfigContext.Provider>
  );
};

export const useGuildConfigContext = () => React.useContext(GuildConfigContext);
