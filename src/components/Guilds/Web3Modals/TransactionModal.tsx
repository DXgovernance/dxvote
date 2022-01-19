import {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
  useMemo,
} from 'react';
import styled, { css } from 'styled-components';
import PendingCircle from 'components/common/PendingCircle';
import { Modal, ModalProps } from '../common/Modal';
import { AiOutlineArrowUp } from 'react-icons/ai';
import { Button } from '../common/Button';
import { FiX } from 'react-icons/fi';
import { Circle, Flex } from '../common/Layout';
import { TransactionResponse } from 'ethers/node_modules/@ethersproject/abstract-provider';
import { useTransactions } from '../../../contexts/Guilds';

export const ModalButton = styled(Button)`
  margin: 0 0 16px 0;
  width: 90%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  :hover:enabled {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

type ContainerTextProps = {
  variant?: 'regular' | 'medium' | 'bold';
};

const variantStyles = (variant = 'regular') =>
  ({
    regular: css`
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
    `,
    medium: css`
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
    `,

    bold: css`
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
    `,
  }[variant]);

export const ContainerText = styled(Flex)<ContainerTextProps>`
  font-family: Inter;
  margin: 4px;
  font-style: normal;
  color: ${props => props.color || '#000000'};
  ${({ variant }) => variantStyles(variant)}
`;

ContainerText.defaultProps = {
  variant: 'primary',
};

export const Container = styled.div`
  margin: 8px 0 24px 0;
`;

enum TransactionModalView {
  Confirm,
  Submit,
  Reject,
}

type TransactionModalProps = {
  message: string;
  transactionHash: string;
  txCancelled: boolean;
} & Pick<ModalProps, 'onCancel'>;

const TransactionModal: React.FC<TransactionModalProps> = ({
  message,
  transactionHash,
  txCancelled,
  onCancel,
}) => {
  const [modalView, setModalView] = useState<TransactionModalView>(
    TransactionModalView.Confirm
  );

  useEffect(() => {
    console.log({ message, transactionHash, txCancelled });
    if (txCancelled) {
      setModalView(TransactionModalView.Reject);
    } else if (transactionHash) {
      setModalView(TransactionModalView.Submit);
    } else {
      setModalView(TransactionModalView.Confirm);
    }
  }, [message, transactionHash, txCancelled]);

  const [header, children, footerText] = useMemo(() => {
    let header: JSX.Element, children: JSX.Element, footerText: string;

    switch (modalView) {
      case TransactionModalView.Confirm:
        header = (
          <Flex>
            <PendingCircle height="86px" width="86px" color="black" />
          </Flex>
        );
        children = (
          <Flex>
            <Container>
              <ContainerText variant="bold">
                Waiting For Confirmation
              </ContainerText>
              <ContainerText variant="medium">
                Stake 52.42DXD for 324 Days
              </ContainerText>
            </Container>
            <ContainerText variant="medium" color="grey">
              Confirm this Transaction in your Wallet
            </ContainerText>
          </Flex>
        );
        break;
      case TransactionModalView.Submit:
        header = (
          <Flex>
            <Circle>
              <AiOutlineArrowUp size={40} />
            </Circle>
          </Flex>
        );
        children = (
          <Flex>
            <ContainerText variant="bold">Transaction Submitted</ContainerText>
            <Container>
              <ContainerText variant="regular" color="grey">
                View on Block Explorer
              </ContainerText>
            </Container>
          </Flex>
        );
        footerText = 'Close';
        break;
      case TransactionModalView.Reject:
        header = (
          <Flex>
            <Circle>
              <FiX size={40} />
            </Circle>
          </Flex>
        );
        children = (
          <Flex>
            <ContainerText variant="bold">Transaction Rejected</ContainerText>
            <Container>
              <ContainerText variant="regular" color="grey">
                View on Block Explorer
              </ContainerText>
            </Container>
          </Flex>
        );
        footerText = 'Dismiss';
        break;
    }

    return [header, children, footerText];
  }, [modalView]);

  return (
    <Modal
      isOpen={!!message}
      onDismiss={onCancel}
      children={children}
      contentHeader={header}
      cross
      hideHeader
      showSecondaryHeader
      onCancel={onCancel}
      maxWidth={300}
      cancelText={footerText}
    />
  );
};

interface TransactionModalContextInterface {
  isOpen: boolean;
  openModal: (message: string) => void;
  createTransaction: (
    summary: string,
    txFunction: () => Promise<TransactionResponse>
  ) => void;
  closeModal: () => void;
}

const TransactionModalContext =
  createContext<TransactionModalContextInterface>(null);

interface TransactionModalProviderProps {
  children: ReactNode;
}
export const TransactionModalProvider = ({
  children,
}: TransactionModalProviderProps) => {
  const { addTransaction } = useTransactions();
  const [message, setMessage] = useState(null);
  const [txCancelled, setTxCancelled] = useState(false);
  const [transactionHash, setTransactionHash] = useState(null);

  const createTransaction = async (
    summary: string,
    txFunction: () => Promise<TransactionResponse>
  ) => {
    openModal(summary);
    try {
      const txResponse = await txFunction();
      addTransaction(txResponse, summary);
      setTransactionHash(txResponse.hash);
    } catch (e) {
      console.error('Transaction execution failed', e);
      setTxCancelled(true);
    }
  };

  const openModal = (message: string) => {
    setMessage(message);
    setTransactionHash(null);
    setTxCancelled(false);
  };

  const closeModal = () => {
    setMessage(null);
    setTransactionHash(null);
    setTxCancelled(false);
  };

  return (
    <TransactionModalContext.Provider
      value={{ isOpen: !!message, openModal, createTransaction, closeModal }}
    >
      {children}
      <TransactionModal
        message={message}
        transactionHash={transactionHash}
        onCancel={closeModal}
        txCancelled={txCancelled}
      />
    </TransactionModalContext.Provider>
  );
};

export const useTransactionModal = () => {
  const context = useContext(TransactionModalContext);
  if (context === undefined) {
    throw new Error(
      'useTransactionModal must be used within a TransactionModalProvider'
    );
  }

  return context;
};
