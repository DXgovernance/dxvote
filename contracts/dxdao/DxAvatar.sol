pragma solidity ^0.5.4;

import "../daostack/controller/Avatar.sol";


contract DxAvatar is Avatar {
    constructor(string memory _orgName, DAOToken _nativeToken, Reputation _nativeReputation)
        public
        Avatar(_orgName, _nativeToken, _nativeReputation)
    {}
}
