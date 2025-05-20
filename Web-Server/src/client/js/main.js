import { search } from '/js/search.js';
import { bindRefimgPreviewHandlers } from '/js/preview.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Kakao SDK
  Kakao.init('1f88dc3dc56724c6631df399322a11c4');
  Kakao.isInitialized();

  const handleSearch = () => {
    search('searchInput');
  };

  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');

  if (searchButton) {
    searchButton.addEventListener('click', handleSearch);
  }

  if (searchInput) {
    searchInput.maxLength = 50;

    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault(); // 엔터 시 기본 동작 방지 (중복 전송 방지)
        handleSearch();
      }
    });
  }

  // 공유 링크로 접근 시 자동 검색 실행 (data attribute에서 값 읽기)
  const sharedQueryElem = document.getElementById('shared-query');
  const sharedQuery = sharedQueryElem ? sharedQueryElem.getAttribute('data-shared-query') : null;
  if (sharedQuery) {
    if (searchInput) {
      searchInput.value = sharedQuery;
      // 자동 검색 실행 딜레이를 1초로 늘림 (서버 부하 방지)
      setTimeout(() => {
        if (searchButton) searchButton.click();
      }, 1000);
    }
  }

  bindRefimgPreviewHandlers();
});
