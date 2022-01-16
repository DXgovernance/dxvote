import {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from 'react';
import styled, { css } from 'styled-components';
import PendingCircle from 'components/common/PendingCircle';
import { Modal, ModalProps } from '../common/Modal';
import { AiOutlineArrowUp } from 'react-icons/ai';
import { Button } from '../common/Button';
import { FiX } from 'react-icons/fi';
import { Circle, Flex } from '../common/Layout';

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

type TransactionModalProps = Pick<ModalProps, 'isOpen' | 'onCancel'>;

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onCancel,
}) => {
  const [modalView, setModalView] = useState<TransactionModalView>(
    TransactionModalView.Confirm
  );

  useEffect(() => {
    // resets view for testing
    // remove when integrating new data flow
    setModalView(TransactionModalView.Confirm);
  }, [isOpen]);

  let header = null;
  let children = null;
  let footerText = null;

  const switchModalViews = () => {
    // purely for review
    // remove when integrating new data flow
    if (modalView === TransactionModalView.Confirm) {
      setModalView(TransactionModalView.Submit);
    }

    if (modalView === TransactionModalView.Submit) {
      setModalView(TransactionModalView.Reject);
    }

    if (modalView === TransactionModalView.Reject) {
      return onCancel();
    }

    return null;
  };

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

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={switchModalViews}
      children={children}
      contentHeader={header}
      cross
      hideHeader
      showSecondaryHeader
      onCancel={switchModalViews}
      maxWidth={300}
      cancelText={footerText}
    />
  );
};

const TransactionModalContext = createContext(null);

interface TransactionModalProviderProps {
  children: ReactNode;
}
export const TransactionModalProvider = ({
  children,
}: TransactionModalProviderProps) => {
  //@TODO create a way to intake transaction data

  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => setIsOpen(!isOpen);

  return (
    <TransactionModalContext.Provider value={{ isOpen, toggleModal }}>
      {children}
      <TransactionModal isOpen={isOpen} onCancel={toggleModal} />
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
