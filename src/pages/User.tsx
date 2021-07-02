import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import { useLocation } from 'react-router-dom';
import BlockchainLink from '../components/common/BlockchainLink';
import Box from '../components/common/Box';

const InfoBox = styled.div`
  flex: 1;
  text-align: center;
  padding: 2px 5px;
  margin: 10px 5px;
  font-size: 25px;
  font-weight: 300;
  border-radius: 3px;
  color: var(--activeButtonBackground);
`;

const UserPage = observer(() => {
    const {
        root: { daoStore, blockchainStore },
    } = useStores();
    const userAddress = useLocation().pathname.split("/")[2];
    const userEvents = daoStore.getUserEvents(userAddress);
    const userInfo = daoStore.getUser(userAddress);
    const governanceInfo = daoStore.getGovernanceInfo().ranking.find(user => user.address == userAddress);
    let proposalsToRedeem = [];
    
    userEvents.votes.map((vote) => {
      const proposal = daoStore.getProposal(vote.proposalId);
      const voteParameters = daoStore.getVotingParametersOfProposal(vote.proposalId);
      if ((
        (proposal.stateInVotingMachine == 1) 
        ||
        (voteParameters.votersReputationLossRatio > 0 && vote.timestamp < proposal.boostedPhaseTime)
      ) && (proposalsToRedeem.indexOf(vote.proposalId) < 0)) {
          proposalsToRedeem.push(vote.proposalId);
      }
    })
    
    userEvents.stakes.map((stake) => {
      if (proposalsToRedeem.indexOf(stake.proposalId) < 0)
        proposalsToRedeem.push(stake.proposalId);
    });
    
    userEvents.redeems.map((redeem) => {
      if (proposalsToRedeem.indexOf(redeem.proposalId) > -1)
        proposalsToRedeem.splice(proposalsToRedeem.indexOf(redeem.proposalId) , 1);
    });
    
    userEvents.redeemsRep.map((redeemRep) => {
      if (proposalsToRedeem.indexOf(redeemRep.proposalId) > -1)
        proposalsToRedeem.splice(proposalsToRedeem.indexOf(redeemRep.proposalId) , 1);
    });

    return (
      <Box style={{padding: "10px 20px"}}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between"
        }}>
          <h2 style={{ display: "flex", alignItems:"center"}}>
            User: <BlockchainLink size="long" text={userAddress} toCopy/>
          </h2>
          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
          </div>
        </div>
        
        <div style={{display: "flex", flexDirection: "row"}}>
          <InfoBox>
            {userInfo.repPercentage.toFixed(2)} % REP
          </InfoBox>
          <InfoBox>
            {userEvents.votes.filter(vote => vote.vote == 1).length} Positive Votes
          </InfoBox>
          <InfoBox>
            {userEvents.votes.filter(vote => vote.vote == 2).length} Negative Votes
          </InfoBox>
          <InfoBox>
            {userEvents.newProposalEvents.length} Proposals
          </InfoBox>
        </div>
        
        <h2> Redeems Left </h2>
        {proposalsToRedeem.map((proposalId, i) => {
          return(
            <a key={"proposalLink"+i} href={`/#/proposal/${proposalId}`}>
              <span> Proposal {proposalId} </span>
            </a>
          );
        })}
        
        <h2> History </h2>
        {userEvents.history.map((historyEvent, i) => {
          return(
            <div key={"userHistoryEvent"+i} style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 0px",
              borderBottom: i < userEvents.history.length - 1 ? "1px solid": ""
            }}>
              <span> {historyEvent.text} </span> 
              <BlockchainLink type="transaction" size="short" text={historyEvent.event.tx} onlyIcon/>
            </div>
          );
        })}
      </Box>
    );
});

export default UserPage;
