import PendingCircle from 'components/common/PendingCircle';
import { Modal, ModalProps } from 'components/Modal';

import styled from 'styled-components';

type TransasctionModalProps = Pick<
  ModalProps,
  'isOpen' | 'onDismiss' | 'onCancel'
>;

export const Flex = styled.div`
  display: Flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: #ffffff;
`


export const ContainerText = styled(Flex)`
  font-family: Inter;
  font-style: normal;
  font-weight: ${props => props.fontWeight || 600};
  font-size: ${props => props.fontSize || '16px'};
  line-height: ${props => props.lineHeight || '24px'};
  color: ${props => props.color || '#000000'};
`;

// small, medium , large text


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


const WaitingForTransactionContent: React.ReactElement = (
  <Flex>
    <div style={{ marginBottom: '16px' }}>
      <ContainerText>Waiting For Confirmation</ContainerText>
      <ContainerText lineHeight="20px" fontSize="14px" fontWeight="500">
        Stake 52.42DXD for 324 Days
      </ContainerText>
    </div>
    <ContainerText color="grey" lineHeight="16px" fontSize="12px">
      Confirm this Transaction in your Wallet
    </ContainerText>
  </Flex>
);

const TransactionHeader = (
  <Flex>
    <PendingCircle height="86px" width="86px" color="black" />
  </Flex>
)

export const TransactionWait: React.FC<TransasctionModalProps> = ({
  isOpen,

  onDismiss,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      children={WaitingForTransactionContent}
      header={TransactionHeader}
      maxWidth={300}
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
