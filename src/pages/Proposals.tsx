import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import Box from '../components/common/Box';
import { timeToTimestamp } from '../utils/date';
import { normalizeBalance } from '../utils/token';
import { formatPercentage } from '../utils/number';
import { Link } from 'react-router-dom';
import moment from 'moment';

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
    padding: 20px 40px 8px 24px;
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
    a {
        text-decoration: none;
        width: 100%;

        &:hover{
            color: var(--turquois-text-onHover);
        }
    }
    color: ${(props) => props.color};
    width: ${(props) => props.width || '25%'};
    text-align: ${(props) => props.align};
    font-weight: ${(props) => props.weight};
    white-space: ${(props) => props.wrapText ? 'nowrap' : 'inherit'};
    overflow: ${(props) => props.wrapText ? 'hidden' : 'inherit'};
    text-overflow: ${(props) => props.wrapText ? 'ellipsis' : 'inherit'};
`;

const ProposalsPage = observer(() => {
    const {
        root: { providerStore, daoStore, blockchainStore, configStore },
    } = useStores();

    const votingMachines = configStore.getNetworkConfig().votingMachines;
    const { library, active } = providerStore.getActiveWeb3React();
    const [stateFilter, setStateFilter] = React.useState("All");
    const [titleFilter, setTitleFilter] = React.useState("");
      
    const allProposals = daoStore.getAllProposals().map((cacheProposal) => {
      const {status, boostTime, finishTime} = daoStore.getProposalStatus(cacheProposal.id);
      cacheProposal.status = status; 
      cacheProposal.boostTime = boostTime; 
      cacheProposal.finishTime = finishTime; 
      return cacheProposal;
    }).sort(function(a, b) { return b.finishTime - a.finishTime; });
    function onStateFilterChange(newValue) { setStateFilter(newValue.target.value) }
    function onTitleFilterChange(newValue) { setTitleFilter(newValue.target.value) }
    console.log("All Proposals", allProposals, allProposals.length, daoStore);
    
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
              <option value="All">All</option>
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
          </div>

          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
            {(configStore.getActiveChainName() != 'mainnet') 
              ? <ActiveButton route="/new">+ New Proposal</ActiveButton>
              : <div/>
            }
          </div>
        </ProposalTableHeaderActions>
        <ProposalTableHeaderWrapper>
            <TableHeader width="5%" align="left"> # </TableHeader>
            <TableHeader width="30%" align="left"> Title </TableHeader>
            <TableHeader width="15%" align="center"> Scheme </TableHeader>
            <TableHeader width="15%" align="center"> Status </TableHeader>
            <TableHeader width="17.5%" align="center"> Staked </TableHeader>
            <TableHeader width="17.5%" align="center"> Votes  </TableHeader>
        </ProposalTableHeaderWrapper>
        { (allProposals.length === 0) ?
          <TableRowsWrapper>
            <h3>No Proposals Found</h3>
          </TableRowsWrapper>
          :
          <TableRowsWrapper>
            { allProposals.map((proposal, i) => {
              if (
                proposal 
                && ((stateFilter == 'All') || (stateFilter != 'All' && proposal.status == stateFilter))
                && (titleFilter.length == 0) || ((titleFilter.length > 0) && (proposal.title.indexOf(titleFilter) >= 0))
              ) {
                const positiveStake = normalizeBalance(proposal.positiveStakes, 18);
                const negativeStake = normalizeBalance(proposal.negativeStakes, 18);
                const positiveVotesPercentage = formatPercentage(
                  proposal.positiveVotes.div(proposal.repAtCreation), 2
                );
                const negativeVotesPercentage =  formatPercentage(
                  proposal.negativeVotes.div(proposal.repAtCreation), 2
                );
                const timeToBoost = timeToTimestamp(proposal.boostTime);
                const timeToFinish = timeToTimestamp(proposal.finishTime);
                
                const votingMachineTokenName = 
                (votingMachines.gen && daoStore.getVotingMachineOfProposal(proposal.id) == votingMachines.gen.address)
                ? 'GEN' : 'DXD';
                return (
                  <Link key={"proposal"+i} to={"/proposal/"+proposal.id} style={{textDecoration: "none"}}>
                    <TableRow>
                      <TableCell width="5%" align="left">
                        {allProposals.length - i}
                      </TableCell>
                      <TableCell width="30%" align="left" weight='500' wrapText="true">
                        {proposal.title.length > 0 ? proposal.title : proposal.id}
                      </TableCell>
                      <TableCell width="15%" align="center">
                        {daoStore.getCache().schemes[proposal.scheme].name}
                      </TableCell>
                      <TableCell width="15%" align="center">
                        {proposal.status} <br/>
                        {(timeToBoost != "") ? <small>Boost {timeToBoost} <br/></small> : <span></span>}
                        {(timeToFinish != "") ? <small>Finish {timeToFinish} </small> : <span></span>}
                      </TableCell>
                      <TableCell width="17.5%" align="center"> 
                        <span style={{color: "green"}}>{positiveStake.toString()} {votingMachineTokenName} </span>
                        -
                        <span style={{color: "red"}}> {negativeStake.toString()} {votingMachineTokenName}</span>
                      </TableCell>
                      <TableCell width="17.5%" align="center"> 
                        <span style={{color: "green"}}>{positiveVotesPercentage} </span>
                        -
                        <span style={{color: "red"}}> {negativeVotesPercentage}</span>
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
