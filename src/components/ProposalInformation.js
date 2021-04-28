import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import { Link, useLocation } from 'react-router-dom';
import moment from 'moment';
import { FiThumbsUp, FiThumbsDown, FiPlayCircle, FiFastForward } from "react-icons/fi";
import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';
import MDEditor from '@uiw/react-md-editor';
import { bnum } from '../utils/helpers';

const ProposalInformationWrapper = styled.div`
    width: 100%;
    background: white;
    padding: 10px 0px;
    border: 1px solid var(--medium-gray);
    margin-top: 24px;
    font-weight: 400;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    flex-direction: row;
    
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

const InfoSidebar = styled.div`
  max-width: 400px;
  min-width: 300px;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const SidebarRow = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  padding: 10px;

  .timeText {
    font-size: 20;
    margin-left: -10px;
    width:100%;
    padding-top: 5px;
  }
`;

const ProposalInfoSection = styled.div`
  max-width: 900px;
  width: 100%;
  padding: 20px;
  overflow-wrap: break-word;
  overflow: auto;

`

const AmountBadge = styled.span`
    background-color: ${(props) => props.color || 'inherit'};
    border-radius: 50%;
    color: white;
    padding: 2px 6px;
    text-align: center;
    margin: 5px;
`;

const VoteButton = styled.div`
    background-color: ${(props) => props.color || '#536DFE'};
    border-radius: 4px;
    color: white;
    height: 34px;
    width: max-content;
    letter-spacing: 1px;
    font-weight: 500;
    line-height: 34px;
    text-align: center;
    cursor: pointer;
    padding: 0px 10px;
    margin: 5px;
    
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 4px;
    }
`;

const AmountSlider = styled(Slider)({
    maxWidth: "40%",
    margin: "auto"
});


const voteMarks = [
  { value: 0, label: 'NO', },
  { value: 50, label: '', },
  { value: 100, label: 'YES', },
];

const stakeMarks = [
  { value: 0, label: 'NO', },
  { value: 50, label: '', },
  { value: 100, label: 'YES', },
];

const ProposalInformation = observer(() => {
    const {
        root: { providerStore, daoStore, configStore, daoService, ipfsService, userStore, blockchainStore },
    } = useStores();
    const schemeAddress = useLocation().pathname.split("/")[2];
    const proposalId = useLocation().pathname.split("/")[4];
    const schemeInfo = daoStore.getScheme(schemeAddress);
    const proposalInfo = daoStore.getProposal(proposalId);
    const { dxdBalance, dxdApproved } = userStore.getUserInfo(); 
    const {content: proposalDescription} = proposalInfo ? ipfsService.get(proposalInfo.descriptionHash) : "";
    const { active, account, library } = providerStore.getActiveWeb3React();
    
    const [votePercentage, setVotePercentage] = React.useState(100);
    const [stakePercentage, setStakePercentage] = React.useState(100);
    const [canRedeem, setCanRedeem] = React.useState(false);
    
    let votedAmount = 0;
    let votedDecision = 0;
    let positiveVotesCount = 0;
    let negativeVotesCount = 0;
    let stakedAmount = 0;
    let stakedDecision = 0;
    let positiveStakesCount = 0;
    let negativeStakesCount = 0;
    let userRepAtProposalCreation = 0;
    let totalRepAtProposalCreation = 0;
    if (proposalInfo){
      
      const repAtCreation = daoService.getRepAt(proposalInfo.creationBlock);
      userRepAtProposalCreation = repAtCreation.userRep;
      totalRepAtProposalCreation = repAtCreation.totalSupply;
      
      const pEvents = daoStore.getProposalEvents(proposalId);
      
      pEvents.votes.map((vote) => {
        if (vote.voter === account) {
          votedAmount = vote.amount;
          votedDecision = vote.vote;
        };
        if (vote.vote === "1") {
          positiveVotesCount ++;
        } else {
          negativeVotesCount --;
        }
      });
      
      pEvents.stakes.map((stake) => {
        if (stake.voter === account) {
          stakedAmount = stake.amount;
          stakedDecision = stake.vote;
        };
        if (stake.vote === "1") {
          positiveStakesCount ++;
        } else {
          negativeStakesCount --;
        }
      });
      
      if ((pEvents.redeems.indexOf((redeem) => redeem.beneficiary === account) === -1) 
        && (stakedAmount > 0 || votedAmount > 0) && !canRedeem)
        setCanRedeem(true);
    }
    
    console.log("Proposal info", proposalInfo);
    console.log("Scheme info", schemeInfo);
    
    if (!active) {
      return (
          <ProposalInformationWrapper>
            <div className="loader">
            <img alt="bolt" src={require('assets/images/bolt.svg')} />
                <br/>
                Connect to view proposal
            </div>
          </ProposalInformationWrapper>
      )
    } else if (!blockchainStore.initialLoadComplete) {
      
      return (
          <ProposalInformationWrapper>
            <div className="loader">
            <img alt="bolt" src={require('assets/images/bolt.svg')} />
                <br/>
                Searching for proposal..
            </div>
          </ProposalInformationWrapper>
      )
      
    } else {
      
      proposalInfo.proposalCallText = new Array(proposalInfo.to.length);
      for (var p = 0; p < proposalInfo.to.length; p++) {
        if (schemeInfo.controllerAddress === configStore.getControllerAddress()) {
          const decodedGenericCall = daoService.decodeControllerCall(proposalInfo.callData[p]);
          proposalInfo.proposalCallText[p] = decodedGenericCall;
        } else {
          proposalInfo.proposalCallText[p] =
            "Call to "+proposalInfo.to[p]+" with data of "+proposalInfo.callData[p]+
            " uinsg value of "+library.utils.fromWei(proposalInfo.values[p].toString());
        }
      }
        
      const proposalStakeScore = bnum(proposalInfo.positiveStakes).div(proposalInfo.negativeStakes);

      let stakeToBoost = 0;
      stakeToBoost = library.utils.fromWei(
        schemeInfo.parameters.thresholdConst.pow(
          (schemeInfo.boostedProposals > schemeInfo.parameters.limitExponentValue)
            ? schemeInfo.parameters.limitExponentValue : schemeInfo.boostedProposals
        ).minus(proposalInfo.positiveStakes)
        .plus(proposalInfo.negativeStakes).toString()
      ).toString();
      
      const stakeToUnBoost = library.utils.fromWei(
        proposalInfo.positiveStakes.minus(proposalInfo.negativeStakes).toString()
      ).toString();
            
      const timeToBoost = proposalInfo && proposalInfo.boostTime > moment().unix() ? 
      moment().to( moment(proposalInfo.boostTime.times(1000).toNumber()) ).toString()
      : "";
      const timeToFinish = proposalInfo && proposalInfo.finishTime > moment().unix() ?
      moment().to( moment(proposalInfo.finishTime.times(1000).toNumber()) ).toString()
      : "";
      
      function onVoteValueChange(newValue) {
        const voteSlider = document.querySelectorAll("span[aria-labelledby='vote-slider']")[0];
        setVotePercentage((voteSlider.ariaValueNow - 50) * 2)
        voteSlider.ariaValueNow = votePercentage;
      }
      
      function onStakeValueChange(newValue) {
        const stakeSlider = document.querySelectorAll("span[aria-labelledby='stake-slider']")[0];
        setStakePercentage((stakeSlider.ariaValueNow - 50) * 2)
      }
      function stakeValuetext(value) { return `${value.toFixed(2)}%`; }
      
      function stakeAmount() {
        if (stakePercentage > 0) {
          return (Math.min(Math.abs(stakeToBoost), library.utils.fromWei(dxdBalance.toString())) * stakePercentage / 100).toFixed(2);
        } else if (stakePercentage < 0) {
          return (Math.min(stakeToUnBoost, library.utils.fromWei(dxdBalance.toString())) * Math.abs(stakePercentage) / 100).toFixed(2);
        } else {
          return 0;
        }
      }
      
      function voteAmount() {
        if (userRepAtProposalCreation)
          return (userRepAtProposalCreation.times(Math.abs(votePercentage)).div(totalRepAtProposalCreation)).toFixed(2);
        else
          return 0;
      }
      
      const submitVote = function(decision) {
        const repAmount = (userRepAtProposalCreation.times(Math.abs(votePercentage))).div(100);
        daoStore.vote(votePercentage > 0 ? 1 : 2, bnum(repAmount), proposalId);
      };
      
      const submitStake = function(decision) {
        daoStore.stake(stakePercentage > 0 ? 1 : 2, library.utils.toWei(stakeAmount().toString()), proposalId);
      };
      
      const redeem = function() {
        daoStore.redeem(proposalId, account);
      }
      
      const approveDXD = function(decision) {
        daoStore.approveVotingMachineToken();
      };
      
      const executeProposal = function() {
        daoStore.execute(proposalId);
      };
      
      return (
          <ProposalInformationWrapper>
            <ProposalInfoSection>
              <MDEditor.Markdown source={
                proposalDescription.length === 0
                  ? "## Getting proposal description from IPFS..."
                  : proposalDescription
                } style={{
                padding: "20px 10px"
              }} />
              <h2> Actions </h2>
              {proposalInfo.to.map((to, i) => {
                return(
                <div key={"proposalCall"+i}>
                  <span> {proposalInfo.proposalCallText[i]} </span> 
                  {i < proposalInfo.to.length - 1 ? <hr/> : <div/>}
                </div>);
              })}
            </ProposalInfoSection>
            <InfoSidebar>
              <h2 style={{margin: "10px 0px 0px 0px", textAlign: "center"}}>{
                (proposalInfo.status === "Quiet Ending Period" && timeToFinish === "") ?
                  "Pending Execution" : proposalInfo.status
                }</h2>
              <SidebarRow style={{
                borderBottom: "1px solid gray",
                margin: "0px 10px",
                flexDirection: "column"
              }}>
                {(proposalInfo.boostTime > moment().unix()) ?
                  <span className="timeText"> Boost {timeToBoost} </span> 
                  : <span></span>
                }
                
                {(proposalInfo.finishTime > moment().unix()) ?
                  <span className="timeText">
                    Finish {timeToFinish} {proposalInfo.status === "Pending Boost" || proposalInfo.status === "Pre Boosted" ? " after boost": ""} </span>
                  : <span></span>}
                {proposalInfo.status === "Pending Boost" ? 
                  <VoteButton color="blue" onClick={executeProposal}><FiFastForward/> Boost </VoteButton>
                  : proposalInfo.status === "Quiet Ending Period" && timeToFinish === "" ?
                  <VoteButton color="blue" onClick={executeProposal}><FiPlayCircle/> Execute </VoteButton>
                  : proposalInfo.status === "Pending Execution" ?
                  <VoteButton color="blue" onClick={executeProposal}><FiPlayCircle/> Execute </VoteButton>
                  : <div/>
                } 
              </SidebarRow>
              <SidebarRow>
                <span> Staked </span>
              </SidebarRow>
              <SidebarRow style={{
                borderBottom: "1px solid gray",
                margin: "0px 10px",
              }}>
                <span style={{width: "40%", textAlign:"center", color: "green"}}>
                  <AmountBadge color="green">{positiveStakesCount}</AmountBadge>
                  {Number(library.utils.fromWei(proposalInfo.positiveStakes.toString())).toFixed(2)} DXD
                </span>
                <span> - </span>
                <span style={{width: "40%", textAlign:"center", color: "red"}}>
                  {Number(library.utils.fromWei(proposalInfo.negativeStakes.toString())).toFixed(2)} DXD
                  <AmountBadge color="red">{negativeStakesCount}</AmountBadge>
                </span>
              </SidebarRow>
              <SidebarRow>
                <span> Votes </span>
              </SidebarRow>
              <SidebarRow style={{
                borderBottom: "1px solid gray",
                margin: "0px 10px",
              }}> 
                <span style={{width: "40%", textAlign:"center", color: "green"}}>
                  <AmountBadge color="green">{positiveVotesCount}</AmountBadge>
                  {proposalInfo.positiveVotes.div(totalRepAtProposalCreation).times("100").toNumber().toFixed(2)} % 
                </span>
                <span> - </span>
                <span style={{width: "40%", textAlign:"center", color: "red"}}>
                  {proposalInfo.negativeVotes.div(totalRepAtProposalCreation).times("100").toNumber().toFixed(2)} %
                  <AmountBadge color="red">{negativeVotesCount}</AmountBadge>
                </span>
              </SidebarRow>
              {votedAmount === 0 && proposalInfo.priority >=3 && proposalInfo.priority <= 6  ?
                <SidebarRow>
                  <AmountSlider
                  defaultValue={100}
                  aria-labelledby="vote-slider"
                  step={0.1}
                  onChangeCommitted={onVoteValueChange}
                  marks={voteMarks}
                  style={{color: votePercentage > 0 ? 'green' : 'red'}}
                  />
                  <span style={{color: votePercentage > 0 ? 'green' : 'red'}}>{voteAmount()} %</span>
                  <VoteButton color="blue" onClick={() => submitVote()}>Vote</VoteButton>
                </SidebarRow>
              : votedAmount !== 0 ?
                <SidebarRow>
                  Already voted {(votedAmount > 0) ? "for" : "against"} with { (votedAmount / totalRepAtProposalCreation * 100).toFixed(2)} % REP
                </SidebarRow>
              : <div/>
              }
              <br/>
              {(proposalInfo.priority === 3 || proposalInfo.priority== 4) && dxdApproved === "0" ?
                <SidebarRow>
                  <small>Approve DXD to stake</small>
                  <VoteButton color="blue" onClick={() => approveDXD()}>Approve DXD</VoteButton>
                </SidebarRow>
                : (proposalInfo.priority === 3 || proposalInfo.priority== 4)  ?
                  <div>
                    {stakeToBoost > 0 ? <small>Stake {Number(stakeToBoost).toFixed(2)} DXD to boost</small> : <span/>}
                    {stakeToUnBoost > 0 ? <small>Stake {Number(stakeToUnBoost).toFixed(2)} DXD to unboost</small> : <span/>}
                    <SidebarRow>
                      <AmountSlider
                        defaultValue={stakePercentage}
                        aria-labelledby="stake-slider"
                        step={0.1}
                        onChangeCommitted={onStakeValueChange}
                        marks={stakeMarks}
                        style={{color: stakePercentage > 0 ? 'green' : 'red'}}
                      />
                      <span>{stakeAmount()} DXD </span>
                      <VoteButton color="blue" onClick={() => submitStake()}>Stake</VoteButton>
                    </SidebarRow>
                  </div>
                : <div></div>
              }
              {stakedAmount > 0
                ? <SidebarRow>
                  Already staked {(stakedAmount > 0) ? "for" : "against"} with {Number(library.utils.fromWei(stakedAmount)).toFixed(2)} DXD
                </SidebarRow>
                : <div></div>
              }
              
              {canRedeem > 0
                ? <SidebarRow>
                  <VoteButton color="blue" onClick={() => redeem()}>Redeem</VoteButton>
                </SidebarRow>
                : <div></div>
              }
              
            </InfoSidebar>
          </ProposalInformationWrapper>
      );
    }
});

export default ProposalInformation;
