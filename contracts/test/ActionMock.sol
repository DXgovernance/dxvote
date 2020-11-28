pragma solidity 0.5.17;

contract ActionMock {
    event ReceivedEther(address indexed _sender, uint256 _value);

    function test(address _addr) public payable returns (bool) {
        require(msg.sender == _addr, "the caller must be equal to _addr");
        emit ReceivedEther(msg.sender, msg.value);
        return true;
    }

    function testWithNoargs() public payable returns (bool) {
        return true;
    }

    function testWithoutReturnValue(address _addr) public payable {
        require(msg.sender == _addr, "the caller must be equal to _addr");
        emit ReceivedEther(msg.sender, msg.value);
    }
}
