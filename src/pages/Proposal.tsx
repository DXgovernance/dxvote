import React from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import moment from 'moment';
import { FiPlayCircle, FiFastForward } from "react-icons/fi";
import Slider from '@material-ui/core/Slider';
import MDEditor from '@uiw/react-md-editor';
import contentHash from 'content-hash';
import { bnum } from '../utils/helpers';
import BlockchainLink from '../components/common/BlockchainLink';
import Question from '../components/common/Question';
import Box from '../components/common/Box';
import { FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import {
  WalletSchemeProposalState,
  VotingMachineProposalState
} from '../enums';

const ProposalInformationWrapper = styled(Box)`
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: row;
`;

const InfoSidebar = styled.div`
  max-width: 400px;
  min-width: 300px;
  display: flex;
  justify-content: flex-start;
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
  
  span {
    margin-bottom: 5px;
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

const ActionButton = styled.div`
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

const ProposalPage = observer(() => {
    const {
        root: { providerStore, daoStore, configStore, daoService, ipfsService, userStore, blockchainStore },
    } = useStores();
    const votingMachines = configStore.getNetworkConfig().votingMachines;
    const proposalId = useLocation().pathname.split("/")[2];
    const proposalInfo = daoStore.getProposal(proposalId);
    const schemeInfo = daoStore.getScheme(proposalInfo.scheme);
    const { dxdApproved } = userStore.getUserInfo(); 
    const { active, account, library } = providerStore.getActiveWeb3React();
    const [stakeAmount, setStakeAmount] = React.useState(100);
    const [votePercentage, setVotePercentage] = React.useState(0);
    const [canRedeem, setCanRedeem] = React.useState(false);
    const [proposalDescription, setProposalDescription] = React.useState(
      "## Getting proposal description from IPFS..."
    );
    const [proposalTitle, setProposalTitle] = React.useState(
      schemeInfo.type == 'WalletScheme' ? proposalInfo.title : "Getting proposal title from IPFS..."
    );
    
    const votingMachineTokenName = (votingMachines.gen && (schemeInfo.votingMachine == votingMachines.gen.address))
      ? 'GEN' : 'DXD';
      
    const proposalEvents = daoStore.getProposalEvents(proposalId);
    console.debug("[Scheme info]", schemeInfo);
    
    let votedAmount = bnum(0);
    let positiveVotesCount = proposalEvents.votes.filter((vote) => vote.vote.toString() === "1").length;
    let negativeVotesCount = proposalEvents.votes.filter((vote) => vote.vote.toString() === "2").length;
    let stakedAmount = bnum(0);
    let positiveStakesCount = proposalEvents.stakes.filter((stake) => stake.vote.toString() === "1").length;
    let negativeStakesCount = proposalEvents.stakes.filter((stake) => stake.vote.toString() === "2").length;
    let userRepAtProposalCreation = bnum(0);
    let totalRepAtProposalCreation = bnum(0);
    
    const repAtCreation = daoService.getRepAt(proposalInfo.creationEvent.block);
    userRepAtProposalCreation = bnum(repAtCreation.userRep);
    totalRepAtProposalCreation = bnum(repAtCreation.totalSupply);
      
    // @ts-ignore
    try {
      if (proposalDescription == "## Getting proposal description from IPFS...")
        ipfsService.getContent(contentHash.decode(proposalInfo.descriptionHash)).then((data) => {
          if (schemeInfo.type == 'WalletScheme') {
            setProposalDescription(data);
          } else {
            setProposalTitle(JSON.parse(data).title);
            setProposalDescription(JSON.parse(data).description);
          }
        });
    } catch (error) {
      console.error("[IPFS ERROR]",error);
      setProposalTitle("Error getting proposal title from ipfs");
      setProposalDescription("Error getting proposal description from IPFS");
    }
    
    
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
    
      console.debug("[Proposal info]", proposalInfo);
      console.debug("[Proposal events]", proposalEvents);
    
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
      schemeInfo.configurations[ schemeInfo.configurations.length - 1].parameters.thresholdConst.pow(
        (schemeInfo.boostedProposals > schemeInfo.configurations[ schemeInfo.configurations.length - 1].parameters.limitExponentValue.toNumber())
          ? schemeInfo.configurations[ schemeInfo.configurations.length - 1].parameters.limitExponentValue : schemeInfo.boostedProposals
      ).minus(proposalInfo.positiveStakes)
      .plus(proposalInfo.negativeStakes).times(110).div(100).toFixed(0)
    ).toString();
    
    const stakeToUnBoost = library.utils.fromWei(
      proposalInfo.positiveStakes.minus(proposalInfo.negativeStakes).times(101).div(100).toFixed(0)
    ).toString();
          
    const timeToBoost = proposalInfo && proposalInfo.boostTime.toNumber() > moment().unix() ? 
    moment().to( moment(proposalInfo.boostTime.times(1000).toNumber()) ).toString()
    : "";
    const timeToFinish = proposalInfo && proposalInfo.finishTime.toNumber() > moment().unix() ?
    moment().to( moment(proposalInfo.finishTime.times(1000).toNumber()) ).toString()
    : "";
    console.log(schemeInfo.configurations[schemeInfo.configurations.length -1]
      .boostedVoteRequiredPercentage.toString())
    const boostedVoteRequiredPercentage = schemeInfo.configurations[schemeInfo.configurations.length -1]
      .boostedVoteRequiredPercentage / 1000;
      
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
      daoStore.vote(decision, repAmount.toFixed(0), proposalId);
    };
    
    const submitStake = function(decision) {
      daoStore.stake(decision, library.utils.toWei(stakeAmount.toString()), proposalId);
    };
    
    const redeem = function() {
      daoStore.redeem(proposalId, account);
    }
    
    const approveVotingMachineToken = function() {
      daoStore.approveVotingMachineToken();
    };
    
    const executeProposal = function() {
      daoStore.execute(proposalId);
    };
    
    return (
      <ProposalInformationWrapper>
        <ProposalInfoSection>
          <h1 style={{margin: "0px"}}> {proposalTitle} </h1>
          <MDEditor.Markdown source={ proposalDescription } style={{
            padding: "20px 10px"
          }} />
          <hr/>
          <h2> Calls  <Question question="9"/></h2>
          {proposalCallTexts.map((proposalCallText, i) => {
            return(
            <div key={"proposalCallText"+i}>
              <span> {proposalCallText} </span> 
              {i < proposalCallTexts.length - 1 ? <hr/> : <div/>}
            </div>);
          })}
          <h2> History </h2>
          
          {proposalEvents.history.map((historyEvent, i) => {
            return(
              <div key={"proposalHistoryEvent"+i} style={{
                display: "flex", alignItems:"center", padding:"4px 0px",
                borderBottom: i < proposalEvents.history.length - 1 ? " 1px --medium-gray": ""
              }}>
                <span> {historyEvent.text} </span> 
                <BlockchainLink type="transaction" size="short" text={historyEvent.event.tx} onlyIcon/>
                {i < proposalEvents.history.length - 1 ? <hr/> : <div/>}
              </div>
            );
          })}
        </ProposalInfoSection>
        <InfoSidebar>
          <h2 style={{margin: "10px 0px 0px 0px", textAlign: "center"}}>{proposalInfo.status} <Question question="3"/></h2>
          <SidebarRow style={{
            margin: "0px 10px",
            flexDirection: "column"
          }}>
            {(proposalInfo.boostTime.toNumber() > moment().unix()) ?
              <span className="timeText"> Boost {timeToBoost} </span> 
              : <div></div>
            }
            {(proposalInfo.finishTime.toNumber() > moment().unix()) ?
              <span className="timeText">
                Finish {timeToFinish} </span>
              : <div></div>}
          </SidebarRow>
          <SidebarRow style={{flexDirection:"column", alignItems:"center"}}>
            {proposalInfo.status === "Pending Boost" ? 
              <ActionButton color="blue" onClick={executeProposal}><FiFastForward/> Boost </ActionButton>
              : proposalInfo.status === "Quiet Ending Period" && timeToFinish === "" ?
              <ActionButton color="blue" onClick={executeProposal}><FiPlayCircle/> Execute </ActionButton>
              : proposalInfo.status === "Pending Execution" ?
              <ActionButton color="blue" onClick={executeProposal}><FiPlayCircle/> Execute </ActionButton>
              : <div/>
            }
          </SidebarRow>
          
          <SidebarDivider/> 

          <SidebarRow style={{ margin: "0px 10px", padding: "10px 0px", flexDirection: "column" }}>
            <span style={{ display: "flex", height: "17px "}}>
              <strong>Proposer</strong> <small><BlockchainLink type="user" text={proposalInfo.proposer} toCopy/></small>
            </span>
            <span> <strong>Scheme</strong> <small>{schemeInfo.name}</small></span>
            <span><strong>State in Voting Machine </strong>
              <small>{VotingMachineProposalState[proposalInfo.stateInVotingMachine]}</small>
            </span>
            <span><strong>State in Scheme </strong>
              <small>{WalletSchemeProposalState[proposalInfo.stateInScheme]}</small>
            </span>
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
            { (boostedVoteRequiredPercentage > 0) ?
              <span> <strong> Required Boosted Vote: </strong> <small>{boostedVoteRequiredPercentage}%</small> </span>
            : <div/>
            }
          </SidebarRow>
          
          <SidebarDivider/> 
        
          <SidebarRow>
            <strong>Votes <Question question="4"/></strong>
          </SidebarRow>
          <SidebarRow style={{ margin: "0px 10px" }}> 
            <span style={{width: "50%", textAlign:"center", color: "green"}}>
              <AmountBadge color="green">{positiveVotesCount}</AmountBadge>
              {proposalInfo.positiveVotes.div(totalRepAtProposalCreation).times("100").toFixed(2)} %
              <br/> 
              {proposalEvents.votes && proposalEvents.votes.map(function(voteEvent, i){
                if (voteEvent.vote.toString() === "1")
                  return (
                    <small color="green" key={`voteUp${i}`} style={{ display: "flex", alignItems:"center"}}>
                      <BlockchainLink size="short" type="user" text={voteEvent.voter}/>
                      {bnum(voteEvent.amount).div(totalRepAtProposalCreation).times("100").toFixed(2)} %
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
                  return (
                    <small color="red" key={`voteDown${i}`} style={{ display: "flex", alignItems:"center"}}>
                      <BlockchainLink size="short" type="user" text={voteEvent.voter}/>
                      {bnum(voteEvent.amount).div(totalRepAtProposalCreation).times("100").toNumber().toFixed(2)} %
                    </small>
                  )
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
              <ActionButton style={{flex: 1, maxWidth: "20px", textAlign: "center"}} color="green" onClick={() => submitVote(1)}><FiThumbsUp /></ActionButton>
              <ActionButton style={{flex: 1, maxWidth: "20px", textAlign: "center"}} color="red" onClick={() => submitVote(2)}><FiThumbsDown /></ActionButton>
              
            </SidebarRow>
          : votedAmount.toNumber() !== 0 ?
            <SidebarRow>
              Already voted {(votedAmount.toNumber() > 0) ? "for" : "against"} with { (votedAmount.div(totalRepAtProposalCreation).times("100")).toFixed(2)} % REP
            </SidebarRow>
          : <div/>
          }
          
          <SidebarDivider/> 
          
          <SidebarRow>
            <strong>Stakes <Question question="5"/></strong>
          </SidebarRow>
          <SidebarRow style={{ margin: "0px 10px" }}>
            <span style={{width: "50%", textAlign:"center", color: "green"}}>
              <AmountBadge color="green">{positiveStakesCount}</AmountBadge>
              {Number(library.utils.fromWei(proposalInfo.positiveStakes.toString())).toFixed(4)} {votingMachineTokenName}
              <br/> 
              {proposalEvents && proposalEvents.stakes.map(function(stakeEvent, i){
                if (stakeEvent.vote.toString() === "1")
                  return (
                    <small color="green" key={`stakeUp${i}`} style={{ display: "flex", alignItems:"center"}}>
                      <BlockchainLink size="short" type="user" text={stakeEvent.staker}/>
                      {Number(library.utils.fromWei(stakeEvent.amount.toString())).toFixed(4)} {votingMachineTokenName}
                    </small>
                  )
                else return undefined;
              })}
            </span>
            <span style={{width: "50%", textAlign:"center", color: "red"}}>
              {Number(library.utils.fromWei(proposalInfo.negativeStakes.toString())).toFixed(4)} {votingMachineTokenName}
              <AmountBadge color="red">{negativeStakesCount}</AmountBadge>
              <br/> 
              {proposalEvents && proposalEvents.stakes.map(function(stakeEvent, i){
                if (stakeEvent.vote.toString() === "2")
                  return (
                    <small color="red" key={`stakeDown${i}`} style={{ display: "flex", alignItems:"center"}}>
                      <BlockchainLink size="short" type="user" text={stakeEvent.staker}/>
                      {Number(library.utils.fromWei(stakeEvent.amount.toString())).toFixed(4)} {votingMachineTokenName}
                    </small>
                  )
                else return undefined;
              })}
            </span>
          </SidebarRow>
          
          {stakedAmount.toNumber() > 0
            ? <SidebarRow>
            Already staked {(stakedAmount.toNumber() > 0) ? "for" : "against"} with {Number(library.utils.fromWei(stakedAmount.toString())).toFixed(4)} {votingMachineTokenName}
            </SidebarRow>
            : <div></div>
          }

          {(proposalInfo.priority === 3 || proposalInfo.priority === 4) && dxdApproved.toString() === "0" ?
            <SidebarRow>
              <small>Approve {votingMachineTokenName} to stake</small>
              <ActionButton color="blue" onClick={() => approveVotingMachineToken()}>Approve {votingMachineTokenName}</ActionButton>
            </SidebarRow>
            : (proposalInfo.priority === 3 || proposalInfo.priority === 4)  ?
              <div>
                {stakeToBoost > 0 ? <small>Stake {Number(stakeToBoost).toFixed(4)} {votingMachineTokenName} to boost</small> : <span/>}
                {stakeToUnBoost > 0 ? <small>Stake {Number(stakeToUnBoost).toFixed(4)} {votingMachineTokenName} to unboost</small> : <span/>}
                <SidebarRow>
                  <AmountInput
                    type="number"
                    placeholder={votingMachineTokenName}
                    name="stakeAmount"
                    id="stakeAmount"
                    step="0.01"
                    min="0"
                    onChange={onStakeAmountChange}
                    style={{flex: 2}}
                  />
                  <ActionButton style={{flex: 1, maxWidth: "20px", textAlign: "center"}} color="green" onClick={() => submitStake(1)}><FiThumbsUp /></ActionButton>
                  <ActionButton style={{flex: 1, maxWidth: "20px", textAlign: "center"}} color="red" onClick={() => submitStake(2)}><FiThumbsDown /></ActionButton>
                </SidebarRow>
              </div>
            : <div></div>
          }
          
          {proposalInfo.priority < 3 && canRedeem
            ? <SidebarRow style={{ borderTop: "1px solid gray",  margin: "0px 10px" }}>
              <ActionButton color="blue" onClick={() => redeem()}>Redeem</ActionButton>
            </SidebarRow>
            : <div></div>
          }
          
        </InfoSidebar>
      </ProposalInformationWrapper>
    );
    
});

export default ProposalPage;
