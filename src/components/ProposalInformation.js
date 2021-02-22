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
        root: { providerStore, daoStore, configStore, daoService, ipfsService },
    } = useStores();
    const schemeAddress = useLocation().pathname.split("/")[2];
    const proposalId = useLocation().pathname.split("/")[4];
    const shortchemeInfo = daoStore.getSchemeInfo(schemeAddress);
    const proposalInfo = daoStore.getProposalInfo(schemeAddress, proposalId, shortchemeInfo.parameters);
    const { userVotingMachineTokenBalance, userVotingMachineTokenApproved } = daoStore.getDaoInfo(); 
    const {content: proposalDescription} = proposalInfo ? ipfsService.get(proposalInfo.descriptionHash)
    : "";
    const { active, account, library } = providerStore.getActiveWeb3React();
    
    const [proposalEvents, setProposalEvents] = React.useState({});
    const [userRep, setUserRep] = React.useState(undefined);
    const [totalRep, setTotalRep] = React.useState(undefined);
    const [votePercentage, setVotePercentage] = React.useState(100);
    const [stakePercentage, setStakePercentage] = React.useState(100);
    
    if (proposalInfo){
      console.log(proposalInfo)
      daoService.getProposalEvents(proposalId, Number(proposalInfo.creationBlock)).then((pEvents) => {
        if (!proposalEvents.stakes && !proposalEvents.votes){
          setProposalEvents(pEvents);
        }
      })

      daoService.getRepAt(proposalInfo.creationBlock).then((repAtCreation) => {
        if (!userRep && !totalRep) {
          setUserRep(repAtCreation.userRep);
          setTotalRep(repAtCreation.totalSupply);
        }
      })
    }
    
    let votedAmount = 0, positiveVotesCount = 0, negativeVotesCount = 0;
    if (proposalEvents.votes)
      for (var i = 0; i < proposalEvents.votes.length; i++){
        if (proposalEvents.votes[i].returnValues._voter === account)
          votedAmount = proposalEvents.votes[i].returnValues._vote === "2" ?
            - proposalEvents.votes[i].returnValues._reputation
            : proposalEvents.votes[i].returnValues._reputation;
        if (proposalEvents.votes[i].returnValues._vote === "1")
          positiveVotesCount ++;
        else 
          negativeVotesCount ++;
      }
    let stakedAmount = 0, positiveStakesCount = 0, negativeStakesCount = 0;
    if (proposalEvents.stakes)
      for (var i = 0; i < proposalEvents.stakes.length; i++){
        if (proposalEvents.stakes[i].returnValues._staker === account)
          stakedAmount = proposalEvents.stakes[i].returnValues._vote === "2" ?
            - proposalEvents.stakes[i].returnValues._amount
            : proposalEvents.stakes[i].returnValues._amount;
        if (proposalEvents.stakes[i].returnValues._vote === "1")
          positiveStakesCount ++;
        else 
          negativeStakesCount ++;
      }
    
    console.log("Proposal info", proposalInfo);
    
  
    let votingMachineTokenBalance = userVotingMachineTokenBalance ?
      library.utils.fromWei(userVotingMachineTokenBalance.toString())
      : 0;
    
    
    const loading = (!shortchemeInfo || !proposalInfo || !totalRep || !userRep || !userVotingMachineTokenBalance || !userVotingMachineTokenApproved) ;
    
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
    } else if (loading) {
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
        if (proposalInfo.to[p] == configStore.getControllerAddress()) {
          const decodedGenericCall = daoService.decodeControllerCall(proposalInfo.callData[p]);
          proposalInfo.proposalCallText[p] = decodedGenericCall.text;
          proposalInfo.to[p] = decodedGenericCall.to;
          proposalInfo.callData[p] = decodedGenericCall.data;
          proposalInfo.values[p] = decodedGenericCall.value;
        }
      }
        
      const proposalStakeScore = proposalInfo.positiveStakes.div(proposalInfo.negativeStakes);

      let stakeToBoost = 0;
      stakeToBoost = shortchemeInfo.parameters.thresholdConst.pow(
        (shortchemeInfo.boostedProposals > shortchemeInfo.parameters.limitExponentValue)
          ? shortchemeInfo.parameters.limitExponentValue : shortchemeInfo.boostedProposals
      ).minus(library.utils.fromWei(proposalInfo.positiveStakes.toString()))
      .plus(library.utils.fromWei(proposalInfo.negativeStakes.toString())).toString();
      
      const stakeToUnBoost = bnum(library.utils.fromWei(proposalInfo.positiveStakes.toString()))
      .minus(library.utils.fromWei(proposalInfo.negativeStakes.toString())).toString();
            
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
          return (Math.min(Math.abs(stakeToBoost), votingMachineTokenBalance) * stakePercentage / 100).toFixed(2);
        } else if (stakePercentage < 0) {
          return (Math.min(stakeToUnBoost, votingMachineTokenBalance) * Math.abs(stakePercentage) / 100).toFixed(2);
        } else {
          return 0;
        }
      }
      
      function voteAmount() {
        if (votePercentage > 0) {
          return (userRep * votePercentage / totalRep).toFixed(2);
        } else if (votePercentage < 0) {
          return (userRep * Math.abs(votePercentage) / totalRep).toFixed(2);
        } else {
          return 0;
        }
      }
      
      const submitVote = function(decision) {
        const repAmount = (userRep * Math.abs(votePercentage)) / 100;
        daoStore.vote(votePercentage > 0 ? 1 : 2, bnum(repAmount), proposalId);
      };
      
      const submitStake = function(decision) {
        daoStore.stake(stakePercentage > 0 ? 1 : 2, library.utils.toWei(stakeAmount().toString()), proposalId);
      };
      
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
                proposalDescription.length == 0
                  ? "## Getting proposal description from IPFS..."
                  : proposalDescription
                } style={{
                padding: "20px 10px"
              }} />
              <h2> Actions </h2>
              {proposalInfo.to.map((to, i) => {
                return proposalInfo.proposalCallText[i] && proposalInfo.proposalCallText[i].length > 0 ?
                    <div>
                      <span> {proposalInfo.proposalCallText[i]} </span> 
                      {i < proposalInfo.to.length - 1 ? <hr/> : <div/>}
                    </div>
                    : <div>
                      <span> Call to {to} with data <small> {proposalInfo.callData[i]} </small> using value {library.utils.fromWei(proposalInfo.values[i])} ETH </span> 
                      {i < proposalInfo.to.length - 1 ? <hr/> : <div/>}
                    </div>
              })}
            </ProposalInfoSection>
            <InfoSidebar>
              <h2 style={{margin: "10px 0px 0px 0px", textAlign: "center"}}>{
                (proposalInfo.status == "Quiet Ending Period" && timeToFinish == "") ?
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
                    Finish {timeToFinish} {proposalInfo.status == "Pending Boost" || proposalInfo.status == "Pre Boosted" ? " after boost": ""} </span>
                  : <span></span>}
                {proposalInfo.status == "Pending Boost" ? 
                  <VoteButton color="blue" onClick={executeProposal}><FiFastForward/> Boost </VoteButton>
                  : proposalInfo.status == "Quiet Ending Period" && timeToFinish == "" ?
                  <VoteButton color="blue" onClick={executeProposal}><FiPlayCircle/> Execute </VoteButton>
                  : proposalInfo.status == "Pending Execution" ?
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
                  {proposalInfo.positiveVotes.div(totalRep).times("100").toNumber().toFixed(2)} % 
                </span>
                <span> - </span>
                <span style={{width: "40%", textAlign:"center", color: "red"}}>
                  {proposalInfo.negativeVotes.div(totalRep).times("100").toNumber().toFixed(2)} %
                  <AmountBadge color="red">{negativeVotesCount}</AmountBadge>
                </span>
              </SidebarRow>
              {votedAmount == 0 && proposalInfo.statusPriority >=3 && proposalInfo.statusPriority <= 6  ?
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
              : votedAmount != 0 ?
                <SidebarRow>
                  Already voted {(votedAmount > 0) ? "for" : "against"} with { (votedAmount / totalRep * 100).toFixed(2)} % REP
                </SidebarRow>
              : <div/>
              }
              <br/>
              {(proposalInfo.statusPriority == 3 || proposalInfo.statusPriority== 4) && userVotingMachineTokenApproved == 0 ?
                <SidebarRow>
                  <small>Approve DXD to stake</small>
                  <VoteButton color="blue" onClick={() => approveDXD()}>Approve DXD</VoteButton>
                </SidebarRow>
                : (proposalInfo.statusPriority == 3 || proposalInfo.statusPriority== 4)  ?
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
              
            </InfoSidebar>
          </ProposalInformationWrapper>
      );
    }
});

export default ProposalInformation;
