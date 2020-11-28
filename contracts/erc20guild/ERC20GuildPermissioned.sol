// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "./ERC20Guild.sol";

/// @title ERC20GuildPermissioned - DRAFT
/// @author github:AugustoL
/// @notice This smart contract has not be audited.
/// @dev ERC20Guild implementation that can execute calls to allowed functions and contracts
contract ERC20GuildPermissioned is ERC20Guild {
    using SafeMath for uint256;

    mapping(address => mapping(bytes4 => bool)) public callPermissions;

    event SetAllowance(address indexed to, bytes4 functionSignature, bool allowance);

    /// @dev Initilizer
    /// @param _token The address of the token to be used
    /// @param _proposalTime The minimun time for a proposal to be under votation
    /// @param _votesForExecution The token votes needed for a proposal to be executed
    /// @param _votesForCreation The minimum balance of tokens needed to create a proposal
    function initialize(
        address _token,
        uint256 _proposalTime,
        uint256 _votesForExecution,
        uint256 _votesForCreation,
        string memory _name
    ) public {
        super.initialize(_token, _proposalTime, _votesForExecution, _votesForCreation, _name);
        callPermissions[address(this)][bytes4(keccak256("setConfig(uint256,uint256,uint256)"))] = true;
        callPermissions[address(this)][bytes4(keccak256("setAllowance(address[],bytes4[],bool[])"))] = true;
    }

    /// @dev Set the allowance of a call to be executed by the guild
    /// @param to The address to be called
    /// @param functionSignature The signature of the function
    /// @param allowance If the function is allowed to be called or not
    function setAllowance(
        address[] memory to,
        bytes4[] memory functionSignature,
        bool[] memory allowance
    ) public isInitialized {
        require(msg.sender == address(this), "ERC20Guild: Only callable by ERC20guild itself");
        require(
            (to.length == functionSignature.length) && (to.length == allowance.length),
            "ERC20Guild: Wrong length of to, functionSignature or allowance arrays"
        );
        for (uint256 i = 0; i < to.length; i++) {
            callPermissions[to[i]][functionSignature[i]] = allowance[i];
            emit SetAllowance(to[i], functionSignature[i], allowance[i]);
        }
    }

    /// @dev Execute a proposal that has already passed the votation time and has enough votes
    /// @param proposalId The id of the proposal to be executed
    function executeProposal(bytes32 proposalId) public isInitialized {
        for (uint256 i = 0; i < proposals[proposalId].to.length; i++) {
            bytes4 proposalSignature = getFuncSignature(proposals[proposalId].data[i]);
            require(
                getCallPermission(proposals[proposalId].to[i], proposalSignature) == true,
                "ERC20GuildPermissioned: Not allowed call"
            );
        }
        super.executeProposal(proposalId);
    }

    /// @dev Get call data signature
    function getFuncSignature(bytes memory data) public view returns (bytes4) {
        bytes32 functionSignature = bytes32(0);
        assembly {
            functionSignature := mload(add(data, 32))
        }
        return bytes4(functionSignature);
    }

    /// @dev Get call signature permission
    function getCallPermission(address to, bytes4 functionSignature) public view returns (bool) {
        return callPermissions[to][functionSignature];
    }
}
