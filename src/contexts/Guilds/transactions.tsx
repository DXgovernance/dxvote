import { useWeb3React } from '@web3-react/core';
import { createContext, useContext, useMemo, useState } from 'react';
import { Transaction, TransactionReceipt } from '../../types/types.guilds';

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: Transaction;
  };
}

interface TransactionsContextInterface {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  clearAllTransactions: () => void;
  updateTransaction: (hash: string, blockNumber: string) => void;
  finalizeTransaction: (hash: string, receipt: TransactionReceipt) => void;
}

const TransactionsContext = createContext<TransactionsContextInterface>(null);

export const TransactionsProvider = ({ children }) => {
  const { chainId } = useWeb3React();
  const [transactions, setTransactions] = useState<TransactionState>({});

  const allTransactions = useMemo(() => {
    return transactions[chainId] ? Object.values(transactions[chainId]) : [];
  }, [transactions, chainId]);

  const addTransaction = (transaction: Transaction) => {
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

  const updateTransaction = (hash: string, blockNumber: string) => {
    if (!transactions[chainId] || !transactions[chainId][hash]) {
      return;
    }

    setTransactions(prevState => ({
      ...prevState,
      [chainId]: {
        ...prevState[chainId],
        [hash]: {
          ...prevState[chainId][hash],
          blockNumber,
        },
      },
    }));
  };

  const finalizeTransaction = (hash: string, receipt: TransactionReceipt) => {
    if (!transactions[chainId] || !transactions[chainId][hash]) {
      return;
    }

    setTransactions(prevState => ({
      ...prevState,
      [chainId]: {
        ...prevState[chainId],
        [hash]: {
          ...prevState[chainId][hash],
          receipt,
          confirmedTime: Date.now(),
        },
      },
    }));
  };

  return (
    <TransactionsContext.Provider
      value={{
        transactions: allTransactions,
        addTransaction,
        clearAllTransactions,
        updateTransaction,
        finalizeTransaction,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionsContext);
