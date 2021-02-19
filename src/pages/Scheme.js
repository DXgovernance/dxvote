import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import { Link, useLocation } from 'react-router-dom';
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


const SchemeInformationBox = styled.div`
  background: white;
  border: 1px solid var(--medium-gray);
  margin: auto;
  padding: 5px 10px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  width: fit-content;
  
  h3 {
    margin: 5px 0px;
  }
`;

const Row = styled.div`
  flex-direction: row;
  flex: auto;
  display: flex;
  padding-top: 15px;
  justify-content: space-around;
`
const DaiInformation = observer(() => {
    const {
        root: { providerStore, daoStore, configStore, blockchainStore },
    } = useStores();
    const { active: providerActive, library } = providerStore.getActiveWeb3React();
    const schemeAddress = useLocation().pathname.split("/")[2];
    const loading = (
      !blockchainStore.initialLoadComplete
    );
  
    if (!providerActive) {
      return (
          <SchemeInformationWrapper>
            <div className="loader">
            <img alt="bolt" src={require('assets/images/bolt.svg')} />
                <br/>
                Connect to view scheme information
            </div>
          </SchemeInformationWrapper>
      )
    } else if (loading) {
      return (
          <SchemeInformationWrapper>
            <div className="loader">
            <img alt="bolt" src={require('assets/images/bolt.svg')} />
                <br/>
                Getting Scheme information
            </div>
          </SchemeInformationWrapper>
      )
    } else {
      const schemeInfo = daoStore.getSchemeInfo(schemeAddress);
      console.log(schemeInfo)
      return (
        <SchemeInformationWrapper>
          <h2>Address: {schemeInfo.address}</h2>
          <h3>Scheme ETH Balance: {Number(library.utils.fromWei(schemeInfo.ethBalance.toString())).toFixed(2)} ETH</h3>
          <h3>Permissions</h3>
          <h4>Generic Call from Avatar: {schemeInfo.permissions.canGenericCall.toString()}</h4>
          <h4>Upgrade Controller: {schemeInfo.permissions.canUpgrade.toString()}</h4>
          <h4>Change Constraints: {schemeInfo.permissions.canChangeConstraints.toString()}</h4>
          <h4>Add/Remove Schemes: {schemeInfo.permissions.canRegisterSchemes.toString()}</h4>
          <h3>Voting Machine Configuration</h3>
          <h4>Voting Machine Configuration Parameters Hash: {schemeInfo.parametersHash}</h4>
          <h4>Required Percentage for approval: {schemeInfo.parameters.queuedVoteRequiredPercentage.toString()} %</h4>
          <h4>Queued Proposal Period: {
            moment.duration(schemeInfo.parameters.queuedVotePeriodLimit.toString(), 'seconds').humanize()
          }</h4>
          <h4>Boosted Proposal Period: {
            moment.duration(schemeInfo.parameters.boostedVotePeriodLimit.toString(), 'seconds').humanize()
          }</h4>
          <h4>PreBoosted Proposal Period: {
            moment.duration(schemeInfo.parameters.preBoostedVotePeriodLimit.toString(), 'seconds').humanize()
          }</h4>
          <h4>Quiet Ending Period: {
            moment.duration(schemeInfo.parameters.quietEndingPeriod.toString(), 'seconds').humanize()
          }</h4>
          <h4>Rep Proposing Reward: {
            Number(library.utils.fromWei(schemeInfo.parameters.proposingRepReward.toString())).toFixed(2)
          } REP</h4>
          <h4>Reputation Loss Ratio: {schemeInfo.parameters.votersReputationLossRatio.toString()} %</h4>
          <h4>Minimum Dao Boost: {
            Number(library.utils.fromWei(schemeInfo.parameters.minimumDaoBounty.toString())).toFixed(2)
          } DXD</h4>
          <h4>Proposal Boost Bounty Const: {schemeInfo.parameters.daoBountyConst.toString()}</h4>
          <h4>Boost Threshold Constant: {schemeInfo.parameters.thresholdConst.toString()}</h4>
          <h4>Boost Limit Exponent Value: {schemeInfo.parameters.limitExponentValue.toString()}</h4>
        </SchemeInformationWrapper>
      );
    }
});

export default DaiInformation;
