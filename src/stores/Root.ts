// Stores
import ProviderStore from './ETHProvider';
import TransactionStore from './Transaction';
import ModalStore from './Modal';
import ConfigStore from './ConfigStore';
import DaoStore from './DaoStore';
import BlockchainStore from './BlockchainStore';
import ABIService from '../services/ABIService';
import MulticallService from '../services/MulticallService';
import DaoService from '../services/DaoService';
import IPFSService from '../services/IPFSService';

export default class RootStore {
  providerStore: ProviderStore;
  transactionStore: TransactionStore;
  modalStore: ModalStore;
  configStore: ConfigStore;
  daoStore: DaoStore;
  blockchainStore: BlockchainStore;

  abiService: ABIService;
  multicallService: MulticallService;
  daoService: DaoService;
  ipfsService: IPFSService;

  constructor() {
    this.abiService = new ABIService(this);
    this.multicallService = new MulticallService(this);
    this.daoService = new DaoService(this);
    this.ipfsService = new IPFSService(this);
    this.providerStore = new ProviderStore(this);
    this.transactionStore = new TransactionStore(this);
    this.modalStore = new ModalStore(this);
    this.configStore = new ConfigStore(this);
    this.daoStore = new DaoStore(this);
    this.blockchainStore = new BlockchainStore(this);
  }
}
