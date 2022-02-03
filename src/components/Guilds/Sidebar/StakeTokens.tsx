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
import { useERC20, useERC20Guild } from 'hooks/Guilds/contracts/useContract';
import { useTransactions } from '../../../contexts/Guilds';
import { useERC20Allowance } from '../../../hooks/Guilds/ether-swr/erc20/useERC20Allowance';
import NumericalInput from '../NumericalInput';

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

const StakeAmountInput = styled(NumericalInput)`
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
  const [stakeAmount, setStakeAmount] = useState<BigNumber>(BigNumber.from(0));
  const { account: userAddress } = useWeb3React();
  const { guild_id: guildAddress } = useParams<{ guild_id?: string }>();
  const { data: guildConfig } = useGuildConfig(guildAddress);
  const { data: tokenInfo } = useERC20Info(guildConfig?.token);
  const { data: tokenBalance } = useERC20Balance(
    guildConfig?.token,
    userAddress
  );
  const { data: tokenAllowance } = useERC20Allowance(
    guildConfig?.token,
    userAddress,
    guildConfig?.tokenVault
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

  const { createTransaction } = useTransactions();
  const guildContract = useERC20Guild(guildAddress);
  const lockTokens = async () => {
    createTransaction(
      `Lock ${formatUnits(stakeAmount, tokenInfo?.decimals)} ${
        tokenInfo?.symbol
      } tokens`,
      async () => guildContract.lockTokens(stakeAmount)
    );
    onJoin();
  };

  const tokenContract = useERC20(guildConfig?.token);
  const approveTokenSpending = async () => {
    createTransaction(`Approve ${tokenInfo?.symbol} token spending`, async () =>
      tokenContract.approve(guildConfig?.tokenVault, stakeAmount)
    );
  };

  const isStakeAmountValid = useMemo(
    () =>
      stakeAmount?.gt(0) &&
      tokenInfo?.decimals &&
      stakeAmount.lte(tokenBalance),
    [stakeAmount, tokenBalance, tokenInfo]
  );

  const votingPowerPercent = useMemo(() => {
    if (!userVotingPower || !guildConfig || !tokenInfo) return null;

    const percent = userVotingPower.div(guildConfig.totalLocked).mul(100);
    return Math.round(percent.toNumber() * Math.pow(10, 3)) / Math.pow(10, 3);
  }, [tokenInfo, guildConfig, userVotingPower]);

  const nextVotingPowerPercent = useMemo(() => {
    if (!isStakeAmountValid || !guildConfig || !tokenInfo) return null;

    const newStakeAmount = stakeAmount.add(userVotingPower);
    const percent = newStakeAmount
      .div(stakeAmount.add(guildConfig.totalLocked))
      .mul(100);
    return Math.round(percent.toNumber() * Math.pow(10, 3)) / Math.pow(10, 3);
  }, [
    isStakeAmountValid,
    stakeAmount,
    userVotingPower,
    tokenInfo,
    guildConfig,
  ]);

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

      {/* <InfoItem>
        {tokenInfo?.symbol ? (
          `2.5 ${tokenInfo.symbol} min. deposit`
        ) : (
          <Skeleton width={200} />
        )}
      </InfoItem> */}

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
            value={formatUnits(stakeAmount, tokenInfo?.decimals)}
            onUserInput={(value: string) =>
              setStakeAmount(parseUnits(value, tokenInfo.decimals))
            }
          />
          <Button onClick={() => setStakeAmount(tokenBalance)}>Max</Button>
        </InfoRow>
      </BalanceWidget>
      <InfoRow>
        <InfoLabel>Your voting power</InfoLabel>
        <InfoValue>
          {isStakeAmountValid ? (
            <>
              <InfoOldValue>
                {votingPowerPercent != null ? (
                  `${votingPowerPercent}%`
                ) : (
                  <Skeleton width={40} />
                )}{' '}
                <FiArrowRight />
              </InfoOldValue>{' '}
              <strong>
                {nextVotingPowerPercent != null ? (
                  `${nextVotingPowerPercent}%`
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
      {tokenAllowance?.gte(stakeAmount) ? (
        <ButtonLock disabled={!isStakeAmountValid} onClick={lockTokens}>
          Lock {tokenInfo?.symbol || <Skeleton width={10} />}
        </ButtonLock>
      ) : (
        <ButtonLock
          disabled={!isStakeAmountValid}
          onClick={approveTokenSpending}
        >
          Approve {tokenInfo?.symbol || <Skeleton width={10} />} Spending
        </ButtonLock>
      )}
    </GuestContainer>
  );
};
