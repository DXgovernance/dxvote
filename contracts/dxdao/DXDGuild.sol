// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "../erc20guild/ERC20Guild.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";

/// @title DXDGuild
/// @author github:AugustoL
/// An ERC20Guild for the DXD token designed to execute votes on Genesis Protocol Voting Machine.
contract DXDGuild is ERC20Guild, OwnableUpgradeable {
    using SafeMathUpgradeable for uint256;
    
    address public votingMachine;
    bytes4 public voteFuncSignature = bytes4(keccak256("vote(bytes32,uint256,uint256,address)"));
    uint256 private _currentSnapshotId;
    
    struct VotingMachineProposals {
      bytes32 positiveProposal;
      bytes32 negativeProposal;
    }
    
    mapping(bytes32 => VotingMachineProposals) public votingMachineProposals;
    mapping(bytes32 => bool) public proposalsForVotingMachine;

    /// @dev Initilizer
    /// @param _token The address of the token to be used
    /// @param _proposalTime The minimun time for a proposal to be under votation
    /// @param _timeForExecution The amount of time that has a proposal has to be executed before being ended
    /// @param _votesForExecution The % of votes needed for a proposal to be executed based on the token total supply.
    /// @param _votesForCreation The % of votes needed for a proposal to be created based on the token total supply.
    /// @param _voteGas The gas to be used to calculate the vote gas refund
    /// @param _maxGasPrice The maximum gas price to be refunded
    /// @param _lockTime The minimum amount of seconds that the tokens would be locked
    /// @param _votingMachine The voting machine where the guild will vote
    function initialize(
        address _token,
        uint256 _proposalTime,
        uint256 _timeForExecution,
        uint256 _votesForExecution,
        uint256 _votesForCreation,
        uint256 _voteGas,
        uint256 _maxGasPrice,
        uint256 _lockTime,
        address _votingMachine
    ) public initializer {
        super.initialize(
          _token,
          _proposalTime,
          _timeForExecution,
          _votesForExecution,
          _votesForCreation,
          "DXDGuild", 
          _voteGas,
          _maxGasPrice,
          _lockTime
        );
        votingMachine = _votingMachine;
        callPermissions[votingMachine][voteFuncSignature] = true;
    }
    
    /// @dev Create a proposal with an static call data and extra information
    /// The proposals created with this function cant call the voting machine.
    /// @param to The receiver addresses of each call to be executed
    /// @param data The data to be executed on each call to be executed
    /// @param value The ETH value to be sent on each call to be executed
    /// @param description A short description of the proposal
    /// @param contentHash The content hash of the content reference of the proposal for the proposal to be executed
    function createProposal(
        address[] memory to,
        bytes[] memory data,
        uint256[] memory value,
        string memory description,
        bytes memory contentHash
    ) override public isInitialized returns(bytes32) {
        require(votesOf(msg.sender) >= getVotesForCreation(), "DXDGuild: Not enough tokens to create proposal");
        require(
            (to.length == data.length) && (to.length == value.length),
            "DXDGuild: Wrong length of to, data or value arrays"
        );
        require(to.length > 0, "DXDGuild: to, data value arrays cannot be empty");
        for (uint i = 0; i < to.length; i ++) {
          require(
            to[i] != votingMachine,
            "DXDGuild: Use createVotingMachineProposal to submit proposals to voting machine"
          );
        }
        return _createProposal(to, data, value, description, contentHash);
    }
    
    /// @dev Execute a proposal that has already passed the votation time and has enough votes
    /// This function cant end voting machine proposals
    /// @param proposalId The id of the proposal to be executed
    function endProposal(bytes32 proposalId) override public {
      require(
        !proposalsForVotingMachine[proposalId],
        "DXDGuild: Use endVotingMachineProposal to end proposals to voting machine"
      );
      require(proposals[proposalId].state == ProposalState.Submitted, "ERC20Guild: Proposal already executed");
      require(proposals[proposalId].endTime < block.timestamp, "ERC20Guild: Proposal hasnt ended yet");
      _endProposal(proposalId);
    }
    
    /// @dev Create two proposals one to vote for a positive and another to vor for negative vote on a proposal on a
    /// voting machine.
    /// @param votingMachineProposalId the proposalId of the voting machine
    function createVotingMachineProposal(
        bytes32 votingMachineProposalId
    ) public isInitialized {
      require(votesOf(msg.sender) >= getVotesForCreation(), "DXDGuild: Not enough tokens to create proposal");      
      address[] memory _to = new address[](1);
      _to[0] = votingMachine;
      bytes[] memory _data = new bytes[](1);
      bytes memory _contentHash = abi.encodePacked(votingMachineProposalId);
      _data[0] = abi.encodeWithSelector(voteFuncSignature, votingMachineProposalId, 1, 0, address(this));
      votingMachineProposals[votingMachineProposalId].positiveProposal = 
        _createProposal( _to, _data, new uint256[](1), string("Positive Vote"), _contentHash );
      proposalsForVotingMachine[votingMachineProposals[votingMachineProposalId].positiveProposal] = true;
      _data[0] = abi.encodeWithSelector(voteFuncSignature, votingMachineProposalId, 2, 0, address(this));
      votingMachineProposals[votingMachineProposalId].negativeProposal = 
        _createProposal( _to, _data, new uint256[](1), string("Negative Vote"), _contentHash );
      proposalsForVotingMachine[votingMachineProposals[votingMachineProposalId].negativeProposal] = true;
    }
    
    /// @dev End positive and negative proposals to vote on a voting machine, executing the one with the higher vote 
    /// count first.
    /// @param votingMachineProposalId the proposalId of the voting machine
    function endVotingMachineProposal(
        bytes32 votingMachineProposalId
    ) public isInitialized {
      Proposal storage positiveProposal = proposals[votingMachineProposals[votingMachineProposalId].positiveProposal];
      Proposal storage negativeProposal = proposals[votingMachineProposals[votingMachineProposalId].negativeProposal];
      require(positiveProposal.state == ProposalState.Submitted, "DXDGuild: Positive proposal already executed");
      require(negativeProposal.state == ProposalState.Submitted, "DXDGuild: Negative proposal already executed");
      require(positiveProposal.endTime < block.timestamp, "DXDGuild: Positive proposal hasnt ended yet");
      require(negativeProposal.endTime < block.timestamp, "DXDGuild: Negative proposal hasnt ended yet");
      
      if (positiveProposal.totalVotes > negativeProposal.totalVotes) {
        _endProposal(votingMachineProposals[votingMachineProposalId].positiveProposal);
        negativeProposal.state = ProposalState.Rejected;
        emit ProposalRejected(votingMachineProposals[votingMachineProposalId].negativeProposal);
      } else {
        _endProposal(votingMachineProposals[votingMachineProposalId].negativeProposal);
        positiveProposal.state = ProposalState.Rejected;
        emit ProposalRejected(votingMachineProposals[votingMachineProposalId].positiveProposal);
      }
    }
    
    /// @dev Get minimum amount of votes needed for creation
    function getVotesForCreation() override public view returns (uint256) {
        return token.totalSupply().mul(votesForCreation).div(100);
    }
    
    /// @dev Get minimum amount of votes needed for proposal execution
    function getVotesForExecution() override public view returns (uint256) {
        return token.totalSupply().mul(votesForExecution).div(100);
    }

}
