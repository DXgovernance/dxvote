// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "../erc20guild/ERC20GuildPermissioned.sol";
import "../erc20guild/ERC20GuildSnapshot.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/// @title DXDGuild
/// @author github:AugustoL
/// @notice This smart contract has not be audited.
/// An ERC20Guild that can only vote on a voting machine by calling the vote funtion
/// and can be configures only by its owner.
contract DXDGuild is ERC20GuildSnapshot, ERC20GuildPermissioned, Ownable {

  constructor() public ERC20GuildSnapshot() ERC20GuildPermissioned() {}
    
    /// @dev Initilizer
    /// @param _token The address of the token to be used
    /// @param _proposalTime The minimun time for a proposal to be under votation
    /// @param _votesForExecution The token votes needed for a proposal to be executed
    /// @param _votesForCreation The minimum balance of tokens needed to create a proposal
    /// @param votingMachine The voting machine where the guild will vote
    function initialize(
        address _token,
        uint256 _proposalTime,
        uint256 _votesForExecution,
        uint256 _votesForCreation,
        address votingMachine
    ) public {
        super.initialize(_token, _proposalTime, _votesForExecution, _votesForCreation, "DXDGuild");
        callPermissions[votingMachine][bytes4(keccak256("vote(bytes32,uint256,uint256,address)"))] = true;
    }
    
    /// @dev Set the ERC20Guild configuration, can be called only executing a proposal 
    /// or when it is initilized
    /// @param _proposalTime The minimun time for a proposal to be under votation
    /// @param _votesForExecution The token votes needed for a proposal to be executed
    /// @param _votesForCreation The minimum balance of tokens needed to create a proposal
    function setConfig(
        uint256 _proposalTime,
        uint256 _votesForExecution,
        uint256 _votesForCreation
    ) public {
      require(
          !initialized || (msg.sender == owner()), 
          "ERC20Guild: Only callable by ERC20guild owner when initialized"
      );
      
      initialized = true;
      proposalTime = _proposalTime;
      votesForExecution = _votesForExecution;
      votesForCreation = _votesForCreation;
    }

}
