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
import { utils } from 'ethers';
import moment from 'moment';
import { ConfirmVoteModal } from 'old-components/ConfirmVoteModal';
import {
  Question,
  AmountBadge,
  HorizontalSeparator,
  BlockchainLink,
} from 'old-components/common';
import { useState } from 'react';
import {
  FiThumbsDown,
  FiThumbsUp,
  FiWifi,
  FiWifiOff,
  FiArrowUp,
} from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import {
  bnum,
  isVoteNo,
  isVoteYes,
  parseSignedVoteMessage,
  toPercentage,
  verifySignedVote,
} from 'utils';

const Votes = () => {
  const {
    context: {
      configStore,
      daoStore,
      providerStore,
      daoService,
      orbitDBService,
    },
  } = useContext();

  //State
  const [signVote, setSignVote] = useState(false);
  const [decision, setDecision] = useState(0);
  const [votePercentage, setVotePercentage] = useState(0);
  const [signedVotesOfProposal, setSignedVotesOfProposal] = useState([]);
  const [loadingSignedOrbitDBVotes, setLoadingSignedOrbitDBVotes] =
    useState(true);

  // We should get the ID in another way
  const proposalId = useLocation().pathname.split('/')[3];

  const proposal = daoStore.getProposal(proposalId);
  const proposalEvents = daoStore.getProposalEvents(proposalId);
  const { account } = providerStore.getActiveWeb3React();
  const signedVoteMessageId = utils.id(`dxvote:${proposalId}`);
  const { finishTime } = daoStore.getProposalStatus(proposalId);
  const votingMachineOfProposal =
    daoStore.getVotingMachineOfProposal(proposalId);
  const finishTimeReached = finishTime.toNumber() < moment().unix();
  const isDXDVotingMachine =
    configStore.getNetworkContracts().votingMachines[
      votingMachineOfProposal.address
    ].type === 'DXDVotingMachine';

  orbitDBService.getLogs(signedVoteMessageId).then(signedVoteMessages => {
    console.debug('[OrbitDB messages]', signedVoteMessages);
    signedVoteMessages.forEach(signedVoteMessageRaw => {
      const signedVoteMessage = parseSignedVoteMessage(signedVoteMessageRaw);
      if (signedVoteMessage.valid) {
        const alreadyAdded =
          signedVotesOfProposal.findIndex(
            s => s.voter === signedVoteMessage.voter
          ) > -1 ||
          proposalEvents.votes.findIndex(
            s => s.voter === signedVoteMessage.voter
          ) > -1;

        const repOfVoterForProposal = daoStore.getRepAt(
          signedVoteMessage.voter,
          proposal.creationEvent.blockNumber
        ).userRep;

        if (
          !alreadyAdded &&
          repOfVoterForProposal >= bnum(signedVoteMessage.repAmount)
        ) {
          signedVotesOfProposal.push({
            voter: signedVoteMessage.voter,
            vote: signedVoteMessage.decision,
            amount: bnum(signedVoteMessage.repAmount),
            signature: signedVoteMessage.signature,
            source: 'orbitDB',
          });
        }
      }
    });
    setSignedVotesOfProposal(signedVotesOfProposal);
    setLoadingSignedOrbitDBVotes(false);
  });

  let votedAmount = bnum(0);

  proposalEvents.votes.forEach(vote => {
    if (vote.voter === account) {
      votedAmount = bnum(vote.amount);
    }
  });

  let positiveVotesCount = proposalEvents.votes.filter(vote =>
    isVoteYes(vote.vote)
  ).length;

  let negativeVotesCount = proposalEvents.votes.filter(vote =>
    isVoteNo(vote.vote)
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
  ).toFixed(2, 4);

  const negativeVotes = toPercentage(
    proposal.negativeVotes.div(totalRepAtProposalCreation)
  ).toFixed(2, 4);

  const totalPositiveSignedVotes = toPercentage(
    signedVotesOfProposal
      .filter(signedVote => isVoteYes(signedVote.vote))
      .reduce(function (acc, obj) {
        return acc.plus(obj.amount);
      }, bnum(0))
      .div(totalRepAtProposalCreation)
  ).toFixed(2, 4);

  const totalNegativeSignedVotes = toPercentage(
    signedVotesOfProposal
      .filter(signedVote => isVoteNo(signedVote.vote))
      .reduce(function (acc, obj) {
        return acc.plus(obj.amount);
      }, bnum(0))
      .div(totalRepAtProposalCreation)
  ).toFixed(2, 4);

  if (Number(repPercentageAtCreation) > 0 && votePercentage === 0) {
    setVotePercentage(Number(repPercentageAtCreation));
  }

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
      votingMachineOfProposal.address,
      proposalId,
      signedVote.voter,
      signedVote.vote,
      signedVote.amount.toString(),
      signedVote.signature
    );
  };

  const submitVote = async function (voteDetails: {
    votingMachine: string;
    proposalId: string;
    voter: string;
    decision: string;
    repAmount: string;
    signVote: boolean;
    networks: boolean[];
    hashToETHMessage: boolean;
  }) {
    if (voteDetails.signVote) {
      const voteSignature = await daoService.signVote(
        voteDetails.votingMachine,
        voteDetails.proposalId,
        voteDetails.decision,
        voteDetails.repAmount,
        voteDetails.hashToETHMessage
      );
      if (
        verifySignedVote(
          voteDetails.votingMachine,
          voteDetails.proposalId,
          voteDetails.voter,
          voteDetails.decision,
          voteDetails.repAmount,
          voteSignature
        )
      ) {
        if (voteDetails.networks[0])
          orbitDBService.addLog(
            utils.id(`dxvote:${proposalId}`),
            `signedVote:${voteDetails.votingMachine}:${voteDetails.proposalId}:${voteDetails.voter}:${voteDetails.decision}:${voteDetails.repAmount}:${voteSignature}`
          );
      }
    } else {
      daoService.vote(
        voteDetails.decision,
        voteDetails.repAmount,
        voteDetails.proposalId
      );
    }

    setDecision(0);
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
              .filter(voteEvent => isVoteYes(voteEvent.vote))
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
                      .toFixed(2, 4)}
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
              ?.filter(voteEvent => isVoteNo(voteEvent.vote))
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
                      .toFixed(2, 4)}
                    %
                  </span>
                </Vote>
              ))}
          </SummaryDetails>
        </NegativeSummary>
      </SpaceAroundRow>

      {!loadingSignedOrbitDBVotes && (
        <div>
          <SpaceAroundRow>
            <strong>
              Signed Votes <Question question="4" /> <br />
              {!isDXDVotingMachine && <small>Non-Executable</small>}
            </strong>
          </SpaceAroundRow>
          <SpaceAroundRow>
            <PositiveSummary>
              <SummaryTotal>
                <AmountBadge color="green">
                  {
                    signedVotesOfProposal.filter(signedVote =>
                      isVoteYes(signedVote.vote)
                    ).length
                  }
                </AmountBadge>
                {`${totalPositiveSignedVotes}%`}
              </SummaryTotal>
              <HorizontalSeparator />
              <SummaryDetails>
                {signedVotesOfProposal
                  .filter(signedVote => isVoteYes(signedVote.vote))
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
                          .toFixed(2, 4)}
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
                    signedVotesOfProposal.filter(signedVote =>
                      isVoteNo(signedVote.vote)
                    ).length
                  }
                </AmountBadge>
                {`${totalNegativeSignedVotes}%`}
              </SummaryTotal>
              <HorizontalSeparator />
              <SummaryDetails>
                {signedVotesOfProposal
                  ?.filter(signedVote => isVoteNo(signedVote.vote))
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
                          .toFixed(2, 4)}
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
            </NegativeSummary>
          </SpaceAroundRow>
        </div>
      )}

      {Number(repPercentageAtCreation) > 0 && (
        <small>{repPercentageAtCreation} % REP at proposal creation</small>
      )}

      {(proposal.stateInVotingMachine === 3 ||
        proposal.stateInVotingMachine === 4) &&
        votingMachineOfProposal.params.votersReputationLossRatio.toNumber() >
          0 &&
        finishTime.toNumber() > 0 && (
          <TextCenter>
            <small>
              Voter REP Loss Ratio:
              {votingMachineOfProposal.params.votersReputationLossRatio.toString()}
              %
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
            onCancel={() => setDecision(0)}
            voteDetails={{
              votingMachine: votingMachineOfProposal.address,
              proposalId,
              voter: account,
              decision: decision.toString(),
              repAmount: totalRepAtProposalCreation
                .times(bnum(votePercentage))
                .div('100')
                .toFixed(0, 1)
                .toString(),
              signVote: signVote,
            }}
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
                .toFixed(2, 4)}
              % REP`}
            </TextCenter>
          </SpaceAroundRow>
        )
      )}
    </>
  );
};
export default Votes;
