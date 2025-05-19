let isSearching = false;

const setSearchUIEnabled = enabled => {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');

  if (searchInput) {
    searchInput.disabled = !enabled;
  }

  if (searchButton) {
    searchButton.disabled = !enabled;
  }

  // reSearchInput/reSearchButton은 동적으로 생성되므로 존재할 때만 처리
  const reSearchInput = document.getElementById('reSearchInput');
  const reSearchButton = document.getElementById('reSearchButton');

  if (reSearchInput) {
    reSearchInput.disabled = !enabled;
  }

  if (reSearchButton) {
    reSearchButton.disabled = !enabled;
  }
};

const resetResults = results => {
  if (results.querySelector('#loading')) {
    results.querySelector('#loading').remove();
  }

  if (results.querySelector('.text-red-500')) {
    results.querySelector('.text-red-500').remove();
  }
};

const showLoading = results => {
  // 기존 로딩 제거
  if (results.querySelector('#loading')) {
    results.querySelector('#loading').remove();
  }

  const loadingTemplate = document.getElementById('loadingTemplate').content.cloneNode(true);
  results.appendChild(loadingTemplate);
};

const bindRefimgPreviewHandlers = () => {
  document.querySelectorAll('.candidate-card a.refimg').forEach(link => {
    if (link.dataset.refimgBound) {
      return;
    }

    link.dataset.refimgBound = '1';

    link.addEventListener('mouseenter', () => {
      const preview = link.querySelector('.refimg-preview');

      if (!preview) {
        return;
      }

      preview.classList.remove('left');
      preview.style.display = 'block';
      const rect = preview.getBoundingClientRect();

      if (rect.right > window.innerWidth) {
        preview.classList.add('left');
      }

      preview.style.display = '';
    });

    link.addEventListener('mouseleave', () => {
      const preview = link.querySelector('.refimg-preview');

      if (preview) {
        preview.classList.remove('left');
      }
    });
  });
};

const renderResults = (results, searchKeyword, htmlData, append) => {
  if (typeof append === 'undefined') {
    append = false;
  }

  const keywordTemplate = document.getElementById('searchKeywordTemplate');
  let keywordNode = null;

  if (keywordTemplate) {
    keywordNode = keywordTemplate.content.cloneNode(true);
    const valueSpan = keywordNode.querySelector('.search-keyword-value');

    if (valueSpan) {
      valueSpan.textContent = searchKeyword;
    }
  }

  if (append) {
    if (keywordNode) {
      results.appendChild(keywordNode);
    }

    results.innerHTML += htmlData;
  } else {
    results.innerHTML = '';

    if (keywordNode) {
      results.appendChild(keywordNode);
    }

    results.innerHTML += htmlData;
  }

  bindRefimgPreviewHandlers();
};

const renderTemplate = (templateId, container, append) => {
  if (typeof append === 'undefined') {
    append = false;
  }

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

const showSearchBox = initialBox => {
  initialBox.classList.remove('hidden');
};

const search = async (inputId, append) => {
  if (typeof append === 'undefined') {
    append = false;
  }

  if (isSearching) {
    return;
  }

  isSearching = true;
  setSearchUIEnabled(false);

  try {
    const inputElem = document.getElementById(inputId);

    if (!inputElem) {
      throw new Error('검색 입력창을 찾을 수 없습니다.');
    }

    // 50글자 제한
    let input = inputElem.value.trim().toLowerCase();

    if (input.length > 50) {
      input = input.slice(0, 50);
    }

    inputElem.value = input;

    if (!input) {
      alert('검색어를 입력해주세요.');
      return;
    }

    const results = document.getElementById('results');
    const initialBox = document.getElementById('initialSearchBox');

    showLoading(results);

    if (inputId === 'searchInput') {
      initialBox.classList.add('hidden');
    }

    // 검색어를 쿼리 파라미터로 전달
    const response = await fetch(`/pledges?q=${encodeURIComponent(input)}`);

    if (response.status === 429) {
      const data = await response.json();

      if (document.getElementById('loading')) {
        document.getElementById('loading').remove();
      }

      alert(data.message || '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      appendReSearch(results);
      return;
    }

    if (!response.ok) {
      throw new Error('API 호출 오류');
    }

    const data = await response.json();

    if (document.getElementById('loading')) {
      document.getElementById('loading').remove();
    }

    if (data.status === 'invalid') {
      alert('대선 공약과 관련된 내용만 검색해 주세요.');
      appendReSearch(results);
      return;
    } else if (data.status === 'tooLong') {
      alert('검색어는 50자 이내로 입력해 주세요.');
      appendReSearch(results);
      return;
    } else if (data.status === 'error') {
      alert('검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도하거나, 다른 검색어로 시도해보세요.');
      appendReSearch(results);
      return;
    } else {
      renderResults(results, data.search, data.htmlData, append);
      appendReSearch(results);
    }
  } catch (error) {
    console.error(error);

    if (document.getElementById('loading')) {
      document.getElementById('loading').remove();
    }

    alert('검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도하거나, 다른 검색어로 시도해보세요.');
    const results = document.getElementById('results');

    if (results) {
      appendReSearch(results);
    }
  } finally {
    isSearching = false;
    setSearchUIEnabled(true);
  }
};

const appendReSearch = results => {
  const existingReSearch = results.querySelector('.re-search');

  if (existingReSearch) {
    existingReSearch.remove();
  }

  const reSearchTemplate = document.getElementById('reSearchTemplate');

  if (!reSearchTemplate) {
    return;
  }

  results.appendChild(reSearchTemplate.content.cloneNode(true));

  // 이벤트 중복 방지 위해 새로 생성된 요소에서만 바인딩
  const reSearchButton = results.querySelector('.re-search #reSearchButton');
  const reSearchInput = results.querySelector('.re-search #reSearchInput');

  if (reSearchInput) {
    reSearchInput.maxLength = 50;
    reSearchInput.onkeydown = e => {
      if (e.key === 'Enter') {
        search('reSearchInput', true);
      }
    };
  }

  if (reSearchButton) {
    reSearchButton.onclick = () => {
      search('reSearchInput', true);
    };
  }
};

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
