import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useContext } from '../contexts';
import {
  LinkButton, Box, Positive, Negative, Separator, Table, 
  TableHeader, HeaderCell, TableBody, TableRow, DataCell
} from '../components/common';
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

const ProposalsWrapper = styled(Box)`
  padding: 10px 0px;
  background: white;
  border-radius: 4px;
  display: grid; 
  grid-row-columns: 20% 80%;
  grid-gap: 10px;
`;

const ProposalsFilter = styled.div`
  padding: 5px 15px;
  letter-spacing: 1px;
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  border-bottom: 1px solid var(--light-gray);
`;

const SearchTitle = styled.input`
  background-color: white;
  border: 1px solid #536dfe;
  border-radius: 4px;
  color: #536dfe;
  letter-spacing: 1px;
  font-weight: 500;
  text-align: left;
  cursor: initial;
  font-family: var(--roboto);
  padding: 10px;
  margin-right: 10px;
  width: 200px;
`;

const FilterByProperty = styled.select`
  background-color: ${props => props.color || '#536DFE'};
  border-radius: 4px;
  color: white;
  letter-spacing: 1px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  font-family: var(--roboto);
  border: 0px;
  margin-right: 10px;
`;

const ProposalsTable = styled(Table)`
  grid-template-columns: 33% 20% 15% 20% 12%;
  padding: 20px 10px 20px 10px;
  overflow-y: scroll;
  height: 65vh;
`;

const NewProposalButton = styled(LinkButton)`
  padding: 0px;
  margin: 0px;
  margin-left: auto;
`;

const StyledTableRow = styled(TableRow)`
  font-size: smaller;
  padding: 16px 24px;
  color: var(--dark-text-gray);
  text-align: center;
  cursor: pointer;
  &:hover {
    ${DataCell}{
      background-color: #80808012;
    }
  }

  ${DataCell}{
    border-bottom: 1px solid var(--line-gray);
    padding: 20px 5px;
    &:nth-child(1) {
      text-align: left;
      font-size: 14px;
    }
  }
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

  const history = useHistory();

  console.debug('All Proposals', allProposals, allProposals.length, daoStore);

  return (
    <ProposalsWrapper>
      <ProposalsFilter>
        <SearchTitle
          type="text"
          placeholder="Search by proposal title"
          name="titleFilter"
          id="titleFilter"
          onChange={onTitleFilterChange}
        >
        </SearchTitle>
        <FilterByProperty
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
        </FilterByProperty>
        <FilterByProperty
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
        </FilterByProperty>
        <NewProposalButton route={`/${networkName}/new`} width="200px">
          + New Proposal
        </NewProposalButton>
      </ProposalsFilter>
       
      <ProposalsTable>
        <TableHeader>
          <HeaderCell>
            Title
          </HeaderCell>
          <HeaderCell>
            Scheme
          </HeaderCell>
          <HeaderCell>
            Status
          </HeaderCell>
          <HeaderCell>
            Stakes
          </HeaderCell>
          <HeaderCell>
            Votes
          </HeaderCell>
        </TableHeader>
        <TableBody>
          { proposals.length === 0 && <h3>No Proposals Found</h3> }       
            
          {proposals.map((proposal, i) => {
            console.log(i)
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
              const minimumDaoBounty = daoStore.getVotingParametersOfProposal(
                proposal.id
              ).minimumDaoBounty;
              const positiveStake = formatNumberValue(
                normalizeBalance(proposal.positiveStakes, 18),
                1
              );
              const negativeStake = formatNumberValue(
                normalizeBalance(
                  proposal.negativeStakes.plus(minimumDaoBounty),
                  18
                ),
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
              <StyledTableRow onClick={() => history.push(`/${networkName}/proposal/${proposal.id}`)}>
                <DataCell
                  weight="800"
                  wrapText="true"
                  fontSize="inherit"
                  align="left"
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
                </DataCell>
                <DataCell >
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
                  <Separator>
                    |
                  </Separator>
                  <Negative>
                    {negativeStake.toString()} {votingMachineTokenName}
                  </Negative>
                </DataCell>
                <DataCell>
                  <Positive>
                    {positiveVotesPercentage}{' '}
                  </Positive>
                  <Separator>
                    |
                  </Separator>
                  <Negative>
                    {negativeVotesPercentage}
                  </Negative>
                </DataCell>
              </StyledTableRow>
            )} else {
              return null;
            }
          })}
          </TableBody>
       </ProposalsTable>
    </ProposalsWrapper>
  );
});

export default ProposalsPage;
