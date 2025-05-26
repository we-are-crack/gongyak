import client from '../config/redisConfig.js';

export default class RedisRepository {
  /**
   * 데이터 저장
   * @param {String} searchQuery - 검색어
   * @param {Float32Array} embedding - 384차원 벡터
   * @param {String} data - json 데이터
   */
  static async save(searchQuery, embedding, data) {
    // Float32Array로 강제 변환
    let vector = '';
    if (!(embedding instanceof Float32Array)) {
      vector = new Float32Array(embedding);
    } else {
      vector = embedding;
    }

    try {
      const key = `doc:${searchQuery}`;
      await client.hSet(key, {
        searchQuery,
        embedding: Buffer.from(vector.buffer),
        data,
      });

      const ttl = 86400; // 1일
      await client.expire(key, ttl);

      console.log(`Redis에 데이터 저장 완료: ${searchQuery}`);
    } catch (error) {
      console.error('Redis 데이터 저장 오류:', error);
      throw error;
    }
  }

  /**
   * 데이터 조회
   * @param {String} searchQuery - 검색어
   * @returns {Object} - 검색어, 데이터
   */
  static async findOne(searchQuery) {
    try {
      const key = `doc:${searchQuery}`;
      const result = await client.hGetAll(key);

      if (!result || Object.keys(result).length === 0) {
        return null;
      }

      return {
        searchQuery: result.searchQuery,
        data: result.data,
      };
    } catch (error) {
      console.error('Redis 데이터 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 일부 검색 결과 조회
   * @param {Number} limit - 조회할 결과 개수
   * @returns {Array} - {검색어, html 데이터} 리스트
   */
  static async findSome(limit = 6) {
    try {
      let cursor = '0';
      let keys = [];

      // SCAN으로 최대 limit개 키만 수집
      do {
        // eslint-disable-next-line no-await-in-loop
        const scanResult = await client.scan(cursor, { MATCH: 'doc:*', COUNT: limit });
        let nextCursor;
        let foundKeys;
        if (Array.isArray(scanResult)) {
          [nextCursor, foundKeys] = scanResult;
        } else if (scanResult && typeof scanResult === 'object' && 'cursor' in scanResult && 'keys' in scanResult) {
          nextCursor = scanResult.cursor;
          foundKeys = scanResult.keys;
        } else {
          throw new Error('Redis SCAN 결과 형식이 올바르지 않습니다.');
        }
        cursor = nextCursor;
        keys = keys.concat(foundKeys);
      } while (keys.length < limit && cursor !== '0');

      if (keys.length === 0) return [];

      const selectedKeys = keys.slice(0, limit);

      const searchQueryList = selectedKeys.map(key => key.replace('doc:', ''));

      // 바로 변환해서 반환
      return searchQueryList;
    } catch (error) {
      console.error('Redis 일부 검색 결과 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 벡터 검색
   * @param {Float32Array} queryEmbedding - 검색할 벡터
   * @returns {Object} - 검색어, 점수
   */
  static async searchByVector(queryEmbedding) {
    // Float32Array로 강제 변환
    let vector = '';
    if (!(queryEmbedding instanceof Float32Array)) {
      vector = new Float32Array(queryEmbedding);
    } else {
      vector = queryEmbedding;
    }

    try {
      const topK = 1; // 반환할 상위 결과 개수
      const indexName = 'vector_index';
      const vectorField = '@embedding';
      const vertorData = Buffer.from(vector.buffer);
      const returnFields = ['searchQuery', 'score'];
      const dialectVersion = '2';

      const command = [
        'FT.SEARCH',
        indexName,
        `*=>[KNN ${topK} ${vectorField} $vertorData AS score]`,
        'PARAMS',
        '2',
        'vertorData',
        vertorData,
        'SORTBY',
        'score',
        'RETURN',
        String(returnFields.length),
        ...returnFields,
        'DIALECT',
        dialectVersion,
      ];

      const result = await client.sendCommand(command);

      // 결과가 없으면 null 반환
      if (!result || result[0] === '0' || result.length <= 1) {
        console.error('Redis 벡터 검색 결과 없음');
        return null;
      }

      // result 구조: [ '1', 'doc:xxx', [ 'searchQuery', '값', 'score', '값' ] ]
      const fields = result[2];
      let searchQuery = null;
      let score = null;

      // 순서가 바뀔 수 있으므로 반복문으로 처리
      for (let i = 0; i < fields.length; i += 2) {
        if (fields[i] === 'searchQuery') {
          searchQuery = fields[i + 1];
        }
        if (fields[i] === 'score') {
          score = 1 - Number(fields[i + 1]); // RediSearch의 score는 "거리"이므로, 유사도는 (1 - score)
        }
      }

      console.log(`Redis 벡터 검색 완료: ${searchQuery}, 점수: ${score}`);

      return {
        searchQuery,
        score,
      };
    } catch (error) {
      console.error('Redis 벡터 검색 오류:', error);
      throw error;
    }
  }
}
