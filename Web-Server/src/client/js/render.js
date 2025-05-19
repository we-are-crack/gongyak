import { bindRefimgPreviewHandlers } from '/js/preview.js';

export const showLoading = results => {
  if (results.querySelector('#loading')) {
    results.querySelector('#loading').remove();
  }

  const loadingTemplate = document.getElementById('loadingTemplate').content.cloneNode(true);
  results.appendChild(loadingTemplate);
};

export const renderResults = (results, searchKeyword, htmlData, append) => {
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

export const renderTemplate = (templateId, container, append) => {
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

export const showSearchBox = initialBox => {
  initialBox.classList.remove('hidden');
};
