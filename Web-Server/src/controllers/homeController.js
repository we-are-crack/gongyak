import fetch from 'node-fetch';
import getEmbedding from '../utils/embedding.js';
import redisService from '../services/redisService.js';

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
const checkSimilarSearchQuery = async enbedding => {
  try {
    const { searchQuery, score } = (await redisService.searchByVector(enbedding)) || {};

    // Redis에 비슷한 검색어가 있고, 벡터 검색 시 코사인 유사도 점수가 0.8 이상이면 비슷한 검색어 존재
    if (searchQuery != null && score > 0.9) {
      return searchQuery;
    }

    return null;
  } catch (error) {
    console.error(error);
  }
};

/**
 * @description 홈 화면 렌더링 컨트롤러
 */
export const home = (req, res) => {
  res.render('home');
};

/**
 * @description AI 서버에 쿼리를 보내고 결과를 반환하는 컨트롤러
 */
export const search = async (req, res) => {
  const searchQuery = req.query.q || '';

  // 브라우저에서 직접 접근 시 안내 메시지 반환 (400.pug 렌더)
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.status(400).render('400', { searchQuery });
  }

  // 중복된 검색어 길이 제한 검사
  if (validSearchQueryLengthLimit(res, searchQuery)) return;

  try {
    let htmlData = '';
    let rest = {};

    // Redis에 비슷한 검색어가 있는 지 검사
    console.log('searchQuery:', searchQuery);
    const embedding = await getEmbedding(searchQuery);
    const similarSearchQuery = await checkSimilarSearchQuery(embedding);

    // Redis에 비슷한 검색어가 있으면 Redis에서 데이터 가져오기
    if (similarSearchQuery !== null) {
      const findData = await redisService.findOne(similarSearchQuery);
      htmlData = findData.htmlData;
      rest = { search: searchQuery, status: 'ok' };
    } else {
      const q = encodeURIComponent(searchQuery);
      const url =
        process.env.NODE_ENV === 'development'
          ? `${process.env.TEST_AI_SERVER_URL}?q=${q}`
          : `${process.env.AI_SERVER_URL}?q=${q}`;
      console.log(process.env.NODE_ENV);
      console.log('AI 서버 URL:', url);
      const headers = { Accept: 'application/json' };
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`AI 서버 응답 오류: ${response.status}`);
      }

      const data = await response.json();

      htmlData = data.htmlData.substring(7, data.htmlData.length - 3);
      rest = { search: data.search, status: data.status };

      // Redis에 검색어와 HTML 데이터 저장
      await redisService.save(searchQuery, embedding, htmlData);
    }

    res
      .status(200)
      .set('Content-Type', 'application/json; charset=utf-8')
      .json({ ...rest, htmlData });
  } catch (error) {
    console.error(error);
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
export const share = (req, res) => {
  const searchQuery = req.query.q || '';

  // 검색어가 없으면 홈 화면으로 리다이렉트
  if (searchQuery === '') {
    return res.redirect('/');
  }

  // 검색어 길이 제한 검사
  if (validSearchQueryLengthLimit(res, searchQuery)) return;

  // 검색어가 있으면 검색 페이지(home.pug)에 검색어를 전달
  res.render('home', { sharedQuery: searchQuery });
};
