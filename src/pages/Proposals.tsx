import styled from 'styled-components';
import { useHistory, Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useContext } from '../contexts';
import {
  LinkButton,
  Positive,
  Negative,
  Separator,
  Table,
  TableHeader,
  HeaderCell,
  TableBody,
  TableRow,
  DataCell,
} from '../components/common';
import PulsingIcon from '../components/common/LoadingIcon';
import Footer from '../components/Footer';
import {
  ZERO_ADDRESS,
  formatPercentage,
  normalizeBalance,
  timeToTimestamp,
  formatNumberValue,
} from '../utils';
import { FiFeather, FiCheckCircle, FiCheckSquare } from 'react-icons/fi';
import { useProposals } from 'hooks/useProposals';
import {
  StatusSearch,
  SchemaSearch,
  TitleSearch,
} from '../components/Proposals/Search';

const LoadingBox = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;

  .loader {
    text-align: center;
    font-weight: 500;
    font-size: 20px;
    line-height: 18px;
    color: var(--dark-text-gray);
    padding: 25px 0px;

    svg {
      margin-bottom: 10px;
    }
  }
`;

const ProposalsWrapper = styled.div`
  padding: 10px 0px;
  background: white;
  border-radius: 4px;
  display: grid;
  grid-template-columns: 20% 80%;
  grid-gap: 10px;
`;

const NewProposalButton = styled.div`
  align-self: center;
  margin-bottom: 100px;
`;

const SidebarWrapper = styled.div`
  padding: 0px 10px 10px 10px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: calc(90vh - 20px);
  align-self: flex-start;
  position: sticky;
  top: 10%;
`;

const ProposalTableHeaderActions = styled.div`
  padding: 20px 10px 20px 10px;
  color: var(--dark-text-gray);
  font-weight: 500;
  font-size: 18px;
  letter-spacing: 1px;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;

  span {
    font-size: 20px;
    padding: 10px 5px 5px 5px;
  }
`;

const StyledTableRow = styled(TableRow)`
  font-size: smaller;
  padding: 16px 24px;
  color: var(--dark-text-gray);
  text-align: center;
  cursor: pointer;
  &:hover {
    ${DataCell} {
      background-color: #80808012;
    }
  }

  ${DataCell} {
    border-bottom: 1px solid var(--line-gray);
    padding: 20px 5px;
    &:nth-child(1) {
      text-align: left;
      font-size: 14px;
    }
  }
`;

const FooterWrap = styled.div`
  align-self: flex-end;
`;

const TableProposal = styled(Table)`
  grid-template-columns: 33% 20% 15% 20% 12%;
  margin-bottom: auto;
  overflow-y: scroll;
  max-height: calc(90vh - 20px);
  ${TableHeader} {
    ${HeaderCell} {
      background: white;
      position: sticky;
      top: 0;
    }
  }
`;

const UnstyledAnchor = styled.a`
  color: inherit;
  text-decoration: inherit;
`;

const ProposalsPage = observer(() => {
  const {
    context: { daoStore, configStore, providerStore },
  } = useContext();

  const votingMachines = configStore.getNetworkContracts().votingMachines;
  const networkName = configStore.getActiveChainName();
  const { account } = providerStore.getActiveWeb3React();
  const userEvents = daoStore.getUserEvents(account);

  const [state] = useProposals();

  const history = useHistory();
  return (
    <ProposalsWrapper>
      <SidebarWrapper>
        <ProposalTableHeaderActions>
          <NewProposalButton>
            <LinkButton route={`/${networkName}/create/type`} width="200px">
              + New Proposal
            </LinkButton>
          </NewProposalButton>
          <TitleSearch />
          <StatusSearch />
          <SchemaSearch />
        </ProposalTableHeaderActions>
        <FooterWrap>
          <Footer />
        </FooterWrap>
      </SidebarWrapper>
      {state.loading && (
        <LoadingBox>
          <div className="loader">
            <PulsingIcon size={80} inactive={false} />
          </div>
        </LoadingBox>
      )}
      {!state.loading && (
        <TableProposal>
          <TableHeader>
            <HeaderCell>Title</HeaderCell>
            <HeaderCell>Scheme</HeaderCell>
            <HeaderCell>Status</HeaderCell>
            <HeaderCell>Stakes</HeaderCell>
            <HeaderCell>Votes</HeaderCell>
          </TableHeader>
          <TableBody>
            {state.proposals.map((proposal, i) => {
              const positiveStake = formatNumberValue(
                normalizeBalance(proposal.positiveStakes, 18),
                1
              );
              const negativeStake = formatNumberValue(
                normalizeBalance(proposal.negativeStakes, 18),
                1
              );
              const repAtCreation = daoStore.getRepAt(
                ZERO_ADDRESS,
                proposal.creationEvent.l1BlockNumber
              ).totalSupply;

              const positiveVotesPercentage = formatPercentage(
                proposal.positiveVotes.div(repAtCreation),
                2
              );
              const negativeVotesPercentage = formatPercentage(
                proposal.negativeVotes.div(repAtCreation),
                2
              );
              const timeToBoost = timeToTimestamp(proposal.boostTime);
              const timeToFinish = timeToTimestamp(proposal.finishTime);

              const votingMachineTokenName =
                votingMachines.dxd &&
                daoStore.getVotingMachineOfProposal(proposal.id) ===
                  votingMachines.dxd.address
                  ? 'DXD'
                  : 'GEN';

              const voted =
                userEvents.votes.findIndex(
                  event => event.proposalId === proposal.id
                ) > -1;
              const staked =
                userEvents.stakes.findIndex(
                  event => event.proposalId === proposal.id
                ) > -1;
              const created =
                userEvents.newProposal.findIndex(
                  event => event.proposalId === proposal.id
                ) > -1;
              return (
                <StyledTableRow
                  onClick={() =>
                    history.push(`/${networkName}/proposal/${proposal.id}`)
                  }
                  key={`row-${i}`}
                >
                  <DataCell
                    weight="800"
                    wrapText="true"
                    fontSize="inherit"
                    align="left"
                  >
                    <Link
                      to={`/${networkName}/proposal/${proposal.id}`}
                      component={UnstyledAnchor}
                    >
                      {created && (
                        <FiFeather
                          style={{ minWidth: '15px', margin: '0px 2px' }}
                        />
                      )}
                      {voted && (
                        <FiCheckCircle
                          style={{ minWidth: '15px', margin: '0px 2px' }}
                        />
                      )}
                      {staked && (
                        <FiCheckSquare
                          style={{ minWidth: '15px', margin: '0px 2px' }}
                        />
                      )}
                      {proposal.title.length > 0 ? proposal.title : proposal.id}
                    </Link>
                  </DataCell>
                  <DataCell>
                    {daoStore.getCache().schemes[proposal.scheme].name}
                  </DataCell>
                  <DataCell>
                    <span>
                      {proposal.status} <br />
                      {timeToBoost !== '' ? (
                        <small>
                          Boost {timeToBoost} <br />
                        </small>
                      ) : (
                        <span></span>
                      )}
                      {timeToFinish !== '' ? (
                        <small>Finish {timeToFinish} </small>
                      ) : (
                        <span></span>
                      )}
                      {proposal.pendingAction === 3 ? (
                        <small> Pending Finish Execution </small>
                      ) : (
                        <span></span>
                      )}
                    </span>
                  </DataCell>
                  <DataCell>
                    <Positive>
                      {positiveStake.toString()} {votingMachineTokenName}{' '}
                    </Positive>
                    <Separator>|</Separator>
                    <Negative>
                      {negativeStake.toString()} {votingMachineTokenName}
                    </Negative>
                  </DataCell>
                  <DataCell>
                    <Positive>{positiveVotesPercentage} </Positive>
                    <Separator>|</Separator>
                    <Negative>{negativeVotesPercentage}</Negative>
                  </DataCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </TableProposal>
      )}
    </ProposalsWrapper>
  );
});

export default ProposalsPage;
