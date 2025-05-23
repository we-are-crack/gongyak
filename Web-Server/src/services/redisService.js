import client from '../config/redisConfig.js';

class RedisService {
  /**
   * 데이터 저장
   * @param {String} searchQuery - 검색어
   * @param {Float32Array} embedding - 384차원 벡터
   * @param {String} html - HTML 데이터
   */
  async save(searchQuery, embedding, html) {
    try {
      const key = `doc:${searchQuery}`;
      await client.hSet(key, {
        searchQuery,
        embedding: Buffer.from(embedding.buffer),
        html,
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
   * @returns {Object} - 검색어, HTML 데이터
   */
  async findOne(searchQuery) {
    try {
      const key = `doc:${searchQuery}`;
      const result = await client.hGetAll(key);

      if (!result || Object.keys(result).length === 0) {
        return null;
      }

      return {
        searchQuery: result.searchQuery,
        html: result.html,
      };
    } catch (error) {
      console.error('Redis 데이터 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 일부 검색 결과 조회
   * @param {Number} limit - 조회할 결과 개수
   * @returns {Array} - {검색어, HTML 데이터} 리스트
   */
  async findSome(limit = 6) {
    try {
      let cursor = '0';
      let keys = [];

      // SCAN으로 최대 limit개 키만 수집
      do {
        const [nextCursor, foundKeys] = await client.scan(cursor, { MATCH: 'doc:*', COUNT: limit });
        cursor = nextCursor;
        keys = keys.concat(foundKeys);
      } while (keys.length < limit && cursor !== '0');

      if (keys.length === 0) return [];

      const selectedKeys = keys.slice(0, limit);

      // 여러 키의 데이터를 병렬로 조회
      const results = await Promise.all(selectedKeys.map(key => client.hGetAll(key)));

      // 바로 변환해서 반환
      return results.map(data => ({
        searchQuery: data.searchQuery,
        html: data.html,
      }));
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
  async searchByVector(queryEmbedding) {
    try {
      const topK = 1; // 반환할 상위 결과 개수
      const indexName = 'vector_index';
      const vectorField = '@embedding';
      const vertorData = Buffer.from(queryEmbedding.buffer);
      const returnFields = ['searchQuery'];
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
        returnFields.length,
        ...returnFields,
        'DIALECT',
        dialectVersion,
      ];

      const result = await client.sendCommand(command);

      // 결과가 없으면 null 반환
      if (!result || result[0] === '0' || result.length <= 1) {
        return null;
      }

      // result 구조: [ '1', 'doc:xxx', [ 'searchQuery', '값', 'score', '값' ] ]
      const fields = result[2];
      let searchQuery = null;
      let score = null;

      // 순서가 바뀔 수 있으므로 반복문으로 처리
      for (let i = 0; i < fields.length; i += 2) {
        if (fields[i] === 'searchQuery') searchQuery = fields[i + 1];
        if (fields[i] === 'score') score = Number(fields[i + 1]);
      }

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

export default new RedisService();
