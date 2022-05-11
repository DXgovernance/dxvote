import {
  ActionArea,
  SpaceAroundRow,
  Vote,
  AmountInput,
  PositiveSummary,
  NegativeSummary,
  SummaryDetails,
  SummaryTotal,
  ActionButton,
} from '../styles';
import { useContext } from 'contexts';
import { parseUnits } from 'ethers/lib/utils';
import { useAllowance } from 'hooks/useERC20';
import moment from 'moment';
import {
  Question,
  AmountBadge,
  BlockchainLink,
  HorizontalSeparator,
} from 'old-components/common';
import { useState } from 'react';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import {
  bnum,
  calculateStakes,
  formatBalance,
  denormalizeBalance,
} from 'utils';

const Stakes = () => {
  const {
    context: { daoStore, configStore, providerStore, daoService },
  } = useContext();

  const [stakeAmount, setStakeAmount] = useState(0);
  // We should get the ID in another way
  const proposalId = useLocation().pathname.split('/')[3];

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

  const redeemsLeft = daoStore.getUserRedeemsLeft(account);

  const votingMachineOfProposal =
    daoStore.getVotingMachineOfProposal(proposalId);

  const votingMachineTokenName =
    votingMachines[votingMachineOfProposal.address].type == 'DXDVotingMachine'
      ? 'DXD'
      : 'GEN';

  const votingMachineTokenAllowed = useAllowance(
    votingMachines[votingMachineOfProposal.address].token,
    account,
    votingMachineOfProposal.address
  );

  const votingMachineTokenApproved = votingMachineTokenAllowed.gt(
    bnum(parseUnits('10000'))
  );

  const votingParameters =
    daoStore.getVotingMachineOfProposal(proposalId).params;

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

  // Event Handlers
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
      networkContracts.daostack[scheme.address].redeemer
    ) {
      daoService.redeemContributionReward(
        networkContracts.daostack[scheme.address].redeemer,
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

  return (
    <>
      <SpaceAroundRow>
        <strong>
          Stakes <Question question="5" />
        </strong>
      </SpaceAroundRow>
      <SpaceAroundRow>
        <PositiveSummary>
          <SummaryTotal>
            <AmountBadge color="green">{positiveStakesCount}</AmountBadge>
            {formatBalance(proposal.positiveStakes).toString()}
            {votingMachineTokenName}
          </SummaryTotal>
          <HorizontalSeparator />
          <SummaryDetails>
            {proposalEvents &&
              proposalEvents.stakes
                .filter(stakeEvent => stakeEvent?.vote?.toString() === '1')
                .map((stakeEvent, i) => (
                  <Vote key={`stakeUp${i}`} style={{ flexDirection: 'column' }}>
                    <BlockchainLink
                      size="short"
                      type="user"
                      text={stakeEvent.staker}
                    />
                    <span>
                      {formatBalance(bnum(stakeEvent.amount)).toString()}
                      {votingMachineTokenName}
                    </span>
                  </Vote>
                ))}
          </SummaryDetails>
        </PositiveSummary>

        <NegativeSummary>
          <SummaryTotal>
            <AmountBadge color="red">{negativeStakesCount}</AmountBadge>
            {formatBalance(proposal.negativeStakes).toString()}
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
                    style={{ flexDirection: 'column' }}
                  >
                    <BlockchainLink
                      size="short"
                      type="user"
                      text={stakeEvent.staker}
                    />
                    <span>
                      {formatBalance(bnum(stakeEvent.amount)).toString()}
                      {votingMachineTokenName}
                    </span>
                  </Vote>
                ))}
          </SummaryDetails>
        </NegativeSummary>
      </SpaceAroundRow>

      {stakedAmount.toNumber() > 0 ? (
        <SpaceAroundRow>
          {`Already staked ${
            stakedAmount.toNumber() > 0 ? 'for' : 'against'
          } with `}
          {formatBalance(stakedAmount).toString()} {votingMachineTokenName}
        </SpaceAroundRow>
      ) : (
        <div></div>
      )}

      {account &&
      !finishTimeReached &&
      (proposal.stateInVotingMachine === 3 ||
        proposal.stateInVotingMachine === 4) &&
      !votingMachineTokenApproved ? (
        <SpaceAroundRow>
          <ActionArea>
            <small>Approve {votingMachineTokenName} to stake</small>
            <ActionButton
              color="blue"
              onClick={() => approveVotingMachineToken()}
            >
              Approve {votingMachineTokenName}
            </ActionButton>
          </ActionArea>
        </SpaceAroundRow>
      ) : (
        account &&
        !finishTimeReached &&
        (proposal.stateInVotingMachine === 3 ||
          proposal.stateInVotingMachine === 4) && (
          <div>
            {Number(recommendedStakeToBoost) > 0 && (
              <small>
                Stake ~
                {formatBalance(
                  recommendedStakeToBoost,
                  18,
                  1,
                  false
                ).toString()}
                {votingMachineTokenName} to boost
              </small>
            )}
            {Number(recommendedStakeToUnBoost) > 0 && (
              <small>
                Stake ~
                {formatBalance(
                  recommendedStakeToUnBoost,
                  18,
                  1,
                  false
                ).toString()}
                {votingMachineTokenName} to unboost
              </small>
            )}
            <SpaceAroundRow>
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
            </SpaceAroundRow>
          </div>
        )
      )}

      {proposal.stateInVotingMachine < 3 &&
        (redeemsLeft.rep.indexOf(proposalId) > -1 ||
          redeemsLeft.stake.indexOf(proposalId) > -1) && (
          <SpaceAroundRow
            style={{
              borderTop: '1px solid gray',
              margin: '0px 10px',
              justifyContent: 'center',
            }}
          >
            <ActionButton color="blue" onClick={() => redeem()}>
              Redeem
            </ActionButton>
          </SpaceAroundRow>
        )}

      {account &&
        proposal.stateInVotingMachine < 3 &&
        redeemsLeft.bounty[proposalId] && (
          <SpaceAroundRow
            style={{
              borderTop: '1px solid gray',
              margin: '0px 10px',
              justifyContent: 'center',
            }}
          >
            <ActionButton color="blue" onClick={() => redeemDaoBounty()}>
              Redeem Stake Bounty
            </ActionButton>
          </SpaceAroundRow>
        )}
    </>
  );
};

export default Stakes;
