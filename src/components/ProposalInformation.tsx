import React from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import moment from 'moment';
import { FiPlayCircle, FiFastForward } from "react-icons/fi";
import Slider from '@material-ui/core/Slider';
import MDEditor from '@uiw/react-md-editor';
import { bnum } from '../utils/helpers';
import Address from '../components/common/Address';
import boltIcon from "assets/images/bolt.svg"
import { FiThumbsUp, FiThumbsDown } from "react-icons/fi";

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

const SidebarDivider = styled.div`
  border-bottom: 1px solid gray;
  margin: 5px 10px;
`;

const SidebarRow = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  padding: 5px 0px;

  .timeText {
    font-size: 20;
    margin-left: -10px;
    width:100%;
    padding-top: 5px;
  }
`;

const AmountInput = styled.input`
  background-color: white;
  border: 1px solid gray;
  border-radius: 4px;
  height: 34px;
  letter-spacing: 1px;
  font-weight: 500;
  line-height: 32px;
  text-align: left;
  cursor: pointer;
  width: 60px;
  padding: 0px 10px;
  margin: 5px;
  font-family: var(--roboto);
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

const ProposalInformation = observer(() => {
    const {
        root: { providerStore, daoStore, configStore, daoService, ipfsService, userStore, blockchainStore },
    } = useStores();
    const schemeAddress = useLocation().pathname.split("/")[2];
    const proposalId = useLocation().pathname.split("/")[4];
    const schemeInfo = daoStore.getScheme(schemeAddress);
    const proposalInfo = daoStore.getProposal(proposalId);
    const proposalEvents = daoStore.getProposalEvents(proposalId);
    const { dxdApproved } = userStore.getUserInfo(); 
    const { active, account, library } = providerStore.getActiveWeb3React();
    const [stakeAmount, setStakeAmount] = React.useState(100);
    const [votePercentage, setVotePercentage] = React.useState(0);
    const [canRedeem, setCanRedeem] = React.useState(false);

    let votedAmount = bnum(0);
    let positiveVotesCount = proposalEvents.votes.filter((vote) => vote.vote.toString() === "1").length;
    let negativeVotesCount = proposalEvents.votes.filter((vote) => vote.vote.toString() === "2").length;
    let stakedAmount = bnum(0);
    let positiveStakesCount = proposalEvents.stakes.filter((stake) => stake.vote.toString() === "1").length;
    let negativeStakesCount = proposalEvents.stakes.filter((stake) => stake.vote.toString() === "2").length;
    let userRepAtProposalCreation = bnum(0);
    let totalRepAtProposalCreation = bnum(0);
    
    let proposalDescription: string = ""

    if (proposalInfo){
      
      const repAtCreation = daoService.getRepAt(proposalInfo.creationBlock);
      userRepAtProposalCreation = bnum(repAtCreation.userRep);
      totalRepAtProposalCreation = bnum(repAtCreation.totalSupply);
        
      // @ts-ignore
      proposalDescription = ipfsService.get(proposalInfo.descriptionHash).content;
      
      proposalEvents.votes.map((vote) => {
        if (vote.voter === account) {
          votedAmount = bnum(vote.amount);
        };
      });
        
      proposalEvents.stakes.map((stake) => {
        if (stake.staker === account && stake.vote.toString() == "1") {
          stakedAmount = stakedAmount.plus(stake.amount);
        } else if (stake.staker === account && stake.vote.toString() == "2") {
          stakedAmount = stakedAmount.minus(stake.amount);
        }
      });
      
      if ((proposalEvents.redeems.find((redeem) => redeem.beneficiary === account)) 
        && (stakedAmount.gt('0') || votedAmount.gt('0') && !canRedeem))
        setCanRedeem(true);
      
      console.log("Proposal info", proposalInfo);
    }
    
    console.log("Scheme info", schemeInfo);
    
    if (!active) {
      return (
          <ProposalInformationWrapper>
            <div className="loader">
            <img alt="bolt" src={boltIcon} />
                <br/>
                Connect to view proposal
            </div>
          </ProposalInformationWrapper>
      )
    } else if (!blockchainStore.initialLoadComplete) {
      
      return (
          <ProposalInformationWrapper>
            <div className="loader">
            <img alt="bolt" src={boltIcon} />
                <br/>
                Searching for proposal..
            </div>
          </ProposalInformationWrapper>
      )
      
    } else {
      
      let proposalCallTexts = new Array(proposalInfo.to.length);
      for (var p = 0; p < proposalInfo.to.length; p++) {
        if (schemeInfo.controllerAddress === configStore.getNetworkConfig().controller) {
          const decodedGenericCall = daoService.decodeControllerCall(proposalInfo.callData[p]);
          proposalCallTexts[p] = decodedGenericCall;
        } else {
          proposalCallTexts[p] =
            "Call to "+proposalInfo.to[p]+" with data of "+proposalInfo.callData[p]+
            " uinsg value of "+library.utils.fromWei(proposalInfo.values[p].toString());
        }
      }
      
      let stakeToBoost = 0;
      stakeToBoost = library.utils.fromWei(
        schemeInfo.parameters.thresholdConst.pow(
          (schemeInfo.boostedProposals > schemeInfo.parameters.limitExponentValue.toNumber())
            ? schemeInfo.parameters.limitExponentValue : schemeInfo.boostedProposals
        ).minus(proposalInfo.positiveStakes)
        .plus(proposalInfo.negativeStakes).toString()
      ).toString();
      
      const stakeToUnBoost = library.utils.fromWei(
        proposalInfo.positiveStakes.minus(proposalInfo.negativeStakes).toString()
      ).toString();
            
      const timeToBoost = proposalInfo && proposalInfo.boostTime.toNumber() > moment().unix() ? 
      moment().to( moment(proposalInfo.boostTime.times(1000).toNumber()) ).toString()
      : "";
      const timeToFinish = proposalInfo && proposalInfo.finishTime.toNumber() > moment().unix() ?
      moment().to( moment(proposalInfo.finishTime.times(1000).toNumber()) ).toString()
      : "";
      
      const repPercentageAtCreation = userRepAtProposalCreation.times(100).div(totalRepAtProposalCreation).toFixed(4);
      
      function onStakeAmountChange(event) {
        setStakeAmount(event.target.value);
      }
      
      function onVoteValueChange(event) {
        setVotePercentage(event.target.value < repPercentageAtCreation ? event.target.value : repPercentageAtCreation);
      }
      
      if (repPercentageAtCreation > 0 && votePercentage === 0) {
        setVotePercentage(repPercentageAtCreation);
      }
      
      const submitVote = function(decision) {
        const repAmount = (totalRepAtProposalCreation.times(bnum(votePercentage))).div('100');
        daoStore.vote(decision, repAmount.toNumber(), proposalId);
      };
      
      const submitStake = function(decision) {
        daoStore.stake(decision, library.utils.toWei(stakeAmount.toString()), proposalId);
      };
      
      const redeem = function() {
        daoStore.redeem(proposalId, account);
      }
      
      const approveDXD = function() {
        daoStore.approveVotingMachineToken();
      };
      
      const executeProposal = function() {
        daoStore.execute(proposalId);
      };
      
      return (
          <ProposalInformationWrapper>
            <ProposalInfoSection>
              <h1> {proposalInfo.title} </h1>
              <MDEditor.Markdown source={
                proposalDescription.length === 0
                  ? "## Getting proposal description from IPFS..."
                  : proposalDescription
                } style={{
                padding: "20px 10px"
              }} />
              <hr/>
              <h2> Calls </h2>
              {proposalCallTexts.map((proposalCallText, i) => {
                return(
                <div key={"proposalCallText"+i}>
                  <span> {proposalCallText} </span> 
                </div>);
              })}
              <hr/>
              <h2> History </h2>
              {proposalEvents.history.map((historyEvent, i) => {
                return(
                <div key={"proposalHistoryEvent"+i}>
                  <span> {historyEvent.text} </span> 
                  {i < proposalEvents.history.length - 1 ? <hr/> : <div/>}
                </div>);
              })}
            </ProposalInfoSection>
            <InfoSidebar>
              <h2 style={{margin: "10px 0px 0px 0px", textAlign: "center"}}>{
                (proposalInfo.status === "Quiet Ending Period" && timeToFinish === "") ?
                  "Pending Execution" : proposalInfo.status
                }</h2>
              <SidebarRow style={{
                margin: "0px 10px",
                flexDirection: "column"
              }}>
                {(proposalInfo.boostTime.toNumber() > moment().unix()) ?
                  <span className="timeText"> Boost {timeToBoost} </span> 
                  : <span></span>
                }
                
                {(proposalInfo.finishTime.toNumber() > moment().unix()) ?
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
              
              <SidebarDivider/> 

              <SidebarRow style={{ margin: "0px 10px", padding: "10px 0px", flexDirection: "column" }}>
                <span> <strong>Proposer</strong> <Address type="user" address={proposalInfo.proposer}/> </span>
                <span> <strong>Submitted Time</strong> <small>{
                  moment.unix(proposalInfo.submittedTime.toNumber()).format("MMMM Do YYYY, h:mm:ss")
                }</small> </span>
                <span> <strong>Boosted Time</strong> <small>{
                  proposalInfo.boostedPhaseTime.toNumber() > 0 ?
                    moment.unix(proposalInfo.boostedPhaseTime.toNumber()).format("MMMM Do YYYY, h:mm:ss")
                  : "-"
                }</small> </span>
                <span> <strong>Finish Time</strong> <small>{
                  moment.unix(proposalInfo.finishTime.toNumber()).format("MMMM Do YYYY, h:mm:ss")
                }</small> </span>
              </SidebarRow>
              
              <SidebarDivider/> 
            
              <SidebarRow>
                <span> <strong>Votes</strong> </span>
              </SidebarRow>
              <SidebarRow style={{ margin: "0px 10px" }}> 
                <span style={{width: "50%", textAlign:"center", color: "green"}}>
                  <AmountBadge color="green">{positiveVotesCount}</AmountBadge>
                  {proposalInfo.positiveVotes.div(totalRepAtProposalCreation).times("100").toFixed(2)} %
                  <br/> 
                  {proposalEvents.votes && proposalEvents.votes.map(function(voteEvent, i){
                    if (voteEvent.vote.toString() === "1")
                      return (
                        <small color="green" key={`voteUp${i}`}>
                          <Address size="short" type="user" address={voteEvent.voter}/>
                            {bnum(voteEvent.amount).div(totalRepAtProposalCreation).times("100").toFixed(2)} %
                            <br/>
                        </small>
                      );
                    else return undefined;
                  })}
                </span>
                <span style={{width: "50%", textAlign:"center", color: "red"}}>
                  {proposalInfo.negativeVotes.div(totalRepAtProposalCreation).times("100").toFixed(2)} %
                  <AmountBadge color="red">{negativeVotesCount}</AmountBadge>
                  <br/> 
                  {proposalEvents && proposalEvents.votes.map(function(voteEvent, i){
                    if (voteEvent.vote.toString() === "2")
                      return <small color="red" key={`voteDown${i}`}><Address size="short" type="user" address={voteEvent.voter}/> {bnum(voteEvent.amount).div(totalRepAtProposalCreation).times("100").toNumber().toFixed(2)} %<br/></small>
                    else return undefined;
                  })}
                </span>
              </SidebarRow>
              
              <small>{repPercentageAtCreation} % REP at proposal creation</small>
              
              {votedAmount.toNumber() === 0 && proposalInfo.priority >=3 && proposalInfo.priority <= 6  ?
                <SidebarRow>
                  
                  <AmountInput
                    type="number"
                    placeholder="REP"
                    name="votePercentage"
                    max={votePercentage}
                    value={votePercentage}
                    min="0"
                    step={votePercentage > 10 ? "1" : votePercentage > 1 ? "0.01" : votePercentage > 0.1 ? "0.001" : "0.00001"}
                    id="votePercentage"
                    onChange={onVoteValueChange}
                    style={{flex: 2}}
                  />
                  <VoteButton style={{flex: 1, maxWidth: "20px", textAlign: "center"}} color="green" onClick={() => submitVote(1)}><FiThumbsUp /></VoteButton>
                  <VoteButton style={{flex: 1, maxWidth: "20px", textAlign: "center"}} color="red" onClick={() => submitVote(2)}><FiThumbsDown /></VoteButton>
                  
                </SidebarRow>
              : votedAmount.toNumber() !== 0 ?
                <SidebarRow>
                  Already voted {(votedAmount.toNumber() > 0) ? "for" : "against"} with { (votedAmount.div(totalRepAtProposalCreation).times("100")).toFixed(2)} % REP
                </SidebarRow>
              : <div/>
              }
              
              <SidebarDivider/> 
              
              <SidebarRow>
                <span> <strong>Staked</strong> </span>
              </SidebarRow>
              <SidebarRow style={{ margin: "0px 10px" }}>
                <span style={{width: "50%", textAlign:"center", color: "green"}}>
                  <AmountBadge color="green">{positiveStakesCount}</AmountBadge>
                  {Number(library.utils.fromWei(proposalInfo.positiveStakes.toString())).toFixed(2)} DXD
                  <br/> 
                  {proposalEvents && proposalEvents.stakes.map(function(stakeEvent, i){
                    if (stakeEvent.vote.toString() === "1")
                      return (
                        <small color="green" key={`stakeUp${i}`}>
                          <Address size="short" type="user" address={stakeEvent.staker}/>
                            {Number(library.utils.fromWei(stakeEvent.amount.toString())).toFixed(2)} DXD
                            <br/>
                        </small>
                      )
                    else return undefined;
                  })}
                </span>
                <span style={{width: "50%", textAlign:"center", color: "red"}}>
                  {Number(library.utils.fromWei(proposalInfo.negativeStakes.toString())).toFixed(2)} DXD
                  <AmountBadge color="red">{negativeStakesCount}</AmountBadge>
                  <br/> 
                  {proposalEvents && proposalEvents.stakes.map(function(stakeEvent, i){
                    if (stakeEvent.vote.toString() === "2")
                      return <small color="red" key={`stakeDown${i}`}><Address size="short" type="user" address={stakeEvent.staker}/> {Number(library.utils.fromWei(stakeEvent.amount.toString())).toFixed(2)} DXD<br/> </small>
                    else return undefined;
                  })}
                </span>
              </SidebarRow>
              
              {stakedAmount.toNumber() > 0
                ? <SidebarRow>
                Already staked {(stakedAmount.toNumber() > 0) ? "for" : "against"} with {Number(library.utils.fromWei(stakedAmount)).toFixed(2)} DXD
                </SidebarRow>
                : <div></div>
              }

              {(proposalInfo.priority === 3 || proposalInfo.priority === 4) && dxdApproved.toString() === "0" ?
                <SidebarRow>
                  <small>Approve DXD to stake</small>
                  <VoteButton color="blue" onClick={() => approveDXD()}>Approve DXD</VoteButton>
                </SidebarRow>
                : (proposalInfo.priority === 3 || proposalInfo.priority === 4)  ?
                  <div>
                    {stakeToBoost > 0 ? <small>Stake {Number(stakeToBoost).toFixed(2)} DXD to boost</small> : <span/>}
                    {stakeToUnBoost > 0 ? <small>Stake {Number(stakeToUnBoost).toFixed(2)} DXD to unboost</small> : <span/>}
                    <SidebarRow>
                      <AmountInput
                        type="number"
                        placeholder="DXD"
                        name="stakeAmount"
                        id="stakeAmount"
                        step="0.01"
                        min="0"
                        onChange={onStakeAmountChange}
                        style={{flex: 2}}
                      />
                      <VoteButton style={{flex: 1, maxWidth: "20px", textAlign: "center"}} color="green" onClick={() => submitStake(1)}><FiThumbsUp /></VoteButton>
                      <VoteButton style={{flex: 1, maxWidth: "20px", textAlign: "center"}} color="red" onClick={() => submitStake(2)}><FiThumbsDown /></VoteButton>
                    </SidebarRow>
                  </div>
                : <div></div>
              }
              
              {proposalInfo.priority < 3 && canRedeem
                ? <SidebarRow style={{ borderTop: "1px solid gray",  margin: "0px 10px" }}>
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
