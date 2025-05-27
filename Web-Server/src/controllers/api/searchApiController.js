/* eslint-disable import/prefer-default-export */
import fetch from 'node-fetch';
import RedisRepository from '../../repositories/RedisRepository.js';
import sendError from '../../utils/errorHandler.js';
import { validSearchQueryLengthLimit } from '../../utils/validation.js';
import { parseDocs, generatePrompt } from '../../utils/prompt.js';
import Gemini from '../../utils/Gemini.js';

// Redis에서 비슷한 검색어가 있는지 검사
const checkSimilarSearchQuery = async enbedding => {
  try {
    const { searchQuery, score } = (await RedisRepository.searchByVector(enbedding)) || {};

    // Redis에 비슷한 검색어가 있고, 벡터 검색 시 코사인 유사도 점수가 0.8 이상이면 비슷한 검색어 존재
    if (searchQuery != null && score > 0.85) {
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

  console.log('AI 서버 요청 URL:', url);

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
  if (error) {
    console.error('임베딩 추출 실패');
    return { error: true, status: 'aiServerError' };
  }
  return {
    queryEmbedding: result.query_embedding,
    passageEmbedding: result.passage_embedding,
  };
};

// 쿼리 결과 추출
// const fetchQuery = async searchQuery => {
//   const { error, result } = await fetchAIServerAPI('query', searchQuery);
//   if (error) return { error: true, status: 'aiServerError' };
//   return { error: false, result };
// };

// 연관 문서 가져오기
const fetchDocs = async searchQuery => {
  const { error, result } = await fetchAIServerAPI('docs', searchQuery);
  if (error) {
    console.error('연관 문서 가져오기 실패');
    return { error: true, status: 'aiServerError' };
  }
  return { error: false, result };
};

// AI 서버에 쿼리를 보내고 결과를 반환하는 컨트롤러
export const search = async (req, res) => {
  const searchQuery = req.query.q || '';
  console.log('searchQuery:', searchQuery);

  // 브라우저에서 직접 접근 시 안내 메시지 반환 (400.pug 렌더)
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.status(400).render('400', { searchQuery });
  }

  // 중복된 검색어 길이 제한 검사
  if (validSearchQueryLengthLimit(res, searchQuery)) return;

  try {
    let data = '';
    let rest = {};

    // const embedding = await getEmbedding(searchQuery);

    // Redis에 비슷한 검색어가 있는 지 검사
    const { queryEmbedding, passageEmbedding } = await fetchEmbedding(searchQuery);
    const similarSearchQuery = await checkSimilarSearchQuery(queryEmbedding);

    // Redis에 비슷한 검색어가 있으면 Redis에서 데이터 가져오기
    if (similarSearchQuery !== null) {
      const findData = await RedisRepository.findOne(similarSearchQuery);
      data = JSON.parse(findData.data);
      rest = { searchQuery, status: 'ok' };
    } else {
      let prompt = '';
      let geminiResult = {};
      const gemini = await Gemini.getInstance();

      // 후보자 공약과 관련된 질문인지 Gemini AI로 판단
      prompt = generatePrompt(searchQuery);
      geminiResult = await gemini.generateContent(prompt);

      if (JSON.parse(geminiResult.slice(7, -3)).status === 'invalid') {
        return sendError(res, {
          status: 'invalid',
          message: '대선 공약과 관련된 내용만 검색해 주세요.',
          code: 400,
        });
      }

      // AI 서버에 관련 문서 데이터 요청
      const aiResult = await fetchDocs(searchQuery);

      if (aiResult.error) {
        return sendError(res, {
          status: aiResult.status,
        });
      }

      // AI 서버에서 받은 문서 데이터로 다시 Gemini AI에 공약 요약 요청
      const docs = aiResult.result.data;
      prompt = generatePrompt(searchQuery, parseDocs(docs));
      geminiResult = await gemini.generateContent(prompt);

      data = JSON.parse(geminiResult.slice(7, -3)).data;
      rest = { searchQuery, status: 'ok' };

      // Redis에 검색어와 HTML 데이터 저장
      await RedisRepository.save(searchQuery, passageEmbedding, JSON.stringify(data));
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
