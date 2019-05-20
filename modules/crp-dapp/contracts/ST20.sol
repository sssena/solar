pragma solidity ^0.4.24;

/**
 * @title ST20 interface
 * @dev see https://github.com/PolymathNetwork/polymath-core
 */
contract ST20 {
    function verifyTransfer(address _from, address _to, uint256 _value) public view returns (bool);
    function totalSupply() public view returns (uint256);
    function balanceOf(address _who) public view returns (uint256);
    function transfer(address _to, uint256 _value) public;
    function allowance(address _owner, address _spender) public view returns (uint256);
    function transferFrom(address _from, address _to, uint256 _value) public;
    function approve(address _spender, uint256 _value) public;
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
