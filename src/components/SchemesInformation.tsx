import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import BlockchainLink from '../components/common/BlockchainLink';
import Question from '../components/common/Question';
import { bnum } from '../utils/helpers';
import { Link } from 'react-router-dom';
import moment from 'moment';

const SchemesInformationWrapper = styled.div`
  width: 100%;
  background: white;
  font-weight: 400;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const ProposalTableHeaderWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: var(--dark-text-gray);
    padding: 20px 40px 8px 24px;
    font-size: 16px;
    text-align: center;
`;

const TableHeader = styled.div`
    width: ${(props) => props.width || '25%'};
    text-align: ${(props) => props.align};
    align-items: center;
`;

const TableRowsWrapper = styled.div`
    overflow-y: scroll;
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
    const { active: providerActive, library } = providerStore.getActiveWeb3React();
    
    const loading = (
      !blockchainStore.initialLoadComplete
    );
    
    const schemes = daoStore.getAllSchemes();
    return (
      <SchemesInformationWrapper>
        <ProposalTableHeaderWrapper>
            <TableHeader width="15%" align="left"> Name </TableHeader>
            <TableHeader width="40%" align="center"> Configuration <Question question="9"/> </TableHeader>
            <TableHeader width="25%" align="center"> Permissions <Question question="9"/> </TableHeader>
            <TableHeader width="20%" align="center" style={{display: "flex", justifyContent: "space-between"}}>
              <span>Boosted</span> - <span>Active</span> - <span>Total</span>
            </TableHeader>
        </ProposalTableHeaderWrapper>
        <TableRowsWrapper>
        {schemes.map((scheme, i) => {
          const schemeProposals = daoStore.getSchemeProposals(scheme.name);
          const schemeConfiguration = scheme.configurations[ scheme.configurations.length - 1];
          return (
            <div key={"scheme"+i}>
              <TableRow>
                <TableCell width="15%" align="left" weight='500' wrapText="true">
                  {scheme.name}<br/>
                  <BlockchainLink size="short" text={scheme.address} toCopy/>
                </TableCell>
                <TableCell width="40%" align="center">
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
                  { (scheme.type == "WalletScheme")
                    ? <small>Max time for execution: {
                        moment.duration(scheme.maxSecondsForExecution.toString(), 'seconds').humanize()
                      }<br/></small>
                    : <div/>
                  }
                  { (scheme.type == "WalletScheme")
                    ? <small>Max REP % to change in proposal: {scheme.maxRepPercentageChange.toString()} %<br/></small>
                    : <div/>
                  }
                  { (scheme.type == "WalletScheme")
                    ? <small>Required Percentage for boosted approval: {bnum(schemeConfiguration.boostedVoteRequiredPercentage).div("1000").toString()} %<br/></small>
                    : <div/>
                  }
                  
                  <small>Required Percentage for queue approval: {schemeConfiguration.parameters.queuedVoteRequiredPercentage.toString()} %</small><br/>
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
                  <small>Rep Proposing Reward: {
                    Number(library.utils.fromWei(schemeConfiguration.parameters.proposingRepReward.toString())).toFixed(2)
                  } REP</small><br/>
                  <small>Reputation Loss Ratio: {schemeConfiguration.parameters.votersReputationLossRatio.toString()} %</small><br/>
                  <small>Minimum Dao Boost: {
                    Number(library.utils.fromWei(schemeConfiguration.parameters.minimumDaoBounty.toString())).toFixed(2)
                  } DXD</small><br/>
                  <small>Proposal Boost Bounty Const: {schemeConfiguration.parameters.daoBountyConst.toString()}</small><br/>
                  <small>Boost Threshold Constant: {schemeConfiguration.parameters.thresholdConst.toString()}</small><br/>
                  <small>Boost Limit Exponent Value: {schemeConfiguration.parameters.limitExponentValue.toString()}</small>
                  
                </TableCell>
                <TableCell width="25%" align="center" wrapText>
                  <strong>Controller Permissions</strong><br/>
                  <small>{schemeConfiguration.permissions.canGenericCall ? 'Can' : 'Cant'} make generic call</small><br/>
                  <small>{schemeConfiguration.permissions.canUpgrade ? 'Can' : 'Cant'} upgrade controller</small><br/>
                  <small>{schemeConfiguration.permissions.canChangeConstraints ? 'Can' : 'Cant'} change constraints</small><br/>
                  <small>{schemeConfiguration.permissions.canRegisterSchemes ? 'Can' : 'Cant'} register schemes</small>
                  <br/><br/>
                  <strong>Call Permissions</strong><br/>

                  {scheme.callPermissions.map((callPermission, i) => {
                    if (callPermission.fromTime > 0)
                      return (
                        <small>
                          Address: {callPermission.to == "0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa" ? "Any Address" : callPermission.to}<br/>
                          Function: {callPermission.functionSignature == "0xaaaaaaaa" ? "Any" : callPermission.functionSignature}<br/>
                          Value: {callPermission.value == "115792089237316195423570985008687907853269984665640564039457584007913129639935" ? "Any": callPermission.value}
                        </small>
                      );
                  })}
                </TableCell>

                <TableCell width="20%" align="center" style={{display: "flex", justifyContent: "space-around"}}> 
                  <span>{scheme.boostedProposals}</span>
                  -
                  <span>{schemeProposals.filter((proposal) => {
                    return (proposal.priority >=3 && proposal.priority <= 6 )
                  }).length}</span>
                  -
                  <span>{scheme.proposalIds ? scheme.proposalIds.length : 0}</span>
                </TableCell>
              </TableRow>
            </div>);
          }
        )}
        </TableRowsWrapper>
      </SchemesInformationWrapper>
    );
});

export default SchemesInformation;
