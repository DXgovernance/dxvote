pragma solidity ^0.5.4;

import "../daostack/controller/Controller.sol";

contract DxController is Controller {
    constructor(Avatar _avatar) public Controller(_avatar) {}
}
