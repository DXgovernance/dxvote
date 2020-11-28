pragma solidity 0.5.17;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// Status: DRAFT !

contract PermissionRegistry {
  using SafeMath for uint256;
  
  uint256 public timeDelay;
  address public owner;
  address public constant ANY_ADDRESS = address(0x0000000000000000000000000000000000000001);
  bytes4 public constant ANY_SIGNATURE = bytes4(0x00000001);
  
  struct Permission {
    uint256 valueAllowed;
    uint256 fromTime;
  }
  
  // from address => to address => function call signature allowed => Permission
  mapping(address =>
    mapping(address =>
      mapping(bytes4 =>
        Permission
      )
    )
  ) public permissions;

  /**
   * @dev Constructor
   * @param _owner the owner of the registry that can set any permissions
   * @param _timeDelay the amount of time taht has to pass after permission addition to allow execution
   */
  constructor(address _owner, uint256 _timeDelay) public {
    require(_owner != address(0), "PermissionRegistry: Invalid owner address");
    require(timeDelay > 0, "PermissionRegistry: Invalid time delay");
    owner = _owner;
    timeDelay = _timeDelay;
  }
  
  function transferOwnership(address newOwner) public {
    require(msg.sender == owner, "PermissionRegistry: Only callable by owner");
    owner = newOwner;
  }
  
  function setPermission(
    address from, 
    address to, 
    bytes4 functionSignature, 
    uint256 valueAllowed, 
    bool allowed
  ) public {
    require(msg.sender == owner, "PermissionRegistry: Only callable by owner");
    if (allowed){
      permissions[from][to][functionSignature].fromTime = now.add(timeDelay);
      permissions[from][to][functionSignature].valueAllowed = valueAllowed;
    } else {
      permissions[from][to][functionSignature].fromTime = 0;
      permissions[from][to][functionSignature].valueAllowed = 0;
    }
  }
  
  function getPermission(
    address from, 
    address to, 
    bytes4 functionSignature
  ) public returns (uint256 valueAllowed, uint256 fromTime) {
    
    // Check if there is an allowance to any address and function signature
    if (permissions[from][ANY_ADDRESS][ANY_SIGNATURE].fromTime > 0) {
      Permission memory permission = permissions[from][ANY_ADDRESS][ANY_SIGNATURE];
      return(permission.valueAllowed, permission.fromTime);
      
    // Check if there is an allowance to any address with a specific function signature
    } else if((permissions[from][ANY_ADDRESS][functionSignature].fromTime > 0)) {
      Permission memory permission = permissions[from][ANY_ADDRESS][functionSignature];
      return(permission.valueAllowed, permission.fromTime);
      
    // Check if there is an allowance to specific address with a specific function signature
    } else {
      // bytes4(keccak256("implementation()")) == 0x5c60da1b
      (bool proxyImplementationCallSuccess, bytes memory proxyImplementationCallData) =
        address(to).staticcall(hex"5c60da1b");
      
      // If the receiver is a proxy contract check the permission against the proxy address
      if (proxyImplementationCallSuccess){
        address implementationAddress = abi.decode(proxyImplementationCallData, (address));
        Permission memory permission = permissions[from][implementationAddress][functionSignature];
        return(permission.valueAllowed, permission.fromTime);
      } else {
        Permission memory permission = permissions[from][to][functionSignature];
        return(permission.valueAllowed, permission.fromTime);
      }
    }
  }

}
