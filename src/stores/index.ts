// Stores
import ProviderStore from './Provider';
import TransactionStore from './Transaction';
import ModalStore from './Modal';
import ConfigStore from './ConfigStore';
import DaoStore from './DaoStore';
import UserStore from './UserStore';
import BlockchainStore from './BlockchainStore';
import ABIService from '../services/ABIService';
import MulticallService from '../services/MulticallService';
import DaoService from '../services/DaoService';
import EventsService from '../services/EventsService';
import IPFSService from '../services/IPFSService';
import PinataService from '../services/PinataService';
import EtherscanService from '../services/EtherscanService';

export default class RootStore {
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

  constructor() {
    this.abiService = new ABIService(this);
    this.multicallService = new MulticallService(this);
    this.eventsService = new EventsService(this);
    this.daoService = new DaoService(this);
    this.ipfsService = new IPFSService(this);
    this.pinataService = new PinataService(this);
    this.etherscanService = new EtherscanService(this);
    this.providerStore = new ProviderStore(this);
    this.transactionStore = new TransactionStore(this);
    this.modalStore = new ModalStore(this);
    this.configStore = new ConfigStore(this);
    this.daoStore = new DaoStore(this);
    this.userStore = new UserStore(this);
    this.blockchainStore = new BlockchainStore(this);
  }
}
