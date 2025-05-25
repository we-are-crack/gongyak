import bindRefimgPreviewHandlers from './preview.js';
import bindShareButton from './share.js';

// 로딩 표시 제거
export const deleteLoading = results => {
  const loading = results.querySelector('#loading');
  if (loading) loading.remove();
};

// 로딩 표시 추가
export const showLoading = results => {
  deleteLoading(results);
  const loadingTemplate = document.getElementById('loadingTemplate');

  if (loadingTemplate) {
    const loadingNode = loadingTemplate.content.cloneNode(true);
    results.appendChild(loadingNode);
  }
};

// 검색 결과 렌더링
export const renderResults = (results, searchKeyword, htmlData) => {
  // 검색어 강조 템플릿 렌더링
  const searchQueryTemplate = document.getElementById('searchQueryTemplate');
  if (searchQueryTemplate) {
    const searchQuery = searchQueryTemplate.content.cloneNode(true);
    const valueSpan = searchQuery.querySelector('.search-keyword-value');

    if (valueSpan) {
      valueSpan.textContent = searchKeyword;
    }

    results.appendChild(searchQuery);
  }

  // 검색 결과 HTML 삽입
  results.insertAdjacentHTML('beforeend', htmlData);

  // 결과 내 미리보기/공유 버튼 이벤트 바인딩
  bindRefimgPreviewHandlers();
  bindShareButton();
};
