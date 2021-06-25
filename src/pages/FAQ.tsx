import React, { useEffect } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import Box from '../components/common/Box';
import { useLocation } from 'react-router-dom';

const FAQPage = observer(() => {
    
  const questionId = useLocation().search.indexOf("=") > -1 ? useLocation().search.split("=")[1] : 0;
  
  const FAQBox = styled(Box)`
    padding: 20px 30px;
    p {
      line-height: 28px;
      font-size: 20px;
    }
    h2 {
      margin:10px 0px;
    }
    h3 {
      margin: 5px 0px;
    }
    h4 {
      margin: 0px;
    }
  `
  useEffect(() => {
    if (questionId > 0)
      document.getElementById('question'+questionId).scrollIntoView();
   }, []);

  return (
    <FAQBox>
    
      <h2 id="question1">Where are the dao funds held?</h2>
      <p>
        Most of the ETH and tokens are held in the DXdao avatar address, this is the safest place for the funds to be, the access to this funds is usually slow and it take day for a proposal to move funds from this address.
        The Wallet Schemes can also hold funds too, but only the ones that dont make calls from the avatar.
      </p>
      
      <h2 id="question2">What is a Wallet Scheme?</h2>
      <p>
        A wallet scheme is a smart contract that manage the access to DXdao funds, in order to make transfers or calls from the DXdao avatar or the scheme itself the scheme needs to execute a proposal.
        The proposals are executed after it reaches a certain amount of votes or stakes over time, the amount of votes, staked and time that has to passed depends on the scheme configuration.
        An scheme who will have access to the DXdao avatar funds will usually take more votes, stakes and time than a scheme who make calls form itself, this means that funds can be allocated in the schemes as well, but this schemes will have only access to the funds held by themselves.
      </p>
      
      <h2 id="question3">Proposal States</h2>
      <h4>In Queue</h4>
      <p>A proposal that needs the <i>queuedVoteRequiredPercentage</i> % of votes sets in the proposal scheme to pass.</p>
      <h4>Pre Boosted</h4>
      <p>A proposal that has enough stakes to pass be boosted state but cant be boosted just yet.</p>
      <h4>Pending Boost</h4>
      <p>A proposal that has enough stakes to pass to boosted state.</p>
      <h4>Boosted</h4>
      <p>A proposal that needs the <i>boostedVoteRequiredPercentage</i> % of votes sets in the proposal scheme to pass.</p>
      <h4>Quiet Ending Period</h4>
      <p>A proposal that changed the winning option in the amount of seconds specified as <i>quietEndingPeriod</i> before finishing, this will extend the proposal time for <i>quietEndingPeriod</i> seconds. The <i>quietEndingPeriod</i> is specified in the scheme configuration where the proposal was submitted. </p>
      <h4>Pending Execution</h4>
      <p>A proposal that got enough votes and is ready to be executed.</p>
      <h4>Execution Failed</h4>
      <p>A proposal that was executed after it passed but it execution failed.</p>
      <h4>Execution Succeded</h4>
      <p>A proposal that was executed after it passed but it execution succeeded.</p>
      <h4>Expired in Queue</h4>
      <p>A proposal that spent too much time in Queue state and didnt get enough votes to pass.</p>
      
      <h2 id="question4">How does voting works?</h2>
      <p>
        A proposal needs a minimum amount of votes to pass, and that depends on the state of the proposal at the moment of execution.
        If a proposal is in Boosted state it will need the <i>boostedVoteRequiredPercentage</i> percentage amount specified in the scheme configuration where the proposal was created of votes in favor to be executed.
        If a proposal reaches the <i>queuedVoteRequiredPercentage</i> percentage amount of votes it gets executed instantly. This means that any proposal in Queued state will need that amount of votes to pass.
      </p>
      
      <h2 id="question5">How does staking works?</h2>
      <p>
        A proposal can receives a financial stake in DXD to speed up the voting process.
        If a proposal receives enough positive stakes to boost it will enter pre-boosted state, once the pre-boosted state finish if the proposal still has enough DXD staked to boost it will be boosted in the next voting machine action (vote, stake, or voting machine execution).
        If a proposal is in Boosted state it will need the <i>boostedVoteRequiredPercentage</i> percentage amount specified in the scheme configuration where the proposal was created of votes in favor to be executed.
      </p>
      
      <h2 id="question6">How do I get DXD?</h2>
      <p>
        You can get rinkeby DXD buying DXD in dxtrust rinkeby here: <a href="https://levelkdev.github.io/dxtrust/">https://levelkdev.github.io/dxtrust/</a>
      </p>
      
      <h2 id="question7">How are proposals created?</h2>
      <p>
        Each proposal has a title, description and calls to be exected by the wallet scheme where it is proposed.
        The description of the proposal is stored in IPFS, and we save the hash of the IPFS description in the blokchain next to the proposal title and calls.
        When creating a proposal you first need to submit the description to IPFS and once you get the IPFS hash of the description the proposal can be submited by sending a transaction to the wallet scheme smart contract.
      </p>
      
      <h2 id="question8">External APIs</h2>
      <p>
        The app allows you to add external API services.
        Use Pinata to help DXdao by pinning the proposal description and important documents in you pinata account.
        Use Etherscan to decode proposal calls and know what the proposal will execute.
      </p>
      
      <h2 id="question9">Schemes Configuration</h2>
      
      <h3>Scheme Parameters</h3>
      
      <h4>name</h4>
      <p>The name of the scheme, this will be used to identify the scheme by name in DXvote dapp.</p>
      
      <h4>callToController</h4>
      <p>If the scheme make calls to the controller or not. A Scheme that makes calls to a controller will make calls from the dxdao avatar (which gives access to the dxdao funds) and a scheme that do not call the controller will make call directly from itself, which means that it will have access only to the funds held in the scheme address.</p>
      
      <h4>maxSecondsForExecution</h4>
      <p>This is the amount of time that a proposal has to be executed in the scheme, this is useful to "clean" proposals that weren't successful or weren't able to be executed for some reason. This means that if a proposal passes in 3 days in the voting machine and the <i>maxSecondsForExecution</i> are 6 days it will have 3 days to be executed, after that it will be marked in <i>ExecutionTimeout</i> state and wont be able to be executed again, reaching a state of termination.</p>
      
      <h4>maxRepPercentageToMint</h4>
      <p>This is the maximum amount of rep in percentage allowed to be minted by proposal, the value can be between 0-100, if a proposal execution mints 5% of REP and the <i>maxRepPercentageToMint</i> equals 3, it will fail.</p>
      
      <h4>Controller Permissions</h4>
      <p>This are four values that determine what the scheme can do in the dxdao controller contract, the most powerful contract in the stack, the only two values that we use from it are <i>canRegisterSchemes</i> and <i>canGenericCall</i>. <i>canRegisterSchemes</i> allows the addition/removal of schemes and the <i>canGenericCall</i> allows the execution of calls in the avatar contract.</p>
      
      <h3>Permission Registry Permissions</h3>
      <p>This permissions are checked before a proposal execution to check that the total value transferred by asset and the functions to be called are allowed. If a scheme make calls to the controller the permissions are checked from the avatar address.
      The permissions are set by asset, specifying the sender and receiver addresses, the signature of the function to be used and the value to be transferred.
      It allows the use of "wildcard" permissions by using <i>0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa</i> for any address and <i>0xaaaaaaaa</i> for any signature.
      It also allows the use of global transfer limits, by setting the limit by asset using the scheme as receiver address, any value recorded here will be used as global transfer limit in the proposal check.</p>

      <h3>Voting Machine Params</h3>
      <h4>queuedVoteRequiredPercentage</h4>
      <p>The percentage of votes required to execute a proposal in queued state.</p>
      <h4>boostedVoteRequiredPercentage</h4>
      <p>The percentage of votes required to execute a proposal in boosted state.</p>
      <h4>queuedVotePeriodLimit</h4>
      <p>The amount of time that a proposal will be in queue state (not boosted), once the time limit is reached and the proposal was not executed it finish.</p>
      <h4>boostedVotePeriodLimit</h4>
      <p>The amount of time that a proposal will be in boost state (after pre-boosted), once the time limit is reached and the proposal was not executed it finish.</p>
      <h4>preBoostedVotePeriodLimit</h4>
      <p>The amount of time that a proposal will be in pre-boosted state. A proposal gets into pre-boosted state when it has enough.</p>
      <h4>thresholdConst</h4>
      <p>The constant used to calculate the needed upstakes in a proposal to reach boosted state, where the upstakes needed equal to <i>downStakes * (thresholdConst ** (numberOfBoostedProposals))</i> taking in count the number of boosted proposals at the moment of the pre-boost to boosted state change.</p>
      <h4>quietEndingPeriod</h4>
      <p>The amount of time a proposal has to have the same winning option before it finish, if the winning option change during that time the proposal finish time will be extended till the winning option doesn't change during that time.</p>
      <h4>proposingRepReward</h4>
      <p>The fixed amount of REP that will be minted to the address who created the proposal.</p>
      <h4>votersReputationLossRatio</h4>
      <p>The percentage of REP a voter will loose if the voter voted a proposal in queue state for the loosing option.</p>
      <h4>minimumDaoBounty</h4>
      <p>The minimum amount to be set as downstake when a proposal is created.</p>
      <h4>daoBountyConst</h4>
      <p>The downstake for proposal is calculated when the proposal is created, by using the formula: <i>(daoBountyConst * averageBoostDownstakes) / 100</i>. If the value calculated is higher than <i>minimumDaoBounty</i> then this value will be used, if not the start downstake of the proposal will be <i>minimumDaoBounty</i>.</p>
    </FAQBox>
  );
});

export default FAQPage;
