/* eslint-disable no-undef */
import { initSearch } from './search.js';
import bindRefimgPreviewHandlers from './preview.js';

document.addEventListener('DOMContentLoaded', () => {
  // JSON 노출 방지: HTML이 아닌 JSON이 직접 노출된 경우 안내
  if (
    typeof document.body === 'object' &&
    document.body.childElementCount === 0 &&
    document.body.textContent.trim().startsWith('{')
  ) {
    alert('페이지가 정상적으로 표시되지 않습니다. 새로고침하거나, 외부 브라우저(크롬, 사파리 등)에서 다시 열어주세요.');
    return;
  }

  // 초기 검색창 렌더링
  initSearch();

  // Initialize Kakao SDK
  Kakao.init('1f88dc3dc56724c6631df399322a11c4');
  Kakao.isInitialized();

  // 공유 링크로 접근 시 자동 검색 실행 (data attribute에서 값 읽기)
  setTimeout(() => {
    const sharedQueryElem = document.getElementById('shared-query');
    const sharedQuery = sharedQueryElem ? sharedQueryElem.getAttribute('data-shared-query') : null;

    if (sharedQuery) {
      const searchInput = document.getElementById('searchInput');
      const searchButton = document.getElementById('searchButton');

      if (searchInput && searchButton) {
        searchInput.value = sharedQuery;
        searchButton.click();
      }
    }
  }, 1000);

  bindRefimgPreviewHandlers();
});
