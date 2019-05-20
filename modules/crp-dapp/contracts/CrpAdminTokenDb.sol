pragma solidity ^ 0.4 .24;

import "./SafeMath.sol";
import "./CrpInfc.sol";

/// @title 컨트랙트 코드 작성: CRP ADMIN USER STATUS
/// @notice user 각각의 정보들을 관리하기 위한 컨트랙트
/// user 정보1: user가 토큰을 보유한 컨트랙트 리스트
/// user 정보2: user가 staff으로 참여 중인 컨트랙트 리스트
/// @author jhhong
contract CrpAdminTokenDb {
    using SafeMath for uint256;

    // 구조체 : 컨트랙트 주소 정보 (chaining)
    struct CaChainInfo {
        address prev; // 현 CA의 전 CA
        address next; // 현 CA의 다음 CA
    }
    // 구조체 : 컨트랙트 주소 list
    struct CaList {
        uint256 count; // 리스트 노드의 총 개수
        address head; // 체인의 머리
        address tail; // 체인의 꼬리
        mapping(address => CaChainInfo) map; // CA chain 정보 관리 매핑
    }
    mapping(address => CaList) owns; // user가 토큰을 보유한 컨트랙트 리스트
    string constant contract_type = "TOKENDB"; //컨트렉트 타입을 나타내는 변수
    // 이벤트
    event TokenCaAdded(address _who, address _ca, uint256 _count); // _who의 Owns에 _ca가 추가됨
    event TokenCaDeleted(address _who, address _ca, uint256 _count); // _who의 Owns에 _ca가 제거됨됨
    
    /// @author jhhong
    /// @notice CrpAdminUsrStat 컨트랙트 생성자
    /// 현재는 별도의 처리가 없다.
    constructor() public {}

    /// @author jhhong
    /// @notice 컨트랙트 타입(string)을 반환한다.
    /// @return 컨트랙트 타입(string)
    function getContractType() external pure returns(string) {
        return contract_type;
    }
    
    /// @author jhhong
    /// @notice _who가 토큰을 보유한 컨트랙트 리스트의 개수를 반환한다.
    /// @param _who Account 주소
    /// @return _who가 토큰을 보유한 컨트랙트 리스트의 개수
    function getCount(address _who) public view returns(uint256) {
        return owns[_who].count;
    }

    /// @author jhhong
    /// @notice _who가 토큰을 보유한 컨트랙트 리스트의 헤드 정보(첫번째 컨트랙트)를 반환한다.
    /// @param _who Account 주소
    /// @return _who가 토큰을 보유한 컨트랙트 리스트의 헤드 정보(첫번째 컨트랙트)
    function getHead(address _who) public view returns(address) {
        return owns[_who].head;
    }

    /// @author jhhong
    /// @notice _who가 토큰을 보유한 컨트랙트 리스트의 테일 정보(마지막 컨트랙트)를 반환한다.
    /// @param _who Account 주소
    /// @return _who가 토큰을 보유한 컨트랙트 리스트의 테일 정보(마지막 컨트랙트)
    function getTail(address _who) public view returns(address) {
        return owns[_who].tail;
    }

    /// @author jhhong
    /// @notice _who의 owns에서 _ca의 next 컨트랙트를 반환한다. (0이면 next가 없음을 의미)
    /// @param _who Account 주소
    /// @param _ca _who가 토큰을 보유한 컨트랙트 주소
    /// @return _who의 owns에서 _ca의 next 컨트랙트 주소
    function nextOf(address _who, address _ca) public view returns(address) {
        return owns[_who].map[_ca].next;
    }

    /// @author jhhong
    /// @notice _who의 owns에서 _ca의 prev 컨트랙트를 반환한다. (0이면 prev가 없음을 의미)
    /// @param _who Account 주소
    /// @param _ca _who가 토큰을 보유한 컨트랙트 주소
    /// @return _who의 owns에서 _ca의 prev 컨트랙트 주소
    function prevOf(address _who, address _ca) public view returns(address) {
        return owns[_who].map[_ca].prev;
    }

    /// @author jhhong
    /// @notice _who의 owns에 컨트랙트 주소 _ca를 추가한다.
    /// @param _who Account 주소
    /// @param _ca owns에 추가할 컨트랙트 주소
    function addList(address _who, address _ca) public {
        if(owns[_who].count == 0) {
            owns[_who].head = owns[_who].tail = _ca;
        } else {
            owns[_who].map[owns[_who].tail].next = _ca;
            owns[_who].map[_ca].prev = owns[_who].tail;
            owns[_who].tail = _ca;
        }
        owns[_who].count = owns[_who].count.add(1);
        emit TokenCaAdded(_who, _ca, owns[_who].count);
    }

    /// @author jhhong
    /// @notice _who의 owns에서 컨트랙트 주소 _ca를 제거한다.
    /// @param _who Account 주소
    /// @param _ca owns에 제거할 컨트랙트 주소
    function deleteList(address _who, address _ca) public {
        require((owns[_who].map[_ca].prev != address(0) || owns[_who].map[_ca].next != address(0)), "Invalid CA!");
        address temp_prev = owns[_who].map[_ca].prev;
        address temp_next = owns[_who].map[_ca].next;
        if (owns[_who].head == _ca) {
            owns[_who].head = temp_next;
        }
        if (owns[_who].tail == _ca) {
            owns[_who].tail = temp_prev;
        }
        if (temp_prev != address(0)) {
            owns[_who].map[temp_prev].next = temp_next;
            owns[_who].map[_ca].prev = address(0);
        }
        if (temp_next != address(0)) {
            owns[_who].map[temp_next].prev = temp_prev;
            owns[_who].map[_ca].next = address(0);
        }
        owns[_who].count = owns[_who].count.sub(1);
        emit TokenCaDeleted(_who, _ca, owns[_who].count);
    }
}