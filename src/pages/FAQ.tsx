import React, { useEffect } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import Box from '../components/common/Box';
import { useLocation } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';

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
      document.querySelectorAll("#FAQBody div h1")[questionId].scrollIntoView();
   }, []);
   
   
   const FAQBody = 
`# Where are the dao funds held?
Most of the ETH and tokens are held in the DXdao avatar address, this is the safest place for the funds to be, the access to this funds is usually slow and it take day for a proposal to move funds from this address. The Wallet Schemes can also hold funds too, but only the ones that dont make calls from the avatar.

# What is a Wallet Scheme?
A wallet scheme is a smart contract that manage the access to DXdao funds, in order to make transfers or calls from the DXdao avatar or the scheme itself the scheme needs to execute a proposal. The proposals are executed after it reaches a certain amount of votes or stakes over time, the amount of votes, staked and time that has to passed depends on the scheme configuration. An scheme who will have access to the DXdao avatar funds will usually take more votes, stakes and time than a scheme who make calls form itself, this means that funds can be allocated in the schemes as well, but this schemes will have only access to the funds held by themselves.

# Proposal States
## In Queue
A proposal that needs the queuedVoteRequiredPercentage % of votes sets in the proposal scheme to pass.

## Pre Boosted
A proposal that has enough stakes to pass be boosted state but cant be boosted just yet.

## Pending Boost
A proposal that has enough stakes to pass to boosted state.

## Boosted
A proposal that needs the boostedVoteRequiredPercentage % of votes sets in the proposal scheme to pass.

## Quiet Ending Period
A proposal that changed the winning option in the amount of seconds specified as quietEndingPeriod before finishing, this will extend the proposal time for quietEndingPeriod seconds. The quietEndingPeriod is specified in the scheme configuration where the proposal was submitted.

## Pending Execution
A proposal that got enough votes and is ready to be executed.

## Execution Failed
A proposal that was executed after it passed but it execution failed.

## Execution Succeded
A proposal that was executed after it passed but it execution succeeded.

## Expired in Queue
A proposal that spent too much time in Queue state and didnt get enough votes to pass.

# How does voting works?
A proposal needs a minimum amount of votes to pass, and that depends on the state of the proposal at the moment of execution. If a proposal is in Boosted state it will need the boostedVoteRequiredPercentage percentage amount specified in the scheme configuration where the proposal was created of votes in favor to be executed. If a proposal reaches the queuedVoteRequiredPercentage percentage amount of votes it gets executed instantly. This means that any proposal in Queued state will need that amount of votes to pass.

# How does staking works?
A proposal can receives a financial stake in DXD to speed up the voting process. If a proposal receives enough positive stakes to boost it will enter pre-boosted state, once the pre-boosted state finish if the proposal still has enough DXD staked to boost it will be boosted in the next voting machine action (vote, stake, or voting machine execution). If a proposal is in Boosted state it will need the boostedVoteRequiredPercentage percentage amount specified in the scheme configuration where the proposal was created of votes in favor to be executed.

# How do I get DXD?
You can get rinkeby DXD buying DXD in dxtrust rinkeby here: https://levelkdev.github.io/dxtrust/

# How are proposals created?
Each proposal has a title, description and calls to be exected by the wallet scheme where it is proposed. The description of the proposal is stored in IPFS, and we save the hash of the IPFS description in the blokchain next to the proposal title and calls. When creating a proposal you first need to submit the description to IPFS and once you get the IPFS hash of the description the proposal can be submited by sending a transaction to the wallet scheme smart contract.

# External APIs
The app allows you to add external API services. Use Pinata to help DXdao by pinning the proposal description and important documents in you pinata account. Use Etherscan to decode proposal calls and know what the proposal will execute.

# Schemes Configuration
## Scheme Parameters
### name
The name of the scheme, this will be used to identify the scheme by name in DXvote dapp.

### callToController
If the scheme make calls to the controller or not. A Scheme that makes calls to a controller will make calls from the dxdao avatar (which gives access to the dxdao funds) and a scheme that do not call the controller will make call directly from itself, which means that it will have access only to the funds held in the scheme address.

### maxSecondsForExecution
This is the amount of time that a proposal has to be executed in the scheme, this is useful to "clean" proposals that weren't successful or weren't able to be executed for some reason. This means that if a proposal passes in 3 days in the voting machine and the maxSecondsForExecution are 6 days it will have 3 days to be executed, after that it will be marked in ExecutionTimeout state and wont be able to be executed again, reaching a state of termination.

### maxRepPercentageToMint
This is the maximum amount of rep in percentage allowed to be minted by proposal, the value can be between 0-100, if a proposal execution mints 5% of REP and the maxRepPercentageToMint equals 3, it will fail.

## Controller Permissions
This are four values that determine what the scheme can do in the dxdao controller contract, the most powerful contract in the stack, the only two values that we use from it are canRegisterSchemes and canGenericCall. canRegisterSchemes allows the addition/removal of schemes and the canGenericCall allows the execution of calls in the avatar contract.

## Permission Registry Permissions
This permissions are checked before a proposal execution to check that the total value transferred by asset and the functions to be called are allowed. If a scheme make calls to the controller the permissions are checked from the avatar address. The permissions are set by asset, specifying the sender and receiver addresses, the signature of the function to be used and the value to be transferred. It allows the use of "wildcard" permissions by using 0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa for any address and 0xaaaaaaaa for any signature. It also allows the use of global transfer limits, by setting the limit by asset using the scheme as receiver address, any value recorded here will be used as global transfer limit in the proposal check.

## Voting Machine Params
### queuedVoteRequiredPercentage
The percentage of votes required to execute a proposal in queued state.

### boostedVoteRequiredPercentage
The percentage of votes required to execute a proposal in boosted state.

### queuedVotePeriodLimit
The amount of time that a proposal will be in queue state (not boosted), once the time limit is reached and the proposal was not executed it finish.

### boostedVotePeriodLimit
The amount of time that a proposal will be in boost state (after pre-boosted), once the time limit is reached and the proposal was not executed it finish.

### preBoostedVotePeriodLimit
The amount of time that a proposal will be in pre-boosted state. A proposal gets into pre-boosted state when it has enough.

### thresholdConst
The constant used to calculate the needed upstakes in a proposal to reach boosted state, where the upstakes needed equal to downStakes * (thresholdConst ** (numberOfBoostedProposals)) taking in count the number of boosted proposals at the moment of the pre-boost to boosted state change.

### quietEndingPeriod
The amount of time a proposal has to have the same winning option before it finish, if the winning option change during that time the proposal finish time will be extended till the winning option doesn't change during that time.

proposingRepReward
The fixed amount of REP that will be minted to the address who created the proposal.

### votersReputationLossRatio
The percentage of REP a voter will loose if the voter voted a proposal in queue state for the loosing option.

### minimumDaoBounty
The minimum amount to be set as downstake when a proposal is created.

### daoBountyConst
The downstake for proposal is calculated when the proposal is created, by using the formula: (daoBountyConst * averageBoostDownstakes) / 100. If the value calculated is higher than minimumDaoBounty then this value will be used, if not the start downstake of the proposal will be minimumDaoBounty.
`

  return (
    <FAQBox id="FAQBody">
      <MDEditor.Markdown source={ FAQBody } style={{
        padding: "20px 10px"
      }} />
    </FAQBox>
  );
});

export default FAQPage;
