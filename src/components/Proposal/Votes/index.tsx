import { useState } from 'react';
import moment from 'moment';
import { FiThumbsDown, FiThumbsUp } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import {
  Question,
  AmountBadge,
  HorizontalSeparator,
  BlockchainLink,
} from 'components/common';
import { ConfirmVoteModal } from 'components/ConfirmVoteModal';
import {
  TextCenter,
  SpaceAroundRow,
  Vote,
  AmountInput,
  PositiveSummary,
  NegativeSummary,
  SummaryTotal,
  SummaryDetails,
  ActionButton,
} from '../styles';

import { useContext } from 'contexts';
import { bnum, toPercentage } from 'utils';

const Votes = () => {
  const {
    context: { daoStore, configStore, providerStore, daoService },
  } = useContext();

  //State
  const [decision, setDecision] = useState(null);
  const [votePercentage, setVotePercentage] = useState(0);

  // We should get the ID in another way
  const proposalId = useLocation().pathname.split('/')[3];
  console.debug('Proposal ID in Vote: ', proposalId);

  const proposal = daoStore.getProposal(proposalId);
  const proposalEvents = daoStore.getProposalEvents(proposalId);
  const { account } = providerStore.getActiveWeb3React();

  let votedAmount = bnum(0);

  proposalEvents.votes.map(vote => {
    if (vote.voter === account) {
      votedAmount = bnum(vote.amount);
    }
  });

  console.log('prop events', proposalEvents);
  let positiveVotesCount = proposalEvents.votes.filter(
    vote => vote.vote.toString() === '1'
  ).length;
  let negativeVotesCount = proposalEvents.votes.filter(
    vote => vote.vote.toString() === '2'
  ).length;

  const {
    userRep: userRepAtProposalCreation,
    totalSupply: totalRepAtProposalCreation,
  } =
    configStore.getActiveChainName().indexOf('arbitrum') > -1
      ? daoStore.getRepAt(account, proposal.creationEvent.l2BlockNumber)
      : daoStore.getRepAt(account, proposal.creationEvent.l1BlockNumber);

  const repPercentageAtCreation = toPercentage(
    userRepAtProposalCreation.div(totalRepAtProposalCreation)
  ).toFixed(2);

  const positiveVotes = toPercentage(
    proposal.positiveVotes.div(totalRepAtProposalCreation)
  ).toFixed(2);

  const negativeVotes = toPercentage(
    proposal.negativeVotes.div(totalRepAtProposalCreation)
  ).toFixed(2);

  if (Number(repPercentageAtCreation) > 0 && votePercentage === 0) {
    setVotePercentage(Number(repPercentageAtCreation));
  }

  const { finishTime } = daoStore.getProposalStatus(proposalId);
  const votingParameters = daoStore.getVotingParametersOfProposal(proposalId);
  const finishTimeReached = finishTime.toNumber() < moment().unix();

  // Events Handlers
  const onVoteValueChange = event => {
    setVotePercentage(
      event.target.value < repPercentageAtCreation
        ? event.target.value
        : repPercentageAtCreation
    );
  };

  const submitVote = function (decision) {
    const repAmount = totalRepAtProposalCreation
      .times(bnum(votePercentage))
      .div('100')
      .toFixed(0);
    daoService.vote(decision, repAmount, proposalId);
    setDecision(null);
  };

  // TODO:
  // This Component could be abstracted so much!
  // <Counts> <NewVote> each one getting proposalEvents and iterating and counting.
  // and Summary can be based on polarity <Summary polarity={positive|negative} /> and reused.
  return (
    <>
      <SpaceAroundRow>
        <strong>
          Votes <Question question="4" />
        </strong>
      </SpaceAroundRow>
      <SpaceAroundRow>
        <PositiveSummary>
          <SummaryTotal>
            <AmountBadge color="green">{positiveVotesCount}</AmountBadge>
            {`${positiveVotes}%`}
          </SummaryTotal>
          <HorizontalSeparator />
          <SummaryDetails>
            {proposalEvents?.votes
              .filter(voteEvent => voteEvent?.vote.toString() === '1')
              .map((voteEvent, i) => (
                <Vote key={`vote-pos-${i}`}>
                  <BlockchainLink
                    size="short"
                    type="user"
                    text={voteEvent.voter}
                  />
                  <span>
                    {bnum(voteEvent.amount)
                      .times('100')
                      .div(totalRepAtProposalCreation)
                      .toFixed(2)}
                    %
                  </span>
                </Vote>
              ))}
          </SummaryDetails>
        </PositiveSummary>
        <NegativeSummary>
          <SummaryTotal>
            <AmountBadge color="red">{negativeVotesCount}</AmountBadge>
            <span>{`${negativeVotes}%`}</span>
          </SummaryTotal>
          <HorizontalSeparator />
          <SummaryDetails>
            {proposalEvents?.votes
              ?.filter(voteEvent => voteEvent.vote.toString() === '2')
              .map((voteEvent, i) => (
                <Vote key={`vote-neg-${i}`}>
                  <BlockchainLink
                    size="short"
                    type="user"
                    text={voteEvent.voter}
                  />
                  <span>
                    {bnum(voteEvent.amount)
                      .times('100')
                      .div(totalRepAtProposalCreation)
                      .toNumber()
                      .toFixed(2)}
                    %
                  </span>
                </Vote>
              ))}
          </SummaryDetails>
        </NegativeSummary>
      </SpaceAroundRow>

      {Number(repPercentageAtCreation) > 0 && (
        <small>{repPercentageAtCreation} % REP at proposal creation</small>
      )}

      {(proposal.stateInVotingMachine === 3 ||
        proposal.stateInVotingMachine === 4) &&
        votingParameters.votersReputationLossRatio.toNumber() > 0 &&
        finishTime.toNumber() > 0 && (
          <TextCenter>
            <small>
              Voter REP Loss Ratio:
              {votingParameters.votersReputationLossRatio.toString()}%
            </small>
          </TextCenter>
        )}

      {account &&
      !finishTimeReached &&
      votedAmount.toNumber() === 0 &&
      Number(repPercentageAtCreation) > 0 &&
      proposal.stateInVotingMachine >= 3 ? (
        <SpaceAroundRow>
          <ConfirmVoteModal
            voteDecision={decision}
            toAdd={votePercentage}
            positive={parseFloat(positiveVotes)}
            negative={parseFloat(negativeVotes)}
            onConfirm={submitVote}
            onCancel={() => setDecision(null)}
          />
          <AmountInput
            type="number"
            placeholder="REP"
            name="votePercentage"
            max={repPercentageAtCreation}
            value={votePercentage}
            min="0"
            step={
              votePercentage > 10
                ? '1'
                : votePercentage > 1
                ? '0.01'
                : votePercentage > 0.1
                ? '0.001'
                : '0.00001'
            }
            id="votePercentage"
            onChange={onVoteValueChange}
            style={{ flex: 2 }}
          />
          <ActionButton
            style={{ flex: 1, maxWidth: '20px', textAlign: 'center' }}
            color="green"
            onClick={() => setDecision(1)}
          >
            <FiThumbsUp />
          </ActionButton>
          <ActionButton
            style={{ flex: 1, maxWidth: '20px', textAlign: 'center' }}
            color="red"
            onClick={() => setDecision(2)}
          >
            <FiThumbsDown />
          </ActionButton>
        </SpaceAroundRow>
      ) : (
        votedAmount.toNumber() !== 0 && (
          <SpaceAroundRow>
            <TextCenter>
              {' '}
              Already voted {votedAmount.toNumber() > 0
                ? 'for'
                : 'against'}{' '}
              with
              {votedAmount
                .times('100')
                .div(totalRepAtProposalCreation)
                .toFixed(2)}
              % REP
            </TextCenter>
          </SpaceAroundRow>
        )
      )}
    </>
  );
};
export default Votes;
