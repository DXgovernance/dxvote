import React from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useContext } from '../contexts';
import moment from 'moment';
import Countdown from 'react-countdown';
import {
  FiPlayCircle,
  FiFastForward,
  FiThumbsUp,
  FiThumbsDown,
  FiZoomIn,
  FiZoomOut,
} from 'react-icons/fi';
import MDEditor from '@uiw/react-md-editor';
import { useHistory } from 'react-router-dom';
import contentHash from 'content-hash';
import {
  Box,
  Title,
  Question,
  AmountBadge,
  BlockchainLink,
  HorizontalSeparator,
} from '../components/common';
import {
  WalletSchemeProposalState,
  VotingMachineProposalState,
  bnum,
  calculateStakes,
  formatBalance,
  denormalizeBalance,
} from '../utils';
import { ConfirmVoteModal } from 'components/ConfirmVoteModal';

const ProposalInformationWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: row;
`;

const InfoSidebarBox = styled(Box)`
  max-width: 400px;
  min-width: 300px;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  padding: 10px 15px;
`;

const ProposalInfoSection = styled.div`
  max-width: 900px;
  width: 100%;
  flex-direction: column;
  margin-right: 15px;
`;

const ProposalInfoBox = styled(Box)`
  max-width: 900px;
  overflow-wrap: anywhere;
  padding: 20px 15px 10px 15px;
  justify-content: flex-start;
  overflow: auto;
`;

const SidebarDivider = styled.div`
  border-bottom: 1px solid gray;
  margin: 5px 10px;
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

const ProposalHistoryEvent = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 0px;
  border-bottom: 1px var(--medium-gray);
  &:last-of-type {
    border-bottom: none;
  }
`;

const ProposalCallText = styled.span`
  white-space: pre-line;
`;

const Vote = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.votes.fontSize};
  justify-content: space-between;

  > * {
    margin-left: 4px;
  }
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

const ProposalDescription = styled.div`
  margin: 0px 10px;
  padding: 10px 0px;
  flex-direction: column;
  font-size: 14px;
`;

const Detail = styled.div`
  display: flex;
  align-items: baseline;
  line-height: 20px;
  align-content: center;
  justify-items: center;
  flex-wrap: no-wrap;
  > * {
    margin-right: 5px;
  }
`;

const ActionArea = styled.div`
  display: flex;
  flex-direction: column;
`;

const TextCenter = styled.div`
  text-align: center;
`;

const HistoryEventText = styled.span`
  margin-right: 5px;
`;

const ProposalPage = observer(() => {
  let history = useHistory();

  const {
    context: {
      providerStore,
      daoStore,
      configStore,
      userStore,
      daoService,
      ipfsService,
    },
  } = useContext();

  const networkContracts = configStore.getNetworkContracts();
  const votingMachines = networkContracts.votingMachines;
  const proposalId = useLocation().pathname.split('/')[3];
  const proposal = daoStore.getProposal(proposalId);

  if (!proposal) history.push('/');

  const votingMachineUsed = daoStore.getVotingMachineOfProposal(proposalId);
  const scheme = daoStore.getScheme(proposal.scheme);
  const { dxdApproved, genApproved } = userStore.getUserInfo();
  const { account } = providerStore.getActiveWeb3React();
  const [decision, setDecision] = React.useState(null);
  const [advancedCalls, setAdvancedCalls] = React.useState(false);
  const [votePercentage, setVotePercentage] = React.useState(0);
  const [stakeAmount, setStakeAmount] = React.useState(0);
  const [proposalDescription, setProposalDescription] = React.useState(
    '## Getting proposal description from IPFS...'
  );
  const [proposalTitle, setProposalTitle] = React.useState(
    proposal.title.length > 0
      ? proposal.title
      : 'Getting proposal title from IPFS...'
  );

  const votingMachineTokenName =
    votingMachines.gen && scheme.votingMachine === votingMachines.gen.address
      ? 'GEN'
      : 'DXD';
  const votingMachineTokenApproved =
    votingMachines.gen && scheme.votingMachine === votingMachines.gen.address
      ? genApproved
      : dxdApproved;

  const proposalEvents = daoStore.getProposalEvents(proposalId);
  console.debug('[Scheme]', scheme);

  let votedAmount = bnum(0);
  let positiveVotesCount = proposalEvents.votes.filter(
    vote => vote.vote.toString() === '1'
  ).length;
  let negativeVotesCount = proposalEvents.votes.filter(
    vote => vote.vote.toString() === '2'
  ).length;
  let stakedAmount = bnum(0);
  let positiveStakesCount = proposalEvents.stakes.filter(
    stake => stake.vote.toString() === '1'
  ).length;
  let negativeStakesCount = proposalEvents.stakes.filter(
    stake => stake.vote.toString() === '2'
  ).length;

  const {
    userRep: userRepAtProposalCreation,
    totalSupply: totalRepAtProposalCreation,
  } =
    configStore.getActiveChainName().indexOf('arbitrum') > -1
      ? daoStore.getRepAt(account, proposal.creationEvent.l2BlockNumber)
      : daoStore.getRepAt(account, proposal.creationEvent.l1BlockNumber);

  const repPercentageAtCreation = userRepAtProposalCreation
    .times(100)
    .div(totalRepAtProposalCreation)
    .toFixed(4);

  const positiveVotes = proposal.positiveVotes
    .times('100')
    .div(totalRepAtProposalCreation)
    .toFixed(2);

  const negativeVotes = proposal.negativeVotes
    .times('100')
    .div(totalRepAtProposalCreation)
    .toFixed(2);

  const { status, boostTime, finishTime, pendingAction } =
    daoStore.getProposalStatus(proposalId);

  // @ts-ignore
  try {
    if (proposalDescription === '## Getting proposal description from IPFS...')
      ipfsService
        .getContent(contentHash.decode(proposal.descriptionHash))
        .then(data => {
          try {
            setProposalTitle(JSON.parse(data).title);
            setProposalDescription(JSON.parse(data).description);
          } catch (error) {
            setProposalDescription(data);
          }
        });
  } catch (error) {
    console.error('[IPFS ERROR]', error);
    setProposalTitle('Error getting proposal title from ipfs');
    setProposalDescription('Error getting proposal description from IPFS');
  }

  proposalEvents.votes.map(vote => {
    if (vote.voter === account) {
      votedAmount = bnum(vote.amount);
    }
  });

  proposalEvents.stakes.map(stake => {
    if (stake.staker === account && stake.vote.toString() === '1') {
      stakedAmount = stakedAmount.plus(stake.amount);
    } else if (stake.staker === account && stake.vote.toString() === '2') {
      stakedAmount = stakedAmount.minus(stake.amount);
    }
  });

  console.debug('[Proposal]', proposal);
  console.debug('[Proposal events]', proposalEvents);

  const executionTimeoutTime =
    scheme.type === 'WalletScheme'
      ? proposal.submittedTime.plus(scheme.maxSecondsForExecution)
      : bnum(0);

  let proposalCallTexts = new Array(proposal.to.length);
  for (var p = 0; p < proposal.to.length; p++) {
    proposalCallTexts[p] = daoService.decodeWalletSchemeCall(
      scheme.type === 'WalletScheme' &&
        scheme.controllerAddress !== networkContracts.controller
        ? scheme.address
        : networkContracts.avatar,
      proposal.to[p],
      proposal.callData[p],
      proposal.values[p],
      advancedCalls
    );
  }

  const votingParameters = daoStore.getVotingParametersOfProposal(proposalId);

  const redeemsLeft = daoStore.getUserRedeemsLeft(account);

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

  const boostedVoteRequiredPercentage =
    scheme.boostedVoteRequiredPercentage / 100;

  function onStakeAmountChange(event) {
    setStakeAmount(event.target.value);
  }

  function onVoteValueChange(event) {
    setVotePercentage(
      event.target.value < repPercentageAtCreation
        ? event.target.value
        : repPercentageAtCreation
    );
  }

  if (Number(repPercentageAtCreation) > 0 && votePercentage === 0) {
    setVotePercentage(Number(repPercentageAtCreation));
  }

  if (Number(votingMachineTokenApproved) > 0 && stakeAmount === 0) {
    setStakeAmount(
      Number(formatBalance(recommendedStakeToBoost, 18, 1, false))
    );
  }

  const submitVote = function (decision) {
    const repAmount = totalRepAtProposalCreation
      .times(bnum(votePercentage))
      .div('100')
      .toFixed(0);
    daoService.vote(decision, repAmount, proposalId);
    setDecision(null);
  };

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

  const approveVotingMachineToken = function () {
    daoService.approveVotingMachineToken(votingMachineUsed);
  };

  const executeProposal = function () {
    daoService.execute(proposalId);
  };

  const redeemBeneficiary = function () {
    daoService.redeemContributionReward(
      networkContracts.daostack.contributionRewardRedeemer,
      scheme.address,
      scheme.votingMachine,
      proposalId,
      proposal.to[0]
    );
  };

  const executeMulticall = function () {
    daoService.executeMulticall(scheme.address, proposalId);
  };

  const finishTimeReached = finishTime.toNumber() < moment().unix();
  const autoBoost =
    networkContracts.votingMachines.dxd &&
    networkContracts.votingMachines.dxd.address === votingMachineUsed;

  return (
    <ProposalInformationWrapper>
      <ProposalInfoSection>
        <ProposalInfoBox>
          <Title noMargin> {proposalTitle} </Title>
          <MDEditor.Markdown
            source={proposalDescription}
            style={{
              padding: '20px 10px',
              lineBreak: 'anywhere',
              whiteSpace: 'pre-line',
            }}
          />
          {proposal.descriptionHash.length > 0 && (
            <h3 style={{ margin: '0px' }}>
              <small>
                IPFS Document:{' '}
                <a
                  target="_blank"
                  href={`https://ipfs.io/ipfs/${contentHash.decode(
                    proposal.descriptionHash
                  )}`}
                >
                  ipfs://{contentHash.decode(proposal.descriptionHash)}
                </a>
              </small>
            </h3>
          )}
          <h2>
            {' '}
            Calls
            {advancedCalls ? (
              <FiZoomOut
                onClick={() => {
                  setAdvancedCalls(false);
                }}
              />
            ) : (
              <FiZoomIn
                onClick={() => {
                  setAdvancedCalls(true);
                }}
              />
            )}
            <Question question="9" />
          </h2>
          {proposalCallTexts.map((proposalCallText, i) => {
            return (
              <div key={'proposalCallText' + i}>
                <strong>Call #{i + 1}</strong> -{' '}
                <ProposalCallText
                  dangerouslySetInnerHTML={{ __html: proposalCallText }}
                />
                {i < proposalCallTexts.length - 1 ? <hr /> : <div />}
              </div>
            );
          })}
        </ProposalInfoBox>
        <ProposalInfoBox style={{ marginTop: '15px' }}>
          <Title noMargin> History </Title>
          {proposalEvents.history.map((historyEvent, i) => {
            return (
              <ProposalHistoryEvent key={'proposalHistoryEvent' + i}>
                <HistoryEventText> {historyEvent.text} </HistoryEventText>
                <BlockchainLink
                  type="transaction"
                  size="short"
                  text={historyEvent.event.tx}
                  onlyIcon
                />
                {i < proposalEvents.history.length - 1 ? <hr /> : <div />}
              </ProposalHistoryEvent>
            );
          })}
        </ProposalInfoBox>
      </ProposalInfoSection>
      <InfoSidebarBox>
        <h2 style={{ margin: '10px 0px 0px 0px', textAlign: 'center' }}>
          {status} <Question question="3" />
        </h2>
        <SidebarRow style={{ margin: '0px 10px', flexDirection: 'column' }}>
          {boostTime.toNumber() > moment().unix() && (
            <span className="timeText">
              Boost in <Countdown date={boostTime.toNumber() * 1000} />{' '}
            </span>
          )}
          {finishTime.toNumber() > moment().unix() && (
            <span className="timeText">
              Finish in{' '}
              <Countdown
                autoStart={pendingAction === 1 && !autoBoost ? false : true}
                date={finishTime.toNumber() * 1000}
              />
              {pendingAction === 1 && !autoBoost && ' after boost'}
            </span>
          )}
          {status === 'Pending Execution' &&
            executionTimeoutTime.toNumber() > 0 && (
              <span className="timeText">
                {' '}
                Execution timeout in{' '}
                <Countdown date={executionTimeoutTime.toNumber() * 1000} />{' '}
              </span>
            )}
        </SidebarRow>

        {account && (
          <SidebarRow style={{ flexDirection: 'column', alignItems: 'center' }}>
            {pendingAction === 1 ? (
              <ActionButton color="blue" onClick={executeProposal}>
                <FiFastForward /> Boost{' '}
              </ActionButton>
            ) : pendingAction === 2 ? (
              <ActionButton color="blue" onClick={executeProposal}>
                <FiPlayCircle /> Execute{' '}
              </ActionButton>
            ) : pendingAction === 3 ? (
              <ActionButton color="blue" onClick={executeProposal}>
                <FiPlayCircle /> Finish{' '}
              </ActionButton>
            ) : pendingAction === 4 ? (
              <ActionButton color="blue" onClick={redeemBeneficiary}>
                <FiPlayCircle /> Redeem 4 Beneficiary{' '}
              </ActionButton>
            ) : (
              pendingAction === 5 && (
                <ActionButton color="blue" onClick={executeMulticall}>
                  <FiPlayCircle /> Execute Multicall{' '}
                </ActionButton>
              )
            )}
          </SidebarRow>
        )}

        <SidebarDivider />

        <SidebarRow>
          <ProposalDescription>
            <Detail>
              <strong>Proposer</strong>{' '}
              <small>
                <BlockchainLink type="user" text={proposal.proposer} toCopy />
              </small>
            </Detail>
            <Detail>
              <strong>Scheme</strong> <small>{scheme.name}</small>
            </Detail>
            <Detail>
              <strong>State in Voting Machine </strong>
              <small>
                {VotingMachineProposalState[proposal.stateInVotingMachine]}
              </small>
            </Detail>
            <Detail>
              <strong>State in Scheme </strong>
              <small>{WalletSchemeProposalState[proposal.stateInScheme]}</small>
            </Detail>
            <Detail>
              {' '}
              <strong>Submitted Date</strong>{' '}
              <small>
                {moment
                  .unix(proposal.submittedTime.toNumber())
                  .format('MMMM Do YYYY, h:mm:ss')}
              </small>{' '}
            </Detail>
            <Detail>
              {' '}
              <strong>Boost Date</strong>{' '}
              <small>
                {boostTime.toNumber() > 0
                  ? moment
                      .unix(boostTime.toNumber())
                      .format('MMMM Do YYYY, h:mm:ss')
                  : '-'}
              </small>{' '}
            </Detail>
            <Detail>
              {' '}
              <strong>Finish Date</strong>{' '}
              <small>
                {moment
                  .unix(finishTime.toNumber())
                  .format('MMMM Do YYYY, h:mm:ss')}
              </small>{' '}
            </Detail>

            {boostedVoteRequiredPercentage > 0 && (
              <Detail>
                {' '}
                <strong> Required Boosted Vote: </strong>{' '}
                <small>{boostedVoteRequiredPercentage}%</small>{' '}
              </Detail>
            )}
          </ProposalDescription>
        </SidebarRow>

        <SidebarDivider />

        <SidebarRow>
          <strong>
            Votes <Question question="4" />
          </strong>
        </SidebarRow>
        <SidebarRow>
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
                        .toFixed(2)}{' '}
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
                        .toFixed(2)}{' '}
                      %
                    </span>
                  </Vote>
                ))}
            </SummaryDetails>
          </NegativeSummary>
        </SidebarRow>

        {Number(repPercentageAtCreation) > 0 ? (
          <small>{repPercentageAtCreation} % REP at proposal creation</small>
        ) : (
          <div />
        )}

        {(proposal.stateInVotingMachine === 3 ||
          proposal.stateInVotingMachine === 4) &&
        votingParameters.votersReputationLossRatio.toNumber() > 0 &&
        finishTime.toNumber() > 0 ? (
          <TextCenter>
            <small>
              Voter REP Loss Ratio:{' '}
              {votingParameters.votersReputationLossRatio.toString()}%
            </small>
          </TextCenter>
        ) : (
          <div />
        )}

        {account &&
        !finishTimeReached &&
        votedAmount.toNumber() === 0 &&
        Number(repPercentageAtCreation) > 0 &&
        proposal.stateInVotingMachine >= 3 ? (
          <SidebarRow>
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
          </SidebarRow>
        ) : votedAmount.toNumber() !== 0 ? (
          <SidebarRow>
            Already voted {votedAmount.toNumber() > 0 ? 'for' : 'against'} with{' '}
            {votedAmount
              .times('100')
              .div(totalRepAtProposalCreation)
              .toFixed(2)}{' '}
            % REP
          </SidebarRow>
        ) : (
          <div />
        )}

        <SidebarDivider />

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
            Already staked {stakedAmount.toNumber() > 0 ? 'for' : 'against'}{' '}
            with {formatBalance(stakedAmount).toString()}{' '}
            {votingMachineTokenName}
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
                {formatBalance(
                  recommendedStakeToBoost,
                  18,
                  1,
                  false
                ).toString()}{' '}
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
      </InfoSidebarBox>
    </ProposalInformationWrapper>
  );
});

export default ProposalPage;
