pragma solidity ^ 0.4.24;

import "./SafeMath.sol";
import "./CrpInfc.sol";

/// @title the crp fund contract (version 0.1)
/// @author skkang4966@gmail.com
contract CrpFund is CrpInfc{
    using SafeMath
    for uint;

    // public variables
    uint256 public total_fund; // 입금된 절대 수량의 Crp
    uint256 public current_fund; // 출금가능한 crp의 양
    address public owner; // 생성자 오너 주소
    address public main_contract; // 메인 컨트렉트 주소
    string constant contract_type = "FUND"; //컨트렉트 타입

    //modifier
    modifier isProjectOwner(address _address) { // 토큰 owner인지 검사
        require(_address == owner);
        _;
    }
    //event
    event Deposit(uint256 _amount); // 입금시 알림
    event Transfer(address _address, uint256 _amount); // 출금시 알림

    /// @author sykang
    /// @notice the constructor crp fund contract
    /// @param _main mian contract
    constructor(address _main) public {
        main_contract = _main;
        owner = msg.sender; // 생성자 주소 저장
    }

    /// @author sykang
    /// @notice interface, return contract type
    /// @return const variable of contract_type
    function getContractType()
    public view
    returns(string){
        return contract_type ;
    }
    
    /// @author sykang
    /// @notice The function that is called when crowdsale contract sends Crp to the contract address
    /// @dev proceed below steps
    function receiveCrp() 
    external payable {
        total_fund = total_fund.add(msg.value); // 절대량에 입금량 기록
        current_fund = current_fund.add(msg.value); // 출금가능 양에도 기록
        emit Deposit(msg.value);// 알림 
    }

    /// @author sykang
    /// @notice withdraw adrres _to, amount Crp
    /// @param _to transfer to adrress_to
    /// @param _amount transfer _amount
    function withdraw(address _to, uint256 _amount)
    isProjectOwner(msg.sender)
    payable external {
        require(current_fund >= _amount);
        current_fund = current_fund.sub(_amount);
        _to.transfer(_amount);
        emit Transfer(_to, _amount);
    }

    /// @author sykang
    /// @notice return total amount
    /// @return Total amount deposited
    function showTotalFund()
    public view returns(uint256) {
        return total_fund;
    }

    /// @author sykang
    /// @notice return 
    /// @return Amount to withdraw
    function showRemainFund()
    public view returns(uint256) {
        return current_fund;
    }
}