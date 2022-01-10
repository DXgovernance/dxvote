import styled from 'styled-components';
import moment from 'moment';
import { BlockchainLink } from 'components/common';
import { useLocation } from 'react-router-dom';
import { useContext } from 'contexts';
import { WalletSchemeProposalState, VotingMachineProposalState } from 'utils';

import { SpaceAroundRow } from '../styles';

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

const Details = () => {
  const {
    context: { daoStore },
  } = useContext();

  const proposalId = useLocation().pathname.split('/')[3];
  const proposal = daoStore.getProposal(proposalId);

  const scheme = daoStore.getScheme(proposal.scheme);

  const boostedVoteRequiredPercentage =
    scheme.boostedVoteRequiredPercentage / 100;

  const { boostTime, finishTime } = daoStore.getProposalStatus(proposalId);

  return (
    <SpaceAroundRow>
      <ProposalDescription>
        <Detail>
          <strong>Proposer</strong>
          <small>
            <BlockchainLink type="user" text={proposal.proposer} toCopy />
          </small>
        </Detail>
        <Detail>
          <strong>Scheme</strong> <small>{scheme.name}</small>
        </Detail>
        <Detail>
          <strong>Voting Parameters</strong>{' '}
          <small>{proposal.paramsHash.substring(0, 10)}...</small>
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
          <strong>Submitted Date</strong>
          <small>
            {moment
              .unix(proposal.submittedTime.toNumber())
              .format('MMMM Do YYYY, HH:mm:ss')}
          </small>
        </Detail>
        <Detail>
          <strong>Boost Date</strong>
          <small>
            {boostTime.toNumber() > 0
              ? moment
                  .unix(boostTime.toNumber())
                  .format('MMMM Do YYYY, HH:mm:ss')
              : '-'}
          </small>
        </Detail>
        <Detail>
          <strong>Finish Date</strong>
          <small>
            {moment
              .unix(finishTime.toNumber())
              .format('MMMM Do YYYY, HH:mm:ss')}
          </small>
        </Detail>

        {boostedVoteRequiredPercentage > 0 && (
          <Detail>
            <strong> Required Boosted Vote: </strong>
            <small>{boostedVoteRequiredPercentage}%</small>
          </Detail>
        )}
      </ProposalDescription>
    </SpaceAroundRow>
  );
};
export default Details;
