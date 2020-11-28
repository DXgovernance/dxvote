// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "./ERC20GuildLockable.sol";
import "../utils/Arrays.sol";

/// @title ERC20GuildSnapshot - DRAFT
/// @author github:AugustoL
/// @notice This smart contract has not be audited.
/// @dev Extends the ERC20GuildLockable to save snapshots of the lockable votes per proposal.
/// Saves a snapshot of the votes each time a lock or release happens.
/// Proposals can be voted by voters using their locked tokens at the time of proposal creation.
contract ERC20GuildSnapshot is ERC20GuildLockable {

    using SafeMath for uint256;
    using Arrays for uint256[];

    // Snapshotted values have arrays of ids and the value corresponding to that id. These could be an array of a
    // Snapshot struct, but that would impede usage of functions that work on an array.
    struct Snapshots {
        uint256[] ids;
        uint256[] values;
    }
    
    mapping(bytes32 => uint256) public proposalSnapshots;

    mapping (address => Snapshots) private _votesSnapshots;
    Snapshots private _totalLockedSnapshots;

    // Snapshot ids increase monotonically, with the first value being 1. An id of 0 is invalid.
    uint256 private _currentSnapshotId;

    /// @dev Get the voting power of an address at a certain snapshotId
    /// @param account The address of the token account
    /// @param snapshotId The snapshotId to be used
    function votesOfAt(address account, uint256 snapshotId) public view returns (uint256) {
        (bool snapshotted, uint256 value) = _valueAt(snapshotId, _votesSnapshots[account]);
        if (snapshotted)
            return value;
        else 
            return votesOf(account);
    }
    
    /// @dev Get the voting power of multiple addressese at a certain snapshotId
    /// @param accounts The addresses of the token accounts
    /// @param snapshotIds The snapshotIds to be used
    function votesOfAt(address[] memory accounts, uint256[] memory snapshotIds) public view returns(uint256[] memory) {
        uint256[] memory votes = new uint256[](accounts.length);
        for(uint i = 0; i < accounts.length; i ++)
            votes[i] = votesOfAt(accounts[i], snapshotIds[i]);
        return votes;
    }

    /// @dev Get the total amount of tokes locked at a certain snapshotId
    function totalLockedAt(uint256 snapshotId) public view returns(uint256) {
        (bool snapshotted, uint256 value) = _valueAt(snapshotId, _totalLockedSnapshots);

        if (snapshotted)
            return value;
        else 
            return totalLocked;
    }

    /// @dev Lock tokens in the guild to be used as voting power
    /// It saves a snapshot of the sender balance and total supply
    /// @param amount The amount of tokens to be locked
    function lockTokens(uint256 amount) public {
      _updateAccountSnapshot(msg.sender);
      _updateTotalSupplySnapshot();
      super.lockTokens(amount);
    }
    
    /// @dev Release tokens locked in the guild, this will decrease the voting power
    /// It saves a snapshot of the sender balance and total supply
    /// @param amount The amount of tokens to be released
    function releaseTokens(uint256 amount) public {
      _updateAccountSnapshot(msg.sender);
      _updateTotalSupplySnapshot();
      super.releaseTokens(amount);
    }
    
    /// @dev Set the amount of tokens to vote in a proposal
    /// @param proposalId The id of the proposal to set the vote
    /// @param amount The amount of tokens to use as voting for the proposal
    function setVote(bytes32 proposalId, uint256 amount) public isInitialized {
        require(
            votesOfAt(msg.sender, proposalSnapshots[proposalId]) >=  amount,
            "ERC20Guild: Invalid amount"
        );
        super.setVote(proposalId, amount);
    }
    
    /// @dev Create a proposal with an static call data and extra information
    /// Saves the snapshot id at the time of the proposal creation
    /// @param to The receiver addresses of each call to be executed
    /// @param data The data to be executed on each call to be executed
    /// @param value The ETH value to be sent on each call to be executed
    /// @param description A short description of the proposal
    /// @param contentHash The content hash of the content reference of the proposal
    /// for teh proposal to be executed
    function createProposal(
        address[] memory to,
        bytes[] memory data,
        uint256[] memory value,
        string memory description,
        bytes memory contentHash
    ) public isInitialized returns(bytes32) {
        bytes32 proposalId = super.createProposal(to, data, value, description, contentHash);
        _currentSnapshotId = _currentSnapshotId.add(1);
        proposalSnapshots[proposalId] = _currentSnapshotId;
        return proposalId;
    }

    function _valueAt(
      uint256 snapshotId, Snapshots storage snapshots
    ) private view returns (bool, uint256) {
        require(snapshotId > 0, "ERC20Snapshot: id is 0");
        // solhint-disable-next-line max-line-length
        require(snapshotId <= _currentSnapshotId, "ERC20Snapshot: nonexistent id");

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
