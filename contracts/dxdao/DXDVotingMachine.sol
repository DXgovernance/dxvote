pragma solidity ^0.5.11;

import "../daostack/votingMachines/GenesisProtocol.sol";

/**
 * @title GenesisProtocol implementation designed for DXdao
 *
 * New Features:
 *  - Payable Votes: Any organization can send funds and configure the gas and maxGasPrice to be refunded per vote.
 *  - Signed Votes: Votes can be signed for this or any voting machine, they can shared on this voting machine and
 *    execute votes signed for this voting machine.
 *  - Signal Votes: Voters can signal their decisions with near 50k gas, the signaled votes can be executed on
 *    chain by anyone.
 */
contract DXDVotingMachine is GenesisProtocol {

    struct OrganizationRefunds {
      uint256 balance;
      uint256 voteGas;
      uint256 maxGasPrice;
    }
    
    mapping(address => OrganizationRefunds) public organizationRefunds;
    
    // Event used to share vote signatures on chain
    event VoteSigned(
      address votingMachine,
      bytes32 proposalId,
      address voter,
      uint256 voteDecision,
      uint256 amount,
      bytes signature
    );
    
    struct VoteDecision {
      uint256 voteDecision;
      uint256 amount;
    }
    
    mapping(bytes32 => mapping(address => VoteDecision)) public votesSignaled;
    
    // Event used to signal votes to be executed on chain
    event VoteSignaled(
      bytes32 proposalId,
      address voter,
      uint256 voteDecision,
      uint256 amount
    );
        
    /**
     * @dev Constructor
     */
    constructor(IERC20 _stakingToken) public GenesisProtocol(_stakingToken) {
      require(address(_stakingToken) != address(0), 'wrong _stakingToken');
      stakingToken = _stakingToken;
    }
    
    /**
    * @dev Allows the voting machine to receive ether to be used to refund voting costs
    */
    function() external payable {
      if (organizationRefunds[msg.sender].voteGas > 0)
        organizationRefunds[msg.sender].balance = organizationRefunds[msg.sender].balance.add(msg.value);
    }
    
    /**
    * @dev Config the vote refund for each organization
    * @param _voteGas the amoung of gas that will be used as vote cost
    * @param _maxGasPrice the maximun amount of gas price to be paid, if the gas used is higehr than this value only a
    * portion of the total gas would be refunded
    */
    function setOrganizationRefund(uint256 _voteGas, uint256 _maxGasPrice) public {
      organizationRefunds[msg.sender].voteGas = _voteGas;
      organizationRefunds[msg.sender].maxGasPrice = _maxGasPrice;
    }
    
    /**
     * @dev voting function from old voting machine changing only the logic to refund vote after vote done
     *
     * @param _proposalId id of the proposal
     * @param _vote NO(2) or YES(1).
     * @param _amount the reputation amount to vote with, 0 will use all available REP
     * @param _voter voter address
     * @return bool if the proposal has been executed or not
     */
    function vote(
      bytes32 _proposalId, uint256 _vote, uint256 _amount, address _voter
    ) external votable(_proposalId) returns(bool) {
        Proposal storage proposal = proposals[_proposalId];
        Parameters memory params = parameters[proposal.paramsHash];
        address voter;
        if (params.voteOnBehalf != address(0)) {
            require(msg.sender == params.voteOnBehalf);
            voter = _voter;
        } else {
            voter = msg.sender;
        }
        bool voteResult = internalVote(_proposalId, voter, _vote, _amount);
        _refundVote(proposal.organizationId, msg.sender);
        return voteResult;
    }
    
    /**
     * @dev Share the vote of a proposal for a voting machine on a event log
     *
     * @param votingMachine the voting machine address
     * @param proposalId id of the proposal
     * @param voteDecision the vote decision, NO(2) or YES(1).
     * @param amount the reputation amount to vote with, 0 will use all available REP
     * @param signature the encoded vote signature
     */
    function shareSignedVote(
      address votingMachine,
      bytes32 proposalId,
      uint256 voteDecision,
      uint256 amount,
      bytes calldata signature
    ) external {
      bytes32 voteHashed = hashVote(votingMachine, proposalId, msg.sender, voteDecision, amount);
      require(msg.sender == voteHashed.toEthSignedMessageHash().recover(signature), "wrong signer");
      require(voteDecision > 0, "invalid voteDecision");
      emit VoteSigned(votingMachine, proposalId, msg.sender, voteDecision, amount, signature);
    }
    
    /**
     * @dev Signal the vote of a proposal in this voting machine to be executed later
     *
     * @param proposalId id of the proposal to vote
     * @param voteDecision the vote decisions, NO(2) or YES(1).
     * @param amount the reputation amount to vote with, 0 will use all available REP
     */
    function signalVote(
      bytes32 proposalId, uint256 voteDecision, uint256 amount
    ) external {
      require(_isVotable(proposalId), "not votable proposal");
      require(voteDecision > 0, "invalid voteDecision");
      require(votesSignaled[proposalId][msg.sender].voteDecision == 0, 'already voted');
      votesSignaled[proposalId][msg.sender].voteDecision = voteDecision;
      votesSignaled[proposalId][msg.sender].amount = amount;
      emit VoteSignaled(proposalId, msg.sender, voteDecision, amount);
    }

    /**
     * @dev Execute a signed vote
     *
     * @param votingMachine the voting machine address
     * @param proposalId id of the proposal to execute the vote on
     * @param voter the signer of the vote
     * @param voteDecision the vote decision, NO(2) or YES(1).
     * @param amount the reputation amount to vote with, 0 will use all available REP
     * @param signature the signature of the hashed vote
     */
    function executeSignedVote(
      address votingMachine,
      bytes32 proposalId,
      address voter,
      uint256 voteDecision,
      uint256 amount,
      bytes calldata signature
    ) external {
      require(votingMachine == address(this), "wrong votingMachine");
      require(_isVotable(proposalId), "not votable proposal");
      require(voteDecision > 0, "wrong voteDecision");
      require(
        voter ==
          hashVote(votingMachine, proposalId, voter, voteDecision, amount)
            .toEthSignedMessageHash().recover(signature),
        "wrong signer"
      );
      internalVote(proposalId, voter, voteDecision, amount);
      _refundVote(proposals[proposalId].organizationId, msg.sender);
    }
    
    /**
     * @dev Execute a signed vote on a votable proposal
     *
     * @param proposalId id of the proposal to vote
     * @param voter the signer of the vote
     * @param voteDecision the vote decisions, NO(2) or YES(1).
     * @param amount the reputation amount to vote with, 0 will use all available REP
     */
    function executeSignaledVote(
      bytes32 proposalId,
      address voter,
      uint256 voteDecision,
      uint256 amount
    ) external {
      require(_isVotable(proposalId), "not votable proposal");
      require(voteDecision > 0, "wrong voteDecision");
      require(votesSignaled[proposalId][voter].voteDecision > 0, "wrong vote shared");
      internalVote(proposalId, voter, voteDecision, amount);
      delete votesSignaled[proposalId][voter];
      _refundVote(proposals[proposalId].organizationId, msg.sender);
    }
    
    /**
     * @dev Refund a vote gas cost to an address
     *
     * @param organizationId the id of the organization that should do the refund
     * @param toAddress the address where the refund should be sent
     */
    function _refundVote(bytes32 organizationId, address payable toAddress) internal {
      address orgAddress = organizations[organizationId];
      if (organizationRefunds[orgAddress].voteGas > 0) {
        uint256 gasRefund = organizationRefunds[orgAddress].voteGas
          .mul(tx.gasprice.min(organizationRefunds[orgAddress].maxGasPrice));
        if (organizationRefunds[orgAddress].balance >= gasRefund) {
          toAddress.transfer(gasRefund);
          organizationRefunds[orgAddress].balance = organizationRefunds[orgAddress].balance.sub(gasRefund);
        }
      }
    }
    
    /**
     * @dev Hash the vote data that is used for signatures
     *
     * @param votingMachine the voting machine address
     * @param proposalId id of the proposal
     * @param voter the signer of the vote
     * @param voteDecision the vote decision, NO(2) or YES(1).
     * @param amount the reputation amount to vote with, 0 will use all available REP
     */
    function hashVote(
      address votingMachine,
      bytes32 proposalId,
      address voter,
      uint256 voteDecision,
      uint256 amount
    ) public pure returns(bytes32) {
      return keccak256(abi.encodePacked(votingMachine, proposalId, voter, voteDecision, amount));
    }
    
    /**
    * @dev proposalStatusWithVotes return the total votes, preBoostedVotes and stakes for a given proposal
    * @param _proposalId the ID of the proposal
    * @return uint256 votes YES
    * @return uint256 votes NO
    * @return uint256 preBoostedVotes YES
    * @return uint256 preBoostedVotes NO
    * @return uint256 total stakes YES
    * @return uint256 total stakes NO
    */
    function proposalStatusWithVotes(bytes32 _proposalId) external view returns(
      uint256, uint256, uint256, uint256, uint256, uint256
    ) {
      return (
        proposals[_proposalId].votes[YES],
        proposals[_proposalId].votes[NO],
        proposals[_proposalId].preBoostedVotes[YES],
        proposals[_proposalId].preBoostedVotes[NO],
        proposals[_proposalId].stakes[YES],
        proposals[_proposalId].stakes[NO]
      );
    }

}
