import styled from 'styled-components';
import moment from 'moment';
import Web3 from 'web3';
import {
  useState,
  // useEffect
} from 'react';
import { Modal } from '../Modal';
import { Row as CommonRow, BlockchainLink, Button } from '../common';
import { TokenVesting } from '../../types/types';
// import TokenVestingJSON from '../../contracts/TokenVesting.json';
// import useVestingContract from './useVestingContract';
//
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
  margin-left: 4px;
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
  // const [extraContractData, setextraContractData] = useState<{ start: number }>(
  //   { start: 0 }
  // );
  // const {
  //   context: {
  //     providerStore: { web3Context },
  //   },
  // } = useContext();

  // const vestingContract = useVestingContract(
  //   contract?.address,
  //   TokenVestingJSON.abi
  // );

  // useEffect(() => {
  //   const getData = async () => {
  //     const data = {
  //       start: await vestingContract?.start?.call(),
  //       isOwner: await vestingContract?.isOwner?.call(),
  //       revocable: await vestingContract?.revocable?.call(),
  //     };

  //     setextraContractData({
  //       ...data,
  //       start: data?.start?.toNumber(),
  //     });
  //   };

  //   getData();
  // }, [vestingContract]);

  if (!contract) return null;
  console.log('contractdata', contract);

  const handleRedeemClick = async () => {
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
          <span>Contract Address: </span>
          <StyledLink text={contract.address} toCopy>
            {contract.address}↗
          </StyledLink>
        </Row>
        <Row>Start: {moment.unix(Number(contract.start)).format('LLL')}</Row>
        <Row>Cliff: {moment.unix(Number(contract.cliff)).format('LLL')}</Row>
        <Row>
          Duration:{' '}
          {moment.duration(Number(contract.duration), 'seconds').humanize()}
        </Row>

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
