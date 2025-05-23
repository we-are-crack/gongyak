import { jest } from '@jest/globals.js';
import redisService from '../../services/redisService.js';
import client from '../../config/redisConfig.js';

// Redis 클라이언트 Mock 설정
client.hSet = jest.fn();
client.expire = jest.fn();
client.hGetAll = jest.fn();
client.scan = jest.fn();
client.sendCommand = jest.fn();
client.quit = jest.fn();

describe('RedisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await client.quit();
  });

  describe('save', () => {
    it('Redis에 데이터를 정상적으로 저장한다', async () => {
      client.hSet.mockResolvedValue('OK');
      client.expire.mockResolvedValue('OK');

      const searchQuery = '청년 주거 정책';
      const embedding = new Float32Array(384).fill(0.5);
      const htmlData = '<html><body>청년 주거 정책 내용</body></html>';

      await redisService.save(searchQuery, embedding, htmlData);

      expect(client.hSet).toHaveBeenCalledWith(`doc:${searchQuery}`, {
        searchQuery,
        embedding: Buffer.from(embedding.buffer),
        htmlData,
      });
      expect(client.expire).toHaveBeenCalledWith(`doc:${searchQuery}`, 86400);
    });

    it('Redis hSet에서 오류가 발생하면 예외를 던진다', async () => {
      client.hSet.mockRejectedValue(new Error('Redis 저장 오류'));
      client.expire.mockResolvedValue('OK');

      const searchQuery = '청년 주거 정책';
      const embedding = new Float32Array(384).fill(0.5);
      const htmlData = '<html><body>청년 주거 정책 내용</body></html>';

      await expect(redisService.save(searchQuery, embedding, htmlData)).rejects.toThrow('Redis 저장 오류');
    });
  });

  describe('findOne', () => {
    it('데이터가 존재하면 해당 데이터를 반환한다', async () => {
      client.hGetAll.mockResolvedValue({
        searchQuery: '청년 주거 정책',
        htmlData: '<html><body>청년 주거 정책 내용</body></html>',
      });

      const result = await redisService.findOne('청년 주거 정책');
      expect(result).toEqual({
        searchQuery: '청년 주거 정책',
        htmlData: '<html><body>청년 주거 정책 내용</body></html>',
      });
    });

    it('데이터가 존재하지 않으면 null을 반환한다', async () => {
      client.hGetAll.mockResolvedValue({});
      const result = await redisService.findOne('없는 검색어');
      expect(result).toBeNull();
    });

    it('Redis에서 오류가 발생하면 예외를 던진다', async () => {
      client.hGetAll.mockRejectedValue(new Error('Redis 조회 오류'));
      await expect(redisService.findOne('검색어')).rejects.toThrow('Redis 조회 오류');
    });
  });

  describe('findSome', () => {
    it('최대 6개의 검색 결과를 반환한다', async () => {
      // SCAN이 여러 번 호출되어 keys가 누적되도록 mock 설정
      client.scan
        .mockResolvedValueOnce(['1', ['doc:1', 'doc:2', 'doc:3']])
        .mockResolvedValueOnce(['0', ['doc:4', 'doc:5', 'doc:6']]);
      client.hGetAll.mockImplementation(key =>
        Promise.resolve({
          searchQuery: `검색어-${key}`,
          htmlData: `<html>${key}</html>`,
        }),
      );

      const result = await redisService.findSome(6);

      expect(client.scan).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(6);
      expect(result[0]).toHaveProperty('searchQuery');
      expect(result[0]).toHaveProperty('htmlData');
    });

    it('키가 없으면 빈 배열을 반환한다', async () => {
      client.scan.mockResolvedValue(['0', []]);
      const result = await redisService.findSome(6);
      expect(result).toHaveLength(0);
    });

    it('Redis SCAN에서 오류가 발생하면 예외를 던진다', async () => {
      client.scan.mockRejectedValue(new Error('Redis SCAN 오류'));
      await expect(redisService.findSome(6)).rejects.toThrow('Redis SCAN 오류');
    });
  });

  describe('searchByVector', () => {
    it('검색 결과가 있으면 JSON 형태로 반환한다', async () => {
      client.sendCommand.mockResolvedValue(['1', 'doc:xxx', ['searchQuery', '청년 주거 정책', 'score', '0.95']]);

      const embedding = new Float32Array(384).fill(0.5);
      const result = await redisService.searchByVector(embedding);

      expect(result).toEqual({
        searchQuery: '청년 주거 정책',
        score: 0.95,
      });
    });

    it('검색 결과가 없으면 null을 반환한다', async () => {
      client.sendCommand.mockResolvedValue(['0']);
      const embedding = new Float32Array(384).fill(0.5);
      const result = await redisService.searchByVector(embedding);
      expect(result).toBeNull();
    });

    it('Redis 벡터 검색에서 오류가 발생하면 예외를 던진다', async () => {
      client.sendCommand.mockRejectedValue(new Error('Redis 벡터 검색 오류'));
      const embedding = new Float32Array(384).fill(0.5);
      await expect(redisService.searchByVector(embedding)).rejects.toThrow('Redis 벡터 검색 오류');
    });
  });
});
