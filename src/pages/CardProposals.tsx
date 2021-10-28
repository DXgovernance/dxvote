import { observer } from 'mobx-react';
import { useState, useEffect } from 'react';
import { useContext } from '../contexts';
import styled from 'styled-components';
import { Row, Title } from 'components/common';
import { VotingMachineProposalState } from 'utils/enums';
import { orderByNewestTimeToFinish } from 'utils/proposals';

const Card = styled.div`
  width: 326px;
  height: 128px;
  background: #ffffff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  text-align: center;
  margin: 30px 10px;
  flex: ${props => props.size};
`;

const Grid = styled.div``;
const TimeTitle = styled.p`
  font-family: Inter;
  font-style: normal;
  font-weight: 200;
  font-size: 11px;
  line-height: 13px;

  color: #1254ff;
`;

const CardTitle = styled.p`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 15px;

  color: #000000;
`;

const InfoSum = styled.p`
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 15px;

  color: #000000;
`;

// title: IFPS
// call data summary:
// Boosted state

const CardProposalView = observer(() => {
  const {
    context: { daoStore },
  } = useContext();

  const [proposals, setProposal] = useState([]);

  // grab all the boosted proposals and sort via time
  const allProposals = daoStore
    .getAllProposals()
    .map(cacheProposal => {
      return Object.assign(
        cacheProposal,
        daoStore.getProposalStatus(cacheProposal.id)
      );
    })
    .filter(
      (proposal: Proposal): Boolean =>
        proposal.stateInVotingMachine === VotingMachineProposalState.Boosted
    );
  proposals.sort(orderByNewestTimeToFinish);

  useEffect(() => {
    setProposal(allProposals);
  }, []);

  console.log(proposals);

  return (
    <Grid>
      <Row>
        <Title>Proposal Cards</Title>
      </Row>
      {proposals.map(proposal => {
        return (
          <Row>
            <Card size={3}>
              <TimeTitle>{proposal.status}</TimeTitle>
              <CardTitle>{proposal.title}</CardTitle>
              <InfoSum>Proposal Info Summary Stats</InfoSum>
            </Card>
          </Row>
        );
      })}
      <Card>
        <TimeTitle>Boosted</TimeTitle>
        <CardTitle>Proposal Title</CardTitle>
        <InfoSum>Proposal Info Summary Stats</InfoSum>
      </Card>
    </Grid>
  );
});

export default CardProposalView;
