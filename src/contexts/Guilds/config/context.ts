import React from 'react';
import { GuildServiceProviderState } from './configProvider';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';

export interface ConfigContext extends GuildServiceProviderState {
  initialize: (context: Web3ReactContextInterface, address: string) => void;
}

export const GuildConfigContext = React.createContext<ConfigContext>(null);
