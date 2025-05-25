// 검색 search query 리스트 API 호출
async function fetchSearchList() {
  const response = await fetch('/api/searchList');
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    const error = new Error(errorData.message || response.statusText);
    error.status = response.status;
    Object.assign(error, errorData);
    throw error;
  }
  return response.json();
}

export default async function renderRecommendedSearchQueryList(results, handleSearchQuery) {
  // 리스트 템플릿 클론
  const listTpl = document.getElementById('recommendedSearchQueryListTemplate');
  if (!listTpl) return;

  results.appendChild(listTpl.content.cloneNode(true));

  // 버튼 템플릿 준비
  const btnTpl = document.getElementById('recommendedSearchQueryButtonTemplate');
  if (!btnTpl) return;

  try {
    const { data } = await fetchSearchList();

    const btnContainer = results.querySelector('.recommended-search-queries');
    if (!btnContainer) return;

    data.forEach(searchQuery => {
      const btnNode = btnTpl.content.cloneNode(true);
      const btn = btnNode.querySelector('button');

      btn.textContent = searchQuery;
      btn.onclick = () => handleSearchQuery(searchQuery);
      btnContainer.appendChild(btn);
    });
  } catch (error) {
    console.error('추천 search query 로딩 중 오류 발생:', error);
  }
}
