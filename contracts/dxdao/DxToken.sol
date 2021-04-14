pragma solidity ^0.5.4;
import "../daostack/controller/DAOToken.sol";


// is DAOToken
contract DxToken is DAOToken {
    constructor(string memory _name, string memory _symbol, uint _cap) public DAOToken(_name, _symbol, _cap) {}
}
