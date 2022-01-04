import { useState } from 'react';
import moment from 'moment';
import {
  FiThumbsDown,
  FiThumbsUp,
  FiWifi,
  FiWifiOff,
  FiArrowUp,
} from 'react-icons/fi';
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
    context: {
      configStore,
      daoStore,
      providerStore,
      daoService,
      messageLoggerService,
    },
  } = useContext();

  //State
  const [signVote, setSignVote] = useState(false);
  const [decision, setDecision] = useState(null);
  const [votePercentage, setVotePercentage] = useState(0);
  const [signedVotesOfProposal, setSignedVotesOfProposal] = useState([]);
  const [loadingSignedVotes, setLoadingSignedVotes] = useState(true);

  // We should get the ID in another way
  const proposalId = useLocation().pathname.split('/')[3];

  const proposal = daoStore.getProposal(proposalId);
  const proposalEvents = daoStore.getProposalEvents(proposalId);
  const { account } = providerStore.getActiveWeb3React();

  if (signedVotesOfProposal.length == 0)
    messageLoggerService
      .getMessages(`dxvote:${proposalId}`)
      .then(messagesEvents => {
        console.debug(`[Proposal messages] ${messagesEvents}`);
        messagesEvents.map(messagesEvent => {
          if (
            messagesEvent.returnValues.message &&
            messagesEvent.returnValues.message.length > 0 &&
            messagesEvent.returnValues.message.split(':').length > 6
          ) {
            const signedVote = messagesEvent.returnValues.message.split(':');
            const validSignature = daoService.verifySignedVote(
              signedVote[1],
              signedVote[2],
              signedVote[3],
              signedVote[4],
              signedVote[5],
              signedVote[6]
            );

            const alreadyAdded =
              signedVotesOfProposal.findIndex(s => s.voter == signedVote[3]) >
                -1 ||
              proposalEvents.votes.findIndex(s => s.voter == signedVote[3]) >
                -1;

            const repOfVoterForProposal = daoStore.getRepAt(
              signedVote[3],
              proposal.creationEvent.blockNumber
            ).userRep;

            if (
              validSignature &&
              !alreadyAdded &&
              repOfVoterForProposal >= signedVote[5]
            ) {
              signedVotesOfProposal.push({
                voter: signedVote[3],
                vote: signedVote[4],
                amount: bnum(signedVote[5]),
                signature: signedVote[6],
              });
            }
          }
        });
        console.debug(`[Signed votes] ${signedVotesOfProposal}`);
        setSignedVotesOfProposal(signedVotesOfProposal);
        setLoadingSignedVotes(false);
      });

  let votedAmount = bnum(0);

  proposalEvents.votes.map(vote => {
    if (vote.voter === account) {
      votedAmount = bnum(vote.amount);
    }
  });

  let positiveVotesCount = proposalEvents.votes.filter(
    vote => vote.vote.toString() === '1'
  ).length;
  let negativeVotesCount = proposalEvents.votes.filter(
    vote => vote.vote.toString() === '2'
  ).length;

  const {
    userRep: userRepAtProposalCreation,
    totalSupply: totalRepAtProposalCreation,
  } = daoStore.getRepAt(account, proposal.creationEvent.blockNumber);

  const repPercentageAtCreation = toPercentage(
    userRepAtProposalCreation.div(totalRepAtProposalCreation)
  ).toFixed(2);

  const positiveVotes = toPercentage(
    proposal.positiveVotes.div(totalRepAtProposalCreation)
  ).toFixed(2);

  const negativeVotes = toPercentage(
    proposal.negativeVotes.div(totalRepAtProposalCreation)
  ).toFixed(2);

  const totalPositiveSignedVotes = toPercentage(
    signedVotesOfProposal
      .filter(signedVote => signedVote.vote.toString() === '1')
      .reduce(function (acc, obj) {
        return acc.plus(obj.amount);
      }, bnum(0))
      .div(totalRepAtProposalCreation)
  ).toFixed(2);

  const totalNegativeSignedVotes = toPercentage(
    signedVotesOfProposal
      .filter(signedVote => signedVote.vote.toString() === '2')
      .reduce(function (acc, obj) {
        return acc.plus(obj.amount);
      }, bnum(0))
      .div(totalRepAtProposalCreation)
  ).toFixed(2);

  if (Number(repPercentageAtCreation) > 0 && votePercentage === 0) {
    setVotePercentage(Number(repPercentageAtCreation));
  }

  const { finishTime } = daoStore.getProposalStatus(proposalId);
  const votingParameters = daoStore.getVotingParametersOfProposal(proposalId);
  const votingMachineAddress = daoStore.getVotingMachineOfProposal(proposalId);
  const finishTimeReached = finishTime.toNumber() < moment().unix();
  const isDXDVotingMachine =
    configStore.getNetworkContracts().votingMachines.dxd &&
    configStore.getNetworkContracts().votingMachines.dxd.address ==
      votingMachineAddress;

  // Events Handlers
  const onVoteValueChange = event => {
    setVotePercentage(
      event.target.value < repPercentageAtCreation
        ? event.target.value
        : repPercentageAtCreation
    );
  };

  const executeSignedVote = function (signedVote) {
    daoService.executeSignedVote(
      votingMachineAddress,
      proposalId,
      signedVote.voter,
      signedVote.vote,
      signedVote.amount.toString(),
      signedVote.signature
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

  const submitSignedVote = function (decision) {
    const repAmount = totalRepAtProposalCreation
      .times(bnum(votePercentage))
      .div('100')
      .toFixed(0);

    messageLoggerService.broadcastVote(
      votingMachineAddress,
      proposalId,
      decision.toString(),
      repAmount.toString()
    );
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
          Confirmed Votes <Question question="4" />
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

      {!loadingSignedVotes && (
        <div>
          <SpaceAroundRow>
            <strong>
              Signed Votes <Question question="4" />
            </strong>
          </SpaceAroundRow>
          <SpaceAroundRow>
            <PositiveSummary>
              <SummaryTotal>
                <AmountBadge color="green">
                  {
                    signedVotesOfProposal.filter(
                      signedVote => signedVote.vote.toString() === '1'
                    ).length
                  }
                </AmountBadge>
                {`${totalPositiveSignedVotes}%`}
              </SummaryTotal>
              <HorizontalSeparator />
              <SummaryDetails>
                {signedVotesOfProposal
                  .filter(signedVote => signedVote?.vote.toString() === '1')
                  .map((signedVote, i) => (
                    <Vote key={`vote-pos-${i}`}>
                      <BlockchainLink
                        size="short"
                        type="user"
                        text={signedVote.voter}
                      />
                      <span>
                        {bnum(signedVote.amount)
                          .times('100')
                          .div(totalRepAtProposalCreation)
                          .toFixed(2)}
                        %
                      </span>
                      {isDXDVotingMachine && (
                        <ActionButton
                          style={{
                            height: '15px',
                            margin: '0px 0px 0px 2px',
                            maxWidth: '15px',
                            textAlign: 'center',
                          }}
                          color="#536DFE"
                          onClick={() => executeSignedVote(signedVote)}
                        >
                          <FiArrowUp />
                        </ActionButton>
                      )}
                    </Vote>
                  ))}
              </SummaryDetails>
            </PositiveSummary>
            <NegativeSummary>
              <SummaryTotal>
                <AmountBadge color="red">
                  {
                    signedVotesOfProposal.filter(
                      signedVote => signedVote.vote.toString() === '2'
                    ).length
                  }
                </AmountBadge>
                {`${totalNegativeSignedVotes}%`}
              </SummaryTotal>
              <HorizontalSeparator />
              <SummaryDetails>
                {signedVotesOfProposal
                  ?.filter(signedVote => signedVote.vote.toString() === '2')
                  .map((signedVote, i) => (
                    <Vote key={`vote-neg-${i}`}>
                      <BlockchainLink
                        size="short"
                        type="user"
                        text={signedVote.voter}
                      />
                      <span>
                        {bnum(signedVote.amount)
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
        </div>
      )}

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
            onConfirm={signVote ? submitSignedVote : submitVote}
            onCancel={() => setDecision(null)}
            signedVote={signVote}
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
          <ActionButton
            style={{ flex: 1, maxWidth: '20px', textAlign: 'center' }}
            color="#536DFE"
            onClick={() => setSignVote(!signVote)}
          >
            {signVote ? <FiWifiOff /> : <FiWifi />}
          </ActionButton>
        </SpaceAroundRow>
      ) : (
        votedAmount.toNumber() !== 0 && (
          <SpaceAroundRow>
            <TextCenter>
              {`
              Already voted ${votedAmount.toNumber() > 0 ? 'for' : 'against'}
              with
              ${votedAmount
                .times('100')
                .div(totalRepAtProposalCreation)
                .toFixed(2)}
              % REP`}
            </TextCenter>
          </SpaceAroundRow>
        )
      )}
    </>
  );
};
export default Votes;
