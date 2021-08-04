import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import Box from '../components/common/Box';
import { ZERO_ADDRESS, formatPercentage, normalizeBalance, timeToTimestamp } from '../utils';
import { FiFeather, FiCheckCircle, FiCheckSquare } from "react-icons/fi";

const ProposalsTableWrapper = styled(Box)`
  width: 100%;
`;

const ProposalsFilter = styled.select`
  background-color: ${(props) => props.color || '#536DFE'};
  border-radius: 4px;
  color: white;
  height: 34px;
  letter-spacing: 1px;
  font-weight: 500;
  line-height: 34px;
  text-align: center;
  cursor: pointer;
  width: max-content;
  padding: 0px 10px;
  margin: 5px;
  font-family: var(--roboto);
  border: 0px;
`;

const ProposalsNameFilter = styled.input`
  background-color: white;
  border: 1px solid #536DFE;
  border-radius: 4px;
  color: #536DFE;
  height: 34px;
  letter-spacing: 1px;
  font-weight: 500;
  line-height: 32px;
  text-align: left;
  cursor: pointer;
  width: max-content;
  padding: 0px 10px;
  margin: 5px;
  font-family: var(--roboto);
`;

const ProposalTableHeaderActions = styled.div`
  padding: 0px 10px 10px 10px;
  color: var(--dark-text-gray);
  border-bottom: 1px solid var(--line-gray);
  font-weight: 500;
  font-size: 18px;
  letter-spacing: 1px;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  
  span {
    font-size: 20px;
    padding: 10px 5px 5px 5px;
  }
`;

const ProposalTableHeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: var(--light-text-gray);
  padding: 20px 24px 8px 24px;
  font-size: 14px;
  text-align: center;
`;

const TableHeader = styled.div`
  width: ${(props) => props.width || '25%'};
  text-align: ${(props) => props.align};
`;

const TableRowsWrapper = styled.div`
  overflow-y: scroll;
  height: 350px;
  
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
`;

const TableCell = styled.div`
  display: flex;
  color: ${(props) => props.color};
  width: ${(props) => props.width || '25%'};
  justify-content: ${(props) => props.align};
  font-weight: ${(props) => props.weight};
  white-space: ${(props) => props.wrapText ? 'nowrap' : 'inherit'};
  overflow: ${(props) => props.wrapText ? 'hidden' : 'inherit'};
  text-overflow: ${(props) => props.wrapText ? 'ellipsis' : 'inherit'};
`;

const ProposalsPage = observer(() => {
    const {
        root: { daoStore, configStore, providerStore },
    } = useStores();

    const schemes = daoStore.getAllSchemes();
    const votingMachines = configStore.getNetworkConfig().votingMachines;
    const [stateFilter, setStateFilter] = React.useState("Any Status");
    const [schemeFilter, setSchemeFilter] = React.useState("All Schemes");
    const [titleFilter, setTitleFilter] = React.useState("");
    const networkName = configStore.getActiveChainName();
    const { account } = providerStore.getActiveWeb3React();
    const userEvents = daoStore.getUserEvents(account);
    

    const allProposals = daoStore.getAllProposals().map((cacheProposal) => {
      return Object.assign(cacheProposal, daoStore.getProposalStatus(cacheProposal.id));
    });
    
    // First show the proposals that still have an active status in teh boting machine and order them from lower 
    // to higher based on the finish time.
    // Then show the proposals who finished based on the statte in the voting machine and order them from higher to 
    // lower in the finish time.
    // This way we show the proposals that will finish soon first and the latest proposals that finished later
    
    const sortedProposals = allProposals.filter((proposal) => proposal.stateInVotingMachine  > 2)
      .sort(function(a, b) { return a.finishTime - b.finishTime; })
      .concat(
        allProposals.filter((proposal) => proposal.stateInVotingMachine < 3)
        .sort(function(a, b) { return b.finishTime - a.finishTime; })
      );
    function onStateFilterChange(newValue) { setStateFilter(newValue.target.value) }
    function onTitleFilterChange(newValue) { setTitleFilter(newValue.target.value) }
    function onSchemeFilterChange(newValue) { setSchemeFilter(newValue.target.value) }
    
    console.debug("All Proposals", allProposals, allProposals.length, daoStore);

    return (
      <ProposalsTableWrapper>
        <ProposalTableHeaderActions>
          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
            <ProposalsNameFilter
              type="text"
              placeholder="Search by proposal title"
              name="titleFilter"
              id="titleFilter"
              onChange={onTitleFilterChange}
            ></ProposalsNameFilter>
            <ProposalsFilter name="stateFilter" id="stateSelector" onChange={onStateFilterChange}>
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
            <ProposalsFilter name="schemeFilter" id="schemeSelector" onChange={onSchemeFilterChange}>
              <option value="All Schemes">All Schemes</option>
              {schemes.map((scheme) => {
                return <option key={scheme.address} value={scheme.address}>{scheme.name}</option>
              })}
            </ProposalsFilter>
          </div>

          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
            <ActiveButton route={`/${networkName}/new`}>+ New Proposal</ActiveButton>
          </div>
        </ProposalTableHeaderActions>
        <ProposalTableHeaderWrapper>
          <TableHeader width="35%" align="left"> Title </TableHeader>
          <TableHeader width="15%" align="center"> Scheme </TableHeader>
          <TableHeader width="15%" align="center"> Status </TableHeader>
          <TableHeader width="17.5%" align="center"> Stakes </TableHeader>
          <TableHeader width="17.5%" align="center"> Votes  </TableHeader>
        </ProposalTableHeaderWrapper>
        { (sortedProposals.length === 0) ?
          <TableRowsWrapper>
            <h3>No Proposals Found</h3>
          </TableRowsWrapper>
          :
          <TableRowsWrapper>
            { sortedProposals.map((proposal, i) => {
              if (
                proposal 
                && ((stateFilter == 'Any Status') || (stateFilter != 'Any Status' && proposal.status == stateFilter))
                && ((titleFilter.length == 0) || ((titleFilter.length > 0) && (proposal.title.indexOf(titleFilter) >= 0)))
                && ((schemeFilter == 'All Schemes') || (proposal.scheme == schemeFilter))
              ) {
                const positiveStake = normalizeBalance(proposal.positiveStakes, 18);
                const negativeStake = normalizeBalance(proposal.negativeStakes, 18);
                const repAtCreation = daoStore.getRepAt(ZERO_ADDRESS, proposal.creationEvent.l1BlockNumber).totalSupply;
                
                const positiveVotesPercentage = formatPercentage(
                  proposal.positiveVotes.div(repAtCreation), 2
                );
                const negativeVotesPercentage =  formatPercentage(
                  proposal.negativeVotes.div(repAtCreation), 2
                );
                const timeToBoost = timeToTimestamp(proposal.boostTime);
                const timeToFinish = timeToTimestamp(proposal.finishTime);
                
                const votingMachineTokenName = 
                (votingMachines.gen && daoStore.getVotingMachineOfProposal(proposal.id) == votingMachines.gen.address)
                ? 'GEN' : 'DXD';
                
                const voted = userEvents.votes.findIndex((event) => event.proposalId == proposal.id) > -1;
                const staked = userEvents.stakes.findIndex((event) => event.proposalId == proposal.id) > -1;
                const created = userEvents.newProposal.findIndex((event) => event.proposalId == proposal.id) > -1;
                return (
                  <Link key={"proposal"+i} to={`/${networkName}/proposal/${proposal.id}`} style={{textDecoration: "none"}}>
                    <TableRow>
                      <TableCell width="35%" align="left" weight='500' wrapText="true">
                        {created && <FiFeather style={{margin: "0px 2px"}}/>}
                        {voted && <FiCheckCircle style={{margin: "0px 2px"}}/>}
                        {staked && <FiCheckSquare style={{margin: "0px 2px"}}/>}
                        {proposal.title.length > 0 ? proposal.title : proposal.id}
                      </TableCell>
                      <TableCell width="15%" align="center">
                        {daoStore.getCache().schemes[proposal.scheme].name}
                      </TableCell>
                      <TableCell width="15%" align="center">
                        <span style={{textAlign:"center"}}>
                          {proposal.status} <br/>
                          {(timeToBoost != "") ? <small>Boost {timeToBoost} <br/></small> : <span></span>}
                          {(timeToFinish != "") ? <small>Finish {timeToFinish} </small> : <span></span>}
                          {(proposal.pendingAction == 3) ? <small> Pending Finish Execution </small> : <span></span>}
                        </span>
                      </TableCell>
                      <TableCell width="17.5%" align="space-evenly"> 
                        <span style={{color: "green", flex:"3", textAlign:"right"}}>{positiveStake.toString()} {votingMachineTokenName} </span>
                        <span style={{flex:"1", textAlign:"center"}}>|</span>
                        <span style={{color: "red", flex:"3", textAlign:"left"}}> {negativeStake.toString()} {votingMachineTokenName}</span>
                      </TableCell>
                      <TableCell width="17.5%" align="space-evenly"> 
                        <span style={{color: "green", flex:"3", textAlign:"right"}}>{positiveVotesPercentage} </span>
                        <span style={{flex:"1", textAlign:"center"}}>|</span>
                        <span style={{color: "red", flex:"3", textAlign:"left"}}> {negativeVotesPercentage}</span>
                      </TableCell>
                    </TableRow>
                  </Link>);
                } else {
                  return null;
                }
              }
            )}
          </TableRowsWrapper>
        }
      </ProposalsTableWrapper>
    );
});

export default ProposalsPage;
