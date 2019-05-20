let check_intval = 4000; // 발행한 tx가 block에 실렸는지 체크하는 주기 (default: 4000ms --> 4sec)
let check_count = 10; // 발행한 tx가 block에 실렸는지 체크하는 횟수 (default: 150회 --> 4 * 150 = 600 = 10분), 시험용으로 10번만 설정해뒀음
let retry_count = 3; // 특정 action이 성공할 때까지 반복할 횟수 (GUI 참조용 변수)
/* exports 선언 */
exports.check_intval = check_intval;
exports.check_count = check_count;
exports.retry_count = retry_count;