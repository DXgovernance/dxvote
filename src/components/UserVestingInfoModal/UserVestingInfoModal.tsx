import styled from 'styled-components';
import moment from 'moment';
import Web3 from 'web3';
import { useState } from 'react';
import { Modal } from '../Modal';
import { Row as CommonRow, BlockchainLink, Button } from '../common';
import { TokenVesting } from '../../types/types';

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnWrap}
  padding: 0 24px;
  background-color: ${({ theme }) => theme.backgroundColor};
  text-align: center;
`;

const Row = styled(CommonRow)`
  justify-content: flex-start;
  &:first-child {
    padding: 0;
  }
`;

const StyledLink = styled(BlockchainLink)`
  background: red;
  width: 300px;
`;

const StyledButton = styled(Button)`
  margin: 0;
`;

const Title = styled.h2`
  margin: 0;
`;

export interface UserVestingInfoModalProps {
  onDismiss?: () => void;
  isOpen: boolean;
  contract?: TokenVesting;
}

const UserVestingInfoModal: React.FC<UserVestingInfoModalProps> = ({
  onDismiss,
  isOpen,
  contract,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  if (!contract) return null;

  const handleRedeemClick = () => {
    if (!showConfirmation) return setShowConfirmation(true);

    // Do the actual transaction here.
    // TODO: Add a loading state.
    // TODO: CALL redeem transaction. if success, close modal.
    onDismiss();
  };
  const header = <Title>Vesting Contract</Title>;

  return (
    <Modal header={header} isOpen={isOpen} onDismiss={onDismiss}>
      <Wrapper>
        <Row>
          <span>Contract Address:</span>{' '}
          <StyledLink text={contract.address} toCopy>
            {contract.address}↗
          </StyledLink>
        </Row>
        <Row>Cliff: {moment.unix(Number(contract.cliff)).format('LL')}</Row>
        <Row>
          Value:{' '}
          {parseFloat(
            Number(Web3.utils.fromWei(contract.value.toString())).toFixed(2)
          )}{' '}
          ETH
        </Row>
        <Row>
          <StyledButton onClick={handleRedeemClick}>
            {showConfirmation
              ? 'Are you sure you want to redeem your DXD?'
              : 'Redeem DXD'}
          </StyledButton>
        </Row>
      </Wrapper>
    </Modal>
  );
};

export default UserVestingInfoModal;
