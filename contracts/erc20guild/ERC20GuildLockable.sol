// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "./ERC20Guild.sol";

/// @title ERC20GuildLockable -DRAFT
/// @author github:AugustoL
/// @notice This smart contract has not be audited.
/// @dev Extends an ERC20Guild to vote only with locked tokens
/// The votes used in the proposals equals the amount of tokens locked by the voter.
/// The tokens can be released back to the voter after a lock time measured in seconds.
contract ERC20GuildLockable is ERC20Guild {

    struct TokenLock {
      uint256 amount;
      uint256 timestamp;
    }
    mapping(address => TokenLock) public tokensLocked;
    uint256 public totalLocked;
    
    uint256 public lockTime;

    event TokensLocked(address voter, uint256 value);
    event TokensReleased(address voter, uint256 value);

    /// @dev Initilizer
    /// @param _token The address of the token to be used
    /// @param _proposalTime The minimun time for a proposal to be under votation
    /// @param _votesForExecution The token votes needed for a proposal to be executed
    /// @param _votesForCreation The minimum balance of tokens needed to create a proposal
    /// @param _lockTime The minimum amount of seconds that the tokens would be locked
    function initialize(
        address _token,
        uint256 _proposalTime,
        uint256 _votesForExecution,
        uint256 _votesForCreation,
        string  memory _name,
        uint256 _lockTime
    ) public {
        require(_lockTime > 0, "ERC20Guild: lockTime should be higher than zero");
        super.initialize(_token, _proposalTime, _votesForExecution, _votesForCreation, _name);
        lockTime = _lockTime;
    }

    /// @dev Set the ERC20Guild configuration, can be called only executing a proposal 
    /// or when it is initilized
    /// @param _proposalTime The minimun time for a proposal to be under votation
    /// @param _votesForExecution The token votes needed for a proposal to be executed
    /// @param _votesForCreation The minimum balance of tokens needed to create a proposal
    /// @param _lockTime The minimum amount of seconds that the tokens would be locked
    function setConfig(
        uint256 _proposalTime,
        uint256 _votesForExecution,
        uint256 _votesForCreation,
        uint256 _lockTime
    ) public {
        require(_lockTime > 0, "ERC20Guild: lockTime should be higher than zero");
        super.setConfig(_proposalTime, _votesForExecution, _votesForCreation);
        lockTime = _lockTime;
    }
    
    /// @dev Override standard setConfig method from ERC20Guild
    /// @param _proposalTime The minimun time for a proposal to be under votation
    /// @param _votesForExecution The token votes needed for a proposal to be executed
    /// @param _votesForCreation The minimum balance of tokens needed to create a proposal
    function setConfig(
        uint256 _proposalTime,
        uint256 _votesForExecution,
        uint256 _votesForCreation
    ) public {
        revert("ERC20Guild: Cant call standard setConfig method of ERC20Guild");
    }
    
    /// @dev Lock tokens in the guild to be used as voting power
    /// @param amount The amount of tokens to be locked
    function lockTokens(uint256 amount) public {
        token.transferFrom(msg.sender, address(this), amount);
        tokensLocked[msg.sender].amount = tokensLocked[msg.sender].amount.add(amount);
        tokensLocked[msg.sender].timestamp = block.timestamp.add(lockTime);
        totalLocked = totalLocked.add(amount);
        emit TokensLocked(msg.sender, amount);
    }

    /// @dev Release tokens locked in the guild, this will decrease the voting power
    /// @param amount The amount of tokens to be released
    function releaseTokens(uint256 amount) public {
        require(votesOf(msg.sender) >= amount, "ERC20GuildLockable: Unable to release more tokens than locked");
        require(tokensLocked[msg.sender].timestamp < block.timestamp, "ERC20GuildLockable: Tokens still locked");
        tokensLocked[msg.sender].amount = tokensLocked[msg.sender].amount.sub(amount);
        totalLocked = totalLocked.sub(amount);
        token.transfer(msg.sender, amount);
        emit TokensReleased(msg.sender, amount);
    }
    
    /// @dev Get the ERC20 voting power of an address
    /// @param account The address of the token account
    function votesOf(address account) public view returns(uint256) {
        return tokensLocked[account].amount;
    }

}
