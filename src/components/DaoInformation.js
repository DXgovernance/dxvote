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
    padding: 10px 0px;
    border: 1px solid var(--medium-gray);
    margin-top: 24px;
    font-weight: 400;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    
    .loader {
      text-align: center;
      font-family: Roboto;
      font-style: normal;
      font-weight: 500;
      font-size: 15px;
      line-height: 18px;
      color: #BDBDBD;
      padding: 44px 0px;
      
      img {
        margin-bottom: 10px;
      }
    }
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
    width: ${(props) => props.width || '25%'}
    text-align: ${(props) => props.align};
    font-weight: ${(props) => props.weight};
    white-space: ${(props) => props.wrapText ? 'nowrap' : 'inherit'};
    overflow: ${(props) => props.wrapText ? 'hidden' : 'inherit'};
    text-overflow: ${(props) => props.wrapText ? 'ellipsis' : 'inherit'};
`;

const DaiInformation = observer(() => {
    const {
        root: { providerStore, daoStore, configStore, blockchainStore },
    } = useStores();
    const { active: providerActive, library } = providerStore.getActiveWeb3React();

    const loading = (
      !blockchainStore.initialLoadComplete
    );
  
    if (!providerActive) {
      return (
          <SchemesTableWrapper>
            <div className="loader">
            <img alt="bolt" src={require('assets/images/bolt.svg')} />
                <br/>
                Connect to view proposals
            </div>
          </SchemesTableWrapper>
      )
    } else if (loading) {
      return (
          <SchemesTableWrapper>
            <div className="loader">
            <img alt="bolt" src={require('assets/images/bolt.svg')} />
                <br/>
                Getting DAO information
            </div>
          </SchemesTableWrapper>
      )
    } else {
      const daoInfo = daoStore.getDaoInfo();
      const schemes = [
        Object.assign(
          daoStore.getSchemeInfo(configStore.getSchemeAddress('masterWallet')),
          daoStore.getSchemeProposals(configStore.getSchemeAddress('masterWallet'))
        ),
        Object.assign(
          daoStore.getSchemeInfo(configStore.getSchemeAddress('quickWallet')),
          daoStore.getSchemeProposals(configStore.getSchemeAddress('quickWallet'))
        )
      ];
      console.log(schemes)
      return (    
        <SchemesTableWrapper>
          <ProposalTableHeaderActions>
            <span>Schemes</span>
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
            if (scheme) {
            
              return (
                <Link key={"scheme"+i} to={"/scheme/"+scheme.address} style={{textDecoration: "none"}}>
                  <TableRow>
                    <TableCell width="15%" align="left" weight='500' wrapText="true">
                      {scheme.name}
                    </TableCell>
                    <TableCell width="25%" align="center">
                      <small>Queued Proposal Period: {
                        moment.duration(scheme.parameters.queuedVotePeriodLimit.toString(), 'seconds').humanize()
                      }</small><br/>
                      <small>Boosted Proposal Period: {
                        moment.duration(scheme.parameters.boostedVotePeriodLimit.toString(), 'seconds').humanize()
                      }</small><br/>
                      <small>PreBoosted Proposal Period: {
                        moment.duration(scheme.parameters.preBoostedVotePeriodLimit.toString(), 'seconds').humanize()
                      }</small><br/>
                      <small>Quiet Ending Period: {
                        moment.duration(scheme.parameters.quietEndingPeriod.toString(), 'seconds').humanize()
                      }</small>
                    </TableCell>
                    <TableCell width="15%" align="center">
                      <small>{scheme.permissions.canGenericCall ? 'Can' : 'Cant'} make generic call</small><br/>
                      <small>{scheme.permissions.canUpgrade ? 'Can' : 'Cant'} upgrade controller</small><br/>
                      <small>{scheme.permissions.canChangeConstraints ? 'Can' : 'Cant'} change constraints</small><br/>
                      <small>{scheme.permissions.canRegisterSchemes ? 'Can' : 'Cant'} register schemes</small>
                    </TableCell>
                    <TableCell width="15%" align="center"> 
                      {scheme.boostedProposals}
                    </TableCell>
                    <TableCell width="15%" align="center"> 
                      {scheme.proposals.filter((proposal) => {
                        return (proposal.statusPriority >=3 && proposal.statusPriority <= 6 )
                      }).length}
                    </TableCell>
                    <TableCell width="15%" align="center"> 
                      {scheme.proposalIds.length}
                    </TableCell>
                  </TableRow>
                </Link>);
              } else {
                return <div/>
              }
            }
          )}
          </TableRowsWrapper>
        </SchemesTableWrapper>
      );
    }
});

export default DaiInformation;
