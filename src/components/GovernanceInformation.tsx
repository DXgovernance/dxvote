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

const GovernanceTableHeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: var(--light-text-gray);
  padding: 20px 40px 8px 24px;
  font-size: 14px;
  text-align: center;
`;

const TableHeader = styled.div`
  width: ${props => props.width};
  text-align: ${props => props.align};
`;

const TableRowsWrapper = styled.div`
  overflow-y: scroll;
`;

const TableRow = styled.div`
  font-size: 16px;
  line-height: 18px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid var(--line-gray);
  padding: 16px 24px;
  color: var(--dark-text-gray);
  text-align: right;
  cursor: pointer;
`;

const TableCell = styled.div`
  color: ${props => props.color};
  width: ${props => props.width};
  text-align: ${props => props.align};
  font-weight: ${props => props.weight};
  white-space: ${props => (props.wrapText ? 'nowrap' : 'inherit')};
  overflow: ${props => (props.wrapText ? 'hidden' : 'inherit')};
  text-overflow: ${props => (props.wrapText ? 'ellipsis' : 'inherit')};
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
      <GovernanceTableHeaderWrapper>
        <TableHeader width="5%" align="center">
          {' '}
          #{' '}
        </TableHeader>
        <TableHeader width="35%" align="center">
          {' '}
          Address{' '}
        </TableHeader>
        <TableHeader width="15%" align="center">
          {' '}
          Proposals Created{' '}
        </TableHeader>
        <TableHeader width="15%" align="center">
          {' '}
          Voted{' '}
        </TableHeader>
        <TableHeader width="15%" align="center">
          {' '}
          Staked{' '}
        </TableHeader>
        <TableHeader width="15%" align="center">
          {' '}
          Score{' '}
        </TableHeader>
      </GovernanceTableHeaderWrapper>
      <TableRowsWrapper>
        {governanceInfo.ranking.map((user, i) => {
          return (
            <TableRow key={`user${i}`}>
              <TableCell width="5%" align="center" weight="500">
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
              <TableCell width="35%" align="center" weight="500">
                <BlockchainLink
                  size="long"
                  type="address"
                  text={user.address}
                  toCopy
                />
              </TableCell>
              <TableCell width="15%" align="center">
                {' '}
                {user.proposals}{' '}
              </TableCell>
              <TableCell width="15%" align="center">
                <span style={{ color: 'green' }}>{user.correctVotes} </span>-
                <span style={{ color: 'red' }}> {user.wrongVotes}</span>
              </TableCell>
              <TableCell width="15%" align="center">
                <span style={{ color: 'green' }}>{user.correctStakes} </span>-
                <span style={{ color: 'red' }}> {user.wrongStakes}</span>
              </TableCell>
              <TableCell width="15%" align="center">
                {' '}
                {user.score.toFixed(0)}{' '}
              </TableCell>
            </TableRow>
          );
        })}
      </TableRowsWrapper>
    </GovernanceInfoWrapper>
  );
});

export default GovernanceInformation;
