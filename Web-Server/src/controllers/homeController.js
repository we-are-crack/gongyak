import { validSearchQueryLengthLimit } from '../utils/validation.js';

// 홈 화면을 렌더링하는 컨트롤러
export const home = (req, res) => {
  res.render('home');
};

// 공유 요청을 처리하는 컨트롤러
export const share = (req, res) => {
  const searchQuery = req.query.q || '';

  // 검색어가 없으면 홈 화면으로 리다이렉트
  if (searchQuery === '') {
    return res.redirect('/');
  }

  // 검색어 길이 제한 검사
  if (validSearchQueryLengthLimit(res, searchQuery)) return;

  // 검색어가 있으면 검색 페이지(home.pug)에 검색어를 전달
  res.render('home', { sharedQuery: searchQuery });
};
