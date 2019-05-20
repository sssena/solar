pragma solidity ^ 0.4 .24;

import "./SafeMath.sol";
import "./CrpInfc.sol";

/// @title 컨트랙트 코드 작성: CRP ADMIN STAFF DB
/// @notice user가 STAFF으로 속해있는 컨트랙트들 관리
/// @author jhhong
contract CrpAdminStaffDb {
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
    mapping(address => CaList) staffs; // user가 staff으로 참여 중인 컨트랙트 리스트
    string constant contract_type = "STAFFDB"; //컨트렉트 타입을 나타내는 변수
    // 이벤트
    event StaffCaAdded(address _who, address _ca, uint256 _count); // _who의 staffs에 _ca가 추가됨
    event StaffCaDeleted(address _who, address _ca, uint256 _count); // _who의 staffs에 _ca가 제거됨
    
    /// @author jhhong
    /// @notice CrpAdminStaffDb 컨트랙트 생성자
    /// 현재는 별도의 처리가 없다.
    constructor() public {}

    /// @author jhhong
    /// @notice 컨트랙트 타입(string)을 반환한다.
    /// @return 컨트랙트 타입(string)
    function getContractType() external pure returns(string) {
        return contract_type;
    }
    
    /// @author jhhong
    /// @notice _who가 staff으로 참여 중인 컨트랙트 리스트의 개수를 반환한다.
    /// @param _who Account 주소
    /// @return _who가 staff으로 참여 중인 컨트랙트 리스트의 개수
    function getCount(address _who) public view returns(uint256) {
        return staffs[_who].count;
    }

    /// @author jhhong
    /// @notice _who가 staff으로 참여 중인 컨트랙트 리스트의 헤드 정보(첫번째 컨트랙트)를 반환한다.
    /// @param _who Account 주소
    /// @return _who가 staff으로 참여 중인 컨트랙트 리스트의 헤드 정보(첫번째 컨트랙트)
    function getHead(address _who) public view returns(address) {
        return staffs[_who].head;
    }

    /// @author jhhong
    /// @notice _who가 staff으로 참여 중인 컨트랙트 리스트의 테일 정보(마지막 컨트랙트)를 반환한다.
    /// @param _who Account 주소
    /// @return _who가 staff으로 참여 중인 컨트랙트 리스트의 테일 정보(마지막 컨트랙트)
    function getTail(address _who) public view returns(address) {
        return staffs[_who].tail;
    }

    /// @author jhhong
    /// @notice _who의 staffs에서 _ca의 next 컨트랙트를 반환한다. (0이면 next가 없음을 의미)
    /// @param _who Account 주소
    /// @param _ca _who가 staff으로 참여 중인 컨트랙트 주소
    /// @return _who의 staffs에서 _ca의 next 컨트랙트 주소
    function nextOf(address _who, address _ca) public view returns(address) {
        return staffs[_who].map[_ca].next;
    }

    /// @author jhhong
    /// @notice _who의 staffs에서 _ca의 prev 컨트랙트를 반환한다. (0이면 prev가 없음을 의미)
    /// @param _who Account 주소
    /// @param _ca _who가 staff으로 참여 중인 컨트랙트 주소
    /// @return _who의 staffs에서 _ca의 prev 컨트랙트 주소
    function prevOf(address _who, address _ca) public view returns(address) {
        return staffs[_who].map[_ca].prev;
    }
    
    /// @author jhhong
    /// @notice _who의 staffs에 컨트랙트 주소 _ca를 추가한다.
    /// @param _who Account 주소
    /// @param _ca staffs에 추가할 컨트랙트 주소
    function addList(address _who, address _ca) public {
        if(staffs[_who].count == 0) {
            staffs[_who].head = staffs[_who].tail = _ca;
        } else {
            staffs[_who].map[staffs[_who].tail].next = _ca;
            staffs[_who].map[_ca].prev = staffs[_who].tail;
            staffs[_who].tail = _ca;
        }
        staffs[_who].count = staffs[_who].count.add(1);
        emit StaffCaAdded(_who, _ca, staffs[_who].count);
    }

    /// @author jhhong
    /// @notice _who의 staffs에서 컨트랙트 주소 _ca를 제거한다.
    /// @param _who Account 주소
    /// @param _ca staffs에 제거할 컨트랙트 주소
    function deleteList(address _who, address _ca) public {
        require((staffs[_who].map[_ca].prev != address(0) || staffs[_who].map[_ca].next != address(0)), "Invalid CA!");
        address temp_prev = staffs[_who].map[_ca].prev;
        address temp_next = staffs[_who].map[_ca].next;
        if (staffs[_who].head == _ca) {
            staffs[_who].head = temp_next;
        }
        if (staffs[_who].tail == _ca) {
            staffs[_who].tail = temp_prev;
        }
        if (temp_prev != address(0)) {
            staffs[_who].map[temp_prev].next = temp_next;
            staffs[_who].map[_ca].prev = address(0);
        }
        if (temp_next != address(0)) {
            staffs[_who].map[temp_next].prev = temp_prev;
            staffs[_who].map[_ca].next = address(0);
        }
        staffs[_who].count = staffs[_who].count.sub(1);
        emit StaffCaDeleted(_who, _ca, staffs[_who].count);
    }
}