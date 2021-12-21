import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import moment from 'moment';
import { useState, useEffect } from 'react';
import {
  BlockchainLink,
  Row,
  Box,
  InfoBox,
  Subtitle,
  Button,
} from '../components/common';
import UserVestingInfoModal from '../components/UserVestingInfoModal';
import useContract from '../hooks/useContract';
import { formatBalance, bnum } from '../utils';
import { useContext } from '../contexts';
import useExporters from '../hooks/useExporters';
import ERC20Json from '../contracts/ERC20.json';

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ListRow = styled.div`
  display: flex;
  alignitems: center;
  padding: 6px 0px;
  borderbottom: ${({ borderBottom }) => (borderBottom ? '1px solid' : '')};
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  &:hover {
    opacity: ${({ clickable }) => (clickable ? '0.5' : '1')};
  }
`;

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
  const userVestingContracts = daoStore.getUserVestingContracts(userAddress);
  const [isVestingInfoModalOpen, setIsVestingInfoModalOpen] = useState(false);
  const [selectedModalVestingContract, setSelectedModalVestingContract] =
    useState(null);
  const [tokenVestingContracts, setTokenVestingContracts] = useState([]);

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

  const DXD = useContract(
    configStore.getNetworkContracts().votingMachines.dxd.token,
    ERC20Json.abi
  );

  const updateUserVestingContracts = () => {
    const contracts = Promise.all(
      userVestingContracts.map(async contract => {
        try {
          const balance = await DXD?.balanceOf(contract.address);
          return {
            ...contract,
            value: bnum(balance),
          };
        } catch (e) {
          return {
            ...contract,
            value: '0',
          };
        }
      })
    );
    contracts.then(setTokenVestingContracts);
  };

  useEffect(updateUserVestingContracts, []);

  return (
    <>
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

        <TitleRow>
          <h2>Vesting Contracts</h2>
        </TitleRow>

        {tokenVestingContracts.length ? (
          tokenVestingContracts.map((contract, i, arr) => {
            return (
              <ListRow
                clickable
                key={contract.address}
                borderBottom={i < arr.length - 1}
                onClick={() => {
                  if (!contract.address) return;
                  setSelectedModalVestingContract(contract);
                  setIsVestingInfoModalOpen(true);
                }}
              >
                <span>
                  {contract.address} / Cliff:{' '}
                  {moment.unix(Number(contract.cliff)).format('LL')}/ Value:{' '}
                  {formatBalance(contract.value)} DXD
                </span>
              </ListRow>
            );
          })
        ) : (
          <ListRow> - No Vesting Contracts found for {userAddress} - </ListRow>
        )}
      </Box>
      <UserVestingInfoModal
        contract={selectedModalVestingContract}
        isOpen={isVestingInfoModalOpen}
        onDismiss={() => {
          setSelectedModalVestingContract(null);
          setIsVestingInfoModalOpen(false);
        }}
        onUpdate={updateUserVestingContracts}
      />
    </>
  );
});

export default UserPage;
