import { save, searchByVector } from '../../services/redisService.js';
import client from '../../config/redisConfig.js';
import { jest } from '@jest/globals';

// Redis 클라이언트 Mock 설정
client.hSet = jest.fn();
client.sendCommand = jest.fn();
client.quit = jest.fn();

describe('redisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await client.quit();
  });

  describe('save', () => {
    it('should save data to Redis successfully', async () => {
      // Mock Redis hSet 메서드
      client.hSet.mockResolvedValue('OK');

      const searchQuery = '청년 주거 정책';
      const embedding = new Float32Array(384).fill(0.5); // 384차원 벡터
      const html = '<html><body>청년 주거 정책 내용</body></html>';

      // save 호출
      await save(searchQuery, embedding, html);

      // Redis hSet 호출 확인
      expect(client.hSet).toHaveBeenCalledWith(`doc:${searchQuery}`, {
        searchQuery,
        embedding: Buffer.from(embedding.buffer), // Buffer로 변환된 벡터
        html,
      });
      console.log('save 테스트 성공');
    });

    it('should throw an error if Redis hSet fails', async () => {
      // Mock Redis hSet 메서드가 오류를 던지도록 설정
      client.hSet.mockRejectedValue(new Error('Redis 저장 오류'));

      const searchQuery = '청년 주거 정책';
      const embedding = new Float32Array(384).fill(0.5);
      const html = '<html><body>청년 주거 정책 내용</body></html>';

      // save 호출 및 오류 확인
      await expect(save(searchQuery, embedding, html)).rejects.toThrow('Redis 저장 오류');
    });
  });

  describe('searchByVector', () => {
    it('should return search results from Redis', async () => {
      // Mock Redis sendCommand 메서드
      const mockResult = [
        '2', // 검색된 총 결과 개수
        'doc:1', // 첫 번째 문서의 키
        ['searchQuery', '청년 주거 정책', 'html', '<html><body>내용</body></html>', 'score', '0.95'],
        'doc:2', // 두 번째 문서의 키
        ['searchQuery', '경제 정책', 'html', '<html><body>경제 내용</body></html>', 'score', '0.85'],
      ];
      client.sendCommand.mockResolvedValue(mockResult);

      const queryEmbedding = new Float32Array(384).fill(0.5); // 검색할 벡터
      const topK = 2; // 상위 2개 결과 반환

      // searchByVector 호출
      const result = await searchByVector(queryEmbedding, topK);

      // Redis sendCommand 호출 확인
      expect(client.sendCommand).toHaveBeenCalledWith([
        'FT.SEARCH',
        'vector_index',
        '*=>[KNN 2 @embedding $vertorData AS score]',
        'PARAMS',
        '2',
        'vertorData',
        Buffer.from(queryEmbedding.buffer),
        'SORTBY',
        'score',
        'RETURN',
        2,
        'searchQuery',
        'html',
        'DIALECT',
        '2',
      ]);

      // 결과 확인
      expect(result).toEqual(mockResult);
      console.log('searchByVector 테스트 성공');
    });

    it('should throw an error if Redis sendCommand fails', async () => {
      // Mock Redis sendCommand 메서드가 오류를 던지도록 설정
      client.sendCommand.mockRejectedValue(new Error('Redis 검색 오류'));

      const queryEmbedding = new Float32Array(384).fill(0.5);
      const topK = 2;

      // searchByVector 호출 및 오류 확인
      await expect(searchByVector(queryEmbedding, topK)).rejects.toThrow('Redis 검색 오류');
    });
  });
});
