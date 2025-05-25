/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
import { jest } from '@jest/globals';
import { searchQueryList } from '../../../controllers/api/searchListApiController.js';
import RedisRepository from '../../../repositories/RedisRepository.js';

RedisRepository.findSome = jest.fn();

describe('searchQueryList', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should return search query list with status 200', async () => {
    const mockData = [{ searchQuery: 'test', htmlData: '<div>test</div>' }];
    RedisRepository.findSome.mockResolvedValue(mockData);

    await searchQueryList(req, res);

    expect(RedisRepository.findSome).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.set).toHaveBeenCalledWith('Content-Type', 'application/json; charset=utf-8');
    expect(res.json).toHaveBeenCalledWith({ data: mockData });
  });
});
