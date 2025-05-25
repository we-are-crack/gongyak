/* eslint-disable import/prefer-default-export */
import sendError from './errorHandler.js';

// 검색어 길이 제한 검사
export function validSearchQueryLengthLimit(res, searchQuery) {
  if (typeof searchQuery === 'string' && searchQuery.length > 50) {
    sendError(res, {
      status: 'tooLong',
      message: '검색어는 50자 이내로 입력해 주세요.',
      code: 400,
    });
    return true;
  }
  return false;
}
