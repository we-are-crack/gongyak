/* eslint-disable import/prefer-default-export */
import RedisRepository from '../../repositories/RedisRepository.js';
import sendError from '../../utils/errorHandler.js';

export const searchQueryList = async (req, res) => {
  try {
    const searchQueryList = await RedisRepository.findSome();

    res.status(200).set('Content-Type', 'application/json; charset=utf-8').json({
      data: searchQueryList,
    });
  } catch (error) {
    console.error('검색어 리스트 조회 오류:', error);
    sendError(res);
  }
};
