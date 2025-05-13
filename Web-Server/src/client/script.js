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

// 템플릿을 적용해서 렌더링하는 함수
const renderTemplate = (templateId, container, append = false) => {
  const template = document.getElementById(templateId);
  if (template) {
    if (append) {
      container.appendChild(template.content.cloneNode(true));
    } else {
      container.innerHTML = '';
      container.appendChild(template.content.cloneNode(true));
    }
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
    alert('검색어를 입력해주세요.');
    return;
  }

  const results = document.getElementById('results');
  const initialBox = document.getElementById('initialSearchBox');

  showLoading(results); // 로딩 상태 표시
  if (inputId === 'searchInput') initialBox.classList.add('hidden');

  try {
    const response = await fetch('/test'); // API 호출

    if (!response.ok) throw new Error('API 호출 오류');

    // 서버에서 JSON으로 상태를 받음
    const data = await response.json();
    document.getElementById('loading')?.remove();

    if (data.status === 'invalid') {
      alert('대선 공약과 관련된 내용만 검색해 주세요.');
      // 결과 영역은 그대로 두고, 재검색 창만 추가
      appendReSearch(results);
      return;
    } else if (data.status === 'error') {
      alert('검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도하거나, 다른 검색어로 시도해보세요.');
      appendReSearch(results);
      return;
    } else {
      // 정상 데이터라면 htmlData로 렌더링
      renderResults(results, data.htmlData, append);
      appendReSearch(results); // 재검색 창 추가
    }
  } catch (error) {
    console.error(error);
    document.getElementById('loading')?.remove(); // 로딩 상태 제거
    alert('검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도하거나, 다른 검색어로 시도해보세요.');
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
