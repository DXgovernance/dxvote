import { useState } from 'react';
import styled, { css } from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import { FiArrowRight, FiInfo } from 'react-icons/fi';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';

import { Heading } from '../common/Typography';
import CopyHelper from '../../common/Copy';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { shortenAddress, isAddress } from 'utils';
import dxIcon from '../../../assets/images/dxdao-icon.svg';
import { useVotingPowerOf } from '../../../hooks/Guilds/ether-swr/useVotingPowerOf';
import { useVoterLockTimestamp } from '../../../hooks/Guilds/ether-swr/useVoterLockTimestamp';
import { useGuildConfig } from '../../../hooks/Guilds/ether-swr/useGuildConfig';
import { useERC20Info } from '../../../hooks/Guilds/ether-swr/erc20/useERC20Info';

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
  display: flex;
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

  const { guild_id: guildAddress } = useParams<{ guild_id?: string }>();
  const { data: guildConfig } = useGuildConfig(guildAddress);
  const { data: tokenInfo } = useERC20Info(guildConfig?.token);

  const { account: userAddress } = useWeb3React();
  const { data: userVotingPower } = useVotingPowerOf({
    contractAddress: guildAddress,
    userAddress,
  });
  const { data: voterLockTimestamp } = useVoterLockTimestamp({
    contractAddress: guildAddress,
    userAddress,
  });

  return (
    <GuestContainer>
      <DaoBrand>
        <DaoIcon src={dxIcon} alt={'DXdao Logo'} />
        <DaoTitle>{guildConfig?.name || <Skeleton width={100} />}</DaoTitle>
      </DaoBrand>
      <InfoItem>40% Quorum</InfoItem>

      <InfoItem>
        User Voting Power:{' '}
        {userVotingPower?.toString() || <Skeleton width={40} />}
      </InfoItem>
      <InfoItem>
        Voting Power for proposal creation:{' '}
        {guildConfig?.votingPowerForProposalCreation?.toString() || (
          <Skeleton width={40} />
        )}
      </InfoItem>
      <InfoItem>
        Voting Power for proposal execution:{' '}
        {guildConfig?.votingPowerForProposalExecution?.toString() || (
          <Skeleton width={40} />
        )}
      </InfoItem>
      {guildConfig?.tokenVault && isAddress(guildConfig.tokenVault) && (
        <InfoItem>
          Token Vault: {shortenAddress(guildConfig.tokenVault)}{' '}
          <CopyHelper toCopy={guildConfig.tokenVault} />
        </InfoItem>
      )}
      {guildConfig?.lockTime && guildConfig?.lockTime?.toNumber() > 0 && (
        <InfoItem>
          Lock Time:{' '}
          {moment
            .duration(guildConfig?.lockTime?.toNumber(), 'seconds')
            .humanize()}
        </InfoItem>
      )}
      {guildConfig?.totalLocked && guildConfig?.totalLocked?.toNumber() > 0 && (
        <InfoItem>
          Total Locked:{' '}
          {moment
            .duration(guildConfig?.totalLocked?.toString(), 'seconds')
            .humanize()}
        </InfoItem>
      )}
      {voterLockTimestamp && voterLockTimestamp?.toNumber() > 0 && (
        <InfoItem>
          Voter Lock Timestamp:{' '}
          {moment.unix(voterLockTimestamp?.toNumber()).format('LL')}
        </InfoItem>
      )}
      <Loading text loading={!guildConfig?.token}>
        <InfoItem>
          {isAddress(guildConfig.token) && (
            <>
              Token: {shortenAddress(guildConfig.token)}
              <CopyHelper toCopy={guildConfig.token} />
            </>
          )}
        </InfoItem>
      </Loading>
      <Loading text loading={!guildConfig?.proposalTime}>
        <InfoItem>
          {moment
            .duration(guildConfig.proposalTime.toNumber(), 'seconds')
            .humanize()}{' '}
          proposal duration
        </InfoItem>
      </Loading>
      <Loading text loading={!guildConfig?.timeForExecution}>
        <InfoItem>
          (
          {moment
            .duration(guildConfig.timeForExecution.toNumber(), 'seconds')
            .humanize()}{' '}
          for execution)
        </InfoItem>
      </Loading>
      <InfoItem>
        2.5 {tokenInfo?.symbol || <Skeleton width={10} />} min. deposit
      </InfoItem>
      <BalanceWidget>
        <InfoRow>
          <InfoLabel>Balance:</InfoLabel>
          <InfoValue>
            10.00 {tokenInfo?.symbol || <Skeleton width={10} />}
          </InfoValue>
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
        Lock {tokenInfo?.symbol || <Skeleton width={10} />}
      </ButtonLock>
    </GuestContainer>
  );
};
