import { makeObservable, observable, action } from 'mobx';
import RootStore from 'stores';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { TransactionReceipt } from 'web3-core';

export interface TransactionRecord {
    hash: string;
    blockNumberChecked: number;
    receipt: TransactionReceipt | undefined;
}

const ERRORS = {
    unknownTxHash: 'Transaction hash is not stored',
    unknownNetworkId: 'NetworkID specified is not tracked',
    txHashAlreadyExists: 'Transaction hash already exists for network',
    txHasNoHash: 'Attempting to add transaction record without hash',
};

export enum FetchCode {
    SUCCESS,
    FAILURE,
    STALE,
}

export interface TransactionRecordMap {
    [index: string]: TransactionRecord[];
}

export default class TransactionStore {
    txRecords: TransactionRecordMap;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.txRecords = {} as TransactionRecordMap;
        makeObservable(this, {
            txRecords: observable,
            checkPendingTransactions: action,
            addTransactionRecord: action,
          }
        );
    }

    // @dev Transactions are pending if we haven't seen their receipt yet
    getPendingTransactions(account: string): TransactionRecord[] {
        if (this.txRecords[account]) {
            const records = this.txRecords[account];
            return records.filter((value) => {
                return this.isTxPending(value);
            });
        }

        return [] as TransactionRecord[];
    }

    getConfirmedTransactions(account: string): TransactionRecord[] {
        if (this.txRecords[account]) {
            const records = this.txRecords[account];
            return records.filter((value) => {
                return !this.isTxPending(value);
            });
        }

        return [] as TransactionRecord[];
    }

    async checkPendingTransactions(
        web3React: Web3ReactContextInterface,
        account
    ): Promise<FetchCode> {
        const { providerStore } = this.rootStore;
        const currentBlock = providerStore.getCurrentBlockNumber();

        const { library } = web3React;
        if (this.txRecords[account]) {
            const records = this.txRecords[account];
            records.forEach((value) => {
                if (
                    this.isTxPending(value) &&
                    this.isStale(value, currentBlock)
                ) {
                    library.eth
                        .getTransactionReceipt(value.hash)
                        .then((receipt) => {
                            value.blockNumberChecked = currentBlock;
                            if (receipt) {
                                value.receipt = receipt;
                            }
                        })
                        .catch(() => {
                            value.blockNumberChecked = currentBlock;
                        });
                }
            });
        }

        return FetchCode.SUCCESS;
    }

    // @dev Add transaction record. It's in a pending state until mined.
    addTransactionRecord(account: string, txHash: string) {
        const record: TransactionRecord = {
            hash: txHash,
            blockNumberChecked: 0,
            receipt: undefined,
        };

        if (!txHash) {
            throw new Error(
                'Attempting to add transaction record without hash'
            );
        }

        let records = this.txRecords[account];

        if (records) {
            const duplicate = records.find((value) => value.hash === txHash);
            if (!!duplicate) {
                throw new Error(ERRORS.txHashAlreadyExists);
            }
            this.txRecords[account].push(record);
        } else {
            this.txRecords[account] = [] as TransactionRecord[];
            this.txRecords[account].push(record);
        }
    }

    private isTxPending(txRecord: TransactionRecord): boolean {
        return !txRecord.receipt;
    }

    private isStale(txRecord: TransactionRecord, currentBlock: number) {
        return txRecord.blockNumberChecked < currentBlock;
    }
}
