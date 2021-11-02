import { useState } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import {
  Question,
  AmountBadge,
  BlockchainLink,
  HorizontalSeparator,
} from 'components/common';

import { useContext } from 'contexts';
import { useLocation } from 'react-router-dom';
import {
  bnum,
  calculateStakes,
  formatBalance,
  denormalizeBalance,
} from 'utils';

import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';

//move to Styles
const ActionArea = styled.div`
  display: flex;
  flex-direction: column;
`;
const SidebarRow = styled.div`
  display: flex;
  justify-content: space-around;
  flex-direction: row;
  padding: 5px 0px;

  .timeText {
    font-size: 20;
    margin-left: -10px;
    width: 100%;
    text-align: center;
    padding-top: 5px;
  }

  span {
    margin-bottom: 5px;
  }
`;

const Vote = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.votes.fontSize};
  justify-content: space-between;

  > * {
    margin-left: 4px;
  }
`;

const AmountInput = styled.input`
  background-color: white;
  border: 1px solid gray;
  border-radius: 4px;
  height: 34px;
  letter-spacing: 1px;
  font-weight: 500;
  line-height: 32px;
  text-align: left;
  cursor: pointer;
  width: 60px;
  padding: 0px 10px;
  margin: 5px;
  font-family: var(--roboto);
`;

const Summary = styled.div``;

const PositiveSummary = styled(Summary)`
  color: ${({ theme }) => theme.votes.positive.color};
`;
const NegativeSummary = styled(Summary)`
  color: ${({ theme }) => theme.votes.negative.color};
`;

const SummaryTotal = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
`;
const SummaryDetails = styled.div`
  font-size: 13px;
  flex: 1;
`;

const ActionButton = styled.div`
  background-color: ${props => props.color || '#536DFE'};
  border-radius: 4px;
  color: white;
  height: 34px;
  width: max-content;
  letter-spacing: 1px;
  font-weight: 500;
  line-height: 34px;
  text-align: center;
  cursor: pointer;
  padding: 0px 10px;
  margin: 5px;

  display: flex;
  align-items: center;

  svg {
    margin-right: 4px;
  }
`;
//

const Stakes = () => {
  const {
    context: { daoStore, configStore, providerStore, daoService, userStore },
  } = useContext();

  const [stakeAmount, setStakeAmount] = useState(0);
  // We should get the ID in another way
  const proposalId = useLocation().pathname.split('/')[3];
  console.log('Proposal ID in Vote: ', proposalId);
  const proposal = daoStore.getProposal(proposalId);
  const proposalEvents = daoStore.getProposalEvents(proposalId);
  const { account } = providerStore.getActiveWeb3React();
  const scheme = daoStore.getScheme(proposal.scheme);

  let stakedAmount = bnum(0);
  let positiveStakesCount = proposalEvents.stakes.filter(
    stake => stake.vote.toString() === '1'
  ).length;
  let negativeStakesCount = proposalEvents.stakes.filter(
    stake => stake.vote.toString() === '2'
  ).length;
  const networkContracts = configStore.getNetworkContracts();
  const votingMachines = networkContracts.votingMachines;

  const votingMachineTokenName =
    votingMachines.gen && scheme.votingMachine === votingMachines.gen.address
      ? 'GEN'
      : 'DX';

  const { dxdApproved, genApproved } = userStore.getUserInfo();
  const votingMachineTokenApproved =
    votingMachines.gen && scheme.votingMachine === votingMachines.gen.address
      ? genApproved
      : dxdApproved;
  const votingParameters = daoStore.getVotingParametersOfProposal(proposalId);

  proposalEvents.stakes.map(stake => {
    if (stake.staker === account && stake.vote.toString() === '1') {
      stakedAmount = stakedAmount.plus(stake.amount);
    } else if (stake.staker === account && stake.vote.toString() === '2') {
      stakedAmount = stakedAmount.minus(stake.amount);
    }
  });

  const { recommendedStakeToBoost, recommendedStakeToUnBoost } =
    calculateStakes(
      votingParameters.thresholdConst,
      scheme.boostedProposals,
      proposal.stateInVotingMachine === 4
        ? daoStore.getAmountOfProposalsPreBoostedInScheme(scheme.address) - 1
        : daoStore.getAmountOfProposalsPreBoostedInScheme(scheme.address),
      proposal.positiveStakes,
      proposal.negativeStakes
    );

  if (Number(votingMachineTokenApproved) > 0 && stakeAmount === 0) {
    setStakeAmount(
      Number(formatBalance(recommendedStakeToBoost, 18, 1, false))
    );
  }

  const { finishTime } = daoStore.getProposalStatus(proposalId);
  const finishTimeReached = finishTime.toNumber() < moment().unix();

  function onStakeAmountChange(event) {
    setStakeAmount(event.target.value);
  }

  const submitStake = function (decision) {
    daoService.stake(
      decision,
      denormalizeBalance(bnum(stakeAmount)).toString(),
      proposalId
    );
  };

  const redeem = function () {
    if (
      scheme.type === 'ContributionReward' &&
      networkContracts.daostack.contributionRewardRedeemer
    ) {
      daoService.redeemContributionReward(
        networkContracts.daostack.contributionRewardRedeemer,
        scheme.address,
        scheme.votingMachine,
        proposalId,
        account
      );
    } else {
      daoService.redeem(proposalId, account);
    }
  };

  const redeemDaoBounty = function () {
    daoService.redeemDaoBounty(proposalId, account);
  };

  const votingMachineUsed = daoStore.getVotingMachineOfProposal(proposalId);
  const approveVotingMachineToken = function () {
    daoService.approveVotingMachineToken(votingMachineUsed);
  };
  const redeemsLeft = daoStore.getUserRedeemsLeft(account);

  return (
    <>
      <SidebarRow>
        <strong>
          Stakes <Question question="5" />
        </strong>
      </SidebarRow>
      <SidebarRow>
        <PositiveSummary>
          <SummaryTotal>
            <AmountBadge color="green">{positiveStakesCount}</AmountBadge>
            {formatBalance(proposal.positiveStakes).toString()}{' '}
            {votingMachineTokenName}
          </SummaryTotal>
          <HorizontalSeparator />
          <SummaryDetails>
            {proposalEvents &&
              proposalEvents.stakes
                .filter(stakeEvent => stakeEvent?.vote?.toString() === '1')
                .map((stakeEvent, i) => (
                  <Vote
                    key={`stakeUp${i}`}
                    style={{ 'flex-direction': 'column' }}
                  >
                    <BlockchainLink
                      size="short"
                      type="user"
                      text={stakeEvent.staker}
                    />
                    <span>
                      {formatBalance(bnum(stakeEvent.amount)).toString()}{' '}
                      {votingMachineTokenName}
                    </span>
                  </Vote>
                ))}
          </SummaryDetails>
        </PositiveSummary>

        <NegativeSummary>
          <SummaryTotal>
            <AmountBadge color="red">{negativeStakesCount}</AmountBadge>
            {formatBalance(proposal.negativeStakes).toString()}{' '}
            {votingMachineTokenName}
          </SummaryTotal>
          <HorizontalSeparator />
          <SummaryDetails>
            {proposalEvents &&
              proposalEvents.stakes
                .filter(stakeEvent => stakeEvent?.vote?.toString() === '2')
                .map((stakeEvent, i) => (
                  <Vote
                    key={`stakeDown${i}`}
                    style={{ 'flex-direction': 'column' }}
                  >
                    <BlockchainLink
                      size="short"
                      type="user"
                      text={stakeEvent.staker}
                    />
                    <span>
                      {formatBalance(bnum(stakeEvent.amount)).toString()}{' '}
                      {votingMachineTokenName}
                    </span>
                  </Vote>
                ))}
          </SummaryDetails>
        </NegativeSummary>
      </SidebarRow>

      {stakedAmount.toNumber() > 0 ? (
        <SidebarRow>
          Already staked {stakedAmount.toNumber() > 0 ? 'for' : 'against'} with{' '}
          {formatBalance(stakedAmount).toString()} {votingMachineTokenName}
        </SidebarRow>
      ) : (
        <div></div>
      )}

      {account &&
      !finishTimeReached &&
      (proposal.stateInVotingMachine === 3 ||
        proposal.stateInVotingMachine === 4) &&
      votingMachineTokenApproved.toString() === '0' ? (
        <SidebarRow>
          <ActionArea>
            <small>Approve {votingMachineTokenName} to stake</small>
            <ActionButton
              color="blue"
              onClick={() => approveVotingMachineToken()}
            >
              Approve {votingMachineTokenName}
            </ActionButton>
          </ActionArea>
        </SidebarRow>
      ) : account &&
        !finishTimeReached &&
        (proposal.stateInVotingMachine === 3 ||
          proposal.stateInVotingMachine === 4) ? (
        <div>
          {Number(recommendedStakeToBoost) > 0 ? (
            <small>
              Stake ~
              {formatBalance(recommendedStakeToBoost, 18, 1, false).toString()}{' '}
              {votingMachineTokenName} to boost
            </small>
          ) : (
            <span />
          )}
          {Number(recommendedStakeToUnBoost) > 0 ? (
            <small>
              Stake ~
              {formatBalance(
                recommendedStakeToUnBoost,
                18,
                1,
                false
              ).toString()}{' '}
              {votingMachineTokenName} to unboost
            </small>
          ) : (
            <span />
          )}
          <SidebarRow>
            <AmountInput
              type="number"
              placeholder={votingMachineTokenName}
              name="stakeAmount"
              value={stakeAmount}
              id="stakeAmount"
              step="0.01"
              min="0"
              onChange={onStakeAmountChange}
              style={{ flex: 2 }}
            />
            <ActionButton
              style={{ flex: 1, maxWidth: '20px', textAlign: 'center' }}
              color="green"
              onClick={() => submitStake(1)}
            >
              <FiThumbsUp />
            </ActionButton>
            <ActionButton
              style={{ flex: 1, maxWidth: '20px', textAlign: 'center' }}
              color="red"
              onClick={() => submitStake(2)}
            >
              <FiThumbsDown />
            </ActionButton>
          </SidebarRow>
        </div>
      ) : (
        <div></div>
      )}

      {proposal.stateInVotingMachine < 3 &&
      (redeemsLeft.rep.indexOf(proposalId) > -1 ||
        redeemsLeft.stake.indexOf(proposalId) > -1) ? (
        <SidebarRow
          style={{
            borderTop: '1px solid gray',
            margin: '0px 10px',
            justifyContent: 'center',
          }}
        >
          <ActionButton color="blue" onClick={() => redeem()}>
            Redeem
          </ActionButton>
        </SidebarRow>
      ) : (
        <div></div>
      )}

      {account &&
      proposal.stateInVotingMachine < 3 &&
      redeemsLeft.bounty.indexOf(proposalId) > -1 ? (
        <SidebarRow
          style={{
            borderTop: '1px solid gray',
            margin: '0px 10px',
            justifyContent: 'center',
          }}
        >
          <ActionButton color="blue" onClick={() => redeemDaoBounty()}>
            Redeem Stake Bounty
          </ActionButton>
        </SidebarRow>
      ) : (
        <div></div>
      )}
    </>
  );
};

export default Stakes;
