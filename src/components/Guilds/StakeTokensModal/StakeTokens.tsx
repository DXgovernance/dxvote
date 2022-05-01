import { useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { FiArrowRight, FiInfo } from 'react-icons/fi';
import moment from 'moment';
import { useHistory, useLocation } from 'react-router';
import { useParams } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';

import { Heading } from '../common/Typography';
import { Button } from '../common/Button';
import dxIcon from '../../../assets/images/dxdao-icon.svg';
import { useVotingPowerOf } from '../../../hooks/Guilds/ether-swr/guild/useVotingPowerOf';
import { useGuildConfig } from '../../../hooks/Guilds/ether-swr/guild/useGuildConfig';
import { useERC20Info } from '../../../hooks/Guilds/ether-swr/erc20/useERC20Info';
import { useERC20Balance } from '../../../hooks/Guilds/ether-swr/erc20/useERC20Balance';
import { formatUnits } from 'ethers/lib/utils';
import { useERC20, useERC20Guild } from 'hooks/Guilds/contracts/useContract';
import { useTransactions } from '../../../contexts/Guilds';
import { useERC20Allowance } from '../../../hooks/Guilds/ether-swr/erc20/useERC20Allowance';
import useVotingPowerPercent from '../../../hooks/Guilds/guild/useVotingPowerPercent';
import useBigNumberToNumber from '../../../hooks/Guilds/conversions/useBigNumberToNumber';
import useGuildImplementationType from '../../../hooks/Guilds/guild/useGuildImplementationType';
import { Loading } from '../common/Loading';
import TokenAmountInput from '../common/Form/TokenAmountInput';
import { BigNumber } from 'ethers';
import { MAX_UINT } from 'utils';

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
  color: ${({ theme }) => theme.colors.text};
`;

const InfoItem = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.fontSizes.body};
  color: ${({ theme }) => theme.colors.card.grey};
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
  color: ${({ theme }) => theme.colors.card.grey};
`;

const InfoValue = styled.span`
  ${BaseFont}
  font-weight: bold;
  flex-wrap: wrap;
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
`;

const InfoOldValue = styled(InfoValue)`
  color: ${({ theme }) => theme.colors.muted};
  display: inline-flex;
  align-items: center;
`;

const StakeAmountInput = styled(TokenAmountInput)`
  font-size: 20px;
  font-weight: 600;
  border: none;
  outline: none;
  width: inherit;
  font-family: inherit;
`;

const ActionButton = styled(Button)`
  width: 100%;
  margin-top: 22px;
  self-align: flex-end;
`;

export const StakeTokens = () => {
  const [stakeAmount, setStakeAmount] = useState<BigNumber>(null);
  const { account: userAddress } = useWeb3React();
  const { guildId: guildAddress } = useParams();
  const { data: guildConfig } = useGuildConfig(guildAddress);
  const { data: tokenInfo } = useERC20Info(guildConfig?.token);

  const { data: tokenBalance } = useERC20Balance(
    guildConfig?.token,
    userAddress
  );
  const roundedBalance = useBigNumberToNumber(
    tokenBalance,
    tokenInfo?.decimals,
    4
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

  const isStakeAmountValid = useMemo(
    () =>
      stakeAmount?.gt(0) &&
      tokenInfo?.decimals &&
      stakeAmount.lte(tokenBalance),
    [stakeAmount, tokenBalance, tokenInfo]
  );

  const { createTransaction } = useTransactions();
  const guildContract = useERC20Guild(guildAddress);
  const lockTokens = async () => {
    if (!isStakeAmountValid) return;

    createTransaction(
      `Lock ${formatUnits(stakeAmount, tokenInfo?.decimals)} ${
        tokenInfo?.symbol
      } tokens`,
      async () => guildContract.lockTokens(stakeAmount)
    );
  };

  const tokenContract = useERC20(guildConfig?.token);
  const approveTokenSpending = async () => {
    if (!isStakeAmountValid) return;

    createTransaction(`Approve ${tokenInfo?.symbol} token spending`, async () =>
      tokenContract.approve(guildConfig?.tokenVault, MAX_UINT)
    );
  };

  const votingPowerPercent = useVotingPowerPercent(
    userVotingPower,
    guildConfig?.totalLocked,
    3
  );
  const nextVotingPowerPercent = useVotingPowerPercent(
    stakeAmount?.add(userVotingPower),
    stakeAmount?.add(guildConfig?.totalLocked),
    3
  );
  const history = useHistory();
  const location = useLocation();
  const { isRepGuild } = useGuildImplementationType(guildAddress);
  return (
    <GuestContainer>
      <DaoBrand>
        <DaoIcon src={dxIcon} alt={'DXdao Logo'} />
        <DaoTitle>
          {guildConfig?.name || (
            <Loading text loading skeletonProps={{ width: 100 }} />
          )}
        </DaoTitle>
      </DaoBrand>
      {!isRepGuild && (
        <InfoItem>
          {guildConfig?.lockTime ? (
            `${moment
              .duration(guildConfig.lockTime.toNumber(), 'seconds')
              .humanize()} staking period`
          ) : (
            <Loading loading text skeletonProps={{ width: 200 }} />
          )}{' '}
        </InfoItem>
      )}

      {!isRepGuild && (
        <BalanceWidget>
          <InfoRow>
            <InfoLabel>Balance:</InfoLabel>
            <InfoValue>
              {tokenBalance && tokenInfo ? (
                roundedBalance
              ) : (
                <Loading loading text skeletonProps={{ width: 30 }} />
              )}{' '}
              {tokenInfo?.symbol || (
                <Loading loading text skeletonProps={{ width: 10 }} />
              )}
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <StakeAmountInput
              value={stakeAmount}
              onChange={setStakeAmount}
              decimals={tokenInfo?.decimals}
            />
            <Button onClick={() => setStakeAmount(tokenBalance)}>Max</Button>
          </InfoRow>
        </BalanceWidget>
      )}
      {isRepGuild && (
        <InfoRow>
          <InfoLabel>Balance</InfoLabel>
          <InfoValue>
            {tokenBalance && tokenInfo ? (
              roundedBalance
            ) : (
              <Loading loading text skeletonProps={{ width: 30 }} />
            )}{' '}
            {tokenInfo?.symbol || (
              <Loading loading text skeletonProps={{ width: 10 }} />
            )}
          </InfoValue>
        </InfoRow>
      )}
      <InfoRow>
        <InfoLabel>Your voting power</InfoLabel>
        <InfoValue>
          {isStakeAmountValid ? (
            <>
              <InfoOldValue>
                {votingPowerPercent != null ? (
                  `${votingPowerPercent}%`
                ) : (
                  <Loading loading text skeletonProps={{ width: 40 }} />
                )}{' '}
                <FiArrowRight />
              </InfoOldValue>{' '}
              <strong>
                {nextVotingPowerPercent != null ? (
                  `${nextVotingPowerPercent}%`
                ) : (
                  <Loading loading text skeletonProps={{ width: 40 }} />
                )}
              </strong>
            </>
          ) : (
            '-'
          )}
        </InfoValue>
      </InfoRow>
      {!isRepGuild && (
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
      )}
      {!isRepGuild ? (
        stakeAmount && tokenAllowance?.gte(stakeAmount) ? (
          <ActionButton disabled={!isStakeAmountValid} onClick={lockTokens}>
            Lock{' '}
            {tokenInfo?.symbol || (
              <Loading loading text skeletonProps={{ width: 10 }} />
            )}
          </ActionButton>
        ) : (
          <ActionButton
            disabled={!isStakeAmountValid}
            onClick={approveTokenSpending}
          >
            Approve{' '}
            {tokenInfo?.symbol || (
              <Loading loading text skeletonProps={{ width: 10 }} />
            )}{' '}
            Spending
          </ActionButton>
        )
      ) : (
        <ActionButton
          onClick={() => history.push(location.pathname + '/proposalType')}
        >
          Mint Rep
        </ActionButton>
      )}
    </GuestContainer>
  );
};
