import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useContext } from '../contexts';
import { LinkButton } from '../components/common/Button';
import Footer from '../components/Footer';
import {
  ZERO_ADDRESS,
  formatPercentage,
  normalizeBalance,
  timeToTimestamp,
  formatNumberValue,
  mapEnum,
  VotingMachineProposalState,
} from '../utils';
import { FiFeather, FiCheckCircle, FiCheckSquare } from 'react-icons/fi';

const ProposalsWrapper = styled.div`
  padding: 10px 0px;
  background: white;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  flex-direction: row;
  width: 100%;
`;

const NewProposalButton = styled.div`
  align-self: center;
  margin-bottom: 100px;
`;

const ProposalsFilter = styled.select`
  background-color: ${props => props.color || '#536DFE'};
  border-radius: 4px;
  color: white;
  height: 34px;
  letter-spacing: 1px;
  font-weight: 500;
  line-height: 34px;
  text-align: center;
  cursor: pointer;
  width: 200px;
  padding: 0px 10px;
  margin: 10px 0px;
  font-family: var(--roboto);
  border: 0px;
  align-self: center;
`;

const ProposalsNameFilter = styled.input`
  background-color: white;
  border: 1px solid #536dfe;
  border-radius: 4px;
  color: #536dfe;
  height: 34px;
  letter-spacing: 1px;
  font-weight: 500;
  line-height: 32px;
  text-align: left;
  cursor: initial;
  width: 100%;
  padding: 0px 10px;
  margin: 5px 0px;
  font-family: var(--roboto);
  align-self: center;
`;

const SidebarWrapper = styled.div`
  padding: 0px 10px 10px 10px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: 90vh;
  width: 200px;
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

const TableContentWrapper = styled.div`
  width: 75%;
  display: flex;
  flex-direction: column;

  border-left: 1px solid #e1e3e7;
`;

const ProposalTableHeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: var(--light-text-gray);
  padding: 20px 24px 8px 24px;
  font-size: 14px;
  text-align: center;
`;

const TableHeader = styled.div`
  width: ${props => props.width || '25%'};
  text-align: ${props => props.align};
`;

const TableRowsWrapper = styled.div`
  height: 100%;
  min-height: 350px;
  ::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 11px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 8px;
    border: 2px solid white;
    background-color: rgba(0, 0, 0, 0.5);
  }

  h3 {
    text-align: center;
    margin-top: 30px;
    color: var(--dark-text-gray);
  }
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
  width: 100%;

  &:hover {
    background-color: #80808012;
  }
`;

const TableCell = styled.div`
  display: flex;
  margin-right: 2%;
  color: ${props => props.color};
  width: ${props => props.width || '25%'};
  justify-content: ${props => props.align};
  font-weight: ${props => props.weight};
  font-size: ${props => (props.fontSize ? props.fontSize : 'smaller')};
  white-space: ${props => (props.wrapText ? 'nowrap' : 'inherit')};
  overflow: ${props => (props.wrapText ? 'hidden' : 'inherit')};
  text-overflow: ${props => (props.wrapText ? 'ellipsis' : 'inherit')};
`;

const FooterWrap = styled.div`
  align-self: flex-end;
`;

const ProposalsPage = observer(() => {
  const {
    context: { daoStore, configStore, providerStore },
  } = useContext();

  const schemes = daoStore.getAllSchemes();
  const votingMachines = configStore.getNetworkContracts().votingMachines;
  const [stateFilter, setStateFilter] = React.useState('Any Status');
  const [schemeFilter, setSchemeFilter] = React.useState('All Schemes');
  const [titleFilter, setTitleFilter] = React.useState('');
  const [proposals, setProposals] = React.useState([]);
  const networkName = configStore.getActiveChainName();
  const { account } = providerStore.getActiveWeb3React();
  const userEvents = daoStore.getUserEvents(account);

  const allProposals = daoStore.getAllProposals().map(cacheProposal => {
    return Object.assign(
      cacheProposal,
      daoStore.getProposalStatus(cacheProposal.id)
    );
  });

  /**
   * proposals are ordered:
   *  QuietEndingPeriod
   *  Boosted
   *  PreBoosted
   *  Queued
   *  Executed
   *  ExpiredInQueue
   *  None
   * Preboosted are ordered in boostTime and not in Finish Time.
   *
   */
  const sortedProposals = mapEnum(VotingMachineProposalState, p => {
    return (
      allProposals

        /**
         * loop over the enum
         * filter each enum value
         * sort them
         * flatten array
         * reverse order of array from ascending to descending
         */
        .filter(proposal => proposal.stateInVotingMachine === p)
        .sort((a, b) =>
          a.boostTime.toNumber() > 0
            ? b.boostTime.toNumber() - a.boostTime.toNumber()
            : b.finishTime - a.finishTime
        )
    );
  })
    .flat(1)
    .reverse();
  if (sortedProposals.length > proposals.length) setProposals(sortedProposals);

  function onStateFilterChange(newValue) {
    setStateFilter(newValue.target.value);
  }
  function onTitleFilterChange(newValue) {
    setTitleFilter(newValue.target.value);
  }
  function onSchemeFilterChange(newValue) {
    setSchemeFilter(newValue.target.value);
  }

  console.debug('All Proposals', allProposals, allProposals.length, daoStore);

  return (
    <ProposalsWrapper>
      <SidebarWrapper>
        <ProposalTableHeaderActions>
          <NewProposalButton>
            <LinkButton route={`/${networkName}/new`} width="200px">
              + New Proposal
            </LinkButton>
          </NewProposalButton>
          <ProposalsNameFilter
            type="text"
            placeholder="Search by proposal title"
            name="titleFilter"
            id="titleFilter"
            onChange={onTitleFilterChange}
          ></ProposalsNameFilter>
          <ProposalsFilter
            name="stateFilter"
            id="stateSelector"
            onChange={onStateFilterChange}
          >
            <option value="Any Status">Any Status</option>
            <option value="Pending Boost">Pending Boost</option>
            <option value="Pre Boosted">Pre Boosted</option>
            <option value="Boosted">Boosted</option>
            <option value="In Queue">Queue</option>
            <option value="Quiet Ending Period">Quiet Ending Period</option>
            <option value="Passed">Passed</option>
            <option value="Pending Execution">Pending Execution</option>
            <option value="Rejected">Rejected</option>
            <option value="Executed">Executed</option>
            <option value="Expired in Queue">Expired</option>
          </ProposalsFilter>
          <ProposalsFilter
            name="schemeFilter"
            id="schemeSelector"
            onChange={onSchemeFilterChange}
          >
            <option value="All Schemes">All Schemes</option>
            {schemes.map(scheme => {
              return (
                <option key={scheme.address} value={scheme.address}>
                  {scheme.name}
                </option>
              );
            })}
          </ProposalsFilter>
        </ProposalTableHeaderActions>
        <FooterWrap>
          <Footer />
        </FooterWrap>
      </SidebarWrapper>
      <TableContentWrapper>
        <ProposalTableHeaderWrapper>
          <TableHeader width="55%" align="left">
            {' '}
            Title{' '}
          </TableHeader>
          <TableHeader width="15%" align="center">
            {' '}
            Scheme{' '}
          </TableHeader>
          <TableHeader width="15%" align="center">
            {' '}
            Status{' '}
          </TableHeader>
          <TableHeader width="15%" align="center">
            {' '}
            Stakes{' '}
          </TableHeader>
          <TableHeader width="10%" align="center">
            {' '}
            Votes{' '}
          </TableHeader>
        </ProposalTableHeaderWrapper>
        {proposals.length === 0 ? (
          <TableRowsWrapper>
            <h3>No Proposals Found</h3>
          </TableRowsWrapper>
        ) : (
          <TableRowsWrapper>
            {proposals.map((proposal, i) => {
              if (
                proposal &&
                (stateFilter === 'Any Status' ||
                  (stateFilter !== 'Any Status' &&
                    proposal.status === stateFilter)) &&
                (titleFilter.length === 0 ||
                  (titleFilter.length > 0 &&
                    proposal.title.indexOf(titleFilter) >= 0)) &&
                (schemeFilter === 'All Schemes' ||
                  proposal.scheme === schemeFilter)
              ) {
                // const minimumDaoBounty = daoStore.getVotingParametersOfProposal(
                //   proposal.id
                // ).minimumDaoBounty;
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
                  <Link
                    key={'proposal' + i}
                    to={`/${networkName}/proposal/${proposal.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <TableRow>
                      <TableCell
                        width="53%"
                        align="left"
                        weight="800"
                        wrapText="true"
                        fontSize="inherit"
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
                        {proposal.title.length > 0
                          ? proposal.title
                          : proposal.id}
                      </TableCell>
                      <TableCell width="13%" align="center">
                        {daoStore.getCache().schemes[proposal.scheme].name}
                      </TableCell>
                      <TableCell width="13%" align="center">
                        <span style={{ textAlign: 'center' }}>
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
                      </TableCell>
                      <TableCell
                        width="13%"
                        align="space-evenly"
                        style={{ minWidth: '15px', margin: '0px 2px' }}
                      >
                        <span
                          style={{
                            color: 'green',
                            flex: '5',
                            textAlign: 'right',
                          }}
                        >
                          {positiveStake.toString()} {votingMachineTokenName}{' '}
                        </span>
                        <span style={{ flex: '1', textAlign: 'center' }}>
                          |
                        </span>
                        <span
                          style={{ color: 'red', flex: '5', textAlign: 'left' }}
                        >
                          {' '}
                          {negativeStake.toString()} {votingMachineTokenName}
                        </span>
                      </TableCell>
                      <TableCell width="8%" align="space-evenly">
                        <span
                          style={{
                            color: 'green',
                            flex: '3',
                            textAlign: 'right',
                          }}
                        >
                          {positiveVotesPercentage}{' '}
                        </span>
                        <span style={{ flex: '1', textAlign: 'center' }}>
                          |
                        </span>
                        <span
                          style={{ color: 'red', flex: '3', textAlign: 'left' }}
                        >
                          {' '}
                          {negativeVotesPercentage}
                        </span>
                      </TableCell>
                    </TableRow>
                  </Link>
                );
              } else {
                return null;
              }
            })}
          </TableRowsWrapper>
        )}
      </TableContentWrapper>
    </ProposalsWrapper>
  );
});

export default ProposalsPage;
