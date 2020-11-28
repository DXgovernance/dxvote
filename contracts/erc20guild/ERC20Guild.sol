// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

/// @title ERC20Guild - DRAFT
/// @author github:AugustoL
/// @notice This smart contract has not be audited
/// @dev Extends an ERC20 functionality into a Guild.
/// An ERC20Guild can make decisions by creating proposals
/// and vote on the token balance as voting power.
contract ERC20Guild {
    using SafeMath for uint256;

    IERC20 public token;
    bool public initialized = false;
    string public name;
    uint256 public proposalTime;
    uint256 public votesForExecution;
    uint256 public votesForCreation;
    
    struct Proposal {
        address creator;
        uint256 startTime;
        uint256 endTime;
        address[] to;
        bytes[] data;
        uint256[] value;
        string description;
        bytes contentHash;
        uint256 totalVotes;
        bool executed;
        mapping(address => uint256) votes;
    }

    mapping(bytes32 => Proposal) public proposals;
    
    event ProposalCreated(bytes32 indexed proposalId);
    event ProposalExecuted(bytes32 indexed proposalId);
    event VoteAdded(bytes32 indexed proposalId, address voter, uint256 amount);
    event VoteRemoved(bytes32 indexed proposalId, address voter, uint256 amount);
    
    /// @dev Initialized modifier to require the contract to be initialized
    modifier isInitialized() {
        require(initialized, "ERC20Guild: Not initilized");
        _;
    }

    /// @dev Initializer
    /// @param _token The address of the token to be used
    /// @param _proposalTime The minimum time for a proposal to be under votation
    /// @param _votesForExecution The token votes needed for a proposal to be executed
    /// @param _votesForCreation The minimum balance of tokens needed to create a proposal
    function initialize(
        address _token,
        uint256 _proposalTime,
        uint256 _votesForExecution,
        uint256 _votesForCreation,
        string memory _name
    ) public {
        require(address(_token) != address(0), "ERC20Guild: token is the zero address");  
        name = _name;
        token = IERC20(_token);
        _setConfig(_proposalTime, _votesForExecution, _votesForCreation);
        initialized = true;
    }
    
    /// @dev Set the ERC20Guild configuration, can be called only executing a proposal
    /// or when it is initialized
    /// @param _proposalTime The minimum time for a proposal to be under votation
    /// @param _votesForExecution The token votes needed for a proposal to be executed
    /// @param _votesForCreation The minimum balance of tokens needed to create a proposal
    function setConfig(
        uint256 _proposalTime,
        uint256 _votesForExecution,
        uint256 _votesForCreation
    ) public {
        _setConfig(_proposalTime, _votesForExecution, _votesForCreation);
    }

    /// @dev Create a proposal with an static call data and extra information
    /// @param to The receiver addresses of each call to be executed
    /// @param data The data to be executed on each call to be executed
    /// @param value The ETH value to be sent on each call to be executed
    /// @param description A short description of the proposal
    /// @param contentHash The content hash of the content reference of the proposal
    /// for the proposal to be executed
    function createProposal(
        address[] memory to,
        bytes[] memory data,
        uint256[] memory value,
        string memory description,
        bytes memory contentHash
    ) public isInitialized returns(bytes32) {
        require(
            votesOf(msg.sender) >= votesForCreation,
            "ERC20Guild: Not enough tokens to create proposal"
        );
        require(
            (to.length == data.length) && (to.length == value.length),
            "ERC20Guild: Wrong length of to, data or value arrays"
        );
        require(
            to.length > 0,
            "ERC20Guild: to, data value arrays cannot be empty"
        );
        bytes32 proposalId = keccak256(abi.encodePacked(msg.sender, now));
        proposals[proposalId] = Proposal(
            msg.sender,
            now,
            now.add(proposalTime),
            to,
            data,
            value,
            description,
            contentHash,
            votesOf(msg.sender),
            false
        );
        
        emit ProposalCreated(proposalId);
        return proposalId;
    }
    
    /// @dev Execute a proposal that has already passed the votation time and has enough votes
    /// @param proposalId The id of the proposal to be executed
    function executeProposal(bytes32 proposalId) public isInitialized {
        require(!proposals[proposalId].executed, "ERC20Guild: Proposal already executed");
        require(proposals[proposalId].endTime < now, "ERC20Guild: Proposal hasnt ended yet");
        require(
            proposals[proposalId].totalVotes >= votesForExecution,
            "ERC20Guild: Not enough tokens to execute proposal"
        );
        for (uint i = 0; i < proposals[proposalId].to.length; i ++) {
            (bool success,) = proposals[proposalId].to[i]
                .call.value(proposals[proposalId].value[i])(proposals[proposalId].data[i]);
            require(success, "ERC20Guild: Proposal call failed");
        }
        proposals[proposalId].executed = true;
        emit ProposalExecuted(proposalId);
    }
    
    /// @dev Set the amount of tokens to vote in a proposal
    /// @param proposalId The id of the proposal to set the vote
    /// @param amount The amount of tokens to use as voting for the proposal
    function setVote(bytes32 proposalId, uint256 amount) public isInitialized {
        _setVote(msg.sender, proposalId, amount);
    }

    /// @dev Set the amount of tokens to vote in multiple proposals
    /// @param proposalIds The ids of the proposals to set the votes
    /// @param amounts The amounts of tokens to use as voting for each proposals
    function setVotes(bytes32[] memory proposalIds, uint256[] memory amounts) public {
        require(
            proposalIds.length == amounts.length,
            "ERC20Guild: Wrong length of proposalIds or amounts"
        );
        for(uint i = 0; i < proposalIds.length; i ++)
            _setVote(msg.sender, proposalIds[i], amounts[i]);
    }

    /// @dev Internal function to set the configuration of the guild
    /// @param _proposalTime The minimum time for a proposal to be under votation
    /// @param _votesForExecution The token votes needed for a proposal to be executed
    /// @param _votesForCreation The minimum balance of tokens needed to create a proposal
    function _setConfig(
        uint256 _proposalTime,
        uint256 _votesForExecution,
        uint256 _votesForCreation
    ) internal {
      require(
          !initialized || (msg.sender == address(this)),
          "ERC20Guild: Only callable by ERC20guild itself when initialized"
      );
      require(_proposalTime >= 0, "ERC20Guild: proposal time has to be more tha 0");
      require(_votesForExecution > 0, "ERC20Guild: votes for execution has to be more than 0");
      proposalTime = _proposalTime;
      votesForExecution = _votesForExecution;
      votesForCreation = _votesForCreation;
    }

    /// @dev Internal function to set the amount of tokens to vote in a proposal
    /// @param voter The address of the voter
    /// @param proposalId The id of the proposal to set the vote
    /// @param amount The amount of tokens to use as voting for the proposal
    function _setVote(address voter, bytes32 proposalId, uint256 amount) internal {
        require(!proposals[proposalId].executed, "ERC20Guild: Proposal already executed");
        require(votesOf(voter) >=  amount, "ERC20Guild: Invalid amount");
        if (amount > proposals[proposalId].votes[voter]) {
            proposals[proposalId].totalVotes = proposals[proposalId].totalVotes.add(
                amount.sub(proposals[proposalId].votes[voter])
            );
            emit VoteAdded(
                proposalId, voter, amount.sub(proposals[proposalId].votes[voter])
            );
        } else {
            proposals[proposalId].totalVotes = proposals[proposalId].totalVotes.sub(
                proposals[proposalId].votes[voter].sub(amount)
            );
            emit VoteRemoved(
                proposalId, voter, proposals[proposalId].votes[voter].sub(amount)
            );
        }
        proposals[proposalId].votes[voter] = amount;
    }

    /// @dev Get the voting power of an address
    /// @param account The address of the token account
    function votesOf(address account) public view returns(uint256) {
      return token.balanceOf(account);
    }
    
    /// @dev Get the voting power of multiple addresses
    /// @param accounts The addresses of the token accounts
    function votesOf(address[] memory accounts) public view returns(uint256[] memory) {
      uint256[] memory votes = new uint256[](accounts.length);
      for (uint i = 0; i < accounts.length; i ++) {
        votes[i] = votesOf(accounts[i]);
      }
      return votes;
    }

    /// @dev Get the information of a proposal
    /// @param proposalId The id of the proposal to get the information
    /// @return creator The address that created the proposal
    /// @return startTime The time at the proposal was created
    /// @return endTime The time at the proposal will end
    /// @return to The receiver addresses of each call to be executed
    /// @return data The data to be executed on each call to be executed
    /// @return value The ETH value to be sent on each call to be executed
    /// @return description A short description of the proposal
    /// @return contentHash The content hash of the content reference of the proposal
    /// @return totalVotes The total votes of the proposal
    /// @return executed If the proposal was executed or not
    function getProposal(bytes32 proposalId) public returns(
        address creator,
        uint256 startTime,
        uint256 endTime,
        address[] memory to,
        bytes[] memory data,
        uint256[] memory value,
        string memory description,
        bytes memory contentHash,
        uint256 totalVotes,
        bool executed
    ) {
        Proposal memory proposal = proposals[proposalId];
        return(
            proposal.creator,
            proposal.startTime,
            proposal.endTime,
            proposal.to,
            proposal.data,
            proposal.value,
            proposal.description,
            proposal.contentHash,
            proposal.totalVotes,
            proposal.executed
        );
    }

    /// @dev Get the votes of a voter of a proposal
    /// @param proposalId The id of the proposal to get the information
    /// @param voter The address of the voter to get the votes
    /// @return the votes of the voter for the proposalId
    function getProposalVotes(bytes32 proposalId, address voter) public returns(uint256) {
        return(proposals[proposalId].votes[voter]);
    }

}
