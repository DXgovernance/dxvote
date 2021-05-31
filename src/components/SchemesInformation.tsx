import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import { Link } from 'react-router-dom';
import moment from 'moment';

const SchemesTableWrapper = styled.div`
    width: 100%;
    background: white;
    font-weight: 400;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    flex-direction: column;
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
    /* height: 260px; */
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

const SchemesInformation = observer(() => {
    const {
        root: { providerStore, daoStore, blockchainStore },
    } = useStores();
    const { active: providerActive } = providerStore.getActiveWeb3React();
    
    const loading = (
      !blockchainStore.initialLoadComplete
    );
    
    const schemes = daoStore.getAllSchemes();
    return (
      <SchemesTableWrapper>
        <ProposalTableHeaderActions>
          <span>Schemes</span>
          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
            <ActiveButton route="/?view=proposals">Proposals</ActiveButton>
            <ActiveButton route="/?view=dao">DAO</ActiveButton>
          </div>
        </ProposalTableHeaderActions>
        <ProposalTableHeaderWrapper>
            <TableHeader width="15%" align="left"> Name </TableHeader>
            <TableHeader width="25%" align="center"> Times </TableHeader>
            <TableHeader width="15%" align="center"> Permissions </TableHeader>
            <TableHeader width="15%" align="center"> Boosted Proposals </TableHeader>
            <TableHeader width="15%" align="center"> Active Proposals </TableHeader>
            <TableHeader width="15%" align="center"> Total proposals  </TableHeader>
        </ProposalTableHeaderWrapper>
        <TableRowsWrapper>
        {schemes.map((scheme, i) => {
          const schemeProposals = daoStore.getSchemeProposals(scheme.name);
          const schemeConfiguration = scheme.configurations[ scheme.configurations.length - 1];
          return (
            <Link key={"scheme"+i} to={"/scheme/"+scheme.address} style={{textDecoration: "none"}}>
              <TableRow>
                <TableCell width="15%" align="left" weight='500' wrapText="true">
                  {scheme.name}
                </TableCell>
                <TableCell width="25%" align="center">
                  <small>Queued Proposal Period: {
                    moment.duration(schemeConfiguration.parameters.queuedVotePeriodLimit.toString(), 'seconds').humanize()
                  }</small><br/>
                  <small>Boosted Proposal Period: {
                    moment.duration(schemeConfiguration.parameters.boostedVotePeriodLimit.toString(), 'seconds').humanize()
                  }</small><br/>
                  <small>PreBoosted Proposal Period: {
                    moment.duration(schemeConfiguration.parameters.preBoostedVotePeriodLimit.toString(), 'seconds').humanize()
                  }</small><br/>
                  <small>Quiet Ending Period: {
                    moment.duration(schemeConfiguration.parameters.quietEndingPeriod.toString(), 'seconds').humanize()
                  }</small><br/>
                  <small>Max time for execution: {
                    moment.duration(scheme.maxSecondsForExecution.toString(), 'seconds').humanize()
                  }</small>
                </TableCell>
                <TableCell width="15%" align="center">
                  <small>{schemeConfiguration.permissions.canGenericCall ? 'Can' : 'Cant'} make generic call</small><br/>
                  <small>{schemeConfiguration.permissions.canUpgrade ? 'Can' : 'Cant'} upgrade controller</small><br/>
                  <small>{schemeConfiguration.permissions.canChangeConstraints ? 'Can' : 'Cant'} change constraints</small><br/>
                  <small>{schemeConfiguration.permissions.canRegisterSchemes ? 'Can' : 'Cant'} register schemes</small>
                </TableCell>
                <TableCell width="15%" align="center"> 
                  {scheme.boostedProposals}
                </TableCell>
                <TableCell width="15%" align="center"> 
                  {schemeProposals.filter((proposal) => {
                    return (proposal.priority >=3 && proposal.priority <= 6 )
                  }).length}
                </TableCell>
                <TableCell width="15%" align="center"> 
                  {scheme.proposalIds ? scheme.proposalIds.length : 0}
                </TableCell>
              </TableRow>
            </Link>);
          }
        )}
        </TableRowsWrapper>
      </SchemesTableWrapper>
    );
});

export default SchemesInformation;
