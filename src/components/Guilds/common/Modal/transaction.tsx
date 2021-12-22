import styled, { css } from 'styled-components';
import PendingCircle from 'components/common/PendingCircle';
import { Modal, ModalProps } from 'components/Modal';
import { AiOutlineArrowUp } from 'react-icons/ai';
import { Button } from '../Button';

type TransasctionModalProps = Pick<
  ModalProps,
  'isOpen' | 'onDismiss' | 'onCancel'
>;

export const Circle = styled.div`
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  height: 86px;
  width: 86px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Flex = styled.div`
  display: Flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: ${({ theme }) => theme.colors.background};
`;

export const ModalButton = styled(Button)`
width: 90%;

`

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

export const ContainerText = styled(Flex) <ContainerTextProps>`
  font-family: Inter;
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


const TransactionSubmittedContent: React.ReactElement = (
  <Flex>
    <ContainerText variant='bold'>Transaction Submitted</ContainerText>
    <Container>
      <ContainerText variant='regular' color='grey'>View on Block Explorer</ContainerText>
    </Container>
    <ModalButton>Dismiss</ModalButton>
  </Flex>
);

const TransactionRejectedContent: React.ReactElement = (
  <Flex>
    <ContainerText>Transaction Rejected</ContainerText>
    <Container>
      <ContainerText variant='regular' color='grey'>View on Block Explorer</ContainerText>
    </Container>
  </Flex>
);

const WaitingForTransactionContent: React.ReactElement = (
  <Flex>
    <Container>
      <ContainerText variant='bold'>Waiting For Confirmation</ContainerText>
      <ContainerText variant='medium'>
        Stake 52.42DXD for 324 Days
      </ContainerText>
    </Container>
    <ContainerText
      color="grey"
    >
      Confirm this Transaction in your Wallet
    </ContainerText>
  </Flex>
);

const TransactionWaitHeader = (
  <Flex>
    <PendingCircle height="86px" width="86px" color="black" />
  </Flex>
);

const TransactionSubmittedHeader = (
  <Flex>
    <Circle>
      <AiOutlineArrowUp size={40} />
    </Circle>
  </Flex>
);

export const TransactionWait: React.FC<TransasctionModalProps> = ({
  isOpen,
  onDismiss,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      children={WaitingForTransactionContent}
      header={TransactionWaitHeader}
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
      children={TransactionSubmittedContent}
      header={TransactionSubmittedHeader}
      maxWidth={300}
    />
  );
};

export const TransactionRejected: React.FC<TransasctionModalProps> = ({
  isOpen,
  onCancel,
  onDismiss,
}) => {
  return (
    <Modal
      children={TransactionRejectedContent}
      isOpen={isOpen}
      onDismiss={onDismiss}
      header={<div>hi</div>}
      onCancel={onCancel}
    />
  );
};
