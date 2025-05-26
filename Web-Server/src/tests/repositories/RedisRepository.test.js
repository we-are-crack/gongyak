/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
import { jest } from '@jest/globals';
import RedisRepository from '../../repositories/RedisRepository.js';
import client from '../../config/redisConfig.js';

// Redis 클라이언트 Mock 설정
client.hSet = jest.fn();
client.expire = jest.fn();
client.hGetAll = jest.fn();
client.scan = jest.fn();
client.sendCommand = jest.fn();
client.quit = jest.fn();

describe('RedisRepository', () => {
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
      const data = JSON.stringify([
        {
          candidate: 'leejaemyung',
          pledges: [
            {
              mainPledge: '주요 정책1',
              sourceImage: '/images/leejaemyung1.png',
              details: ['세부 정책 내용1', '세부 정책 내용2'],
            },
          ],
        },
      ]);

      await RedisRepository.save(searchQuery, embedding, data);

      expect(client.hSet).toHaveBeenCalledWith(`doc:${searchQuery}`, {
        searchQuery,
        embedding: Buffer.from(embedding.buffer),
        data,
      });
      expect(client.expire).toHaveBeenCalledWith(`doc:${searchQuery}`, 86400);
    });

    it('Redis hSet에서 오류가 발생하면 예외를 던진다', async () => {
      client.hSet.mockRejectedValue(new Error('Redis 저장 오류'));
      client.expire.mockResolvedValue('OK');

      const searchQuery = '청년 주거 정책';
      const embedding = new Float32Array(384).fill(0.5);
      const data = JSON.stringify([
        {
          candidate: 'leejaemyung',
          pledges: [],
        },
      ]);

      await expect(RedisRepository.save(searchQuery, embedding, data)).rejects.toThrow('Redis 저장 오류');
    });
  });

  describe('findOne', () => {
    it('데이터가 존재하면 해당 데이터를 반환한다', async () => {
      client.hGetAll.mockResolvedValue({
        searchQuery: '청년 주거 정책',
        data: JSON.stringify([
          {
            candidate: 'leejaemyung',
            pledges: [],
          },
        ]),
      });

      const result = await RedisRepository.findOne('청년 주거 정책');
      expect(result).toEqual({
        searchQuery: '청년 주거 정책',
        data: JSON.stringify([
          {
            candidate: 'leejaemyung',
            pledges: [],
          },
        ]),
      });
    });

    it('데이터가 존재하지 않으면 null을 반환한다', async () => {
      client.hGetAll.mockResolvedValue({});
      const result = await RedisRepository.findOne('없는 검색어');
      expect(result).toBeNull();
    });

    it('Redis에서 오류가 발생하면 예외를 던진다', async () => {
      client.hGetAll.mockRejectedValue(new Error('Redis 조회 오류'));
      await expect(RedisRepository.findOne('검색어')).rejects.toThrow('Redis 조회 오류');
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

      const result = await RedisRepository.findSome(6);

      expect(client.scan).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(6);
    });

    it('키가 없으면 빈 배열을 반환한다', async () => {
      client.scan.mockResolvedValue(['0', []]);
      const result = await RedisRepository.findSome(6);
      expect(result).toHaveLength(0);
    });

    it('Redis SCAN에서 오류가 발생하면 예외를 던진다', async () => {
      client.scan.mockRejectedValue(new Error('Redis SCAN 오류'));
      await expect(RedisRepository.findSome(6)).rejects.toThrow('Redis SCAN 오류');
    });
  });

  describe('searchByVector', () => {
    it('검색 결과가 있으면 JSON 형태로 반환한다', async () => {
      // Redis FT.SEARCH 결과 예시: [ '1', 'doc:xxx', [ 'searchQuery', '청년 주거 정책', 'score', '0.05' ] ]
      client.sendCommand.mockResolvedValue(['1', 'doc:xxx', ['searchQuery', '청년 주거 정책', 'score', '0.05']]);

      const embedding = new Float32Array(384).fill(0.5);
      const result = await RedisRepository.searchByVector(embedding);

      expect(result).toEqual({
        searchQuery: '청년 주거 정책',
        score: 0.95, // 1 - 0.05
      });
    });

    it('검색 결과가 없으면 null을 반환한다', async () => {
      client.sendCommand.mockResolvedValue(['0']);
      const embedding = new Float32Array(384).fill(0.5);
      const result = await RedisRepository.searchByVector(embedding);
      expect(result).toBeNull();
    });

    it('Redis 벡터 검색에서 오류가 발생하면 예외를 던진다', async () => {
      client.sendCommand.mockRejectedValue(new Error('Redis 벡터 검색 오류'));
      const embedding = new Float32Array(384).fill(0.5);
      await expect(RedisRepository.searchByVector(embedding)).rejects.toThrow('Redis 벡터 검색 오류');
    });
  });
});
