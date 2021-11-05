import { makeObservable, observable, action } from 'mobx';
import { ethers } from 'ethers';
import PromiEvent from 'promievent';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import RootContext from '../contexts';
import { sendAction } from './actions/actions';
import { TXEvents } from '../utils';
import { schema } from '../services/ABIService';

export enum ContractType {
  ERC20 = 'ERC20',
  Avatar = 'Avatar',
  Controller = 'Controller',
  Reputation = 'Reputation',
  PermissionRegistry = 'PermissionRegistry',
  VotingMachine = 'VotingMachine',
  DXDVotingMachine = 'DXDVotingMachine',
  WalletScheme = 'WalletScheme',
  Multicall = 'Multicall',
  Redeemer = 'Redeemer',
}

export interface ChainData {
  currentBlockNumber: number;
}

enum ERRORS {
  UntrackedChainId = 'Attempting to access data for untracked chainId',
  ContextNotFound = 'Specified context name note stored',
  BlockchainActionNoAccount = 'Attempting to do blockchain transaction with no account',
  BlockchainActionNoChainId = 'Attempting to do blockchain transaction with no chainId',
  BlockchainActionNoResponse = 'No error or response received from blockchain action',
}

export default class ProviderStore {
  context: RootContext;
  web3Context: Web3ReactContextInterface;
  chainData: ChainData;

  constructor(context: RootContext) {
    this.context = context;
    this.web3Context = null;
    this.chainData = { currentBlockNumber: -1 };

    makeObservable(this, {
      web3Context: observable,
      chainData: observable,
      setWeb3Context: action,
      sendTransaction: action,
      sendRawTransaction: action,
      setCurrentBlockNumber: action,
    });
  }

  getCurrentBlockNumber(): number {
    return this.chainData.currentBlockNumber;
  }

  setCurrentBlockNumber(blockNumber: number): void {
    console.debug('[ProviderStore] Setting current block number', blockNumber);
    this.chainData.currentBlockNumber = blockNumber;
  }

  getContract(
    web3React: Web3ReactContextInterface,
    type: ContractType,
    address: string,
    signerAccount?: string
  ): ethers.Contract {
    const { library } = web3React;

    if (signerAccount) {
      return new library.eth.Contract(schema[type], address, {
        from: signerAccount,
      });
    }

    return new library.eth.Contract(schema[type], address);
  }

  getActiveWeb3React(): Web3ReactContextInterface {
    return this.web3Context;
  }

  setWeb3Context(context: Web3ReactContextInterface) {
    console.debug('[ProviderStore] Setting Web3 context', context);
    this.web3Context = context;
  }

  sendTransaction = (
    web3React: Web3ReactContextInterface,
    contractType: ContractType,
    contractAddress: string,
    action: string,
    params: any[],
    overrides?: any
  ): PromiEvent<any> => {
    const { transactionStore } = this.context;
    const { chainId, account } = web3React;

    overrides = overrides ? overrides : {};

    if (!account) {
      throw new Error(ERRORS.BlockchainActionNoAccount);
    }

    if (!chainId) {
      throw new Error(ERRORS.BlockchainActionNoChainId);
    }

    const contract = this.getContract(
      web3React,
      contractType,
      contractAddress,
      account
    );

    const response = sendAction({
      contract,
      action,
      sender: account,
      data: params,
      overrides,
    }).on(TXEvents.TX_HASH, hash => {
      transactionStore.addTransactionRecord(account, hash);
    });

    return response;
  };

  sendRawTransaction = (
    web3React: Web3ReactContextInterface,
    to: string,
    data: string,
    value: string
  ): PromiEvent<any> => {
    const { transactionStore } = this.context;
    const { chainId, account } = web3React;

    if (!account) {
      throw new Error(ERRORS.BlockchainActionNoAccount);
    }

    if (!chainId) {
      throw new Error(ERRORS.BlockchainActionNoChainId);
    }

    const promiEvent = new PromiEvent<any>(() => {
      web3React.library.eth
        .sendTransaction({ from: account, to: to, data: data, value: value })
        .once('transactionHash', hash => {
          transactionStore.addTransactionRecord(account, hash);
          promiEvent.emit(TXEvents.TX_HASH, hash);
          console.debug(TXEvents.TX_HASH, hash);
        })
        .once('receipt', receipt => {
          promiEvent.emit(TXEvents.RECEIPT, receipt);
          console.debug(TXEvents.RECEIPT, receipt);
        })
        .once('confirmation', (confNumber, receipt) => {
          promiEvent.emit(TXEvents.CONFIRMATION, {
            confNumber,
            receipt,
          });
          console.debug(TXEvents.CONFIRMATION, {
            confNumber,
            receipt,
          });
        })
        .on('error', error => {
          console.debug(error.code);
          promiEvent.emit(TXEvents.INVARIANT, error);
          console.debug(TXEvents.INVARIANT, error);
        })
        .then(receipt => {
          promiEvent.emit(TXEvents.FINALLY, receipt);
          console.debug(TXEvents.FINALLY, receipt);
        })
        .catch(e => {
          console.debug('rejected', e);
        });
    });

    return promiEvent;
  };
}
