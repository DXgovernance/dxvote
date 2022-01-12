import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import {
  BlockchainLink,
  Row,
  Box,
  InfoBox,
  Subtitle,
  Button,
} from '../components/common';
import { formatBalance } from '../utils';
import { useContext } from '../contexts';
import useExporters from '../hooks/useExporters';
import {
  TitleRow,
  ListRow,
  VestingContractsSection,
} from 'components/UserPage';

const UserPage = observer(() => {
  let history = useHistory();

  const {
    context: { daoStore, configStore },
  } = useContext();
  const userAddress = useLocation().pathname.split('/')[3];
  const { exportToCSV, triggerDownload } = useExporters();
  const userEvents = daoStore.getUserEvents(userAddress);
  const userInfo = daoStore.getUser(userAddress);
  const networkName = configStore.getActiveChainName();
  const redeemsLeft = daoStore.getUserRedeemsLeft(userAddress);

  const getExportFileName = () => {
    return `history_${userAddress}-${moment().format('YYYY-MM-DD')}`;
  };

  const exportCSV = async () => {
    const historyItems = userEvents.history.map(historyEvent => ({
      tx: historyEvent.event.tx,
      eventTime: moment.unix(historyEvent.event.timestamp).format(),
      eventTimeTs: historyEvent.event.timestamp,
      blockNumber: historyEvent.event.block,
      action: historyEvent.text,
    }));
    const csvString = await exportToCSV(historyItems);
    triggerDownload(csvString, `${getExportFileName()}.csv`, 'text/csv');
  };

  return (
    <Box>
      <Subtitle>
        User: <BlockchainLink size="long" text={userAddress} toCopy />
      </Subtitle>
      <Row>
        <InfoBox>
          {formatBalance(userInfo.repBalance, 18, 0)} REP (
          {userInfo.repPercentage})
        </InfoBox>
        <InfoBox>
          {userEvents.votes.filter(vote => vote.vote === 1).length} Positive
          Votes
        </InfoBox>
        <InfoBox>
          {userEvents.votes.filter(vote => vote.vote === 2).length} Negative
          Votes
        </InfoBox>
        <InfoBox>{userEvents.newProposal.length} Proposals</InfoBox>
      </Row>

      <h2> Redeems Left </h2>
      {redeemsLeft.rep.map((proposalId, i) => {
        return (
          <span
            key={'proposalLink' + i}
            onClick={() => {
              history.push(`/${networkName}/proposal/${proposalId}`);
            }}
            style={{
              padding: '6px 0px',
              cursor: 'pointer',
            }}
          >
            REP redeem in Proposal {proposalId}
          </span>
        );
      })}
      {redeemsLeft.stake.map((proposalId, i) => {
        return (
          <span
            key={'proposalLink' + i}
            onClick={() => {
              history.push(`/${networkName}/proposal/${proposalId}`);
            }}
            style={{
              padding: '6px 0px',
              cursor: 'pointer',
            }}
          >
            Staking token redeem in Proposal {proposalId}
          </span>
        );
      })}
      {redeemsLeft.bounty.map((proposalId, i) => {
        return (
          <span
            key={'proposalLink' + i}
            onClick={() => {
              history.push(`/${networkName}/proposal/${proposalId}`);
            }}
            style={{
              padding: '6px 0px',
              cursor: 'pointer',
            }}
          >
            Staking token bounty redeem in Proposal {proposalId}
          </span>
        );
      })}

      <TitleRow>
        <h2>History</h2>
        <Button onClick={exportCSV}>Export to CSV</Button>
      </TitleRow>

      {userEvents.history.map((historyEvent, i) => {
        return (
          <ListRow
            key={'userHistoryEvent' + i}
            borderBottom={i < userEvents.history.length - 1}
          >
            <span> {historyEvent.text} </span>
            <BlockchainLink
              type="transaction"
              size="short"
              text={historyEvent.event.tx}
              onlyIcon
            />
          </ListRow>
        );
      })}
      <VestingContractsSection userAddress={userAddress} />
    </Box>
  );
});

export default UserPage;
