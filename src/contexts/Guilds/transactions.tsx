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
import { useTransactionModal } from '../../components/Guilds/Web3Modals/TransactionModal';
export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: Transaction;
  };
}

interface TransactionsContextInterface {
  transactions: Transaction[];
  createTransaction: (
    summary: string,
    txFunction: () => Promise<providers.TransactionResponse>
  ) => void;
  clearAllTransactions: () => void;
}
const TransactionsContext = createContext<TransactionsContextInterface>(null);

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState<TransactionState>({});
  const { openModal, setModalTransactionCancelled, setModalTransactionHash } =
    useTransactionModal();

  const { chainId } = useWeb3React();
  const provider = useJsonRpcProvider();

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
    [transactions, chainId]
  );

  // Mark the transactions as finalized when they are mined
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

  const createTransaction = async (
    summary: string,
    txFunction: () => Promise<providers.TransactionResponse>
  ) => {
    openModal(summary);
    try {
      const txResponse = await txFunction();
      addTransaction(txResponse, summary);
      setModalTransactionHash(txResponse.hash);
    } catch (e) {
      console.error('Transaction execution failed', e);
      setModalTransactionCancelled(true);
    }
  };

  return (
    <TransactionsContext.Provider
      value={{
        transactions: allTransactions,
        createTransaction,
        clearAllTransactions,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionsContext);
