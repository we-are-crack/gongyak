// 공통 에러 응답 함수
export default function sendError(res, { status = 'error', message = '서버 오류가 발생했습니다.', code = 500 }) {
  res.status(code).set('Content-Type', 'application/json; charset=utf-8').json({ status, message, code });
}
