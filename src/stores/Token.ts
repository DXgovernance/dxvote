import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import { ContractType } from 'stores/Provider';
import * as helpers from 'utils/helpers';
import { bnum } from 'utils/helpers';
import { parseEther } from 'ethers/utils';
import { BigNumber } from 'utils/bignumber';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { PromiEvent } from 'web3-core';

export interface TokenBalance {
    balance: BigNumber;
    lastFetched: number;
}

export interface UserAllowance {
    allowance: BigNumber;
    lastFetched: number;
}

export interface TotalSupply {
    totalSupply: BigNumber;
    lastFetched: number;
}

export const EtherKey = 'ether';

export default class TokenStore {
    @observable symbols = {};
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    getTotalSupply(tokenAddress: string): BigNumber | undefined {
        const {blockchainStore} = this.rootStore;
        const entry = {
            contractType: ContractType.ERC20,
            address: tokenAddress,
            method: 'totalSupply',
            params: []
        };

        if (blockchainStore.has(entry)) {
            return bnum(blockchainStore.get(entry).value);
        } else {
            return undefined;
        }
    }
    
    getBurnedSupply(tokenAddress: string): BigNumber | undefined {
        const {blockchainStore} = this.rootStore;
        const entry = {
            contractType: ContractType.DecentralizedAutonomousTrust,
            address: tokenAddress,
            method: 'burnedSupply',
            params: []
        };
        
        if (blockchainStore.has(entry)) {
            return bnum(blockchainStore.get(entry).value);
        } else {
            return undefined;
        }
    }


    getEtherBalance(account: string) {
        const {blockchainStore, configStore} = this.rootStore;
        const entry = {
            contractType: ContractType.Multicall,
            address: configStore.getMulticallAddress(),
            method: 'getEthBalance',
            params: [account]
        };

        if (blockchainStore.has(entry)) {
            return bnum(blockchainStore.get(entry).value);
        } else {
            return undefined;
        }
    }

    getBalance(tokenAddress: string, account: string): BigNumber | undefined {
        const {blockchainStore} = this.rootStore;
        const entry = {
            contractType: ContractType.ERC20,
            address: tokenAddress,
            method: 'balanceOf',
            params: [account]
        };

        if (blockchainStore.has(entry)) {
            return bnum(blockchainStore.get(entry).value);
        } else {
            return undefined;
        }
    }

    @action approveMax = (
        web3React,
        tokenAddress,
        spender
    ): PromiEvent<any> => {
        const { providerStore } = this.rootStore;
        return providerStore.sendTransaction(
            web3React,
            ContractType.ERC20,
            tokenAddress,
            'approve',
            [spender, helpers.MAX_UINT.toString()]
        );
    };

    @action revokeApproval = (
        web3React,
        tokenAddress,
        spender
    ): PromiEvent<any> => {
        const { providerStore } = this.rootStore;
        return providerStore.sendTransaction(
            web3React,
            ContractType.ERC20,
            tokenAddress,
            'approve',
            [spender, 0]
        );
    };

    @action mint = async (
        web3React: Web3ReactContextInterface,
        tokenAddress: string,
        amount: string
    ) => {
        const { providerStore } = this.rootStore;
        await providerStore.sendTransaction(
            web3React,
            ContractType.ERC20,
            tokenAddress,
            'mint',
            [parseEther(amount).toString()]
        );
    };

    hasMaxApproval = (tokenAddress, account, spender): boolean => {
        const allowance = this.getAllowance(tokenAddress, account, spender);
        if (!allowance) {
            return false;
        }
        return helpers.hasMaxApproval(allowance);
    };

    getAllowance = (tokenAddress, account, spender): BigNumber | undefined => {
        const {blockchainStore} = this.rootStore;
        const entry = {
            contractType: ContractType.ERC20,
            address: tokenAddress,
            method: 'allowance',
            params: [account, spender]
        };

        if (blockchainStore.has(entry)) {
            return bnum(blockchainStore.get(entry).value);
        } else {
            return undefined;
        }
    };
}
