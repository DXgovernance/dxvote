import { useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import { FiArrowRight, FiInfo } from 'react-icons/fi';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';

import { Heading } from '../common/Typography';
import { Button } from '../common/Button';
import dxIcon from '../../../assets/images/dxdao-icon.svg';
import { useVotingPowerOf } from '../../../hooks/Guilds/ether-swr/useVotingPowerOf';
import { useGuildConfig } from '../../../hooks/Guilds/ether-swr/useGuildConfig';
import { useERC20Info } from '../../../hooks/Guilds/ether-swr/erc20/useERC20Info';
import { useERC20Balance } from '../../../hooks/Guilds/ether-swr/erc20/useERC20Balance';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';

const GuestContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: black;
  @media only screen and (min-width: 769px) {
    padding: 20px 40px;
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
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const InfoItem = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.fontSizes.body};
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 0.4rem;
`;

const BalanceWidget = styled.div`
  width: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
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
  color: ${({ theme }) => theme.colors.muted};
`;

const InfoValue = styled.span`
  ${BaseFont}
  font-weight: bold;
  flex-wrap: wrap;
  display: inline-flex;
  align-items: center;
`;

const InfoOldValue = styled(InfoValue)`
  color: ${({ theme }) => theme.colors.muted};
  display: inline-flex;
  align-items: center;
`;

const StakeAmountInput = styled.input`
  font-size: 20px;
  font-weight: 600;
  border: none;
  outline: none;
  width: inherit;
  font-family: inherit;
`;

const ButtonLock = styled(Button)`
  width: 100%;
  margin-top: 22px;
  self-align: flex-end;
`;

export const StakeTokens = ({ onJoin }) => {
  const [stakeAmount, setStakeAmount] = useState(0);
  const { account: userAddress } = useWeb3React();

  const { guild_id: guildAddress } = useParams<{ guild_id?: string }>();
  const { data: guildConfig } = useGuildConfig(guildAddress);
  const { data: tokenInfo } = useERC20Info(guildConfig?.token);
  const { data: tokenBalance } = useERC20Balance(
    guildConfig?.token,
    userAddress
  );

  const { data: userVotingPower } = useVotingPowerOf({
    contractAddress: guildAddress,
    userAddress,
  });

  const getRoundedBalance = (
    balance: BigNumber,
    tokenDecimals: number,
    desiredDecimals: number = 2
  ) => {
    let formatted = Number.parseFloat(formatUnits(balance, tokenDecimals));
    return (
      Math.round(formatted * Math.pow(10, desiredDecimals)) /
      Math.pow(10, desiredDecimals)
    );
  };

  const isStakeAmountValid = useMemo(
    () =>
      stakeAmount > 0 &&
      tokenInfo?.decimals &&
      parseUnits(`${stakeAmount}`, tokenInfo.decimals).lte(tokenBalance),
    [stakeAmount, tokenBalance, tokenInfo]
  );

  const newVotingPower = useMemo(() => {
    if (!isStakeAmountValid || !guildConfig || !tokenInfo) return null;

    const stakedAmountUnits = parseUnits(`${stakeAmount}`, tokenInfo.decimals);
    const percent = stakedAmountUnits
      .div(stakedAmountUnits.add(guildConfig.totalLocked))
      .mul(100);
    return Math.round(percent.toNumber() * Math.pow(10, 5)) / Math.pow(10, 5);
  }, [isStakeAmountValid, stakeAmount, tokenInfo, guildConfig]);

  return (
    <GuestContainer>
      <DaoBrand>
        <DaoIcon src={dxIcon} alt={'DXdao Logo'} />
        <DaoTitle>{guildConfig?.name || <Skeleton width={100} />}</DaoTitle>
      </DaoBrand>
      <InfoItem>
        {guildConfig?.lockTime ? (
          `${moment
            .duration(guildConfig.lockTime.toNumber(), 'seconds')
            .humanize()} staking period`
        ) : (
          <Skeleton width={200} />
        )}{' '}
      </InfoItem>

      <InfoItem>
        {tokenInfo?.symbol ? (
          `2.5 ${tokenInfo.symbol} min. deposit`
        ) : (
          <Skeleton width={200} />
        )}
      </InfoItem>

      {/* <InfoItem>
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
      </Loading> */}

      <BalanceWidget>
        <InfoRow>
          <InfoLabel>Balance:</InfoLabel>
          <InfoValue>
            {tokenBalance && tokenInfo ? (
              getRoundedBalance(tokenBalance, tokenInfo.decimals, 4)
            ) : (
              <Skeleton width={10} />
            )}{' '}
            {tokenInfo?.symbol || <Skeleton width={10} />}
          </InfoValue>
        </InfoRow>
        <InfoRow>
          <StakeAmountInput
            value={stakeAmount}
            onChange={e => setStakeAmount(e.target.value)}
          />
          <Button
            onClick={() =>
              setStakeAmount(
                Number.parseFloat(formatUnits(tokenBalance, tokenInfo.decimals))
              )
            }
          >
            Max
          </Button>
        </InfoRow>
      </BalanceWidget>
      <InfoRow>
        <InfoLabel>Your voting power</InfoLabel>
        <InfoValue>
          {isStakeAmountValid ? (
            <>
              <InfoOldValue>
                {userVotingPower ? (
                  `${userVotingPower.toString()}%`
                ) : (
                  <Skeleton width={40} />
                )}{' '}
                <FiArrowRight />
              </InfoOldValue>{' '}
              <strong>
                {newVotingPower != null ? (
                  `${newVotingPower}%`
                ) : (
                  <Skeleton width={40} />
                )}
              </strong>
            </>
          ) : (
            '-'
          )}
        </InfoValue>
      </InfoRow>
      <InfoRow>
        <InfoLabel>Unlock Date</InfoLabel>
        <InfoValue>
          {isStakeAmountValid ? (
            <>
              <strong>
                {moment()
                  .add(guildConfig.lockTime.toNumber(), 'seconds')
                  .format('MMM Do, YYYY - h:mm a')}
              </strong>{' '}
              <FiInfo />
            </>
          ) : (
            '-'
          )}
        </InfoValue>
      </InfoRow>
      <ButtonLock disabled={!isStakeAmountValid} onClick={onJoin}>
        Lock {tokenInfo?.symbol || <Skeleton width={10} />}
      </ButtonLock>
    </GuestContainer>
  );
};
