// 검색 결과를 초기화하는 함수
const resetResults = results => {
  results.querySelector('#loading')?.remove();
  results.querySelector('.text-red-500')?.remove();
};

// 로딩 상태를 표시하는 함수
const showLoading = results => {
  const loadingTemplate = document.getElementById('loadingTemplate').content.cloneNode(true);
  results.appendChild(loadingTemplate);
};

// 검색 결과를 렌더링하는 함수
const renderResults = (results, htmlData, append = false) => {
  if (append) {
    results.innerHTML += htmlData; // 기존 결과에 추가
  } else {
    results.innerHTML = htmlData; // 기존 결과를 덮어씀
  }
};

// 검색 창을 다시 표시하는 함수
const showSearchBox = initialBox => {
  initialBox.classList.remove('hidden');
};

// 검색 기능
const search = async (inputId, append = false) => {
  const input = document.getElementById(inputId).value.trim().toLowerCase();
  if (!input) {
    const results = document.getElementById('results');
    showTemplate('errorTemplate', results);
    return;
  }

  const results = document.getElementById('results');
  const initialBox = document.getElementById('initialSearchBox');

  if (!append) resetResults(results); // 기존 결과 초기화 (append가 false일 때만)
  showLoading(results); // 로딩 상태 표시
  if (inputId === 'searchInput') initialBox.classList.add('hidden');

  try {
    const response = await fetch('/test'); // API 호출
    if (!response.ok) throw new Error('공약 데이터를 불러오지 못했습니다.');

    const htmlData = await response.text(); // HTML 데이터 가져오기
    document.getElementById('loading')?.remove();

    // AI 서버에서 빈 문자열이 반환된 경우 안내 메시지 표시
    if (!htmlData.trim()) {
      alert('검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도하거나, 다른 검색어로 시도해보세요.');
    }

    renderResults(results, htmlData, append); // 결과 렌더링
    appendReSearch(results); // 재검색 창 추가
  } catch (error) {
    console.error('Search Error:', error);
    document.getElementById('loading')?.remove(); // 로딩 상태 제거
    alert('검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도하거나, 다른 검색어로 시도해보세요.');
    renderResults(results, htmlData, append); // 결과 렌더링
    appendReSearch(results); // 재검색 창 추가
  }
};

// 재검색 창 추가
const appendReSearch = results => {
  const existingReSearch = results.querySelector('.re-search');
  if (existingReSearch) existingReSearch.remove();

  const reSearchTemplate = document.getElementById('reSearchTemplate').content.cloneNode(true);
  results.appendChild(reSearchTemplate);

  const reSearchButton = results.querySelector('#reSearchButton');
  reSearchButton.addEventListener('click', () => search('reSearchInput', true)); // append를 true로 설정
};

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchButton').addEventListener('click', () => search('searchInput'));
});
