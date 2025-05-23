import fetch from 'node-fetch';
import redisService from '../services/redisService.js';

/**
 * @description 홈 화면 렌더링 컨트롤러
 */
export const home = (req, res) => {
  res.render('home');
};

/**
 * @description AI 서버에 쿼리를 보내고 결과를 반환하는 컨트롤러
 */
export const pledges = async (req, res) => {
  let searchQuery = req.query.q || '';

  // 브라우저에서 직접 접근 시 안내 메시지 반환 (400.pug 렌더)
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.status(400).render('400', { searchQuery });
  }

  // 중복된 검색어 길이 제한 검사
  if (validSearchQueryLengthLimit(res, searchQuery)) return;

  const url = `http://127.0.0.1:${process.env.AI_SERVER_PORT}/query?q=${encodeURIComponent(searchQuery)}`;
  const headers = { Accept: 'application/json' };

  try {
    // 운영 환경에서는 기존 로직 사용
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`AI 서버 응답 오류: ${response.status}`);
    }

    const data = await response.json();

    const htmlData = data.htmlData;
    const rest = { search: data.search, status: data.status };

    const finalHtmlData = typeof htmlData === 'string' ? htmlData.substring(7, htmlData.length - 3) : '';

    res
      .status(200)
      .set('Content-Type', 'application/json; charset=utf-8')
      .json({ ...rest, htmlData: finalHtmlData });
  } catch (error) {
    res.status(500).set('Content-Type', 'application/json; charset=utf-8').json({
      search: '',
      status: 'error',
      htmlData: '',
    });
  }
};

/**
 * @description 공유 요청을 처리하는 컨트롤러
 */
export const share = async (req, res) => {
  let searchQuery = req.query.q || '';

  // 검색어가 없으면 홈 화면으로 리다이렉트
  if (searchQuery === '') {
    return res.redirect('/');
  }

  // 검색어 길이 제한 검사
  if (validSearchQueryLengthLimit(res, searchQuery)) return;

  // 검색어가 없으면 홈 화면으로 리다이렉트

  // 검색어가 있으면 검색 페이지(home.pug)에 검색어를 전달
  res.render('home', { sharedQuery: searchQuery });
};

/**
 * @description 검색어 길이 제한 검사
 */
const validSearchQueryLengthLimit = (res, searchQuery) => {
  if (typeof searchQuery === 'string' && searchQuery.length > 50) {
    res.status(200).set('Content-Type', 'application/json; charset=utf-8').json({
      search: '',
      status: 'tooLong',
      htmlData: '',
    });
    return true;
  }
  return false;
};

/**
 * @description Redis에 비슷한 검색어가 있는지 검사
 */
const checkSimilarSearchQuery = async searchQuery => {
  redisService;
};
