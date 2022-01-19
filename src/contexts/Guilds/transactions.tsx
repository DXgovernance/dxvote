import { useWeb3React } from '@web3-react/core';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { providers } from 'ethers';

import { Transaction } from '../../types/types.guilds';
import useJsonRpcProvider from '../../hooks/Guilds/web3/useJsonRpcProvider';
import useLocalStorage from '../../hooks/Guilds/useLocalStorage';
import TransactionModal from '../../components/Guilds/Web3Modals/TransactionModal';
export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: Transaction;
  };
}
interface PendingTransaction {
  summary: string;
  transactionHash: string;
  cancelled: boolean;
  showModal: boolean;
}
interface TransactionsContextInterface {
  transactions: Transaction[];
  pendingTransaction: PendingTransaction;
  createTransaction: (
    summary: string,
    txFunction: () => Promise<providers.TransactionResponse>
  ) => void;
  clearAllTransactions: () => void;
}

const TransactionsContext = createContext<TransactionsContextInterface>(null);

export const TransactionsProvider = ({ children }) => {
  const { chainId, account } = useWeb3React();

  const [transactions, setTransactions] = useLocalStorage<TransactionState>(
    `transactions/${account}`,
    {}
  );
  const [pendingTransaction, setPendingTransaction] =
    useState<PendingTransaction>(null);

  // Get the transactions from the current chain
  const allTransactions = useMemo(() => {
    return transactions[chainId] ? Object.values(transactions[chainId]) : [];
  }, [transactions, chainId]);

  const addTransaction = (
    txResponse: providers.TransactionResponse,
    summary?: string
  ) => {
    if (!txResponse.hash) return;

    const transaction: Transaction = {
      hash: txResponse.hash,
      from: txResponse.from,
      summary,
      addedTime: Date.now(),
    };

    setTransactions(prevState => ({
      ...prevState,
      [chainId]: {
        ...prevState[chainId],
        [transaction.hash]: transaction,
      },
    }));
  };

  const clearAllTransactions = () => {
    setTransactions(prevState => ({
      ...prevState,
      [chainId]: {},
    }));
  };

  const finalizeTransaction = useCallback(
    (hash: string, receipt: providers.TransactionReceipt) => {
      if (!transactions[chainId] || !transactions[chainId][hash]) {
        return;
      }

      setTransactions(prevState => ({
        ...prevState,
        [chainId]: {
          ...prevState[chainId],
          [hash]: {
            ...prevState[chainId][hash],
            receipt: {
              transactionHash: receipt.transactionHash,
              blockNumber: receipt.blockNumber,
              status: receipt.status,
            },
            confirmedTime: Date.now(),
          },
        },
      }));
    },
    [transactions, chainId, setTransactions]
  );

  // Mark the transactions as finalized when they are mined
  const provider = useJsonRpcProvider();
  useEffect(() => {
    let isSubscribed = true;

    allTransactions
      .filter(transaction => !transaction.receipt)
      .forEach(transaction => {
        provider.waitForTransaction(transaction.hash).then(receipt => {
          if (isSubscribed) finalizeTransaction(transaction.hash, receipt);
        });
      });

    return () => {
      isSubscribed = false;
    };
  }, [allTransactions, finalizeTransaction, provider]);

  // Trigger a new transaction request to the user wallet and track its progress
  const createTransaction = async (
    summary: string,
    txFunction: () => Promise<providers.TransactionResponse>,
    showModal: boolean = true
  ) => {
    setPendingTransaction({
      summary,
      showModal,
      cancelled: false,
      transactionHash: null,
    });
    try {
      const txResponse = await txFunction();
      addTransaction(txResponse, summary);
      setPendingTransaction(pendingTransaction => ({
        ...pendingTransaction,
        transactionHash: txResponse.hash,
      }));
    } catch (e) {
      console.error('Transaction execution failed', e);
      setPendingTransaction(pendingTransaction => ({
        ...pendingTransaction,
        cancelled: true,
      }));
    }
  };

  return (
    <TransactionsContext.Provider
      value={{
        transactions: allTransactions,
        pendingTransaction,
        createTransaction,
        clearAllTransactions,
      }}
    >
      {children}

      <TransactionModal
        message={pendingTransaction?.summary}
        transactionHash={pendingTransaction?.transactionHash}
        onCancel={() => setPendingTransaction(null)}
        txCancelled={pendingTransaction?.cancelled}
      />
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionsContext);
