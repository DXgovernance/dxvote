import RootStore from 'stores';
import { ContractType } from './Provider';
import { bnum } from '../utils/helpers';
import { UserInfo } from '../types';


export default class UserStore {
  userInfo: UserInfo;
  rootStore: RootStore;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  getUserInfo(): UserInfo {
    const { configStore, providerStore, blockchainStore } = this.rootStore;
    const { account } = providerStore.getActiveWeb3React();
    
    const votingMachineToken = blockchainStore.getCachedValue({
        contractType: ContractType.VotingMachine,
        address: configStore.getVotingMachineAddress(),
        method: 'stakingToken',
    })
    
    const repBalance = account ? this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.Reputation,
      address: configStore.getReputationAddress(),
      method: 'balanceOf',
      params: [account]
    }) : bnum(0);
    
    const ethBalance = account ? this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.Multicall,
      address: configStore.getMulticallAddress(),
      method: 'getEthBalance',
      params: [account]
    }) : bnum(0);
    
    const dxdBalance = account && votingMachineToken ? this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.ERC20,
      address: votingMachineToken,
      method: 'balanceOf',
      params: [account]
    }) : bnum(0);
    
    const dxdApproved = account && votingMachineToken ? this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.ERC20,
      address: votingMachineToken,
      method: 'allowance',
      params: [account, configStore.getVotingMachineAddress()]
    }) : bnum(0);
    
    this.userInfo = {
      address: account,
      ethBalance,
      repBalance,
      dxdBalance,
      dxdApproved
    };
    return this.userInfo;
  }
  
}
