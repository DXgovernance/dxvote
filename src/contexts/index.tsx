import React from 'react';

import ABIService from '../services/ABIService';
import MulticallService from '../services/MulticallService';
import DaoService from '../services/DaoService';
import EventsService from '../services/EventsService';
import IPFSService from '../services/IPFSService';
import PinataService from '../services/PinataService';
import EtherscanService from '../services/EtherscanService';
import CoingeckoService from '../services/CoingeckoService';

import ProviderStore from '../stores/Provider';
import TransactionStore from '../stores/Transaction';
import ModalStore from '../stores/Modal';
import ConfigStore from '../stores/ConfigStore';
import DaoStore from '../stores/DaoStore';
import UserStore from '../stores/UserStore';
import BlockchainStore from '../stores/BlockchainStore';

export default class RootContext {

  providerStore: ProviderStore;
  transactionStore: TransactionStore;
  modalStore: ModalStore;
  configStore: ConfigStore;
  daoStore: DaoStore;
  userStore: UserStore;
  blockchainStore: BlockchainStore;
  
  abiService: ABIService;
  multicallService: MulticallService;
  daoService: DaoService;
  eventsService: EventsService;
  ipfsService: IPFSService;
  pinataService: PinataService;
  etherscanService: EtherscanService;
  coingeckoService: CoingeckoService;
  
  constructor() {
    this.providerStore = new ProviderStore(this);
    this.transactionStore = new TransactionStore(this);
    this.modalStore = new ModalStore(this);
    this.configStore = new ConfigStore(this);
    this.daoStore = new DaoStore(this);
    this.userStore = new UserStore(this);
    this.blockchainStore = new BlockchainStore(this);
    
    this.abiService = new ABIService(this);
    this.multicallService = new MulticallService(this);
    this.eventsService = new EventsService(this);
    this.daoService = new DaoService(this);
    this.ipfsService = new IPFSService(this);
    this.pinataService = new PinataService(this);
    this.etherscanService = new EtherscanService(this);
    this.coingeckoService = new CoingeckoService(this);
  }
}

export const rootContext = React.createContext({
  context: new RootContext()
});

export const useContext = () => React.useContext(rootContext);
