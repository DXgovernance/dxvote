import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useContext } from '../contexts';
import { BlockchainLink, InfoBox, Title, Row } from '../components/common';
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

const GovernanceTable = styled.table`
  display: grid;
  grid-template-columns: minmax(auto, 6%) minmax(auto, 36%) minmax(auto,15%) minmax(auto, 15%) minmax(auto, 15%) minmax(auto,15%);
  min-width: 100%;
  margin-top: 20px;
}

`;
const TableHeader = styled.th`
  text-align: ${props => props.align};
  padding: 10px 4px;
`;


const TableRow = styled.tr`
  font-size: 16px;
  line-height: 18px;
  border-bottom: 1px solid var(--line-gray);
  color: var(--dark-text-gray);
  text-align: center;
  cursor: pointer;
  display: contents;
`;

const TableCell = styled.td`
  color: ${props => props.color};
  text-align: ${props => props.align};
  font-weight: ${props => props.weight};
  white-space: ${props => (props.wrapText ? 'nowrap' : 'inherit')};
  overflow: ${props => (props.wrapText ? 'hidden' : 'inherit')};
  text-overflow: ellipsis;
  padding: 4px 14px;
`;

const Positive = styled.span`
  color: green;
`;

const Negative = styled.span`
  color: red;
`;

const GovernanceInformation = observer(() => {
  const {
    context: { daoStore },
  } = useContext();

  const daoInfo = daoStore.getDaoInfo();
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
        <InfoBox>{toNumber(daoInfo.totalRep)} REP</InfoBox>
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
        <thead style={{display: 'contents'}}>
          <tr style={{display: 'contents'}}>
            <TableHeader align="center">
              #
            </TableHeader>  
            <TableHeader align="center">
              Address
            </TableHeader>
            <TableHeader align="center">
              Proposals Created
            </TableHeader>
            <TableHeader align="center">
              Voted
            </TableHeader>
            <TableHeader align="center">
              Staked
            </TableHeader>
            <TableHeader align="center">
              Score
            </TableHeader>
          </tr>
        </thead>
        <tbody style={{display: 'contents'}}>
        {governanceInfo.ranking.map((user, i) => {
          return (
            <TableRow key={`user${i}`}>
              <TableCell align="center" weight="500">
                {' '}
                {i + 1}
                {i === 0 ? (
                  <FaTrophy style={{ color: 'gold' }} />
                ) : i === 1 ? (
                  <FaTrophy style={{ color: 'silver' }} />
                ) : i === 2 ? (
                  <FaTrophy style={{ color: '#CD7F32' }} />
                ) : i < 6 ? (
                  <FaMedal style={{ color: 'gold' }} />
                ) : i < 9 ? (
                  <FaMedal style={{ color: 'silver' }} />
                ) : i < 12 ? (
                  <FaMedal style={{ color: '#CD7F32' }} />
                ) : (
                  <div />
                )}
              </TableCell>
              <TableCell weight="500">
                <BlockchainLink
                  size="long"
                  type="address"
                  text={user.address}
                  toCopy
                />
              </TableCell>
              <TableCell>
                {user.proposals}
              </TableCell>
              <TableCell>
                <Positive>{user.correctVotes} </Positive>-
                <Negative> {user.wrongVotes}</Negative>
              </TableCell>
              <TableCell>
                <Positive>{user.correctStakes} </Positive>-
                <Negative> {user.wrongStakes}</Negative>
              </TableCell>
              <TableCell align="center">
                {user.score.toFixed(0)}
              </TableCell>
            </TableRow>
          );
        })}
        </tbody>
      </GovernanceTable>
    </GovernanceInfoWrapper>
  );
});

export default GovernanceInformation;
