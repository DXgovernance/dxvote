import React from 'react';

import ABIService from '../services/ABIService';
import MulticallService from '../services/MulticallService';
import DaoService from '../services/DaoService';
import EventsService from '../services/EventsService';
import IPFSService from '../services/IPFSService';
import PinataService from '../services/PinataService';
import EtherscanService from '../services/EtherscanService';
import CoingeckoService from '../services/CoingeckoService';
import InfuraService from '../services/InfuraService';
import AlchemyService from '../services/AlchemyService';
import CustomRpcService from '../services/CustomRpcService';

import ProviderStore from '../stores/Provider';
import TransactionStore from '../stores/Transaction';
import ModalStore from '../stores/Modal';
import ConfigStore from '../stores/ConfigStore';
import DaoStore from '../stores/DaoStore';
import UserStore from '../stores/UserStore';
import BlockchainStore from '../stores/BlockchainStore';
import NotificationStore from '../stores/NotificationStore';

/*
https://reactjs.org/docs/context.html#reactcreatecontext

Context provides a way to pass data through the component tree without having to pass props down manually at every level.

In a typical React application, data is passed top-down (parent to child) via props, but such usage can be cumbersome for certain types of props (e.g. locale preference, UI theme) that are required by many components within an application. Context provides a way to share values like these between components without having to explicitly pass a prop through every level of the tree.

A root single context calss is exported with the services and stores of the dapp.

Services: Contexts that are not use to store data, only to process information in the dapp and fecth information from external protocols and APIs.
Stores: Context that are used to store data and expose them all around the dapp.
*/

export default class RootContext {
  providerStore: ProviderStore;
  transactionStore: TransactionStore;
  modalStore: ModalStore;
  configStore: ConfigStore;
  daoStore: DaoStore;
  userStore: UserStore;
  notificationStore: NotificationStore;
  blockchainStore: BlockchainStore;

  abiService: ABIService;
  multicallService: MulticallService;
  daoService: DaoService;
  eventsService: EventsService;
  ipfsService: IPFSService;
  pinataService: PinataService;
  etherscanService: EtherscanService;
  coingeckoService: CoingeckoService;
  infuraService: InfuraService;
  alchemyService: AlchemyService;
  customRpcService: CustomRpcService;

  constructor() {
    this.providerStore = new ProviderStore(this);
    this.transactionStore = new TransactionStore(this);
    this.modalStore = new ModalStore(this);
    this.configStore = new ConfigStore(this);
    this.daoStore = new DaoStore(this);
    this.userStore = new UserStore(this);
    this.notificationStore = new NotificationStore(this);
    this.blockchainStore = new BlockchainStore(this);

    this.abiService = new ABIService(this);
    this.multicallService = new MulticallService(this);
    this.eventsService = new EventsService(this);
    this.daoService = new DaoService(this);
    this.ipfsService = new IPFSService(this);
    this.pinataService = new PinataService(this);
    this.etherscanService = new EtherscanService(this);
    this.coingeckoService = new CoingeckoService(this);
    this.infuraService = new InfuraService(this);
    this.alchemyService = new AlchemyService(this);
    this.customRpcService = new CustomRpcService(this);
  }
}

export const rootContext = React.createContext({
  context: new RootContext(),
});

export const useContext = () => React.useContext(rootContext);
