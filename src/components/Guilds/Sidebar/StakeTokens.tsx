import { useState } from 'react';
import styled, { css } from 'styled-components';
import { FiArrowRight, FiInfo } from 'react-icons/fi';

import { Heading } from '../common/Typography';
import { Button } from 'components/Guilds/common/Button';
import dxIcon from '../../../assets/images/dxdao-icon.svg';

const GuestContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: black;
  @media only screen and (min-width: 769px) {
    padding: 40px;
  }
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
  margin: 0px 0px 4px 0px;
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

const InfoRow = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;

const BaseFont = css`
  font-size: 12px;

  @media only screen and (min-width: 769px) {
    font-size: 14px;
  }
`;

const InfoLabel = styled.span`
  ${BaseFont}
`;

const InfoValue = styled.span`
  ${BaseFont}

  font-weight: bold;
  flex-wrap: wrap;
`;
const DXDValue = styled.span`
  font-size: 20px;
  font-weight: 600;
`;

const ButtonLock = styled(Button)`
  width: 100%;
  margin-top: 22px;
  self-align: flex-end;
`;

export const StakeTokens = ({ onJoin }) => {
  const [dxdValue, setDXDValue] = useState(0);
  return (
    <GuestContainer>
      <DaoBrand>
        <DaoIcon src={dxIcon} alt={'DXdao Logo'} />
        <DaoTitle>DXdao</DaoTitle>
      </DaoBrand>
      <InfoItem>40% Quorum</InfoItem>
      <InfoItem>6 days proposal duration</InfoItem>
      <InfoItem>2.5 DXD min. deposit</InfoItem>
      <BalanceWidget>
        <InfoRow>
          <InfoLabel>Balance:</InfoLabel>
          <InfoValue>10.00 DXD</InfoValue>
        </InfoRow>
        <InfoRow>
          <DXDValue>{dxdValue}</DXDValue>
          <Button onClick={() => setDXDValue(10)}>Max</Button>
        </InfoRow>
      </BalanceWidget>
      <InfoRow>
        <InfoLabel>Your voting power</InfoLabel>
        <InfoValue>
          0% <FiArrowRight /> <strong>0.12%</strong>
        </InfoValue>
      </InfoRow>
      <InfoRow>
        <InfoLabel>Unlock Date</InfoLabel>
        <InfoValue>
          <strong> March 31rd, 2021 - 2:32 UTC</strong> <FiInfo />
        </InfoValue>
      </InfoRow>
      <ButtonLock disabled={dxdValue <= 0} onClick={onJoin}>
        Lock DXD
      </ButtonLock>
    </GuestContainer>
  );
};
