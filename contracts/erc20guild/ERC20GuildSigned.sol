// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "./ERC20Guild.sol";

/// @title ERC20GuildSigned - DRAFT
/// @author github:AugustoL
/// @notice This smart contract has not be audited.
/// @dev Extends an ERC20Guild to allow vote on behalf of other voters through vote signatures
contract ERC20GuildSigned is ERC20Guild {
    using ECDSA for bytes32;

    mapping(bytes32 => bool) public signedVotes;

    /// @dev Set the amount of tokens to vote in a proposal
    /// @param proposalId The id of the proposal to set the vote
    /// @param amount The amount of tokens to use as voting for the proposal
    /// @param voter The address of the voter
    /// @param signature The signature of the hashed vote
    function setVote(
        bytes32 proposalId, uint256 amount, address voter, bytes memory signature
    ) public isInitialized {
        bytes32 hashedVote = hashVote(voter, proposalId, amount);
        require(!signedVotes[hashedVote], 'ERC20GuildSigned: Already voted');
        require(
          voter == hashedVote.toEthSignedMessageHash().recover(signature),
          "ERC20GuildSigned: Wrong signer"
        );
        _setVote(voter, proposalId, amount);
        signedVotes[hashedVote] = true;
    }
    
    /// @dev Set the amount of tokens to vote in multiple proposals
    /// @param proposalIds The ids of the proposals to set the votes
    /// @param amounts The amounts of tokens to use as voting for each proposals
    /// @param voters The accounts that signed the votes
    /// @param signatures The vote signatures
    function setVotes(
        bytes32[] memory proposalIds, uint256[] memory amounts, address[] memory voters, bytes[] memory signatures
    ) public {
        for (uint i = 0; i < proposalIds.length; i ++) {
            setVote(proposalIds[i], amounts[i], voters[i], signatures[i]);
        }
    }
    
    /// @dev Set the amount of tokens to vote in multiple proposals
    /// @param voter The address of to be used to sign the vote
    /// @param proposalId The id fo the proposal to be votes
    /// @param amount The amount of votes to be hashed
    function hashVote(
        address voter,
        bytes32 proposalId,
        uint256 amount
    ) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(voter, proposalId, amount));
    }
}
