import { search } from '/js/search.js';
import { bindRefimgPreviewHandlers } from '/js/preview.js';

document.addEventListener('DOMContentLoaded', () => {
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

  bindRefimgPreviewHandlers();
});
