const fs = require('fs'); // file-system
const path = require('path'); // path-package
const solc = require('solc'); // solidity compiler (^0.4.24)

/**
 * CrpToken Contract를 컴파일한다.
 * 컴파일 결과로 나온 abi와 bytecode를 file로 저장한다.
 *
 * @return compilation status (true / false)
 * @author jhhong
 */
function compileCrpToken() {
    console.log("Compile CrpToken Contract...");
    let result = false;
    let src_dir = path.resolve(__dirname, '..', 'contracts'); // solidity file이 위치한 directory path
    let input_src = {
        'ERC20Basic.sol': fs.readFileSync(src_dir+'/ERC20Basic.sol', 'utf-8'),
        'ERC20.sol': fs.readFileSync(src_dir+'/ERC20.sol', 'utf-8'),
        'SafeMath.sol': fs.readFileSync(src_dir+'/SafeMath.sol', 'utf-8'),
        'CrpInfc.sol': fs.readFileSync(src_dir+'/CrpInfc.sol', 'utf-8'),
        'CrpToken.sol': fs.readFileSync(src_dir+'/CrpToken.sol', 'utf-8')
    };
    let compiled_contract = solc.compile({sources: input_src}); // solc를 이용한 source file 컴파일 (두번째 인자로 1을 넣으면 optimizer enable)
    let abi = compiled_contract.contracts['CrpToken.sol:CrpToken'].interface; // abi 추출
    let data = '0x' + compiled_contract.contracts['CrpToken.sol:CrpToken'].bytecode; // bytecode 추출
    let abi_path = path.resolve(__dirname, 'abi', 'CrpToken.abi'); // abi를 저장할 file path
    let data_path = path.resolve(__dirname, 'data', 'CrpToken.data'); // data를 저장할 file path
    try {
        fs.writeFileSync(abi_path, abi, 'utf-8');
        console.log("abi write: ............success!");
        fs.writeFileSync(data_path, data, 'utf-8');
        console.log("data write: ...........success!");
        result = true;
    } catch (err) {
        console.log(err);
    }
    return result;
}

/**
 * CrpTokenNew Contract를 컴파일한다.
 * 컴파일 결과로 나온 abi와 bytecode를 file로 저장한다.
 *
 * @return compilation status (true / false)
 * @author jhhong
 */
function compileCrpTokenNew() {
    console.log("Compile CrpTokenNew Contract...");
    let result = false;
    let src_dir = path.resolve(__dirname, '..', 'contracts'); // solidity file이 위치한 directory path
    let input_src = {
        'ERC20Basic.sol': fs.readFileSync(src_dir+'/ERC20Basic.sol', 'utf-8'),
        'ERC20.sol': fs.readFileSync(src_dir+'/ERC20.sol', 'utf-8'),
        'SafeMath.sol': fs.readFileSync(src_dir+'/SafeMath.sol', 'utf-8'),
        'CrpInfc.sol': fs.readFileSync(src_dir+'/CrpInfc.sol', 'utf-8'),
        'CrpTokenNew.sol': fs.readFileSync(src_dir+'/CrpTokenNew.sol', 'utf-8')
    };
    let compiled_contract = solc.compile({sources: input_src}); // solc를 이용한 source file 컴파일 (두번째 인자로 1을 넣으면 optimizer enable)
    let abi = compiled_contract.contracts['CrpTokenNew.sol:CrpTokenNew'].interface; // abi 추출
    let data = '0x' + compiled_contract.contracts['CrpTokenNew.sol:CrpTokenNew'].bytecode; // bytecode 추출
    let abi_path = path.resolve(__dirname, 'abi', 'CrpTokenNew.abi'); // abi를 저장할 file path
    let data_path = path.resolve(__dirname, 'data', 'CrpTokenNew.data'); // data를 저장할 file path
    try {
        fs.writeFileSync(abi_path, abi, 'utf-8');
        console.log("abi write: ............success!");
        fs.writeFileSync(data_path, data, 'utf-8');
        console.log("data write: ...........success!");
        result = true;
    } catch (err) {
        console.log(err);
    }
    return result;
}

/**
 * CrpTokenSecure Contract를 컴파일한다.
 * 컴파일 결과로 나온 abi와 bytecode를 file로 저장한다.
 *
 * @return compilation status (true / false)
 * @author jhhong
 */
function compileCrpTokenSecure() {
    console.log("Compile CrpTokenSecure Contract...");
    let result = false;
    let src_dir = path.resolve(__dirname, '..', 'contracts'); // solidity file이 위치한 directory path
    let input_src = {
        'ST20.sol': fs.readFileSync(src_dir+'/ST20.sol', 'utf-8'),
        'SafeMath.sol': fs.readFileSync(src_dir+'/SafeMath.sol', 'utf-8'),
        'CrpInfc.sol': fs.readFileSync(src_dir+'/CrpInfc.sol', 'utf-8'),
        'CrpTokenSecure.sol': fs.readFileSync(src_dir+'/CrpTokenSecure.sol', 'utf-8')
    };
    let compiled_contract = solc.compile({sources: input_src}); // solc를 이용한 source file 컴파일 (두번째 인자로 1을 넣으면 optimizer enable)
    let abi = compiled_contract.contracts['CrpTokenSecure.sol:CrpTokenSecure'].interface; // abi 추출
    let data = '0x' + compiled_contract.contracts['CrpTokenSecure.sol:CrpTokenSecure'].bytecode; // bytecode 추출
    let abi_path = path.resolve(__dirname, 'abi', 'CrpTokenSecure.abi'); // abi를 저장할 file path
    let data_path = path.resolve(__dirname, 'data', 'CrpTokenSecure.data'); // data를 저장할 file path
    try {
        fs.writeFileSync(abi_path, abi, 'utf-8');
        console.log("abi write: ............success!");
        fs.writeFileSync(data_path, data, 'utf-8');
        console.log("data write: ...........success!");
        result = true;
    } catch (err) {
        console.log(err);
    }
    return result;
}

/**
 * CrpFund Contract를 컴파일한다.
 * 컴파일 결과로 나온 abi와 bytecode를 file로 저장한다.
 *
 * @return compilation status (true / false)
 * @author jhhong
 */
function compileCrpFund() {
    console.log("Compile CrpFund Contract...");
    let result = false;
    let src_dir = path.resolve(__dirname, '..', 'contracts'); // solidity file이 위치한 directory path
    let input_src = {
        'SafeMath.sol': fs.readFileSync(src_dir+'/SafeMath.sol', 'utf-8'),
        'CrpInfc.sol': fs.readFileSync(src_dir+'/CrpInfc.sol', 'utf-8'),
        'CrpFund.sol': fs.readFileSync(src_dir+'/CrpFund.sol', 'utf-8')
    };
    let compiled_contract = solc.compile({sources: input_src}); // solc를 이용한 source file 컴파일 (두번째 인자로 1을 넣으면 optimizer enable)
    let abi = compiled_contract.contracts['CrpFund.sol:CrpFund'].interface; // abi 추출
    let data = '0x' + compiled_contract.contracts['CrpFund.sol:CrpFund'].bytecode; // bytecode 추출
    let abi_path = path.resolve(__dirname, 'abi', 'CrpFund.abi'); // abi를 저장할 file path
    let data_path = path.resolve(__dirname, 'data', 'CrpFund.data'); // data를 저장할 file path
    try {
        fs.writeFileSync(abi_path, abi, 'utf-8');
        console.log("abi write: ............success!");
        fs.writeFileSync(data_path, data, 'utf-8');
        console.log("data write: ...........success!");
        result = true;
    } catch (err) {
        console.log(err);
    }
    return result;
}

/**
 * CrpSaleMain Contract를 컴파일한다.
 * 컴파일 결과로 나온 abi와 bytecode를 file로 저장한다.
 *
 * @return compilation status (true / false)
 * @author jhhong
 */
function compileCrpSaleMain() {
    console.log("Compile CrpSaleMain Contract...");
    let result = false;
    let src_dir = path.resolve(__dirname, '..', 'contracts'); // solidity file이 위치한 directory path
    let input_src = {
        'SafeMath.sol': fs.readFileSync(src_dir+'/SafeMath.sol', 'utf-8'),
        'CrpInfc.sol': fs.readFileSync(src_dir+'/CrpInfc.sol', 'utf-8'),
        'CrpFund.sol': fs.readFileSync(src_dir+'/CrpFund.sol', 'utf-8'),
        'CrpSaleMain.sol': fs.readFileSync(src_dir+'/CrpSaleMain.sol', 'utf-8')
    };
    let compiled_contract = solc.compile({sources: input_src}); // solc를 이용한 source file 컴파일 (두번째 인자로 1을 넣으면 optimizer enable)
    let abi = compiled_contract.contracts['CrpSaleMain.sol:CrpSaleMain'].interface; // abi 추출
    let data = '0x' + compiled_contract.contracts['CrpSaleMain.sol:CrpSaleMain'].bytecode; // bytecode 추출
    let abi_path = path.resolve(__dirname, 'abi', 'CrpSaleMain.abi'); // abi를 저장할 file path
    let data_path = path.resolve(__dirname, 'data', 'CrpSaleMain.data'); // data를 저장할 file path
    try {
        fs.writeFileSync(abi_path, abi, 'utf-8');
        console.log("abi write: ............success!");
        fs.writeFileSync(data_path, data, 'utf-8');
        console.log("data write: ...........success!");
        result = true;
    } catch (err) {
        console.log(err);
    }
    return result;
}

/**
 * CrpPollRoadmap Contract를 컴파일한다.
 * 컴파일 결과로 나온 abi와 bytecode를 file로 저장한다.
 *
 * @return compilation status (true / false)
 * @author jhhong
 */
function compileCrpPollRoadmap() {
    console.log("Compile CrpPollRoadmap Contract...");
    let result = false;
    let src_dir = path.resolve(__dirname, '..', 'contracts'); // solidity file이 위치한 directory path
    let input_src = {
        'SafeMath.sol': fs.readFileSync(src_dir+'/SafeMath.sol', 'utf-8'),
        'CrpInfc.sol': fs.readFileSync(src_dir+'/CrpInfc.sol', 'utf-8'),
        'CrpPollRoadmap.sol': fs.readFileSync(src_dir+'/CrpPollRoadmap.sol', 'utf-8')
    };
    let compiled_contract = solc.compile({sources: input_src}); // solc를 이용한 source file 컴파일 (두번째 인자로 1을 넣으면 optimizer enable)
    let abi = compiled_contract.contracts['CrpPollRoadmap.sol:CrpPollRoadmap'].interface; // abi 추출
    let data = '0x' + compiled_contract.contracts['CrpPollRoadmap.sol:CrpPollRoadmap'].bytecode; // bytecode 추출
    let abi_path = path.resolve(__dirname, 'abi', 'CrpPollRoadmap.abi'); // abi를 저장할 file path
    let data_path = path.resolve(__dirname, 'data', 'CrpPollRoadmap.data'); // data를 저장할 file path
    try {
        fs.writeFileSync(abi_path, abi, 'utf-8');
        console.log("abi write: ............success!");
        fs.writeFileSync(data_path, data, 'utf-8');
        console.log("data write: ...........success!");
        result = true;
    } catch (err) {
        console.log(err);
    }
    return result;
}
/**
 * CrpMain Contract를 컴파일한다.
 * 컴파일 결과로 나온 abi와 bytecode를 file로 저장한다.
 *
 * @return compilation status (true / false)
 * @author jhhong
 */
function compileCrpMain() {
    console.log("Compile CrpMain Contract...");
    let result = false;
    let src_dir = path.resolve(__dirname, '..', 'contracts'); // solidity file이 위치한 directory path
    let input_src = {
        'ERC20Basic.sol': fs.readFileSync(src_dir+'/ERC20Basic.sol', 'utf-8'),
        'ERC20.sol': fs.readFileSync(src_dir+'/ERC20.sol', 'utf-8'),
        'SafeMath.sol': fs.readFileSync(src_dir+'/SafeMath.sol', 'utf-8'),
        'CrpInfc.sol': fs.readFileSync(src_dir+'/CrpInfc.sol', 'utf-8'),
        'CrpToken.sol': fs.readFileSync(src_dir+'/CrpToken.sol', 'utf-8'),
        'CrpFund.sol': fs.readFileSync(src_dir+'/CrpFund.sol', 'utf-8'),
        'CrpSaleMain.sol': fs.readFileSync(src_dir+'/CrpSaleMain.sol', 'utf-8'),
        'CrpPollRoadmap.sol': fs.readFileSync(src_dir+'/CrpPollRoadmap.sol', 'utf-8'),
        'CrpMain.sol': fs.readFileSync(src_dir+'/CrpMain.sol', 'utf-8')
    };
    let compiled_contract = solc.compile({sources: input_src}); // solc를 이용한 source file 컴파일 (두번째 인자로 1을 넣으면 optimizer enable)
    let abi = compiled_contract.contracts['CrpMain.sol:CrpMain'].interface; // abi 추출
    let data = '0x' + compiled_contract.contracts['CrpMain.sol:CrpMain'].bytecode; // bytecode 추출
    let abi_path = path.resolve(__dirname, 'abi', 'CrpMain.abi'); // abi를 저장할 file path
    let data_path = path.resolve(__dirname, 'data', 'CrpMain.data'); // data를 저장할 file path
    try {
        fs.writeFileSync(abi_path, abi, 'utf-8');
        console.log("abi write: ............success!");
        fs.writeFileSync(data_path, data, 'utf-8');
        console.log("data write: ...........success!");
        result = true;
    } catch (err) {
        console.log(err);
    }
    return result;
}

/**
 * 프로시져 수행 메인 함수이다.
 * 
 * 1. clear screen
 * 2. compileCrpToken
 * 3. compileCrpTokenNew
 * 4. compileCrpTokenSecure
 * 5. compileCrpFund
 * 6. compileCrpSaleMain
 * 7. compileCrpPollRoadmap
 * 8. compileCrpMain
 * 
 * @author jhhong
 */
let RunProc = async () => {
    try {
        console.clear();
        await compileCrpToken();
        await compileCrpTokenNew();
        await compileCrpTokenSecure();
        await compileCrpFund();
        await compileCrpSaleMain();
        await compileCrpPollRoadmap();
        await compileCrpMain();
    } catch(err) {}
}
RunProc();
