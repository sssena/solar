const fs = require('fs'); // File System
const path = require('path'); // Path
/* arguments 추출 */
let args_dir = path.resolve(__dirname, 'args'); // 파일 경로 획득: "../args/"
let args_json = fs.readFileSync(args_dir + '/provider.json'); // json 파일 내용 획득 --> "../args/provider.json"
let args = JSON.parse(args_json); // Json 파일 파싱을 통한 arguments 획득
const provider = args.provider; // provider 정보 획득
const web3path = args.web3;
/* web3 provider 설정 */
const Web3 = require('../../crp-web3');
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(provider));
/* exports 선언 */
exports.web3 = web3;
