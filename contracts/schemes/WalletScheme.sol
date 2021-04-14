pragma solidity 0.5.17;
pragma experimental ABIEncoderV2;

import "@daostack/infra/contracts/votingMachines/IntVoteInterface.sol";
import "@daostack/infra/contracts/votingMachines/ProposalExecuteInterface.sol";
import "../daostack/votingMachines/VotingMachineCallbacks.sol";
import "./PermissionRegistry.sol";

/**
 * @title WalletScheme.
 * @dev  A scheme for proposing and executing calls to any contract except itself
 * It has a value call controller address, in case of the controller address ot be set the scheme will be doing
 * generic calls to the dao controller. If the controller address is not set it will e executing raw calls form the 
 * scheme itself.
 * The scheme can only execute calls allowed to in the permission registry, if the controller address is set
 * the permissions will be checked using the avatar address as sender, if not the scheme address will be used as
 * sender.
 */
contract WalletScheme is VotingMachineCallbacks, ProposalExecuteInterface {
    struct Proposal {
        address[] to;
        bytes[] callData;
        uint256[] value;
        ProposalState state;
        string title;
        string descriptionHash;
    }

    mapping(bytes32 => Proposal) public proposals;
    bytes32[] public proposalsList;

    IntVoteInterface public votingMachine;
    bytes32 public voteParams;
    Avatar public avatar;
    address public controllerAddress;
    PermissionRegistry public permissionRegistry;
    
    bytes4 public constant ERC20_TRANSFER_SIGNATURE = bytes4(keccak256("transfer(address,uint256)"));

    event NewCallProposal(bytes32 indexed _proposalId);
    event ProposalExecuted(bytes32 indexed _proposalId, bool[] _callsSucessResult, bytes[] _callsDataResult);
    event ProposalExecutedByVotingMachine(bytes32 indexed _proposalId, int256 _param);
    event ProposalRejected(bytes32 indexed _proposalId);
    enum ProposalState {Submitted, Rejected, ExecutionSucceded, ExecutionFailed}

    /**
     * @dev initialize
     * @param _avatar the avatar address
     * @param _votingMachine the voting machines address to
     * @param _voteParams voting machine parameters.
     * @param _controllerAddress The address to receive the calls, if address 0x0 is used it wont make generic calls
     * to the avatar
     * @param _permissionRegistry The address of the permission registry contract
     */
    function initialize(
        Avatar _avatar,
        IntVoteInterface _votingMachine,
        bytes32 _voteParams,
        address _controllerAddress,
        address _permissionRegistry
    ) external {
        require(avatar == Avatar(0), "can be called only one time");
        require(_avatar != Avatar(0), "avatar cannot be zero");
        avatar = _avatar;
        votingMachine = _votingMachine;
        voteParams = _voteParams;
        controllerAddress = _controllerAddress;
        permissionRegistry = PermissionRegistry(_permissionRegistry);
    }

    /**
     * @dev Fallback function that allows the wallet to receive ETH when the controller address is not set
     */
    function() external payable {
      require(controllerAddress == address(0), "Cant receive if it will make generic calls to avatar");
    }

    /**
     * @dev execution of proposals, can only be called by the voting machine in which the vote is held.
     * @param _proposalId the ID of the voting in the voting machine
     * @param _decision a parameter of the voting result, 1 yes and 2 is no.
     * @return bool success
     */
    function executeProposal(bytes32 _proposalId, int256 _decision)
      external onlyVotingMachine(_proposalId) returns(bool)
    {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.state == ProposalState.Submitted, "must be a submitted proposal");

        // If decision is 1, it means the proposal was approved by the voting machine
        if (_decision == 1) {
          
            proposal.state = ProposalState.ExecutionSucceded;  
            bytes[] memory callsDataResult = new bytes[](proposal.to.length);
            bool[] memory callsSucessResult = new bool[](proposal.to.length);
            
            for (uint256 i = 0; i < proposal.to.length; i++) {
              
                if (isCallAllowed(proposal.to[i], proposal.callData[i], proposal.value[i])) {
                  
                  // If controller address is set the code needs to be encoded to generiCall function
                  if (controllerAddress != address(0) && proposal.to[i] != controllerAddress) {
                    bytes memory genericCallData = abi.encodeWithSignature(
                      "genericCall(address,bytes,address,uint256)",
                      proposal.to[i], proposal.callData[i], avatar, proposal.value[i]
                    );
                    (callsSucessResult[i], callsDataResult[i]) =
                      address(controllerAddress).call.value(0)(genericCallData);
                  
                    // The success is form the generic call, but the result data is from the call to the controller
                    (bool genericCallSucessResult, bytes memory genericCallDataResult) = 
                      abi.decode(callsDataResult[i], (bool, bytes));
                    callsSucessResult[i] = genericCallSucessResult;
                    
                  // If controller address is not set the call is made to
                  } else {
                    (callsSucessResult[i], callsDataResult[i]) =
                      address(proposal.to[i]).call.value(proposal.value[i])(proposal.callData[i]);
                  }
                  
                // If the call is not allowed the calls finish and is set to execution failed.
                } else {
                  callsDataResult[i] = bytes("0");
                  callsSucessResult[i] = false;
                }
                if (!callsSucessResult[i]){
                  proposals[_proposalId].state = ProposalState.ExecutionFailed;
                  break;
                } 
                
            }
            emit ProposalExecuted(_proposalId, callsSucessResult, callsDataResult);
            
        // If decision is 2, it means the proposal was rejected by the voting machine
        } else {
            proposal.state = ProposalState.Rejected;
            emit ProposalRejected(_proposalId);
        }

        emit ProposalExecutedByVotingMachine(_proposalId, _decision);
        return true;
    }

    /**
    * @dev Propose calls to be executed, the calls have to be allowed by the permission registry
    * @param _to - The addresses to call
    * @param _callData - The abi encode data for the calls
    * @param _value value(ETH) to transfer with the calls
    * @param _descriptionHash proposal description hash
    * @return an id which represents the proposal
    */
    function proposeCalls(
      address[] memory _to,
      bytes[] memory _callData,
      uint256[] memory _value,
      string memory _title,
      string memory _descriptionHash
    ) public returns(bytes32) {
        for(uint i = 0; i < _to.length; i ++) {
          require(_to[i] != address(this), 'invalid proposal caller');
        }
        require(_to.length == _callData.length, "invalid callData length");
        require(_to.length == _value.length, "invalid _value length");

        // Get the proposal id that will be used from the voting machine
        bytes32 proposalId = votingMachine.propose(2, voteParams, msg.sender, address(avatar));
        
        // Add the proposal to the proposals mapping, proposals list and proposals information mapping
        proposals[proposalId] = Proposal({
            to: _to,
            callData: _callData,
            value: _value,
            state: ProposalState.Submitted,
            title: _title,
            descriptionHash: _descriptionHash
        });
        proposalsList.push(proposalId);
        proposalsInfo[address(votingMachine)][proposalId] = ProposalInfo({blockNumber: block.number, avatar: avatar});
        emit NewCallProposal(proposalId);
        return proposalId;
    }

    /**
    * @dev Get the information of a proposal by id
    * @param proposalId the ID of the proposal
    */
    function getOrganizationProposal(bytes32 proposalId) public view 
      returns (
        address[] memory to,
        bytes[] memory callData,
        uint256[] memory value,
        ProposalState state,
        string memory title,
        string memory descriptionHash
    ) {
      return (
        proposals[proposalId].to,
        proposals[proposalId].callData,
        proposals[proposalId].value,
        proposals[proposalId].state,
        proposals[proposalId].title,
        proposals[proposalId].descriptionHash
      );
    }
    
    /**
    * @dev Get the information of a proposal by index
    * @param proposalIndex the index of the proposal in the proposals list
    */
    function getOrganizationProposalByIndex(uint256 proposalIndex) public view 
      returns (
        address[] memory to,
        bytes[] memory callData,
        uint256[] memory value,
        ProposalState state,
        string memory title,
        string memory descriptionHash
    ) {
      return getOrganizationProposal(proposalsList[proposalIndex]);
    }
    
    /**
    * @dev Get if the call is allowed ot not and with how much value
    * @param to the receiver of the call
    * @param data the data of the call
    * @param value the value to be sent
    */
    function isCallAllowed(address to, bytes memory data, uint256 value) public returns (bool) {
      uint256 fromTime;
      uint256 valueAllowed;
      address asset;

      bytes4 callSignature = getFuncSignature(data);
      if (ERC20_TRANSFER_SIGNATURE == callSignature) {
        asset = to;
        (to, value) = erc20TransferDecode(data);
        (valueAllowed, fromTime) = permissionRegistry
          .getPermission(
            asset,
            controllerAddress != address(0) ? address(avatar) : address(this),
            to,
            callSignature
          );
      } else {
        (valueAllowed, fromTime) = permissionRegistry
          .getPermission(
            asset,
            controllerAddress != address(0) ? address(avatar) : address(this),
            to,
            callSignature
          );
      }
      return fromTime > 0 && now > fromTime && valueAllowed >= value;
    }
    
    /**
     * @dev Decodes abi encoded data with selector for "transfer(address,uint256)".
     * @param _data ERC20 Transfer encoded data.
     * @return to The account to receive the tokens
     * @return value The value of tokens to be sent
     */
    function erc20TransferDecode(bytes memory _data) public pure returns(address to, uint256 value) {
        assembly {
            to := mload(add(_data, 36))
            value := mload(add(_data, 68))
        }
    }
    
    /**
    * @dev Get call data signature
    * @param data The bytes data of the data to get the signature
    */
    function getFuncSignature(bytes memory data) public view returns (bytes4) {
        bytes32 functionSignature = bytes32(0);
        assembly {
            functionSignature := mload(add(data, 32))
        }
        return bytes4(functionSignature);
    }
    
    /**
    * @dev Get the proposals length
    */
    function getOrganizationProposalsLength() public view returns (uint256) {
      return proposalsList.length;
    }
    
    /**
    * @dev Get the proposals ids
    */
    function getOrganizationProposals() public view returns (bytes32[] memory) {
      return proposalsList;
    }
}
