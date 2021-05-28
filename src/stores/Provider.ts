import { makeObservable, observable, action } from 'mobx';
import RootStore from 'stores';
import { ethers } from 'ethers';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import UncheckedJsonRpcSigner from 'provider/UncheckedJsonRpcSigner';
import { sendAction } from './actions/actions';
import { web3ContextNames } from '../provider/connectors';
import PromiEvent from 'promievent';
import { TXEvents } from '../enums';
import moment from 'moment';
import { schema } from '../services/ABIService';

export enum ContractType {
    ERC20 = 'ERC20',
    DecentralizedAutonomousTrust = 'ERC20',
    Avatar = 'Avatar',
    Controller = 'Controller',
    Reputation = 'Reputation',
    PermissionRegistry = 'PermissionRegistry',
    VotingMachine = 'VotingMachine',
    WalletScheme = 'WalletScheme',
    Multicall = 'Multicall'
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
    provider: any;
    accounts: string[];
    defaultAccount: string | null;
    web3Contexts: object;
    supportedNetworks: number[];
    chainData: ChainData;
    activeChainId: number;
    activeFetchLoop: any;
    activeAccount: string;
    rootStore: RootStore;

    constructor(rootStore) {
      this.rootStore = rootStore;
      this.web3Contexts = {};
      this.chainData = { currentBlockNumber: -1 };
      makeObservable(this, {
          provider: observable,
          accounts: observable,
          defaultAccount: observable,
          web3Contexts: observable,
          chainData: observable, 
          activeChainId: observable, 
          activeFetchLoop: observable, 
          activeAccount: observable,
          setCurrentBlockNumber: action,
          setActiveAccount: action,
          fetchUserBlockchainData: action
        }
      );
    }

    isFresh(blocknumber: number): boolean {
        return blocknumber === this.getCurrentBlockNumber();
    }

    isFresher(newBlockNumber: number, oldBlockNumber: number): boolean {
        return newBlockNumber > oldBlockNumber;
    }

    isBlockStale(blocknumber: number) {
        return blocknumber < this.chainData.currentBlockNumber;
    }

    getCurrentBlockNumber(): number {
        return this.chainData.currentBlockNumber;
    }

    setCurrentBlockNumber(blocknumber): void {
        this.chainData.currentBlockNumber = blocknumber;
    }

    setActiveAccount(account: string) {
        this.activeAccount = account;
    }

    fetchUserBlockchainData = async (
        web3React: Web3ReactContextInterface,
        account: string
    ) => {
        const { transactionStore } = this.rootStore;

        console.debug('[Fetch Start - User Blockchain Data]', {
            account,
        });

        transactionStore.checkPendingTransactions(web3React, account);
    };

    // account is optional
    getProviderOrSigner(library, account) {
        console.debug('[getProviderOrSigner', {
            library,
            account,
            signer: library.getSigner(account),
        });

        return account
            ? new UncheckedJsonRpcSigner(library.getSigner(account))
            : library;
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

    // get blockTime from blocknumber
    async getBlockTime(blocknumber) {
        const context = this.getActiveWeb3React();
        const blockData = await context.library.eth.getBlock(blocknumber);
        const date = new Date(blockData.timestamp * 1000);
        return moment(date).format('DD.MM - HH:mm');
    }


    // get blockHash from blocknumber
    async getBlockHash(blocknumber) {
        const context = this.getActiveWeb3React();
        const blockData = await context.library.eth.getBlock(blocknumber);
        return blockData.hash;
    }

    getActiveWeb3React(): Web3ReactContextInterface {
        const contextInjected = this.web3Contexts[web3ContextNames.injected];
        return contextInjected;
    }

    getWeb3React(name): Web3ReactContextInterface {
        if (!this.web3Contexts[name]) {
            throw new Error(ERRORS.ContextNotFound);
        }
        return this.web3Contexts[name];
    }

    @action setWeb3Context(name, context: Web3ReactContextInterface) {
        console.debug('[setWeb3Context]', name, context);
        this.web3Contexts[name] = context;
    }

    @action sendTransaction = (
        web3React: Web3ReactContextInterface,
        contractType: ContractType,
        contractAddress: string,
        action: string,
        params: any[],
        overrides?: any
    ): PromiEvent<any> => {
        const { transactionStore } = this.rootStore;
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
        }).on(TXEvents.TX_HASH, (hash) => {
            transactionStore.addTransactionRecord(account, hash);
        });

        return response;
    };
}
