import { makeObservable, observable, action } from 'mobx';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import RootContext from '../contexts';
import { ContractType } from './Provider';
import { BigNumber, bnum } from '../utils';
import { executeMulticall } from '../cache/helpers';

export default class UserStore {
  userInfo: { 
    address: string,
    ethBalance: BigNumber,
    repBalance: BigNumber,
    dxdBalance: BigNumber,
    dxdApproved: BigNumber,
    genBalance: BigNumber,
    genApproved: BigNumber
  };
  context: RootContext;

  constructor(context) {
    this.context = context;
    this.userInfo = {
      address: context.providerStore.getActiveWeb3React(),
      ethBalance: bnum(0),
      repBalance: bnum(0),
      dxdBalance: bnum(0),
      dxdApproved: bnum(0),
      genBalance: bnum(0),
      genApproved: bnum(0)
    };
    makeObservable(this, {
        userInfo: observable,
        update: action
      }
    );
  }
  
  getUserInfo() {
    return this.userInfo;
  }

  async update(web3React: Web3ReactContextInterface) {
    const { configStore, providerStore, daoStore, transactionStore } = this.context;
    const networkConfig = configStore.getNetworkConfig();
    const account = web3React.account;
    
    transactionStore.checkPendingTransactions(web3React, account);
    let callsToExecute = [[
      providerStore.getContract(web3React, ContractType.Multicall, networkConfig.utils.multicall),
      'getEthBalance',
      [account],
    ]];
    
    if (networkConfig.votingMachines.gen) {
      callsToExecute.push([
        providerStore.getContract(web3React, ContractType.ERC20, networkConfig.votingMachines.gen.token),
        'balanceOf',
        [account],
      ]);
      callsToExecute.push([
        providerStore.getContract(web3React, ContractType.ERC20, networkConfig.votingMachines.gen.token),
        'allowance',
        [account, networkConfig.votingMachines.gen.address],
      ]);
    }
    if (networkConfig.votingMachines.dxd) {
      callsToExecute.push([
        providerStore.getContract(web3React, ContractType.ERC20, networkConfig.votingMachines.dxd.token),
        'balanceOf',
        [account],
      ]);
      callsToExecute.push([
        providerStore.getContract(web3React, ContractType.ERC20, networkConfig.votingMachines.dxd.token),
        'allowance',
        [account, networkConfig.votingMachines.dxd.address],
      ]);
    }
    
    const callsResponse = await executeMulticall(
      web3React.library,
      providerStore.getContract(web3React, ContractType.Multicall, networkConfig.utils.multicall),
      callsToExecute
    );
    
    let userInfo = this.userInfo;
    userInfo.repBalance = account ? daoStore.getRepAt(account, providerStore.getCurrentBlockNumber()).userRep : bnum(0);

    // TO DO: Improve this mess of ifs
    userInfo.ethBalance = account ? bnum(callsResponse.decodedReturnData[0]) : bnum(0);
    userInfo.genBalance = (account && networkConfig.votingMachines.gen) ? bnum(callsResponse.decodedReturnData[1]) : bnum(0);
    userInfo.genApproved = (account && networkConfig.votingMachines.gen) ? bnum(callsResponse.decodedReturnData[2]) : bnum(0);
    userInfo.dxdBalance = (account && networkConfig.votingMachines.dxd && networkConfig.votingMachines.gen)
      ? bnum(callsResponse.decodedReturnData[3])
      : (account && networkConfig.votingMachines.dxd && !networkConfig.votingMachines.gen) 
      ? bnum(callsResponse.decodedReturnData[1])
      : bnum(0);
    userInfo.dxdApproved = (account && networkConfig.votingMachines.dxd && networkConfig.votingMachines.gen)
      ? bnum(callsResponse.decodedReturnData[4])
      : (account && networkConfig.votingMachines.dxd && !networkConfig.votingMachines.gen) 
      ? bnum(callsResponse.decodedReturnData[2])
      : bnum(0);
      
    this.userInfo = userInfo;
  }
  
}
