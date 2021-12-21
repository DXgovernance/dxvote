import styled from 'styled-components';
import moment from 'moment';
import Web3 from 'web3';
import { useState } from 'react';
import { Modal } from '../Modal';
import { Row as CommonRow, BlockchainLink, Button } from '../common';
import { TokenVesting } from '../../types/types';
import { useContext } from '../../contexts';
import { toast } from 'react-toastify';
import { TXEvents } from '../../utils';
import { FiZap } from 'react-icons/fi';

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
  const [loading, setLoading] = useState(false);
  const {
    context: { daoService },
  } = useContext();

  if (!contract) return null;

  const contractValue = parseFloat(
    Number(Web3.utils.fromWei(contract.value.toString(), 'ether')).toFixed(4)
  );
  const cliff = moment.unix(Number(contract.cliff));
  const canRelease = !(
    !Number(contract.value.toString()) || moment().isBefore(cliff)
  );

  const handleRedeemClick = () => {
    setLoading(true);
    daoService
      .redeemVestingContractDxd(contract.address)
      .on(TXEvents.RECEIPT, hash => {
        console.debug('[TX_RECEIPT]', hash);
        toast.success(
          `Successfully redeemed ${contractValue}ETH from ${contract.address}`
        );
      })
      .on(TXEvents.TX_ERROR, txerror => {
        console.error('[TX_ERROR]', txerror);
        setLoading(false);
        toast.error(`Error: ${txerror?.message}`);
      })
      .on(TXEvents.INVARIANT, error => {
        console.error('[ERROR]', error);
        setLoading(false);
        toast.error(`Error: ${error?.message}`);
      })
      .on(TXEvents.FINALLY, hash => {
        console.debug('[TX_FINALLY]', hash);
        setLoading(false);
        onDismiss();
        window.location.reload(); // TODO: find a better way to refresh
      })
      .catch(e => {
        console.log('error', e);
        toast.error(`Error: ${e?.message}`);
      });
  };

  return (
    <Modal
      header={<Title>Vesting Contract</Title>}
      isOpen={isOpen}
      onDismiss={onDismiss}
    >
      <Wrapper>
        {loading ? (
          <div>
            <FiZap /> <br /> Loading..
          </div>
        ) : (
          <>
            <Row>
              <span>Contract Address: </span>
              <StyledLink text={contract.address} toCopy>
                {contract.address}↗
              </StyledLink>
            </Row>
            <Row>
              Start: {moment.unix(Number(contract.start)).format('LLL')}
            </Row>
            <Row>
              Cliff: {cliff.format('LLL')} (
              {moment.duration(cliff.diff(moment())).humanize(true)})
            </Row>
            <Row>
              Duration:{' '}
              {moment.duration(contract.duration, 'seconds').humanize()}
            </Row>

            <Row>Value: {contractValue} ETH</Row>
            <Row>Can Release: {canRelease ? 'Yes' : 'No'}</Row>
            <Row>
              <StyledButton disabled={!canRelease} onClick={handleRedeemClick}>
                Redeem DXD
              </StyledButton>
            </Row>
          </>
        )}
      </Wrapper>
    </Modal>
  );
};

export default UserVestingInfoModal;
