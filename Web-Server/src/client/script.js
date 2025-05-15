const resetResults = results => {
  results.querySelector('#loading')?.remove();
  results.querySelector('.text-red-500')?.remove();
};

const showLoading = results => {
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
  const input = document.getElementById(inputId).value.trim().toLowerCase();
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

  try {
    // 검색어를 쿼리 파라미터로 전달
    const response = await fetch(`/pledges?q=${encodeURIComponent(input)}`);

    if (response.status === 429) {
      const data = await response.json();
      document.getElementById('loading')?.remove();
      alert(data.message || '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      appendReSearch(results);
      return;
    }

    if (!response.ok) {
      throw new Error('API 호출 오류');
    }

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
      renderResults(results, data.search, data.htmlData, append);
      appendReSearch(results);
    }
  } catch (error) {
    console.error(error);
    document.getElementById('loading')?.remove();
    alert('검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도하거나, 다른 검색어로 시도해보세요.');
    appendReSearch(results);
  }
};

const appendReSearch = results => {
  const existingReSearch = results.querySelector('.re-search');
  if (existingReSearch) {
    existingReSearch.remove();
  }

  const reSearchTemplate = document.getElementById('reSearchTemplate').content.cloneNode(true);
  results.appendChild(reSearchTemplate);

  const reSearchButton = results.querySelector('#reSearchButton');
  reSearchButton.addEventListener('click', () => {
    search('reSearchInput', true);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const handleSearch = () => search('searchInput');
  document.getElementById('searchButton').addEventListener('click', handleSearch);
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
  bindRefimgPreviewHandlers();
});
