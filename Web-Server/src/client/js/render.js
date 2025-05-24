import bindRefimgPreviewHandlers from './preview.js';
import bindShareButton from './share.js';

export const deleteLoading = results => {
  if (results.querySelector('#loading')) {
    results.querySelector('#loading').remove();
  }
};

export const showLoading = results => {
  deleteLoading(results);

  const loadingTemplate = document.getElementById('loadingTemplate').content.cloneNode(true);
  results.appendChild(loadingTemplate);
};

export const renderResults = (results, searchKeyword, htmlData, append) => {
  if (typeof append === 'undefined') {
    append = false;
  }

  const searchQueryTemplate = document.getElementById('searchQueryTemplate');
  let searchQuery = null;

  if (searchQueryTemplate) {
    searchQuery = searchQueryTemplate.content.cloneNode(true);
    const valueSpan = searchQuery.querySelector('.search-keyword-value');
    if (valueSpan) {
      valueSpan.textContent = searchKeyword;
    }
  }

  if (append) {
    if (searchQuery) {
      results.appendChild(searchQuery);
    }
    results.innerHTML += htmlData;
  } else {
    results.innerHTML = '';
    if (searchQuery) {
      results.appendChild(searchQuery);
    }
    results.innerHTML += htmlData;
  }

  bindRefimgPreviewHandlers();
  bindShareButton();
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
