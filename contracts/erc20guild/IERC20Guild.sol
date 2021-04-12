// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

/// @title IERC20Guild
/// @author github:AugustoL
/// @dev ERC20Guild Interface
interface IERC20Guild {

    event ProposalCreated(bytes32 indexed proposalId);
    event ProposalRejected(bytes32 indexed proposalId);
    event ProposalExecuted(bytes32 indexed proposalId);
    event ProposalEnded(bytes32 indexed proposalId);
    event VoteAdded(bytes32 indexed proposalId, address voter, uint256 amount);
    event VoteRemoved(bytes32 indexed proposalId, address voter, uint256 amount);
    event SetAllowance(address indexed to, bytes4 functionSignature, bool allowance);
    event TokensLocked(address voter, uint256 value);
    event TokensReleased(address voter, uint256 value);
  
    function setConfig(
        uint256 _proposalTime,
        uint256 _timeForExecution,
        uint256 _votesForExecution,
        uint256 _votesForCreation,
        uint256 _voteGas,
        uint256 _maxGasPrice,
        uint256 _lockTime
    ) external;
    function setAllowance(
        address[] calldata to,
        bytes4[] calldata functionSignature,
        bool[] calldata allowance
    ) external;
    function createProposal(
        address[] calldata to,
        bytes[] calldata data,
        uint256[] calldata value,
        string calldata description,
        bytes calldata contentHash
    ) external;
    function endProposal(bytes32 proposalId) external;
    function setVote(bytes32 proposalId, uint256 amount) external;
    function setVotes(bytes32[] calldata proposalIds, uint256[] calldata amounts) external;
    function setSignedVote(
        bytes32 proposalId, uint256 amount, address voter, bytes calldata signature
    ) external;
    function setSignedVotes(
        bytes32[] calldata proposalIds, uint256[] calldata amounts, address[] calldata voters, bytes[] calldata signatures
    ) external;
    function lockTokens(uint256 amount) external;
    function releaseTokens(uint256 amount) external;
    
    function token() external view returns (address);
    function name() external view returns (string memory);
    function tokenVault() external view returns (address);
    function initialized() external view returns (bool);
    function proposalTime() external view returns (uint256);
    function timeForExecution() external view returns (uint256);
    function votesForExecution() external view returns (uint256);
    function votesForCreation() external view returns (uint256);
    function lockTime() external view returns (uint256);
    function totalLocked() external view returns (uint256);
    function totalLockedAt(uint256) external view returns(uint256);
    function voteGas() external view returns (uint256);
    function maxGasPrice() external view returns (uint256);
    function tokensLocked(address) external view returns (uint256 amount, uint256 timestamp);
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
        uint256 state,
        uint256 snapshotId
    );
    function getProposalVotes(bytes32 proposalId, address voter) external view returns(uint256);
    function getVotesForCreation() external view returns (uint256);
    function getVotesForExecution() external view returns (uint256);
    function getFuncSignature(bytes calldata data) external view returns (bytes4);
    function getCallPermission(address to, bytes4 functionSignature) external view returns (bool);
    function votesOf(address[] calldata accounts) external view returns(uint256[] memory);
    function votesOf(address account) external view returns(uint256);
    function votesOfAt(address account, uint256 snapshotId) external view returns (uint256);
    function votesOfAt(address[] calldata accounts, uint256[] calldata snapshotIds) external view returns(uint256[] memory);
    function signedVotes(bytes32) external view returns(bool);
    function hashVote(address voter, bytes32 proposalId, uint256 amount) external pure returns(bytes32);

}
