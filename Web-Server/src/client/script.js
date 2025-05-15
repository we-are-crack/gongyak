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

// refimg 미리보기 위치 자동 조정 함수
function bindRefimgPreviewHandlers() {
  document.querySelectorAll('.candidate-card a.refimg').forEach(link => {
    // 중복 등록 방지
    if (link.dataset.refimgBound) return;
    link.dataset.refimgBound = '1';
    link.addEventListener('mouseenter', function () {
      const preview = link.querySelector('.refimg-preview');
      if (!preview) return;
      preview.classList.remove('left');
      preview.style.display = 'block';
      const rect = preview.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        preview.classList.add('left');
      }
      preview.style.display = '';
    });
    link.addEventListener('mouseleave', function () {
      const preview = link.querySelector('.refimg-preview');
      if (preview) preview.classList.remove('left');
    });
  });
}

// 검색 결과를 렌더링하는 함수 (검색어와 htmlData를 함께 렌더링)
const renderResults = (results, searchKeyword, htmlData, append = false) => {
  // 검색어 템플릿을 복제해서 값만 채움
  const keywordTemplate = document.getElementById('searchKeywordTemplate');
  let keywordNode = null;
  if (keywordTemplate) {
    keywordNode = keywordTemplate.content.cloneNode(true);
    const valueSpan = keywordNode.querySelector('.search-keyword-value');
    if (valueSpan) valueSpan.textContent = searchKeyword;
  }
  if (append) {
    if (keywordNode) results.appendChild(keywordNode);
    results.innerHTML += htmlData;
  } else {
    results.innerHTML = '';
    if (keywordNode) results.appendChild(keywordNode);
    results.innerHTML += htmlData;
  }
  // 후보자 카드 렌더링 후 refimg 이벤트 바인딩
  bindRefimgPreviewHandlers();
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

    if (response.status === 429) {
      // 요청이 너무 많을 때
      const data = await response.json();
      document.getElementById('loading')?.remove();
      alert(data.message || '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      appendReSearch(results);
      return;
    }

    if (!response.ok) throw new Error('API 호출 오류');

    // 서버에서 JSON으로 상태를 받음
    const data = await response.json();
    document.getElementById('loading')?.remove();

    if (data.status === 'invalid') {
      alert('대선 공약과 관련된 내용만 검색해 주세요.');
      appendReSearch(results);
      return;
    } else if (data.status === 'error') {
      alert('검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도하거나, 다른 검색어로 시도해보세요.');
      appendReSearch(results);
      return;
    } else {
      // 정상 데이터라면 검색어와 htmlData로 렌더링
      renderResults(results, data.search, data.htmlData, append);
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
  // 최초 로딩 시에도 바인딩 (초기 카드가 있을 경우)
  bindRefimgPreviewHandlers();
});
