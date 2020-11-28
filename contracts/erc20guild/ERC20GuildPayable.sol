// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "./ERC20Guild.sol";

/// @title ERC20GuildPayable - DRAFT
/// @author github:AugustoL
/// @notice This smart contract has not be audited.
/// @dev Extends an ERC20Guild to allow vote on behalf of other voters through vote signatures
contract ERC20GuildPayable is ERC20Guild {
    using Math for uint256;

    uint256 public voteGas;
    uint256 public maxGasPrice;

    /// @dev Initilizer
    /// @param _token The address of the token to be used
    /// @param _proposalTime The minimun time for a proposal to be under votation
    /// @param _votesForExecution The token votes needed for a proposal to be executed
    /// @param _votesForCreation The minimum balance of tokens needed to create a proposal
    /// @param _voteGas The gas to be used to calculate the vote gas refund
    /// @param _maxGasPrice The maximum gas price to be refunded
    function initialize(
        address _token,
        uint256 _proposalTime,
        uint256 _votesForExecution,
        uint256 _votesForCreation,
        string memory _name,
        uint256 _voteGas,
        uint256 _maxGasPrice
    ) public {
        require(address(_token) != address(0), "ERC20Guild: token is the zero address");
        super.initialize(_token, _proposalTime, _votesForExecution, _votesForCreation, _name);
        voteGas = _voteGas;
        maxGasPrice = _maxGasPrice;
    }

    /// @dev Set the ERC20Guild configuration, can be called only executing a proposal 
    /// or when it is initilized
    /// @param _proposalTime The minimun time for a proposal to be under votation
    /// @param _votesForExecution The token votes needed for a proposal to be executed
    /// @param _votesForCreation The minimum balance of tokens needed to create a proposal
    /// @param _voteGas The gas to be used to calculate the vote gas refund
    /// @param _maxGasPrice The maximum gas price to be refunded
    function setConfig(
        uint256 _proposalTime,
        uint256 _votesForExecution,
        uint256 _votesForCreation,
        uint256 _voteGas,
        uint256 _maxGasPrice
    ) public {
        super.setConfig(_proposalTime, _votesForExecution, _votesForCreation);
        voteGas = _voteGas;
        maxGasPrice = _maxGasPrice;
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

    /// @dev Allows the voting machine to receive ether to be used to refund voting costs
    function() external payable {}

    /// @dev Set the amount of tokens to vote in a proposal
    /// @param proposalId The id of the proposal to set the vote
    /// @param amount The amount of tokens to use as voting for the proposal
    function setVote(bytes32 proposalId, uint256 amount) public isInitialized {
        super.setVote(proposalId, amount);
        _refundVote(msg.sender);
    }

    /// @dev Internal function to refund a vote cost to a sender
    /// @param toAddress The address where the refund should be sent
    function _refundVote(address payable toAddress) internal {
      if (voteGas > 0) {
        uint256 gasRefund = voteGas.mul(tx.gasprice.min(maxGasPrice));
        if (address(this).balance >= gasRefund) {
          toAddress.transfer(gasRefund);
        }
      }
    }
}
