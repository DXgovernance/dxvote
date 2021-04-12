// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.7.6;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

/**
 * @title TokenVault
 * @dev A smart contract to lock an ERC20 token in behalf of user trough an intermediary admin contract.
 * User -> Admin Contract -> Token Vault Contract -> Admin Contract -> User.
 * Tokens can be deposited and withdrawal only with authorization of the locker account from the admin address.
 */
contract TokenVault is Initializable{
    using SafeMathUpgradeable for uint256;

    IERC20Upgradeable public token;
    address public admin;
    bool public initialized = false;
    mapping(address => uint256) public balances;

  /// @dev Initialized modifier to require the contract to be initialized
    modifier isInitialized() {
        require(initialized, "TokenVault: Not initilized");
        _;
    }

    /// @dev Initializer
    /// @param _token The address of the token to be used
    /// @param _admin The address of the contract that will execute deposits and withdrawals 
    function initialize(address _token, address _admin) initializer public {
        token = IERC20Upgradeable(_token);
        admin = _admin;
        initialized = true;
    }
    
    // @dev Deposit the tokens from the user to the vault from the admin contract
    function deposit(address user, uint256 amount) public isInitialized {
      require(msg.sender == admin);
      token.transferFrom(user, address(this), amount);
      balances[user] = balances[user].add(amount);
    }
    
    // @dev Withdraw the tokens to the user from the vault from the admin contract
    function withdraw(address user, uint256 amount) public isInitialized {
      require(msg.sender == admin);
      token.transfer(user, amount);
      balances[user] = balances[user].sub(amount);
    }
}
