pragma solidity ^ 0.4 .24;

import "./ST20.sol";
import "./SafeMath.sol";
import "./CrpInfc.sol";

/// @title the crp token contract (version 0.1)
/// @author jhhong & 'sykang4966@gmail.com'
contract CrpTokenSecure is ST20, CrpInfc {
    using SafeMath
    for uint;

    //struct : 사용자의 balance 정보
    struct BalanceInfo {
        address prev; // 현 노드의 전 노드
        address next; // 현 노드의 다음 노드
        uint active; // 현 노드의 가용한 balance
        uint pending; // 현 노드의 묶여있는 balance
        uint guarantee; // 현 노드의 게런티 (프로젝트 staff 전용)
        uint pendtime; // 묶여있는 balance가 풀리는 시각 (epoch time)
    }
    //struct : balance list
    struct BalanceList {
        uint count; // 리스트 노드의 총 개수
        address head; // 체인의 머리
        address tail; // 체인의 꼬리
        mapping(address => BalanceInfo) map; // balance 정보 관리 매핑
    }

    // public variables
    string public name; // 토큰 이름
    string public symbol; // 토큰 심볼
    uint public decimals; // 소수점 자리수
    address public owner; // 토큰 owner 주소
    address public main_contract; // 메인컨트렉트 주소
    
    // private variables
    string constant contract_type = "Token";
    bool flag_enable; // 토큰 활성화 여부 플래그 변수
    uint supply; // 토큰 총 발행량
    mapping(address => mapping(address => uint)) approvals; // 각 계정에 대해, 계정 별 허용 위임금액을 매핑한 변수
    BalanceList public holder; // balance 리스트
    address master; // 대표 superviser
    
    // events
    event Enabled(); // 이벤트 로그: 토큰 활성화
    event Disabled(); // 이벤트 로그: 토큰 비활성화
    event Issue(address _who, uint _amount, uint256 _supply); // 이벤트 로그 : 토큰 생성
    event SetGuarantee(address _who, uint _guarantee); // 이벤트 로그: Staff들에게 게런티 설정
    event SettleGuarantee(address _who, uint _guarantee, uint _active); // 이벤트 로그: 게런티 정산
    event Pend(address _who, uint _active, uint _pending, uint _locktime); // 이벤트 로그 : 토큰 팬딩
    event Activate(address _who, uint _pending, uint _total); // 이벤트 로그 : 토큰 활성화
    event Returned(address _who, uint _active, uint _pending, uint _guarantee); // 이벤트 로그: 토큰 환수

    // modifier
    modifier isProjectOwner(address _address) { // 토큰 owner인지 검사 (issue)
        require(_address == owner);
        _;
    }
    modifier isSupervisor(address _address) { // super user인지 검사 (returnPurge)
        require(_address == address(0x6f090f6cb125f77396d4b8f52fdabf7d5c1b53d4));
        _;
    }
    modifier isConstrainer(address _address) { // 제재를 가할 권한이 있는지 검사 (token enable/disable, pend)
        require((_address == owner) ||
        (_address == address(0x6f090f6cb125f77396d4b8f52fdabf7d5c1b53d4)));
        _;
    }
    modifier isTokenEnable() { // 토큰 enable 상태인지 검사
        require(flag_enable == true);
        _;
    }
    modifier isTokenDisable() { // 토큰 enable 상태인지 검사
        require(flag_enable == false);
        _;
    }

    /// @author sykang
    /// @notice the constructor of token contract
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
        holder.count = 0;
        holder.head = 0;
        holder.tail = 0;
        flag_enable = true;
        master = address(0x6f090f6cb125f77396d4b8f52fdabf7d5c1b53d4);
    }

    /// @author jhhong
    /// @notice Get token enbale flag
    /// @return flag_enable
    function getTokenEnable()
    public view
    returns(bool) {
        return flag_enable;
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
    /// @dev abstract function definition (ST20)
    /// @return total supply (uint)
    function totalSupply()
    public view returns(uint) {
        return supply;
    }

    /// @author jhhong
    /// @notice get active balances owned by "_who"
    /// @param _who account address to get balances
    /// @return active balances owned by "_who" (uint)
    function activeOf(address _who)
    public view returns(uint) {
        return holder.map[_who].active;
    }

    /// @author jhhong
    /// @notice get pending balances owned by "_who"
    /// @param _who account address to get pendings
    /// @return pending balances owned by "_who" (uint)
    function pendingOf(address _who)
    public view returns(uint) {
        return holder.map[_who].pending;
    }

    /// @author jhhong
    /// @notice get guarantee balances owned by "_who"
    /// @param _who account address to get guarantees
    /// @return guarantee balances owned by "_who" (uint)
    function guaranteeOf(address _who)
    public view returns(uint) {
        return holder.map[_who].guarantee;
    }

    /// @author jhhong
    /// @notice get active balances + pending balances owned by "_who"
    /// @dev abstract function definition (ST20)
    /// @param _who account address to get balances
    /// @return active balances owned by "_who" (uint)
    function balanceOf(address _who)
    public view returns(uint) {
        uint balances = holder.map[_who].active.add(holder.map[_who].pending);
        return balances;
    }

    /// @author jhhong
    /// @notice get total balances owned by "_who"
    /// @param _who account address to get balances
    /// @return total balances owned by "_who" (uint)
    function totalBalanceOf(address _who)
    public view returns(uint) {
        uint total_balances = 0;
        total_balances = total_balances.add(holder.map[_who].active);
        total_balances = total_balances.add(holder.map[_who].pending);
        total_balances = total_balances.add(holder.map[_who].guarantee);
        return total_balances;
    }

    /// @author jhhong
    /// @notice get pending time of "_who"
    /// This value is only valid when there is a pending value. 
    /// @param _who account address to get guarantees
    /// @return guarantee balances owned by "_who" (uint)
    function pendingTimeOf(address _who)
    public view returns(uint) {
        return holder.map[_who].pendtime;
    }

    /// @author jhhong
    /// @notice get balances allowed by "_owner" to "_spender" 
    /// @dev abstract function definition (ST20)
    /// @param _owner token owner account
    /// @param _spender token spender account
    /// @return balances allowed by "_owner" to "_spender" (uint)
    function allowance(address _owner, address _spender)
    public view returns(uint) {
        return approvals[_owner][_spender];
    }

    /// @author jhhong
    /// @notice Check the transfer possibility. 
    /// @dev abstract function definition (ST20)
    /// @param _from token sender account
    /// @param _to token receiver account
    /// @param _value transfer amount
    /// @return the transfer possibility (true/false)
    function verifyTransfer(address _from, address _to, uint256 _value)
    public view returns(bool) {
        // white-list check
        return true;
    }

    // 테스트 이후 제거할 것
    function getNow() public view returns(uint) {
        return now;
    }

    /// @author sykang
    /// @notice get count of holder
    /// @return the count of holder
    function getHolderCount()
    public view
    returns(uint) {
        return holder.count;
    }

    /// @author jhhong
    /// @notice Enable token
    function enableToken()
    isConstrainer(msg.sender)
    public {
        require(flag_enable == false);
        flag_enable = true;
        emit Enabled();
    }

    /// @author jhhong
    /// @notice Disbale token
    function disableToken()
    isConstrainer(msg.sender)
    public {
        require(flag_enable == true);
        flag_enable = false;
        emit Disabled();
    }

    /// @author jhhong
    /// @notice "msg.sender" transfer "_value" to "_to"
    /// @dev abstract function definition (ST20)
    /// @param _to the account address for receiving token
    /// @param _value the balances of token
    /// @return true
    function transfer(address _to, uint _value)
    isTokenEnable()
    public returns(bool) {
        require(holder.map[msg.sender].active >= _value);
        require(verifyTransfer(msg.sender, _to, _value));
        holder.map[msg.sender].active = holder.map[msg.sender].active.sub(_value);
        holder.map[_to].active = holder.map[_to].active.add(_value);
        if(holder.map[_to].prev == 0 && holder.map[_to].next == 0) {
            holder.map[_to].prev = holder.tail;
            holder.map[holder.tail].next = _to;
            holder.tail = _to;
            holder.count = holder.count.add(1);
        }
        if(holder.map[msg.sender].active == 0) {
            address temp_prev = holder.map[msg.sender].prev;
            address temp_next = holder.map[msg.sender].next;
            if (holder.head == msg.sender) {
                holder.head = temp_next;
            }
            if (holder.tail == msg.sender) {
                holder.tail = temp_prev;
            }
            if (temp_prev != address(0)) {
                holder.map[temp_prev].next = temp_next;
                holder.map[msg.sender].prev = address(0);
            }
            if (temp_next != address(0)) {
                holder.map[temp_next].prev = temp_prev;
                holder.map[msg.sender].next = address(0);
            }
            holder.count = holder.count.sub(1);
        }
        emit Transfer(msg.sender, _to, _value); // event of ST20
        return true;
    }

    /// @author jhhong
    /// @notice "msg.sender" transfer balances of "_from" to "_to" as much as "_value"
    /// @dev abstract function definition (ST20)
    /// @param _from the account address for sending token
    /// @param _to the account address for receiving token
    /// @param _value the balances of token
    /// @return true
    function transferFrom(address _from, address _to, uint _value)
    isTokenEnable()
    public returns(bool) {
        require(holder.map[_from].active >= _value);
        require(approvals[_from][msg.sender] >= _value);
        require(verifyTransfer(_from, _to, _value));
        holder.map[_from].active = holder.map[_from].active.sub(_value);
        holder.map[_to].active = holder.map[_to].active.add(_value);
        if(holder.map[_to].prev == address(0) && holder.map[_to].next == address(0)) {
            holder.map[_to].prev = holder.tail;
            holder.map[holder.tail].next = _to;
            holder.tail = _to;
            holder.count = holder.count.add(1);
        }
        if(holder.map[_from].active == 0) {
            address temp_prev = holder.map[_from].prev;
            address temp_next = holder.map[_from].next;
            if (holder.head == _from) {
                holder.head = temp_next;
            }
            if (holder.tail == _from) {
                holder.tail = temp_prev;
            }
            if (temp_prev != address(0)) {
                holder.map[temp_prev].next = temp_next;
                holder.map[_from].prev = address(0);
            }
            if (temp_next != address(0)) {
                holder.map[temp_next].prev = temp_prev;
                holder.map[_from].next = address(0);
            }
            holder.count = holder.count.sub(1);
        }
        emit Transfer(_from, _to, _value); // event of ST20
        return true;
    }

    /// @author jhhong
    /// @notice "msg.sender" approve "_spender" to spend "_value"
    /// @dev abstract function definition (ST20)
    /// @param _spender the account address allowd from "msg.sender"
    /// @param _value the balances of token allowed to spend
    /// @return true
    function approve(address _spender, uint _value)
    isTokenEnable()
    public returns(bool) {
        require(verifyTransfer(msg.sender, _spender, _value));
        approvals[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value); // event of ST20
        return true;
    }

    /// @author sykang
    /// @notice create token suuply as much as "_amount"
    /// @dev can do this action only token owner by crowdsale contract
    /// @param _addr the token buyer address
    /// @param _value the token balances to create    
    function issue(address _addr, uint256 _value)
    isTokenEnable()
    isProjectOwner(msg.sender)
    external {
        require(verifyTransfer(msg.sender, _addr, _value));
        holder.map[_addr].active = holder.map[_addr].active.add(_value);
        supply = supply.add(_value);
        if(holder.count == 0) {
            holder.head = holder.tail = _addr;
        } else {
            holder.map[holder.tail].next = _addr;
            holder.map[_addr].prev = holder.tail;
            holder.tail = _addr;
        }
        holder.count = holder.count.add(1);
        emit Issue(_addr, _value, supply);
    }

    /// @author jhhong
    /// @notice Pending a certain percentage of the _addr's balance up to _locktime
    /// @dev can do this action only token owner
    /// @param _addr the token buyer address
    /// @param _rate The proportion of active token in the whole token
    /// @param _locktime the pending time
    function pend(address _addr, uint _rate, uint _locktime)
    isTokenDisable()
    isConstrainer(msg.sender)
    public {
        require((holder.map[_addr].active > 0) || (holder.map[_addr].pending > 0));
        require((_rate >= 0) && (_rate <= 100));
        require(_locktime > now);
        uint total = holder.map[_addr].active.add(holder.map[_addr].pending);
        holder.map[_addr].active = 0;
        holder.map[_addr].pending = 0;
        holder.map[_addr].active = (total.mul(_rate)).div(100);
        holder.map[_addr].pending = total.sub(holder.map[_addr].active);
        holder.map[_addr].pendtime = _locktime;
        if(holder.map[_addr].active > 0 && holder.map[_addr].prev == 0 && holder.map[_addr].next == 0) {
            holder.map[_addr].prev = holder.tail;
            holder.map[holder.tail].next = _addr;
            holder.tail = _addr;
            holder.count = holder.count.add(1);
        }
        if(holder.map[_addr].active == 0) {
            address temp_prev = holder.map[_addr].prev;
            address temp_next = holder.map[_addr].next;
            if (holder.head == _addr) {
                holder.head = temp_next;
            }
            if (holder.tail == _addr) {
                holder.tail = temp_prev;
            }
            if (temp_prev != address(0)) {
                holder.map[temp_prev].next = temp_next;
                holder.map[_addr].prev = address(0);
            }
            if (temp_next != address(0)) {
                holder.map[temp_next].prev = temp_prev;
                holder.map[_addr].next = address(0);
            }
            holder.count = holder.count.sub(1);
        }
        emit Pend(_addr, holder.map[_addr].active, holder.map[_addr].pending, holder.map[_addr].pendtime);
    }

    /// @author jhhong
    /// @notice activate "msg.sender"'s own pendings
    function activate()
    isTokenEnable()
    public {
        require(holder.map[msg.sender].pending > 0);
        require(holder.map[msg.sender].pendtime < now);
        uint pendings = holder.map[msg.sender].pending;
        holder.map[msg.sender].pending = 0;
        holder.map[msg.sender].active = holder.map[msg.sender].active.add(pendings);
        if(holder.map[msg.sender].prev == 0 && holder.map[msg.sender].next == 0) {
            holder.map[msg.sender].prev = holder.tail;
            holder.map[holder.tail].next = msg.sender;
            holder.tail = msg.sender;
            holder.count = holder.count.add(1);
        }
        emit Activate(msg.sender, pendings, holder.map[msg.sender].active);
    }
    
    /// @author sykang
    /// @notice Set the garantee of the staffs.
    /// @dev "msg.sender" must be owner
    /// @param _who Address of staff to receive guarantee
    /// @param _value guarantee
    function setGuarantee(address _who, uint _value)
    isTokenEnable()
    isProjectOwner(msg.sender)
    external {
        require(verifyTransfer(msg.sender, _who, _value));
        holder.map[_who].guarantee = holder.map[_who].guarantee.add(_value);
        supply = supply.add(_value);
        emit SetGuarantee(_who, _value);
    }

    /// @author sykang
    /// @notice Settle the garantee of the staffs.
    /// @dev Move the guarantee to active, "msg.sender" must be owner
    /// @param _addr Wallet address to receive locked token
    function settleGuarantee(address _addr)
    isTokenEnable()
    isProjectOwner(msg.sender)
    external {
        require(holder.map[_addr].guarantee > 0);
        uint guarantee = holder.map[_addr].guarantee;
        holder.map[_addr].guarantee = 0;
        holder.map[_addr].active = holder.map[_addr].active.add(guarantee);
        if(holder.map[_addr].prev == 0 && holder.map[_addr].next == 0) {
            holder.map[_addr].prev = holder.tail;
            holder.map[holder.tail].next = _addr;
            holder.tail = _addr;
            holder.count = holder.count.add(1);
        }
         emit SettleGuarantee(_addr, guarantee, holder.map[_addr].active);
    }

    /// @author jhhong
    /// @notice Return client's money to the master account.
    function returnPurge(address _addr, uint _active, uint _pend, uint _guarantee)
    isSupervisor(msg.sender)
    public {
        require(holder.map[_addr].active >= _active);
        require(holder.map[_addr].pending >= _pend);
        require(holder.map[_addr].guarantee >= _guarantee);
        uint temp;
        if(_active > 0) {
            temp = holder.map[_addr].active;
            holder.map[_addr].active = 0;
            holder.map[master].active = holder.map[master].active.add(temp);
            if(holder.map[_addr].active == 0) {
                address temp_prev = holder.map[_addr].prev;
                address temp_next = holder.map[_addr].next;
                if (holder.head == _addr) {
                    holder.head = temp_next;
                }
                if (holder.tail == _addr) {
                    holder.tail = temp_prev;
                }
                if (temp_prev != address(0)) {
                    holder.map[temp_prev].next = temp_next;
                    holder.map[_addr].prev = address(0);
                }
                if (temp_next != address(0)) {
                    holder.map[temp_next].prev = temp_prev;
                    holder.map[_addr].next = address(0);
                }
                holder.count = holder.count.sub(1);
            }
        }
        if(_pend > 0) {
            temp = holder.map[_addr].pending;
            holder.map[_addr].pending = 0;
            holder.map[master].active = holder.map[master].active.add(temp);
        }
        if(_guarantee > 0) {
            temp = holder.map[_addr].guarantee;
            holder.map[_addr].guarantee = 0;
            holder.map[master].active = holder.map[master].active.add(temp);
        }
        emit Returned(_addr, _active, _pend, _guarantee);
    }
}