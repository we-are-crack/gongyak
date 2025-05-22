import client from '../config/redisConfig.js';

/**
 * 데이터 저장
 * @param {String} searchQuery - 검색어
 * @param {Float32Array} embedding - 384차원 벡터
 * @param {String} html - HTML 데이터
 */
export const save = async (searchQuery, embedding, html) => {
  try {
    // Redis에 데이터 저장 (Hash 구조 사용)
    const key = `doc:${searchQuery}`;

    await client.hSet(key, {
      searchQuery,
      embedding: Buffer.from(embedding.buffer), // 벡터를 Buffer로 변환
      html,
    });

    // 캐싱 기간 설정
    const ttl = 86400; // 1일
    await client.expire(key, ttl);

    console.log(`Redis에 데이터 저장 완료: ${searchQuery}`);
  } catch (error) {
    console.error('Redis 데이터 저장 오류:', error);
    throw error;
  }
};

/**
 * 벡터 검색
 * @param {Float32Array} queryEmbedding - 검색할 벡터
 * @param {Number} topK - 반환할 상위 결과 개수
 * @returns {Array} - 유사한 결과 리스트
 */
export const searchByVector = async (queryEmbedding, topK = 1) => {
  try {
    const indexName = 'vector_index'; // 검색할 인덱스 이름
    const vectorField = '@embedding'; // 벡터 필드 이름
    const vertorData = Buffer.from(queryEmbedding.buffer); // 검색할 벡터 데이터
    const returnFields = ['searchQuery', 'html']; // 반환할 필드
    const dialectVersion = '2'; // RediSearch 명령어 구문 버전

    const command = [
      'FT.SEARCH', // RediSearch 검색 명령어
      indexName,
      `*=>[KNN ${topK} ${vectorField} $vertorData AS score]`, // 벡터 검색 조건
      'PARAMS',
      '2',
      'vertorData',
      vertorData,
      'SORTBY',
      'score',
      'RETURN',
      returnFields.length,
      ...returnFields,
      'DIALECT',
      dialectVersion,
    ];

    const result = await client.sendCommand(command);

    console.log('벡터 검색 결과:', result);
    return result;
  } catch (error) {
    console.error('Redis 벡터 검색 오류:', error);
    throw error;
  }
};
