pragma solidity ^ 0.4 .24;

import "./ERC20.sol";
import "./SafeMath.sol";
import "./CrpInfc.sol";

/// @title the crp token contract (version 0.1)
/// @author jhhong & 'sykang4966@gmail.com'
contract CrpToken is ERC20, CrpInfc {
    using SafeMath
    for uint;

    //struct : chain state coin balance 
    struct Chainelmt {
        address prev; // 현 노드의 전 노드
        address next; // 현 노드의 다음 노드
        uint balance; // 현재 노드의 잔고
    }

    // public variables
    string public name; // 토큰 이름
    string public symbol; // 토큰 심볼
    uint public decimals; // 소수점 자리수
    address public owner; // 토큰 owner 주소
    bool public token_enable; // 토큰 활성화 플래그 변수
    uint public balance_count; // 잔고 체인의 숫자
    address public balance_head; // 잔고 체인의 머리소
    address public balance_last; // 잔고 체인의 꼬리
    uint public pend_count; // 펜딩 체인의 숫자
    address public pend_head; // 펜딩 체인의 머리
    address public pend_last; // 펜딩 체인의 꼬리
    address public main_contract; // 메인컨트렉트 주소

    // private variables
    uint supply; // 토큰 총 발행량
    string constant contract_type = "Token";
    mapping(address => Chainelmt) balances; // 계정 별 balance를 매핑한 변수
    mapping(address => Chainelmt) pendings; // v2: 계정 별 pendings를 매핑한 변수 (pendings: 계정에 귀속되어 있으나 거래될 수 없는 토큰)
    mapping(address => mapping(address => uint)) approvals; // 각 계정에 대해, 계정 별 허용 위임금액을 매핑한 변수
    mapping(address => bool) table_lock; // 계정 별 lock 여부를 매핑한 변수
    mapping(address => bool) table_admin; // 계정 별 관리자 권한 획득 여부를 매핑한 변수

    // events
    event TokenBurned(uint _amount, uint _supply); // 이벤트 로그: 토큰 소각
    event TokenEnabled(); // 이벤트 로그: 토큰 활성화
    event TokenDisabled(); // 이벤트 로그: 토큰 비활성화                                                                                                                                                                                                                           
    event AdminAdded(address _address); // 이벤트 로그: 관리자 권한 계정 추가
    event AdminDeleted(address _address); // 이벤트 로그: 관리자 권한 계정 제거
    event AddressLocked(address _address); // 이벤트 로그: 계정 락 설정
    event AddressUnlocked(address _address); // 이벤트 로그: 계정 락 해제
    event Issue(uint256 _value); // 이벤트 로그 : 토큰 생성
    event Settled(address _who, uint _pendings); // 이벤트 로그: 계정 정산, 펜딩
    event ReleasePend(address _who, uint _balance); // 이벤트 로그 : 계정 펜딩해제

    // modifier
    modifier isProjectOwner(address _address) { // 토큰 owner인지 검사
        require(_address == owner);
        _;
    }

    modifier isTokenAdmin(address _address) { // 토큰 관리자인지 검사
        require((_address == owner) || (table_admin[_address]));
        _;
    }
    modifier isTokenTransfer(address _address) { // 토큰을 전송할 권한이 있는지 검사
        require((_address == owner) ||
            (table_admin[_address]) ||
            (token_enable && !table_lock[_address]));
        _;
    }

    /// @author sykang
    /// @notice the constructor of SoomToken contract
    /// @dev static initiation: name, symbol, decimals, supply
    /// @param _name token name (string)
    /// @param _symbol token symbol (string)
    /// @param _main main contract address 
    constructor(string _name, string _symbol, address _main) public {
        name = _name;
        symbol = _symbol;
        main_contract = _main;
        decimals = 18;
        supply = 0;
        owner = msg.sender;
        balance_count = 0;
        pend_count = 0;
        table_lock[owner] = false;
        token_enable = false;
    }

    /// @author sykang
    /// @notice interface, return contract type
    /// @return const variable of contract_type
    function getContractType()
    public view
    returns(string) {
        return contract_type;
    }

    /// @author jhhong
    /// @notice get total supply of token
    /// @dev abstract function definition (ERC20Basic)
    /// @return total supply (uint256)
    function totalSupply()
    public view returns(uint256) {
        return supply;
    }

    /// @author jhhong
    /// @notice get balances owned by "_who"
    /// @dev abstract function definition (ERC20Basic)
    /// @param _who account address to get balances
    /// @return balances owned by "_who" (uint)
    function balanceOf(address _who)
    public view returns(uint) {
        return balances[_who].balance;
    }

    /// @author jhhong
    /// @notice get balances allowed by "_owner" to "_spender" 
    /// @dev abstract function definition (ERC20)
    /// @param _owner token owner account
    /// @param _spender token spender account
    /// @return balances allowed by "_owner" to "_spender" (uint)
    function allowance(address _owner, address _spender)
    public view returns(uint) {
        return approvals[_owner][_spender];
    }

    /// @author jhhong
    /// @notice show lock status of "_who"
    /// @dev the lock status is the right to transfer token
    /// @param _who the account address to show lock status
    /// @return lock status of "_who" (bool) true: locked, false: unlocked
    function showAddrLockStat(address _who)
    public view returns(bool) {
        return table_lock[_who];
    }

    /// @author jhhong
    /// @notice show admin status of "_who"
    /// @dev the administrator is able to lock address & transfer token without token_enabled
    /// @param _who the account address to show admin status
    /// @return admin status of "_who" (bool) true: admin, false: not-admin
    function showAdminStat(address _who)
    public view returns(bool) {
        return table_admin[_who];
    }

    /// @author sykang
    /// @notice show pendings of "_addr"
    /// @dev add function in (v2)
    /// @param _addr the account address to show pendings
    /// @return pendings of "_addr" (address)
    function showPendings(address _addr)
    public view returns(uint256) {
        return pendings[_addr].balance;
    }

    /// @author jhhong
    /// @notice "msg.sender" transfer "_value" to "_to"
    /// @dev abstract function definition (ERC20Basic)
    /// and can do this action if msg.sender is transferable token
    /// @param _to the account address for receiving token
    /// @param _value the balances of token
    /// @return true
    function transfer(address _to, uint _value)
    isTokenTransfer(msg.sender)
    public returns(bool) {
        require(balances[msg.sender].balance >= _value);
        balances[msg.sender].balance = balances[msg.sender].balance.sub(_value);
        balances[_to].balance = balances[_to].balance.add(_value);
        if (balances[_to].prev == 0 && balances[_to].next == 0) {
            balances[_to].prev = balance_last;
            balances[balance_last].next = _to;
            balance_last = _to;
            balance_count = balance_count.add(1);
        }
        if (balances[msg.sender].balance == 0) {
            address temp_prev = balances[msg.sender].prev;
            address temp_next = balances[msg.sender].next;
            if (balance_head == msg.sender) {
                balance_head = temp_next;
            }
            if (balance_last == msg.sender) {
                balance_last = temp_prev;
            }
            if (temp_prev != address(0)) {
                balances[temp_prev].next = temp_next;
                balances[msg.sender].prev = address(0);
            }
            if (temp_next != address(0)) {
                balances[temp_next].prev = temp_prev;
                balances[msg.sender].next = address(0);
            }
            balance_count = balance_count.sub(1);
        }
        emit Transfer(msg.sender, _to, _value); // event of ERC20Basic
        return true;
    }

    /// @author jhhong
    /// @notice "msg.sender" transfer balances of "_from" to "_to" as much as "_value"
    /// @dev abstract function definition (ERC20)
    /// and can do this action if msg.sender is transferable token and
    /// _from is transferable token
    /// @param _from the account address for sending token
    /// @param _to the account address for receiving token
    /// @param _value the balances of token
    /// @return true
    function transferFrom(address _from, address _to, uint _value)
    isTokenTransfer(msg.sender)
    isTokenTransfer(_from)
    public returns(bool) {
        require(balances[_from].balance >= _value);
        require(approvals[_from][msg.sender] >= _value);

        //approvals[_from][msg.sender] = approvals[_from][msg.sender].sub(_value);
        balances[_from].balance = balances[_from].balance.sub(_value);
        balances[_to].balance = balances[_to].balance.add(_value);
        if (balances[_to].prev == address(0) && balances[_to].next == address(0)) {
            balances[_to].prev = balance_last;
            balances[balance_last].next = _to;
            balance_last = _to;
            balance_count = balance_count.add(1);
        }
        if (balances[_from].balance == 0) {
            address temp_prev = balances[_from].prev;
            address temp_next = balances[_from].next;
            if (balance_head == _from) {
                balance_head = temp_next;
            }
            if (balance_last == _from) {
                balance_last = temp_prev;
            }
            if (temp_prev != address(0)) {
                balances[temp_prev].next = temp_next;
                balances[_from].prev = address(0);
            }
            if (temp_next != address(0)) {
                balances[temp_next].prev = temp_prev;
                balances[_from].next = address(0);
            }
            balance_count = balance_count.sub(1);
        }
        emit Transfer(_from, _to, _value); // event of ERC20Basic
        return true;
    }

    /// @author jhhong
    /// @notice "msg.sender" approve "_spender" to spend "_value"
    /// @dev abstract function definition (ERC20)
    /// and can do this action if msg.sender is transferable token
    /// @param _spender the account address allowd from "msg.sender"
    /// @param _value the balances of token allowed to spend
    /// @return true
    function approve(address _spender, uint _value)
    isTokenTransfer(msg.sender)
    public returns(bool) {
        approvals[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value); // event of ERC20
        return true;
    }

    /// @author jhhong
    /// @notice burn token supply as much as "_amount"
    /// @dev can do this action only token owner
    /// @param _amount the token balances to burn
    /// @return true
    function setTokenBurn(uint _amount)
    isProjectOwner(msg.sender)
    public returns(bool) {
        require(balances[msg.sender].balance >= _amount);

        balances[msg.sender].balance = balances[msg.sender].balance.sub(_amount);
        supply = supply.sub(_amount);
        emit TokenBurned(_amount, supply);
        return true;
    }

    /// @author sykang
    /// @notice create token suuply as much as "_amount"
    /// @dev can do this action only token owner by crowdsale contract
    /// @param _addr the token buyer address
    /// @param _value the token balances to create    
    function issue(address _addr, uint256 _value)
    isProjectOwner(msg.sender)
    external {
        balances[_addr].balance = balances[_addr].balance.add(_value);
        supply = supply.add(_value);
        if (balance_count == 0) {
            balance_head = balance_last = _addr;
        } else {
            balances[balance_last].next = _addr;
            balances[_addr].prev = balance_last;
            balance_last = _addr;
        }
        balance_count = balance_count.add(1);
        emit Issue(_value);
    }

    /// @author jhhong
    /// @notice enable token availibility
    /// @dev can do this action only token owner
    /// @return true
    function setTokenEnable()
    isProjectOwner(msg.sender)
    external returns(bool) {
        token_enable = true;
        emit TokenEnabled();
        return true;
    }

    /// @author jhhong
    /// @notice disbale token availibility
    /// @dev can do this action only token owner
    /// @return true
    function setTokenDisable()
    isProjectOwner(msg.sender)
    external returns(bool) {
        token_enable = false;
        emit TokenDisabled();
        return true;
    }

    /// @author jhhong
    /// @notice lock for "_target" not to transfer token
    /// @dev can do this action only token owner
    /// @param _target the account address to lock
    /// @return true
    function setAddressLock(address _target)
    isProjectOwner(msg.sender)
    external returns(bool) {
        require(owner != _target);

        table_lock[_target] = true;
        emit AddressLocked(_target);
        return true;
    }

    /// @author jhhong
    /// @notice unlock for "_target" to transfer token
    /// @dev can do this action only token owner
    /// @param _target the account address to unlock
    /// @return true
    function setAddressUnlock(address _target)
    isProjectOwner(msg.sender)
    external returns(bool) {
        table_lock[_target] = false;
        emit AddressUnlocked(_target);
        return true;
    }

    /// @author jhhong
    /// @notice lock for "_target" not to transfer token
    /// @dev can do this action only token admin
    /// @param _target the account address to lock
    function saleAddressLock(address _target)
    isProjectOwner(msg.sender)
    external {
        require(owner != _target);

        table_lock[_target] = true;
        emit AddressLocked(_target);
    }

    /// @author jhhong
    /// @notice unlock for "_target" to transfer token
    /// @dev can do this action only token admin
    /// @param _target the account address to unlock
    function saleAddressUnlock(address _target)
    isProjectOwner(msg.sender)
    external {
        table_lock[_target] = false;
        emit AddressUnlocked(_target);
    }

    /// @author jhhong
    /// @notice add administrator
    /// @dev can do this action only token owner
    /// @param _admin the account address promoted to administrator
    function saleAdminAdd(address _admin)
    isProjectOwner(tx.origin)
    external {
        table_admin[_admin] = true;
        emit AdminAdded(_admin);
    }

    /// @author jhhong
    /// @notice delete administrator
    /// @dev can do this action only token owner
    /// @param _admin the account address to disable administrator privileges
    function saleAdminDelete(address _admin)
    isProjectOwner(tx.origin)
    external {
        table_admin[_admin] = false;
        emit AdminDeleted(_admin);
    }

    /// @author jhhong
    /// @notice "msg.sender" approve "_spender" to spend "_value"
    /// @dev "msg.sender" must be owner
    /// @param _spender the account address allowd from owner
    /// @param _value the balances of token allowed to spend
    /// @return true
    function saleApprove(address _spender, uint _value)
    isProjectOwner(tx.origin)
    external {
        approvals[tx.origin][_spender] = _value;
        emit Approval(tx.origin, _spender, _value); // event of ERC20
    }

    /// @author sykang
    /// @notice create token_pendings for"_who" to "_value"
    /// @dev "msg.sender" must be owner
    /// @param _who Wallet address to receive locked token
    /// @param _value the pendings of token
    function settle(address _who, uint _value)
    isProjectOwner(msg.sender)
    external {
        require(_who != 0);

        if (pend_head == 0) {
            pend_head = pend_last = _who;
            pendings[_who].balance = (pendings[_who].balance).add(_value);
        } else {
            pendings[pend_last].next = _who;
            pendings[_who].prev = pend_last;
            pend_last = _who;
            pendings[_who].balance = (pendings[_who].balance).add(_value);
        }
        pend_count = pend_count.add(1);
        supply = supply.add(_value);

        emit Settled(_who, _value);
    }

    /// @author sykang
    /// @notice unlock Token with address
    /// @dev release pendings amount, move this amount to balance
    /// @param _addr Wallet address to receive locked token
    function releasePend(address _addr)
    isProjectOwner(msg.sender)
    external {               
        if (balances[_addr].balance == 0) {
            balances[_addr].balance = pendings[_addr].balance;
            balances[balance_last].next = _addr;
            balances[_addr].prev = balance_last;
            balance_last = _addr;
            balance_count = balance_count.add(1);
        }else{
            balances[_addr].balance = (balances[_addr].balance).add(pendings[_addr].balance);
        }
        pendings[_addr].balance = 0;

        emit ReleasePend(_addr, balances[_addr].balance);
    }

    /// @author sykang
    /// @notice get count of balance chain
    /// @return reutrn now balance_count
    function getCount()
    public view
    returns(uint) {
        return balance_count;
    }
}