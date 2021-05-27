import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import Address from '../components/common/Address';
import boltIcon from "assets/images/bolt.svg"
import { useLocation } from 'react-router-dom';
import moment from 'moment';

const SchemeInformationWrapper = styled.div`
  background: white;
  border: 1px solid var(--medium-gray);
  margin-top: 24px;
  padding: 15px 20px;
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

const SchemePage = observer(() => {
    const {
        root: { providerStore, daoStore, blockchainStore },
    } = useStores();
    const { active: providerActive, library } = providerStore.getActiveWeb3React();
    const schemeAddress = useLocation().pathname.split("/")[2];
  
    if (!providerActive) {
      return (
          <SchemeInformationWrapper>
            <div className="loader">
            <img alt="bolt" src={boltIcon} />
                <br/>
                Connect to view scheme information
            </div>
          </SchemeInformationWrapper>
      )
    } else if (!blockchainStore.initialLoadComplete) {
      return (
          <SchemeInformationWrapper>
            <div className="loader">
            <img alt="bolt" src={boltIcon} />
                <br/>
                Getting Scheme information
            </div>
          </SchemeInformationWrapper>
      )
    } else {
      const schemeInfo = daoStore.getScheme(schemeAddress);
      const schemeConfiguration = schemeInfo.configurations[ schemeInfo.configurations.length -1 ];
      return (
        <SchemeInformationWrapper>
          <h2>Address: <Address size="long" address={schemeInfo.address}/></h2>
          <h3>Scheme ETH Balance: {Number(library.utils.fromWei(schemeInfo.ethBalance.toString())).toFixed(2)} ETH</h3>
          <hr style={{width:"100%"}}/>
          <h3>Permissions</h3>
          <h4>Generic Call from Avatar: {schemeConfiguration.permissions.canGenericCall.toString()}</h4>
          <h4>Upgrade Controller: {schemeConfiguration.permissions.canUpgrade.toString()}</h4>
          <h4>Change Constraints: {schemeConfiguration.permissions.canChangeConstraints.toString()}</h4>
          <h4>Add/Remove Schemes: {schemeConfiguration.permissions.canRegisterSchemes.toString()}</h4>
          <hr style={{width:"100%"}}/>
          <h3>Voting Machine Configuration</h3>
          <h4>Voting Machine Configuration Parameters Hash: {schemeConfiguration.paramsHash}</h4>
          <h4>Required Percentage for approval: {schemeConfiguration.parameters.queuedVoteRequiredPercentage.toString()} %</h4>
          <h4>Required Percentage for approval in boosted proposals: {schemeConfiguration.boostedVoteRequiredPercentage.div("1000").toString()} %</h4>
          <h4>Queued Proposal Period: {
            moment.duration(schemeConfiguration.parameters.queuedVotePeriodLimit.toString(), 'seconds').humanize()
          }</h4>
          <h4>Boosted Proposal Period: {
            moment.duration(schemeConfiguration.parameters.boostedVotePeriodLimit.toString(), 'seconds').humanize()
          }</h4>
          <h4>PreBoosted Proposal Period: {
            moment.duration(schemeConfiguration.parameters.preBoostedVotePeriodLimit.toString(), 'seconds').humanize()
          }</h4>
          <h4>Quiet Ending Period: {
            moment.duration(schemeConfiguration.parameters.quietEndingPeriod.toString(), 'seconds').humanize()
          }</h4>
          <h4>Rep Proposing Reward: {
            Number(library.utils.fromWei(schemeConfiguration.parameters.proposingRepReward.toString())).toFixed(2)
          } REP</h4>
          <h4>Reputation Loss Ratio: {schemeConfiguration.parameters.votersReputationLossRatio.toString()} %</h4>
          <h4>Minimum Dao Boost: {
            Number(library.utils.fromWei(schemeConfiguration.parameters.minimumDaoBounty.toString())).toFixed(2)
          } DXD</h4>
          <h4>Proposal Boost Bounty Const: {schemeConfiguration.parameters.daoBountyConst.toString()}</h4>
          <h4>Boost Threshold Constant: {schemeConfiguration.parameters.thresholdConst.toString()}</h4>
          <h4>Boost Limit Exponent Value: {schemeConfiguration.parameters.limitExponentValue.toString()}</h4>
        </SchemeInformationWrapper>
      );
    }
});

export default SchemePage;
