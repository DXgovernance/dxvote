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
  WalletScheme1_0 = 'WalletScheme1_0',
  WalletScheme1_1 = 'WalletScheme1_0',
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

  sign = (
    web3React: Web3ReactContextInterface,
    dataToSign: any
  ): Promise<any> => {
    const { chainId, account } = web3React;

    if (!account) {
      throw new Error(ERRORS.BlockchainActionNoAccount);
    }

    if (!chainId) {
      throw new Error(ERRORS.BlockchainActionNoChainId);
    }
    console.log(dataToSign);
    return new Promise((resolve, reject) => {
      web3React.library.eth.currentProvider.sendAsync(
        {
          method: 'eth_sign',
          params: [account, dataToSign],
          from: account,
        },
        function (err, result) {
          console.log(err, result);
          resolve(result);
        }
      );
    });
  };

  signTypedV3 = (
    web3React: Web3ReactContextInterface,
    dataToSign: any
  ): Promise<any> => {
    const { chainId, account } = web3React;

    if (!account) {
      throw new Error(ERRORS.BlockchainActionNoAccount);
    }

    if (!chainId) {
      throw new Error(ERRORS.BlockchainActionNoChainId);
    }
    console.log(dataToSign);
    const msgParams = JSON.stringify({
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Broadcast: [
          { name: 'topic', type: 'bytes32' },
          { name: 'message', type: 'string' },
        ],
      },
      primaryType: 'Broadcast',
      domain: {
        name: 'MessageLogger',
        version: '1',
        chainId: '0x04',
        verifyingContract: '0x0c850e40f72bdc012578788e25a02aadc0da85da',
      },
      message: dataToSign,
    });

    return new Promise((resolve, reject) => {
      web3React.library.eth.currentProvider.sendAsync(
        {
          method: 'eth_signTypedData_v3',
          params: [account, msgParams],
          from: account,
        },
        function (err, result) {
          console.log(err, result);
          resolve(result);
        }
      );
    });
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
