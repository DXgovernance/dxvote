import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useContext } from '../contexts';
import {
  BlockchainLink,
  InfoBox,
  Title,
  Row,
  Table,
  TableHeader,
  HeaderCell,
  TableBody,
  TableRow,
  DataCell,
  Positive,
  Negative,
} from '../components/common';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import { bnum } from '../utils';
import { Chart } from 'react-google-charts';

const GovernanceInfoWrapper = styled.div`
  background: white;
  padding: 0px 10px;
  font-weight: 400;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  color: var(--dark-text-gray);
`;

const GovernanceTable = styled(Table)`
  grid-template-columns:
    minmax(auto, 6%) minmax(auto, 36%) minmax(auto, 15%) minmax(auto, 15%)
    minmax(auto, 15%) minmax(auto, 15%);
  min-width: 100%;
  margin-top: 20px;
`;

const GovernanceInformation = observer(() => {
  const {
    context: { daoStore },
  } = useContext();

  const totalRep = daoStore.daoCache.reputation.total;
  const governanceInfo = daoStore.getGovernanceInfo();

  function toNumber(weiNumber) {
    return bnum(weiNumber)
      .div(10 ** 18)
      .toFixed(0);
  }
  return (
    <GovernanceInfoWrapper>
      <Title centered>Stats</Title>
      <Row>
        <InfoBox>{toNumber(totalRep)} REP</InfoBox>
        <InfoBox>{governanceInfo.totalPositiveVotes} Positive Votes</InfoBox>
        <InfoBox>{governanceInfo.totalNegativeVotes} Negative Votes</InfoBox>
        <InfoBox>{governanceInfo.totalProposalsCreated} Proposals</InfoBox>
      </Row>

      <Title centered>Reputation Charts</Title>
      <Row>
        <Chart
          chartType="PieChart"
          loader={<div>Loading Chart</div>}
          data={governanceInfo.rep}
          options={{
            legend: 'none',
            pieSliceText: 'none',
            pieStartAngle: 100,
            title: 'Reputation Distribution',
            sliceVisibilityThreshold: 0.001, // 0.1%
          }}
        />
        <Chart
          width="100%"
          chartType="LineChart"
          loader={<div>Loading Chart</div>}
          data={governanceInfo.repEvents}
          options={{
            hAxis: { title: 'Block Number' },
            vAxis: { title: 'Reputation' },
            title: 'Reputation over Time',
            legend: 'none',
          }}
        />
      </Row>

      <Title centered>Governance Ranking</Title>

      <Row>
        <InfoBox>
          Create Proposal
          <br />
          <strong>1 to 30 Points</strong>
        </InfoBox>
        <InfoBox>
          Vote Winning Option
          <br />
          <strong>3 Points</strong>
        </InfoBox>
        <InfoBox>
          Vote Losing Option
          <br />
          <strong>1 Point</strong>
        </InfoBox>
        <InfoBox>
          Stake Winning Option
          <br />
          <strong>1 Point</strong>
        </InfoBox>
      </Row>

      <GovernanceTable>
        <TableBody>
          <TableHeader>
            <HeaderCell align="center">#</HeaderCell>
            <HeaderCell align="center">Address</HeaderCell>
            <HeaderCell align="center">Proposals Created</HeaderCell>
            <HeaderCell align="center">Voted</HeaderCell>
            <HeaderCell align="center">Staked</HeaderCell>
            <HeaderCell align="center">REP %</HeaderCell>
          </TableHeader>
          {governanceInfo.ranking.map((user, i) => {
            return (
              <TableRow key={`user${i}`}>
                <DataCell align="center" weight="500">
                  {' '}
                  {i + 1}
                  {i === 0 ? (
                    <FaTrophy color="gold" />
                  ) : i === 1 ? (
                    <FaTrophy color="silver" />
                  ) : i === 2 ? (
                    <FaTrophy color="#CD7F32" />
                  ) : i < 6 ? (
                    <FaMedal color="gold" />
                  ) : i < 9 ? (
                    <FaMedal color="silver" />
                  ) : i < 12 ? (
                    <FaMedal color="#CD7F32" />
                  ) : (
                    <div />
                  )}
                </DataCell>
                <DataCell weight="500">
                  <BlockchainLink
                    size="long"
                    type="address"
                    text={user.address}
                    toCopy
                  />
                </DataCell>
                <DataCell>{user.proposals}</DataCell>
                <DataCell>
                  <Positive>{user.correctVotes} </Positive>-
                  <Negative> {user.wrongVotes}</Negative>
                </DataCell>
                <DataCell>
                  <Positive>{user.correctStakes} </Positive>-
                  <Negative> {user.wrongStakes}</Negative>
                </DataCell>
                <DataCell align="center">{user.score.toFixed(0)}</DataCell>
              </TableRow>
            );
          })}
        </TableBody>
      </GovernanceTable>
    </GovernanceInfoWrapper>
  );
});

export default GovernanceInformation;
