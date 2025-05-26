/* eslint-disable import/prefer-default-export */
import fetch from 'node-fetch';
import RedisRepository from '../../repositories/RedisRepository.js';
import sendError from '../../utils/errorHandler.js';
import { validSearchQueryLengthLimit } from '../../utils/validation.js';

// Redis에서 비슷한 검색어가 있는지 검사
const checkSimilarSearchQuery = async enbedding => {
  try {
    const { searchQuery, score } = (await RedisRepository.searchByVector(enbedding)) || {};

    // Redis에 비슷한 검색어가 있고, 벡터 검색 시 코사인 유사도 점수가 0.8 이상이면 비슷한 검색어 존재
    if (searchQuery != null && score > 0.83) {
      return searchQuery;
    }

    return null;
  } catch (error) {
    throw new Error('Redis 장애: ' + error.message);
  }
};

// 범용 AI 서버 fetch 함수
const fetchAIServerAPI = async (endpoint, searchQuery) => {
  const q = encodeURIComponent(searchQuery);
  const url =
    process.env.NODE_ENV === 'development'
      ? `${process.env.TEST_AI_SERVER_DOMAIN}/${endpoint}?q=${q}`
      : `${process.env.AI_SERVER_DOMAIN}/${endpoint}?q=${q}`;
  const headers = { Accept: 'application/json' };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error(`AI 서버 응답 오류: ${response.status}`);
      return { error: true, status: 'aiServerError' };
    }
    const result = await response.json();
    return { error: false, result };
  } catch (err) {
    console.error('AI 서버 통신 실패:', err);
    return { error: true, status: 'aiServerError' };
  }
};

// 임베딩 추출
const fetchEmbedding = async searchQuery => {
  const { error, result } = await fetchAIServerAPI('embed', searchQuery);
  if (error) return { error: true, status: 'aiServerError' };
  return {
    queryEmbedding: result.query_embedding,
    passageEmbedding: result.passage_embedding,
  };
};

// 쿼리 결과 추출
const fetchAIServer = async searchQuery => {
  const { error, result } = await fetchAIServerAPI('query', searchQuery);
  if (error) return { error: true, status: 'aiServerError' };
  return { error: false, result };
};

// AI 서버에 쿼리를 보내고 결과를 반환하는 컨트롤러
export const search = async (req, res) => {
  const searchQuery = req.query.q || '';

  // 브라우저에서 직접 접근 시 안내 메시지 반환 (400.pug 렌더)
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.status(400).render('400', { searchQuery });
  }

  // 중복된 검색어 길이 제한 검사
  if (validSearchQueryLengthLimit(res, searchQuery)) return;

  try {
    let data = '';
    let rest = {};

    // Redis에 비슷한 검색어가 있는 지 검사
    console.log('searchQuery:', searchQuery);
    // const embedding = await getEmbedding(searchQuery);

    const { queryEmbedding, passageEmbedding } = await fetchEmbedding(searchQuery);
    const similarSearchQuery = await checkSimilarSearchQuery(queryEmbedding);

    // Redis에 비슷한 검색어가 있으면 Redis에서 데이터 가져오기
    if (similarSearchQuery !== null) {
      const findData = await RedisRepository.findOne(similarSearchQuery);
      data = JSON.parse(findData.data);
      rest = { searchQuery, status: 'ok' };
    } else {
      const aiResult = await fetchAIServer(searchQuery);

      if (aiResult.error) {
        return sendError(res, {
          status: aiResult.status,
        });
      }

      const { result } = aiResult;

      if (result.status === 'invalid') {
        return sendError(res, {
          status: 'invalid',
          message: '대선 공약과 관련된 내용만 검색해 주세요.',
          code: 400,
        });
      }

      data = result.data;
      rest = { searchQuery: result.searchQuery, status: result.status };

      // Redis에 검색어와 HTML 데이터 저장
      await RedisRepository.save(searchQuery, passageEmbedding, JSON.stringify(result.data));
    }

    res
      .status(200)
      .set('Content-Type', 'application/json; charset=utf-8')
      .json({ ...rest, data });
  } catch (error) {
    console.error(error);
    sendError(res, {
      message: error.message,
      status: error.status || 'error',
      code: error.code || 500,
    });
  }
};
