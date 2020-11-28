// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

/// @title IERC20Guild - DRAFT
/// @author github:AugustoL
/// @notice This smart contract has not be audited
/// @dev ERC20Guild Interface
interface IERC20Guild {

    event ProposalCreated(bytes32 indexed proposalId);
    event ProposalExecuted(bytes32 indexed proposalId);
    event VoteAdded(bytes32 indexed proposalId, address voter, uint256 amount);
    event VoteRemoved(bytes32 indexed proposalId, address voter, uint256 amount);
    
    function createProposal(
        address[] calldata to,
        bytes[] calldata data,
        uint256[] calldata value,
        string calldata description,
        bytes calldata contentHash
    ) external;
    function executeProposal(bytes32 proposalId) external;
    function setVote(bytes32 proposalId, uint256 amount) external;
    function setVotes(bytes32[] calldata proposalIds, uint256[] calldata amounts) external;
    
    function votesOf(address account) external view returns(uint256);
    function votesOf(address[] calldata accounts) external view returns(uint256[] memory) ;
    function token() external view returns (address);
    function name() external view returns (string memory);
    function initialized() external view returns (bool);
    function proposalTime() external view returns (uint256);
    function votesForExecution() external view returns (uint256);
    function votesForCreation() external view returns (uint256);
    function getProposal(bytes32 proposalId) external view returns(
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
    );
    function getProposalVotes(bytes32 proposalId, address voter) external view returns(uint256);

}
