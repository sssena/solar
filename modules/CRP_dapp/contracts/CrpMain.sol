pragma solidity ^ 0.4 .24;

import "./SafeMath.sol";
import "./CrpSaleMain.sol";
import "./CrpPollRoadmap.sol";
import "./CrpInfc.sol";
import "./CrpToken.sol";
import "./CrpFund.sol";

/// @title the CrpMain contract (version 0.1)
/// @author sykang4966@gmail.com
contract CrpMain is CrpInfc {
    using SafeMath
    for uint;

    // enum : mainStage의 상태 표현
    enum MAINSTAGE {
        INIT, // 생성 단계
        READY, // Staff-Poll 성공 단계
        SAILING, // 1차 크라우드세일 시작 단계
        PROCEEDING, // 프로젝트 제작 착수 단계
        FAILED, // 실패 단계
        COMPLETED // 프로젝트 제작 완료 단계
    }

    //struct : 토큰 정보
    struct TokenInfo {
        string name; //토큰 이름
        string symbol; //토큰 심볼
    }

    //struct : 크라우드세일 정보
    struct CrowdSaleInfo {
        uint start; // 시작시각
        uint end; // 종료시각
        uint softcap; // 최소금액
        uint hardcap; // 최대금액
        uint found_rate; // 추가 발행 비율
        uint crp_max; // 지갑당 최대 투자 금액
        uint crp_min; // 지갑당 최소 투자금액
        uint default_ratio; // 토큰교환 비율
        uint init_amount; // 초기 인출액
    }

    //struct : 로드맵별 정보 관리
    struct RoadmapInfo {
        uint start; //로드맵 투표 시작시각
        uint end; // 로드맵 투표 종료시각
        uint amount; // 전송할 Crp양
    }

    //struct : 스탭 정보 관리
    struct StaffInfo {
        address prev; // 전 스탭 주소
        address next; // 후 스탭 주소
        uint time; // 투표 시간
        uint amount; // 보유량
        bool agree; // 투표 결과 (찬성/반대)
    }

    //struct : 스탭 리스트 구조체
    struct StaffList {
        address head; // 스태프 체인 머리
        address tail; // 스태프 체인 꼬리
        uint num; // 스탭 총 인원
        uint result; // 투표 개표용 0이되면 가결, !0이면 부결
        uint start; //투표 시작시간
        uint end; // 투표 종료시간
        mapping(address => StaffInfo) map; // 스탭정보 관리 맵핑
    }

    //public variables
    string public title; // 프로젝트 이름 (parameters of constructor)
    MAINSTAGE public stage; // main 컨트렉트 현재 상태
    address public owner; // 프로듀서(생성자) 주소
    address public token_addr; // 토큰 컨트렉트 주소
    address public fund_addr; // 자금 컨트렉트 주소
    address[] public crowd_addrs; // 크라우드세일 컨트렉트 주소 (배열)
    address[] public roadmap_addrs; // 로드맵-poll 컨트렉트 주소 (배열)
    StaffList public staff_list; // Staff 리스트

    // private variables
    string constant contract_type = "MAIN"; //컨트렉트 타입을 나타내는 변수
    TokenInfo token_param; // 토큰 컨트렉트 생성을 위한 데이터
    CrowdSaleInfo sale_param; // 1차 크라우드세일 컨트렉트 생성을 위한 데이터
    RoadmapInfo[] roadmap_param; // 로드맵-poll 컨트렉트 생성을 위한 데이터
   
    //event
    event ChangeStage(MAINSTAGE _stage); // enum 변경시 이벤트 발생

    // modifier
    modifier isProjectOwner(address _address) { // 토큰 owner인지 검사
        require(_address == owner);
        _;
    }
    modifier isStaff(address _addr) { // 스탭인지 검사
        require(staff_list.map[_addr].amount != 0 || _addr == owner);
        _;
    }
    modifier isStateInit() { // init 상태인지 검사
        require(stage == MAINSTAGE.INIT);
        _;
    }
    modifier isStateReady() { // ready 상태인지 검사
        require(stage == MAINSTAGE.READY);
        _;
    }

    /// @author sykang
    /// @notice the constructor of CrpMain contract
    /// @dev Initialize Main Contract.
    /// @param _title project name
    constructor(string _title)
    public {
        title = _title;
        owner = msg.sender;
        stage = MAINSTAGE.INIT;
        staff_list.start = now;
        staff_list.end = now + 600; // for test (10분)
    }

    /// @author sykang
    /// @notice interface, return contract type
    /// @return const variable of contract_type    
    function getContractType()
    public view
    returns(string) {
        return contract_type;
    }

    // staff
    /// @author sykang
    /// @notice set Staff information
    /// @param _addr staff address
    /// @param _amount amount of token
    function setStaffInfo(address _addr, uint _amount)
    isProjectOwner(msg.sender)
    isStateInit()
    public {
        if (staff_list.head == address(0)) {
            staff_list.head = staff_list.tail = _addr;
        } else {
            if (staff_list.map[_addr].amount == 0) {
                staff_list.map[staff_list.tail].next = _addr;
                staff_list.map[_addr].prev = staff_list.tail;
                staff_list.tail = _addr;
            }
        }
        staff_list.map[_addr].amount = _amount;
        staff_list.num = staff_list.num.add(1);
        staff_list.result = staff_list.result.add(1);
    }

    /// @author sykang
    /// @notice get staff information
    /// @param _addr staff address
    /// @return haved amount of token, & poll ballot
    function getStaffInfo(address _addr)
    public view
    returns (uint, uint, bool){
        return (staff_list.map[_addr].time, staff_list.map[_addr].amount, staff_list.map[_addr].agree);
    }

    /// @author sykang
    /// @notice poll staff of regist staffInfo
    /// @param _vote vote
    function runPollStaff(uint _vote)
    isStaff(msg.sender)
    isStateInit()
    public {
        //require(now > staff_list.start && now < staff_list.end); 
        require(staff_list.map[msg.sender].time ==0);       
        staff_list.map[msg.sender].time = now;
        bool agree;
        if(_vote == 0){
            agree = false;
        }else if(_vote == 1){
            agree = true;
        }
        staff_list.map[msg.sender].agree = agree;        
        if (agree) {
            staff_list.result = staff_list.result.sub(1);
        }
    }

    /// @author sykang
    /// @notice cancel poll
    function cancelPollStaff()
    isStaff(msg.sender)
    isStateInit()
    public {
        //require(now > staff_list.start && now < staff_list.end);
        if (staff_list.map[msg.sender].agree) {
            staff_list.result = staff_list.result.add(1);
        }
        staff_list.map[msg.sender].time = 0;
    }

    /// @author sykang
    /// @notice end polling and settle polling
    function haltPollStaff()
    isProjectOwner(msg.sender)
    isStateInit()
    public {
        //require(now > staff_list.end);
        if (staff_list.result == 0) {
            changeStage(1);
        } else {
            changeStage(4);
        }
    }

    /// stage
    /// @author sykang
    /// @notice convert current state of crpMain
    /// @param _num set enum by _num
    function changeStage(uint _num)
    isProjectOwner(msg.sender)
    public {
        if (_num == 0) {
            stage = MAINSTAGE.INIT;
        } else if (_num == 1) {
            stage = MAINSTAGE.READY;
        } else if (_num == 2) {
            stage = MAINSTAGE.SAILING;
        } else if (_num == 3) {
            stage = MAINSTAGE.PROCEEDING;
        } else if (_num == 4) {
            stage = MAINSTAGE.FAILED;
        } else if (_num == 5) {
            stage = MAINSTAGE.COMPLETED;                               
        }
        emit ChangeStage(stage);
    }

    /// token function   
    /// @author sykang
    /// @notice set token params
    /// @param _name token name
    /// @param _symbol token symbol
    function setTokenParams(string _name, string _symbol)
    isProjectOwner(msg.sender)
    isStateInit()
    public {
        token_param.name = _name;
        token_param.symbol = _symbol;
    }

    /// @author sykang
    /// @notice get token params
    /// @return token information(name, symbol)
    function getTokenParams()
    public view
    returns(string, string) {
        return (token_param.name, token_param.symbol);
    }

    /// @author sykang
    /// @notice set token contract address
    /// @param _addr regist this address
    function setTokenAddress(address _addr)
    isProjectOwner(msg.sender)
    isStateReady()
    public {
        token_addr = _addr;
    }  

    /// @author sykang
    /// @notice get token address 
    /// @dev call global variable
    /// @return token contract address
    function getTokenAddress()
    public view
    returns(address) {
        return token_addr;
    }
    
    /// fund function
    /// @author sykang
    /// @notice make FundContract
    /// @dev make fund contract address by _addr
    function setFundAddress(address _addr)
    isProjectOwner(msg.sender)
    isStateReady()
    public {
        fund_addr = _addr;
    }

    /// @author sykang
    /// @notice get fund contract address
    /// @dev call global varialbe
    /// @return fund contract address
    function getFundAddress()
    public view
    returns(address) {
        return fund_addr;
    }

    //crowdsale_function
    /// @author sykang
    /// @notice set SaleMain Contract params
    /// @param _start crowdsale start time
    /// @param _end crowdsale end time
    /// @param _softcap minimum fund for start this project
    /// @param _hardcap maximum fund for start this project
    /// @param _found_rate crowFunding rate of whole
    /// @param _crp_max maximum fund of transfer one account
    /// @param _crp_min minimum fund of transfer one account
    /// @param _default_ratio chage rate to token by transfered crp
    /// @param _init_amount withdraw initial amount to transfer stapps
    function setMainSaleParams(uint _start, uint _end, uint _softcap, 
    uint _hardcap, uint _found_rate, uint _crp_max, uint _crp_min, uint _default_ratio, uint _init_amount)
    isProjectOwner(msg.sender)
    isStateInit()
    public {
        sale_param.start = _start;
        sale_param.end = _end;
        sale_param.softcap = _softcap;
        sale_param.hardcap = _hardcap;
        sale_param.found_rate = _found_rate;
        sale_param.crp_max = _crp_max;
        sale_param.crp_min = _crp_min;
        sale_param.default_ratio = _default_ratio;
        sale_param.init_amount = _init_amount;
    }

    /// @author sykang
    /// @notice get saleMain params for create saleMain contract
    /// @return return to struct that stored saleMain Params data
    function getMainSaleParams()
    public view
    returns(uint, uint, uint, uint, uint, uint, uint, uint, uint) {
        return (sale_param.start, sale_param.end, sale_param.softcap, sale_param.hardcap, 
        sale_param.found_rate, sale_param.crp_max, sale_param.crp_min, sale_param.default_ratio, sale_param.init_amount);
    }

    /// @author sykang
    /// @notice set CrowdSaleContract
    /// @dev store crowdSaleContract address in array
    /// @param _addr the crowdslae contract
    function addCrowdSaleAddress(address _addr)
    isProjectOwner(msg.sender)
    public {
        crowd_addrs.push(_addr);
    }
    

    /// @author sykang
    /// @notice get crowdSale contract address by index number
    /// @dev call global variable array
    /// @param _num the crowdslae contract number
    /// @return address in crowd_addrs array
    function getCrowdSaleAddress(uint _num)
    public view
    returns(address) {
        return crowd_addrs[_num];
    }    

    /// @author sykang
    /// @notice add the generated roadmap-poll contact address. 
    /// @dev call object in array
    function addRoadMapPollAddress(address _addr)
    isProjectOwner(msg.sender)
    public {
        roadmap_addrs.push(_addr);
    }

    /// @author sykang
    /// @notice set RoadMapPoll contract object by index number
    /// @dev call global variable array
    /// @param _num the road map poll contract number
    /// @return address of road map poll by index number
    function getRoadMapPollAddress(uint _num)
    public view
    returns(address) {
        return roadmap_addrs[_num];
    }

    /// @author sykang
    /// @notice set RoadMap plan by parameter
    /// @dev abstract function definition
    /// @param _start RoadMap poll start time
    /// @param _end RoadMap poll end times
    /// @param _amount pending amount Crp
    function addRoadmapPollParams(uint _start, uint _end, uint _amount)
    isProjectOwner(msg.sender)
    public {
        roadmap_param.push(RoadmapInfo(_start, _end, _amount));
    }

    /// @author sykang
    /// @notice get roadmap plan element
    /// @param _num roadmap number for show plan element
    /// @return return roamap plan element by _num
    function getRoadmapPollParams(uint8 _num)
    public view
    returns(uint, uint, uint) {
        return (roadmap_param[_num].start, roadmap_param[_num].end, roadmap_param[_num].amount);
    }

    /// @author jhhong
    /// @notice get the total count of roadmap plan
    /// @return return the total count of roadmap plan
    function getRoadmapPollParamsCount()
    public view
    returns(uint) {
        return (roadmap_param.length);
    }
}