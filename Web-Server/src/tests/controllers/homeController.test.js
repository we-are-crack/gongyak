import { checkSimilarSearchQuery } from '../../controllers/homeController.js';
import redisService from '../../services/redisService.js';
import { jest } from '@jest/globals';

describe('checkSimilarSearchQuery', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('유사 검색어가 있고 score가 0.8 초과면 검색어 반환', async () => {
    redisService.searchByVector.mockResolvedValue({ searchQuery: '청년 정책', score: 0.85 });
    const result = await checkSimilarSearchQuery(new Float32Array(384));
    expect(result).toBe('청년 정책');
  });

  it('유사 검색어가 없거나 score가 0.8 이하이면 null 반환', async () => {
    redisService.searchByVector.mockResolvedValue({ searchQuery: '청년 정책', score: 0.7 });
    const result = await checkSimilarSearchQuery(new Float32Array(384));
    expect(result).toBeNull();
  });

  it('searchByVector가 null을 반환하면 null 반환', async () => {
    redisService.searchByVector.mockResolvedValue(null);
    const result = await checkSimilarSearchQuery(new Float32Array(384));
    expect(result).toBeNull();
  });

  it('에러 발생 시 콘솔 에러 출력', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    redisService.searchByVector.mockRejectedValue(new Error('Redis 오류'));
    const result = await checkSimilarSearchQuery(new Float32Array(384));
    expect(errorSpy).toHaveBeenCalled();
    expect(result).toBeUndefined();
    errorSpy.mockRestore();
  });
});
