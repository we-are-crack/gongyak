// 공통 에러 응답 함수
export default function sendError(res, options = {}) {
  const { status = 'error', message = '서버 오류가 발생했습니다.', code = 500 } = options;
  res.status(code).set('Content-Type', 'application/json; charset=utf-8').json({ status, message, code });
}
