import { makeObservable, observable, action } from 'mobx';
import RootContext from '../contexts';
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
    context: RootContext;

    constructor(context) {
        this.context = context;
        this.txRecords = {};
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

        return [];
    }

    getConfirmedTransactions(account: string): TransactionRecord[] {
        if (this.txRecords[account]) {
            const records = this.txRecords[account];
            return records.filter((value) => {
                return !this.isTxPending(value);
            });
        }

        return [];
    }

    async checkPendingTransactions(
        web3React: Web3ReactContextInterface,
        account
    ): Promise<FetchCode> {
        const { providerStore } = this.context;
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
            this.txRecords[account] = [];
            this.txRecords[account].push(record);
        }
    }

    isTxPending(txRecord: TransactionRecord): boolean {
        return !txRecord.receipt;
    }

    isStale(txRecord: TransactionRecord, currentBlock: number) {
        return txRecord.blockNumberChecked < currentBlock;
    }
}
