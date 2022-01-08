import { providers } from 'ethers';
import React from 'react';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { BigNumber } from 'ethers';
import { getContract } from '../../../utils/contracts';
import { abi as ERC20Guild_ABI } from '../../../contracts/ERC20Guild.json';
import { ERC20Guild } from '../../../types/ERC20Guild';

interface ServiceContext extends GuildServiceProviderState {
  initialize: (context: Web3ReactContextInterface, address: string) => void;
}
export const GuildServiceContext = React.createContext<ServiceContext>(null);

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

interface GuildServiceProviderProps {
  children: React.ReactNode;
}

export class GuildServiceProvider extends React.Component<
  GuildServiceProviderProps,
  GuildServiceProviderState
> {
  state: GuildServiceProviderState = {
    web3Context: null,
    contract: null,
    address: '',
    token: '',
    permissionRegistry: '',
    name: '',
    proposalTime: null,
    timeForExecution: null,
    maxActiveProposals: null,
  };

  initialize = async (
    web3Context: Web3ReactContextInterface,
    address: string
  ) => {
    console.debug('[GuildServiceContext - initialize]', web3Context, address);
    const contract = this._getContract(web3Context, address);
    const config = await this._getGuildConfig(contract);

    this.setState({
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

  private _getContract = (
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
      const contract = getContract(
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
  private _getGuildConfig = async (contract: ERC20Guild) => {
    if (!contract) {
      console.log('_getGuildConfig contract', contract);
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

  render() {
    return (
      <GuildServiceContext.Provider
        value={{
          ...this.state,
          initialize: this.initialize,
        }}
      >
        {this.props.children}
      </GuildServiceContext.Provider>
    );
  }
}

export const useGuildProviderService = () =>
  React.useContext(GuildServiceContext);
