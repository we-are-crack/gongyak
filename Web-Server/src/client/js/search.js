/* eslint-disable no-use-before-define */
import { renderResults, showLoading, deleteLoading } from './render.js';

// 검색 API 호출
async function fetchSearchResults(input) {
  const response = await fetch(`/search?q=${encodeURIComponent(input)}`);
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
}

// 입력값 검증
function validateInput(input) {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return { valid: false, message: '검색어를 입력해주세요.' };
  if (trimmed.length > 50) return { valid: false, message: '검색어는 50자 이내로 입력해 주세요.' };
  return { valid: true, value: trimmed };
}

// 기존 입력창 제거
function removeExistingInput(results) {
  const existing = results.querySelector('.search-input-wrapper');
  if (existing) existing.remove();
}

// 입력창 렌더링 및 이벤트 바인딩 (초기/재검색 구분 없이 항상 동일)
function renderSearchInput(results) {
  removeExistingInput(results);

  const tpl = document.getElementById('searchInputTemplate');
  if (!tpl) return;

  const node = tpl.content.cloneNode(true);
  const input = node.querySelector('.search-input');
  const button = node.querySelector('.search-button');

  input.placeholder = '예: 청년 주거 정책이 궁금해요';
  button.textContent = '검색';
  input.id = 'searchInput';
  button.id = 'searchButton';

  input.maxLength = 50;
  input.onkeydown = e => {
    if (e.key === 'Enter') handleSearch();
  };
  button.onclick = () => handleSearch();

  results.appendChild(node);
}

// 에러 메시지 처리
function handleError(message, results) {
  alert(message);
  renderSearchInput(results);
}

// 검색 실행
export async function handleSearch() {
  try {
    const inputElem = document.querySelector('.search-input');
    if (!inputElem) throw new Error('검색 입력창을 찾을 수 없습니다.');

    const { valid, value, message } = validateInput(inputElem.value);
    if (!valid) {
      handleError(message, document.getElementById('results'));
      return;
    }
    inputElem.value = value;

    const results = document.getElementById('results');
    showLoading(results);

    const data = await fetchSearchResults(value);

    if (document.getElementById('loading')) document.getElementById('loading').remove();

    if (data.status === 'invalid') {
      handleError('대선 공약과 관련된 내용만 검색해 주세요.', results);
    } else if (data.status === 'tooLong') {
      handleError('검색어는 50자 이내로 입력해 주세요.', results);
    } else if (data.status === 'error') {
      handleError('검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도하거나, 다른 검색어로 시도해보세요.', results);
    } else {
      renderResults(results, data.search, data.htmlData, true);
      renderSearchInput(results);
    }
  } catch (err) {
    const results = document.getElementById('results');
    if (err.status === 429) {
      handleError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', results);
    } else {
      console.error('검색 중 오류 발생:', err);
      handleError('검색 결과를 불러오지 못했습니다. 잠시 후 다시 시도하거나, 다른 검색어로 시도해보세요.', results);
    }
  } finally {
    deleteLoading(document.getElementById('results'));
  }
}

// 초기 진입 시 검색창 렌더링
export function initSearch() {
  const results = document.getElementById('results');
  renderSearchInput(results);
}
