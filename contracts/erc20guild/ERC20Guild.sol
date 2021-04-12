// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/math/MathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "../utils/TokenVault.sol";
import "../utils/Arrays.sol";

/// @title ERC20Guild
/// @author github:AugustoL
/// @dev Extends an ERC20 functionality into a Guild, adding a simple governance system over an ERC20 token.
/// An ERC20Guild is a simple organization that execute actions if a minimun amount of positive votes are reached in 
/// a certain amount of time.
/// In order to vote a token hodler need to lock tokens in the guild.
/// The tokens are locked for a minimum amount of time.
/// The voting power equals the amount of tokens locked in the guild.
/// A proposal is executed only when the mimimum amount of votes are reached before it finishes.
/// The guild can execute only allowed functions, if a function is not allowed it first will need to set the allowance
/// for it and then after being succesfully added to allowed functions a proposal for it execution can be created.
/// Once a proposal is approved it can execute only once during a certain period of time.
contract ERC20Guild is Initializable {
    using SafeMathUpgradeable for uint256;
    using MathUpgradeable for uint256;
    using ECDSAUpgradeable for bytes32;
    using Arrays for uint256[];
    
    enum ProposalState {Submitted, Rejected, Executed, Failed}

    IERC20Upgradeable public token;
    bool public initialized;
    string public name;
    uint256 public proposalTime;
    uint256 public timeForExecution;
    uint256 public votesForExecution;
    uint256 public votesForCreation;
    uint256 public voteGas;
    uint256 public maxGasPrice;
    uint256 public lockTime;
    uint256 public totalLocked;
    TokenVault public tokenVault;
    uint256 public proposalNonce;
    
    // All the signed votes that were executed, to avoid double signed vote execution.
    mapping(bytes32 => bool) public signedVotes;
    
    // The signatures of the functions allowed, indexed first by address and then by function signature
    mapping(address => mapping(bytes4 => bool)) public callPermissions;
    
    // The tokens locked indexed by token holder address.
    struct TokenLock {
      uint256 amount;
      uint256 timestamp;
    }
    mapping(address => TokenLock) public tokensLocked;
    
    // Proposals indexed by proposal id.
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
        ProposalState state;
        uint256 snapshotId;
        mapping(address => uint256) votes;
    }
    mapping(bytes32 => Proposal) public proposals;
    
    // Array to keep track of the proposalsIds in contract storage
    bytes32[] public proposalsIds;
    
    // Snapshotted values have arrays of ids and the value corresponding to that id. These could be an array of a
    // Snapshot struct, but that would impede usage of functions that work on an array.
    struct Snapshots {
        uint256[] ids;
        uint256[] values;
    }

    // The snapshots used for votes and total tokens locked.
    mapping (address => Snapshots) private _votesSnapshots;
    Snapshots private _totalLockedSnapshots;

    // Snapshot ids increase monotonically, with the first value being 1. An id of 0 is invalid.
    uint256 private _currentSnapshotId;
    
    event ProposalCreated(bytes32 indexed proposalId);
    event ProposalRejected(bytes32 indexed proposalId);
    event ProposalExecuted(bytes32 indexed proposalId);
    event ProposalEnded(bytes32 indexed proposalId);
    event VoteAdded(bytes32 indexed proposalId, address voter, uint256 amount);
    event VoteRemoved(bytes32 indexed proposalId, address voter, uint256 amount);
    event SetAllowance(address indexed to, bytes4 functionSignature, bool allowance);
    event TokensLocked(address voter, uint256 value);
    event TokensReleased(address voter, uint256 value);
    
    /// @dev Allows the voting machine to receive ether to be used to refund voting costs
    fallback() external payable {}
    receive() external payable {}
    
    /// @dev Initialized modifier to require the contract to be initialized
    modifier isInitialized() {
        require(initialized, "ERC20Guild: Not initilized");
        _;
    }
    
    /// @dev Initilizer
    /// @param _token The address of the token to be used
    /// @param _proposalTime The minimun time for a proposal to be under votation
    /// @param _timeForExecution The amount of time that has a proposal has to be executed before being ended
    /// @param _votesForExecution The token votes needed for a proposal to be executed
    /// @param _votesForCreation The minimum balance of tokens needed to create a proposal
    /// @param _voteGas The gas to be used to calculate the vote gas refund
    /// @param _maxGasPrice The maximum gas price to be refunded
    /// @param _lockTime The minimum amount of seconds that the tokens would be locked
    function initialize(
        address _token,
        uint256 _proposalTime,
        uint256 _timeForExecution,
        uint256 _votesForExecution,
        uint256 _votesForCreation,
        string memory _name,
        uint256 _voteGas,
        uint256 _maxGasPrice,
        uint256 _lockTime
    ) public virtual initializer {
        require(address(_token) != address(0), "ERC20Guild: token is the zero address");
        name = _name;
        token = IERC20Upgradeable(_token);
        tokenVault = new TokenVault();
        tokenVault.initialize(address(token), address(this));
        _setConfig(
          _proposalTime,
          _timeForExecution,
          _votesForExecution,
          _votesForCreation,
          _voteGas,
          _maxGasPrice,
          _lockTime
        );
        callPermissions[address(this)][
          bytes4(keccak256("setConfig(uint256,uint256,uint256,uint256,uint256,uint256,uint256)"))
        ] = true;
        callPermissions[address(this)][bytes4(keccak256("setAllowance(address[],bytes4[],bool[])"))] = true;
        initialized = true;
    }
    
    /// @dev Set the ERC20Guild configuration, can be called only executing a proposal 
    /// or when it is initilized
    /// @param _proposalTime The minimun time for a proposal to be under votation
    /// @param _timeForExecution The amount of time that has a proposal has to be executed before being ended
    /// @param _votesForExecution The token votes needed for a proposal to be executed
    /// @param _votesForCreation The minimum balance of tokens needed to create a proposal
    /// @param _voteGas The gas to be used to calculate the vote gas refund
    /// @param _maxGasPrice The maximum gas price to be refunded
    /// @param _lockTime The minimum amount of seconds that the tokens would be locked
    function setConfig(
        uint256 _proposalTime,
        uint256 _timeForExecution,
        uint256 _votesForExecution,
        uint256 _votesForCreation,
        uint256 _voteGas,
        uint256 _maxGasPrice,
        uint256 _lockTime
    ) public virtual {
        _setConfig(
          _proposalTime,
          _timeForExecution,
          _votesForExecution,
          _votesForCreation,
          _voteGas,
          _maxGasPrice,
          _lockTime
        );
    }
    
    /// @dev Set the allowance of a call to be executed by the guild
    /// @param to The address to be called
    /// @param functionSignature The signature of the function
    /// @param allowance If the function is allowed to be called or not
    function setAllowance(
        address[] memory to,
        bytes4[] memory functionSignature,
        bool[] memory allowance
    ) public virtual isInitialized {
        require(msg.sender == address(this), "ERC20Guild: Only callable by ERC20guild itself");
        require(
            (to.length == functionSignature.length) && (to.length == allowance.length),
            "ERC20Guild: Wrong length of to, functionSignature or allowance arrays"
        );
        for (uint256 i = 0; i < to.length; i++) {
            require(functionSignature[i] != bytes4(0), "ERC20Guild: Empty sigantures not allowed");
            callPermissions[to[i]][functionSignature[i]] = allowance[i];
            emit SetAllowance(to[i], functionSignature[i], allowance[i]);
        }
        require(
          callPermissions[address(this)][
            bytes4(keccak256("setConfig(uint256,uint256,uint256,uint256,uint256,uint256,uint256)"))
          ],
          "ERC20Guild: setConfig function allowance cant be turned off"
        );
        require(
          callPermissions[address(this)][bytes4(keccak256("setAllowance(address[],bytes4[],bool[])"))],
          "ERC20Guild: setAllowance function allowance cant be turned off"
        );
    }

    /// @dev Create a proposal with an static call data and extra information
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
    ) public virtual isInitialized returns(bytes32) {
        require(votesOf(msg.sender) >= getVotesForCreation(), "ERC20Guild: Not enough tokens to create proposal");
        require(
            (to.length == data.length) && (to.length == value.length),
            "ERC20Guild: Wrong length of to, data or value arrays"
        );
        require(to.length > 0, "ERC20Guild: to, data value arrays cannot be empty");
        return _createProposal(to, data, value, description, contentHash);
    }
    
    /// @dev Execute a proposal that has already passed the votation time and has enough votes
    /// @param proposalId The id of the proposal to be executed
    function endProposal(bytes32 proposalId) public virtual {
      require(proposals[proposalId].state == ProposalState.Submitted, "ERC20Guild: Proposal already executed");
      require(proposals[proposalId].endTime < block.timestamp, "ERC20Guild: Proposal hasnt ended yet");
      _endProposal(proposalId);
    }
    
    /// @dev Set the amount of tokens to vote in a proposal
    /// @param proposalId The id of the proposal to set the vote
    /// @param amount The amount of votes to be set in the proposal
    function setVote(bytes32 proposalId, uint256 amount) public virtual {
        require(
            votesOfAt(msg.sender, proposals[proposalId].snapshotId) >=  amount,
            "ERC20Guild: Invalid amount"
        );
        _setVote(msg.sender, proposalId, amount);
        _refundVote(msg.sender);
    }

    /// @dev Set the amount of tokens to vote in multiple proposals
    /// @param proposalIds The ids of the proposals to set the votes
    /// @param amounts The amount of votes to be set in each proposal
    function setVotes(bytes32[] memory proposalIds, uint256[] memory amounts) public virtual {
        require(
            proposalIds.length == amounts.length,
            "ERC20Guild: Wrong length of proposalIds or amounts"
        );
        for(uint i = 0; i < proposalIds.length; i ++)
            _setVote(msg.sender, proposalIds[i], amounts[i]);
    }
    
    /// @dev Set the amount of tokens to vote in a proposal using a signed vote
    /// @param proposalId The id of the proposal to set the vote
    /// @param amount The amount of tokens to use as voting for the proposal
    /// @param voter The address of the voter
    /// @param signature The signature of the hashed vote
    function setSignedVote(
        bytes32 proposalId, uint256 amount, address voter, bytes memory signature
    ) public virtual isInitialized {
        bytes32 hashedVote = hashVote(voter, proposalId, amount);
        require(!signedVotes[hashedVote], 'ERC20Guild: Already voted');
        require(
          voter == hashedVote.toEthSignedMessageHash().recover(signature),
          "ERC20Guild: Wrong signer"
        );
        _setVote(voter, proposalId, amount);
        signedVotes[hashedVote] = true;
    }
    
    /// @dev Set the amount of tokens to vote in multiple proposals using signed votes
    /// @param proposalIds The ids of the proposals to set the votes
    /// @param amounts The amounts of tokens to use as voting for each proposals
    /// @param voters The accounts that signed the votes
    /// @param signatures The vote signatures
    function setSignedVotes(
        bytes32[] memory proposalIds, uint256[] memory amounts, address[] memory voters, bytes[] memory signatures
    ) public virtual {
        for (uint i = 0; i < proposalIds.length; i ++) {
            setSignedVote(proposalIds[i], amounts[i], voters[i], signatures[i]);
        }
    }
    
    /// @dev Lock tokens in the guild to be used as voting power
    /// @param amount The amount of tokens to be locked
    function lockTokens(uint256 amount) public virtual {
        _updateAccountSnapshot(msg.sender);
        _updateTotalSupplySnapshot();
        tokenVault.deposit(msg.sender, amount);
        tokensLocked[msg.sender].amount = tokensLocked[msg.sender].amount.add(amount);
        tokensLocked[msg.sender].timestamp = block.timestamp.add(lockTime);
        totalLocked = totalLocked.add(amount);
        emit TokensLocked(msg.sender, amount);
    }

    /// @dev Release tokens locked in the guild, this will decrease the voting power
    /// @param amount The amount of tokens to be released
    function releaseTokens(uint256 amount) public virtual {
        require(votesOf(msg.sender) >= amount, "ERC20Guild: Unable to release more tokens than locked");
        require(tokensLocked[msg.sender].timestamp < block.timestamp, "ERC20Guild: Tokens still locked");
        _updateAccountSnapshot(msg.sender);
        _updateTotalSupplySnapshot();
        tokensLocked[msg.sender].amount = tokensLocked[msg.sender].amount.sub(amount);
        totalLocked = totalLocked.sub(amount);
        tokenVault.withdraw(msg.sender, amount);
        emit TokensReleased(msg.sender, amount);
    }
    
    /// @dev Create a proposal with an static call data and extra information
    /// @param to The receiver addresses of each call to be executed
    /// @param data The data to be executed on each call to be executed
    /// @param value The ETH value to be sent on each call to be executed
    /// @param description A short description of the proposal
    /// @param contentHash The content hash of the content reference of the proposal for the proposal to be executed
    function _createProposal(
        address[] memory to,
        bytes[] memory data,
        uint256[] memory value,
        string memory description,
        bytes memory contentHash
    ) internal returns(bytes32) {
        bytes32 proposalId = keccak256(abi.encodePacked(msg.sender, block.timestamp, proposalNonce));
        proposalNonce = proposalNonce.add(1);
        _currentSnapshotId = _currentSnapshotId.add(1);
        Proposal storage newProposal = proposals[proposalId];
        newProposal.creator = msg.sender;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp.add(proposalTime);
        newProposal.to = to;
        newProposal.data = data;
        newProposal.value = value;
        newProposal.description = description;
        newProposal.contentHash = contentHash;
        newProposal.totalVotes = 0;
        newProposal.state = ProposalState.Submitted;
        newProposal.snapshotId = _currentSnapshotId;
        
        emit ProposalCreated(proposalId);
        _setVote(msg.sender, proposalId, votesOf(msg.sender));
        proposalsIds.push(proposalId);
        return proposalId;
    }
    
    /// @dev Execute a proposal that has already passed the votation time and has enough votes
    /// @param proposalId The id of the proposal to be executed
    function _endProposal(bytes32 proposalId) internal {
        if (
          proposals[proposalId].totalVotes < getVotesForExecution()
          && proposals[proposalId].state == ProposalState.Submitted
        ){
          proposals[proposalId].state = ProposalState.Rejected;
          emit ProposalRejected(proposalId);
        } else if (
          proposals[proposalId].endTime.add(timeForExecution) < block.timestamp
          && proposals[proposalId].state == ProposalState.Submitted
        ) {
          proposals[proposalId].state = ProposalState.Failed;
          emit ProposalEnded(proposalId);
        } else if (proposals[proposalId].state == ProposalState.Submitted) {
          proposals[proposalId].state = ProposalState.Executed;
          for (uint i = 0; i < proposals[proposalId].to.length; i ++) {
            bytes4 proposalSignature = getFuncSignature(proposals[proposalId].data[i]);
            require(
              getCallPermission(proposals[proposalId].to[i], proposalSignature),
              "ERC20Guild: Not allowed call"
              );
              (bool success,) = proposals[proposalId].to[i]
                .call{value: proposals[proposalId].value[i]}(proposals[proposalId].data[i]);
              require(success, "ERC20Guild: Proposal call failed");
            }
            emit ProposalExecuted(proposalId);
        }
    }

    /// @dev Internal function to set the configuration of the guild
    /// @param _proposalTime The minimum time for a proposal to be under votation
    /// @param _timeForExecution The amount of time that has a proposal has to be executed before being ended
    /// @param _votesForExecution The token votes needed for a proposal to be executed
    /// @param _votesForCreation The minimum balance of tokens needed to create a proposal
    /// @param _voteGas The gas to be used to calculate the vote gas refund
    /// @param _maxGasPrice The maximum gas price to be refunded
    /// @param _lockTime The minimum amount of seconds that the tokens would be locked
    function _setConfig(
        uint256 _proposalTime,
        uint256 _timeForExecution,
        uint256 _votesForExecution,
        uint256 _votesForCreation,
        uint256 _voteGas,
        uint256 _maxGasPrice,
        uint256 _lockTime
    ) internal {
      require(
          !initialized || (msg.sender == address(this)),
          "ERC20Guild: Only callable by ERC20guild itself when initialized"
      );
      require(_proposalTime >= 0, "ERC20Guild: proposal time has to be more tha 0");
      require(_votesForExecution > 0, "ERC20Guild: votes for execution has to be more than 0");
      require(_lockTime > 0, "ERC20Guild: lockTime should be higher than zero");
      proposalTime = _proposalTime;
      timeForExecution = _timeForExecution;
      votesForExecution = _votesForExecution;
      votesForCreation = _votesForCreation;
      voteGas = _voteGas;
      maxGasPrice = _maxGasPrice;
      lockTime = _lockTime;
    }

    /// @dev Internal function to set the amount of tokens to vote in a proposal
    /// @param voter The address of the voter
    /// @param proposalId The id of the proposal to set the vote
    /// @param amount The amount of tokens to use as voting for the proposal
    function _setVote(address voter, bytes32 proposalId, uint256 amount) internal isInitialized {
        require(proposals[proposalId].state == ProposalState.Submitted, "ERC20Guild: Proposal already executed");
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
    
    /// @dev Internal function to refund a vote cost to a sender
    /// The refund will be exeuted only if the voteGas is higher than zero and there is enough ETH balance in the guild.
    /// @param toAddress The address where the refund should be sent
    function _refundVote(address payable toAddress) internal isInitialized {
      if (voteGas > 0) {
        uint256 gasRefund = voteGas.mul(tx.gasprice.min(maxGasPrice));
        if (address(this).balance >= gasRefund) {
          toAddress.transfer(gasRefund);
        }
      }
    }

    /// @dev Get the voting power of an address
    /// @param account The address of the account
    function votesOf(address account) public view returns(uint256) {
      return tokensLocked[account].amount;
    }
    
    /// @dev Get the voting power of multiple addresses
    /// @param accounts The addresses of the accounts
    function votesOf(address[] memory accounts) public view virtual returns(uint256[] memory) {
      uint256[] memory votes = new uint256[](accounts.length);
      for (uint i = 0; i < accounts.length; i ++) {
        votes[i] = votesOf(accounts[i]);
      }
      return votes;
    }
    
    /// @dev Get the voting power of an address at a certain snapshotId
    /// @param account The address of the account
    /// @param snapshotId The snapshotId to be used
    function votesOfAt(address account, uint256 snapshotId) public view virtual returns (uint256) {
        (bool snapshotted, uint256 value) = _valueAt(snapshotId, _votesSnapshots[account]);
        if (snapshotted)
            return value;
        else 
            return votesOf(account);
    }
    
    /// @dev Get the voting power of multiple addresses at a certain snapshotId
    /// @param accounts The addresses of the accounts
    /// @param snapshotIds The snapshotIds to be used
    function votesOfAt(address[] memory accounts, uint256[] memory snapshotIds) public view virtual returns(uint256[] memory) {
        uint256[] memory votes = new uint256[](accounts.length);
        for(uint i = 0; i < accounts.length; i ++)
            votes[i] = votesOfAt(accounts[i], snapshotIds[i]);
        return votes;
    }

    /// @dev Get the total amount of tokes locked at a certain snapshotId
    /// @param snapshotId The snapshotId to be used
    function totalLockedAt(uint256 snapshotId) public view virtual returns(uint256) {
        (bool snapshotted, uint256 value) = _valueAt(snapshotId, _totalLockedSnapshots);
        if (snapshotted)
            return value;
        else 
            return totalLocked;
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
    /// @return state If the proposal state
    /// @return snapshotId The snapshotId used for the proposal
    function getProposal(bytes32 proposalId) public view virtual returns(
        address creator,
        uint256 startTime,
        uint256 endTime,
        address[] memory to,
        bytes[] memory data,
        uint256[] memory value,
        string memory description,
        bytes memory contentHash,
        uint256 totalVotes,
        ProposalState state,
        uint256 snapshotId
    ) {
        Proposal storage proposal = proposals[proposalId];
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
            proposal.state,
            proposal.snapshotId
        );
    }

    /// @dev Get the votes of a voter in a proposal
    /// @param proposalId The id of the proposal to get the information
    /// @param voter The address of the voter to get the votes
    /// @return the votes of the voter for the requested proposal
    function getProposalVotes(bytes32 proposalId, address voter) public view virtual returns(uint256) {
        return(proposals[proposalId].votes[voter]);
    }
    
    /// @dev Get minimum amount of votes needed for creation
    function getVotesForCreation() public view virtual returns (uint256) {
        return votesForCreation;
    }
    
    /// @dev Get minimum amount of votes needed for proposal execution
    function getVotesForExecution() public view virtual returns (uint256) {
        return votesForExecution;
    }
    
    /// @dev Get the first four bytes (function signature) of a bytes variable
    function getFuncSignature(bytes memory data) public view virtual returns (bytes4) {
        bytes32 functionSignature = bytes32(0);
        assembly {
            functionSignature := mload(add(data, 32))
        }
        return bytes4(functionSignature);
    }

    /// @dev Get call signature permission
    function getCallPermission(address to, bytes4 functionSignature) public view virtual returns (bool) {
        return callPermissions[to][functionSignature];
    }
    
    /// @dev Get the length of the proposalIds array
    function getProposalsIdsLength() public view virtual returns (uint256) {
        return proposalsIds.length;
    }
    
    /// @dev Get teh hash of the vote, this hash is later signed by the voter.
    /// @param voter The address that will be used to sign the vote
    /// @param proposalId The id fo the proposal to be voted
    function hashVote(address voter, bytes32 proposalId, uint256 amount) public pure returns(bytes32) {
    /// @param amount The amount of votes to be used
        return keccak256(abi.encodePacked(voter, proposalId, amount));
    }
    
    ///
    /// Private functions used to take track of snapshots in contract storage
    ///
    
    function _valueAt(
      uint256 snapshotId, Snapshots storage snapshots
    ) private view returns (bool, uint256) {
        require(snapshotId > 0, "ERC20Guild: id is 0");
        // solhint-disable-next-line max-line-length
        require(snapshotId <= _currentSnapshotId, "ERC20Guild: nonexistent id");

        // When a valid snapshot is queried, there are three possibilities:
        //  a) The queried value was not modified after the snapshot was taken. Therefore, a snapshot entry was never
        //  created for this id, and all stored snapshot ids are smaller than the requested one. The value that corresponds
        //  to this id is the current one.
        //  b) The queried value was modified after the snapshot was taken. Therefore, there will be an entry with the
        //  requested id, and its value is the one to return.
        //  c) More snapshots were created after the requested one, and the queried value was later modified. There will be
        //  no entry for the requested id: the value that corresponds to it is that of the smallest snapshot id that is
        //  larger than the requested one.
        //
        // In summary, we need to find an element in an array, returning the index of the smallest value that is larger if
        // it is not found, unless said value doesn't exist (e.g. when all values are smaller). Arrays.findUpperBound does
        // exactly this.

        uint256 index = snapshots.ids.findUpperBound(snapshotId);

        if (index == snapshots.ids.length) {
            return (false, 0);
        } else {
            return (true, snapshots.values[index]);
        }
    }

    function _updateAccountSnapshot(address account) private {
        _updateSnapshot(_votesSnapshots[account], votesOf(account));
    }

    function _updateTotalSupplySnapshot() private {
        _updateSnapshot(_totalLockedSnapshots, totalLocked);
    }

    function _updateSnapshot(Snapshots storage snapshots, uint256 currentValue) private {
        uint256 currentId = _currentSnapshotId;
        if (_lastSnapshotId(snapshots.ids) < currentId) {
            snapshots.ids.push(currentId);
            snapshots.values.push(currentValue);
        }
    }
    
    function _lastSnapshotId(uint256[] storage ids) private view returns (uint256) {
        if (ids.length == 0) {
            return 0;
        } else {
            return ids[ids.length - 1];
        }
    }

}
