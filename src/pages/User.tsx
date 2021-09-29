import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import { useContext } from '../contexts';
import { useLocation } from 'react-router-dom';
import { BlockchainLink, Row, Box, InfoBox, Subtitle } from '../components/common';
import { formatBalance } from '../utils';

const UserPage = observer(() => {
  let history = useHistory();

  const {
    context: { daoStore, configStore },
  } = useContext();
  const userAddress = useLocation().pathname.split('/')[3];
  const userEvents = daoStore.getUserEvents(userAddress);
  const userInfo = daoStore.getUser(userAddress);
  const networkName = configStore.getActiveChainName();
  const redeemsLeft = daoStore.getUserRedeemsLeft(userAddress);

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

      <h2> History </h2>
      {userEvents.history.map((historyEvent, i) => {
        return (
          <div
            key={'userHistoryEvent' + i}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 0px',
              borderBottom:
                i < userEvents.history.length - 1 ? '1px solid' : '',
            }}
          >
            <span> {historyEvent.text} </span>
            <BlockchainLink
              type="transaction"
              size="short"
              text={historyEvent.event.tx}
              onlyIcon
            />
          </div>
        );
      })}
    </Box>
  );
});

export default UserPage;
