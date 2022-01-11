import { useState } from 'react';
import styled, { css } from 'styled-components';
import PendingCircle from 'components/common/PendingCircle';
import { Modal, ModalProps } from '../common/Modal';
import { AiOutlineArrowUp } from 'react-icons/ai';
import { Button } from '../common/Button';
import { FiX } from 'react-icons/fi';

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

  border-radius: ${({ theme }) => theme.radii.curved2};
`;

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

export const ContainerText = styled(Flex) <ContainerTextProps>`
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

type TransactionModalProps = Pick<ModalProps, 'isOpen'>

export const TransactionModal = ({ isOpen }: TransactionModalProps) => {
    // @TODO rework with SWR data integration

    const [modalView, setModalView] = useState<TransactionModalView>(
        TransactionModalView.Confirm
    );

    let header = null;
    let children = null;


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
                    <ModalButton variant="primary">Close</ModalButton>
                </Flex>
            );
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
                    <ModalButton variant="primary">Dismiss</ModalButton>
                </Flex>
            );
            break;
    }

    return (
        <Modal
            isOpen={isOpen}
            onDismiss={() => setModalView(TransactionModalView.Submit)}
            children={children}
            header={header}
            maxWidth={300}
            hideDivider
        />
    );

};
