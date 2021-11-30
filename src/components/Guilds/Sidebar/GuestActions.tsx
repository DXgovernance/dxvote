import styled from 'styled-components';
import { useState } from 'react';

import { Button } from 'components/Guilds/common/Button';
import { Modal } from 'components/Modal';
import { Heading } from '../common/Typography';

import dxIcon from '../../../assets/images/dxdao-icon.svg';

const ModalHeader = styled.div`
  border-bottom: 1px solid #ccc;
`;
const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: black;
`;

const DaoBrand = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const DaoIcon = styled.img`
  height: 3rem;
  width: 3rem;
`;

const DaoTitle = styled(Heading)`
  margin-left: 4px;
  line-height: 1;
`;

const InfoItem = styled.p`
  margin-bottom: 4px;
  font-size: 14px;
`;

const BalanceWidget = styled.div`
  width: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radii.curved};
`;

const BalanceRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
`;

const BalanceLabel = styled.span``;
const BalanceValue = styled.span``;
const AcquireValue = styled.span``;

export const GuestActions = ({ onJoin }) => {
  const [joinModal, setJoinModal] = useState(false);
  return (
    <>
      <Button onClick={() => setJoinModal(true)}>Join</Button>
      <Modal
        header={<ModalHeader>Join DxDao</ModalHeader>}
        isOpen={joinModal}
        onDismiss={() => setJoinModal(false)}
        maxWidth={300}
      >
        <ModalContainer>
          <DaoBrand>
            <DaoIcon src={dxIcon} alt={'DXdao Logo'} />
            <DaoTitle>DXdao</DaoTitle>
          </DaoBrand>
          <InfoItem>40% Quorum</InfoItem>
          <InfoItem>6 days proposal duration</InfoItem>
          <InfoItem>2.5 DXD min. deposit</InfoItem>
          <BalanceWidget>
            <BalanceRow>
              <BalanceLabel>Balance:</BalanceLabel>
              <BalanceValue>10.00 DXD</BalanceValue>
            </BalanceRow>
            <BalanceRow>
              <AcquireValue>10.00</AcquireValue>
              <Button onClick={onJoin}>Max</Button>
            </BalanceRow>
          </BalanceWidget>
        </ModalContainer>
      </Modal>
    </>
  );
};
