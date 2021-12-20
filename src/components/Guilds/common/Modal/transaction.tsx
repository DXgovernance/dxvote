import PendingCircle from 'components/common/PendingCircle';
import { Modal, ModalProps } from 'components/Modal';

import styled from 'styled-components';

type TransasctionModalProps = Pick<ModalProps, 'isOpen' | 'onDismiss' | 'onCancel'>;

export const Container = styled.div`
  display: flex;

  flex-direction: column;

  align-items: center;

  padding: 24px;

  background: #ffffff;

  border: 1px solid #000000;

  box-sizing: border-box;

  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.25);

  border-radius: 10px;
`;

export const ContainerText = styled.div`
  font-family: Inter;

  font-style: normal;

  font-weight: ${props => props.fontWeight || 600};

  font-size: ${props => props.fontSize || '16px'};
  line-height: ${props => props.lineHeight || '24px'};
  display: flex;

  align-items: center;

  text-align: center;

  color: ${props => props.color || '#000000'};
`;

const TransactionSubmittedContent: React.ReactElement = (
  <div>
    <div>Transaction Submitted</div>

    <div>View on Block Explorer</div>
  </div>
);

const TransactionRejectedContent: React.ReactElement = (
  <div>
    <div>Transaction Rejected</div>

    <div>View on Block Explorer</div>
  </div>
);

//@TODO: make dynamic

const WaitingForTransactionContent: React.ReactElement = (
  <Container>
    <PendingCircle height="86px" width="86px" color="black" />

    <div style={{ marginBottom: '16px', marginTop: "16px" }}>
      <ContainerText>Waiting For Confirmation</ContainerText>
      <ContainerText lineHeight="20px" fontSize="14px" fontWeight="500">
        Stake 52.42DXD for 324 Days
      </ContainerText>
    </div>
    <ContainerText color="grey" lineHeight="16px" fontSize="12px">
      Confirm this Transaction in your Wallet
    </ContainerText>
  </Container >
);

export const TransactionWait: React.FC<TransasctionModalProps> = ({
  isOpen,

  onDismiss,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      hideHeader
      children={WaitingForTransactionContent}
      cancelText="Close"
      header={<div>hi</div>}
    />
  );
};

export const TransactionSubmitted: React.FC<TransasctionModalProps> = ({
  isOpen,

  onDismiss,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      hideHeader
      children={TransactionSubmittedContent}
      cancelText="Dismiss"
      header={<div>hi</div>}
    />
  );
};

export const TransactionRejected: React.FC<TransasctionModalProps> = ({
  isOpen,

  onDismiss,
}) => {
  return (
    <Modal
      hideHeader
      children={TransactionRejectedContent}
      isOpen={isOpen}
      onDismiss={onDismiss}
      header={<div>hi</div>}
    />
  );
};
