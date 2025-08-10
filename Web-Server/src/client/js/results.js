import bindRefimgPreviewHandlers from './preview.js';
import bindShareButton from './share.js';

// 후보자 정보 매핑 (정당, 이름, 이미지 등)
const candidateInfo = {
  leejaemyung: {
    partyClass: 'theminjoo',
    partyName: '더불어민주당',
    number: 1,
    name: '이재명',
    img: 'https://storage.googleapis.com/gongyak21_public/resources/candidate_image/leejaemyung.png',
    alt: '이재명 후보',
  },
  kimmoonsoo: {
    partyClass: 'peoplepowerparty',
    partyName: '국민의힘',
    number: 2,
    name: '김문수',
    img: 'https://storage.googleapis.com/gongyak21_public/resources/candidate_image/kimmoonsoo.png',
    alt: '김문수 후보',
  },
  leejunseok: {
    partyClass: 'reformparty',
    partyName: '개혁신당',
    number: 4,
    name: '이준석',
    img: 'https://storage.googleapis.com/gongyak21_public/resources/candidate_image/leejunseok.png',
    alt: '이준석 후보',
  },
};

const candidateOrder = ['leejaemyung', 'kimmoonsoo', 'leejunseok'];

function sortCandidates(data) {
  return data.slice().sort((a, b) => candidateOrder.indexOf(a.candidate) - candidateOrder.indexOf(b.candidate));
}

// 후보자별 카드 렌더링
function renderCandidateCards(data) {
  const container = document.createElement('div');
  container.className = 'candidate-container';

  // 원하는 순서로 정렬
  const sortedData = sortCandidates(data);

  sortedData.forEach(candidate => {
    const info = candidateInfo[candidate.candidate];

    // 카드 템플릿 clone
    const cardTpl = document.getElementById('candidateCardTemplate');
    const cardNode = cardTpl.content.cloneNode(true);

    const card = cardNode.querySelector('.candidate-card');
    card.classList.add(info.partyClass);

    // 헤더
    const link = cardNode.querySelector('.candidate-link');
    link.href = info.img;
    const img = cardNode.querySelector('.candidate-photo');
    img.src = info.img;
    img.alt = info.alt;
    const title = cardNode.querySelector('.candidate-title');
    title.textContent = `${info.partyName} | \t ${info.number}. ${info.name}`;

    // 공약(pledges) 렌더링
    candidate.pledges.forEach(pledge => {
      // mainPledge 템플릿 clone
      const pledgeTpl = document.getElementById('mainPledgeTemplate');
      if (!pledgeTpl) return;
      const pledgeNode = pledgeTpl.content.cloneNode(true);

      // 정책 요약 내용
      pledgeNode.querySelector('.main-pledge').childNodes[0].textContent = pledge.mainPledge;

      // 출처 이미지
      const refimg = pledgeNode.querySelector('.refimg');
      refimg.href = pledge.sourceImage;
      const refimgPreview = pledgeNode.querySelector('.refimg-preview img');
      refimgPreview.src = pledge.sourceImage;
      refimgPreview.alt = '공약 참고 이미지 미리보기';

      // 세부 공약 목록
      const ul = pledgeNode.querySelector('.pledge-details');
      pledge.details.forEach(detail => {
        const li = document.createElement('li');
        li.textContent = detail;
        ul.appendChild(li);
      });

      // 카드에 추가
      card.appendChild(pledgeNode);
    });

    // 카드 그리드에 추가
    const grid = cardNode.querySelector('.candidates-grid');
    grid.appendChild(card);
    container.appendChild(grid);
  });

  return container;
}

// 요약 비교 테이블 렌더링
function renderSummarySection(data) {
  const summaryTpl = document.getElementById('summarySectionTemplate');
  if (!summaryTpl) return null;
  const summaryNode = summaryTpl.content.cloneNode(true);

  const tbody = summaryNode.querySelector('tbody');
  data.forEach(candidate => {
    const info = candidateInfo[candidate.candidate];
    if (!info) return;

    const tr = document.createElement('tr');
    // 후보자 이름
    const tdName = document.createElement('td');
    const span = document.createElement('span');
    span.className = `summary-cand summary-cand-${info.partyClass}`;
    span.textContent = info.name;
    tdName.appendChild(span);

    // 공약 요약 리스트
    const tdPledges = document.createElement('td');
    const ul = document.createElement('ul');
    candidate.pledges.forEach(pledge => {
      const li = document.createElement('li');
      li.textContent = pledge.mainPledge;
      ul.appendChild(li);
    });
    tdPledges.appendChild(ul);

    tr.appendChild(tdName);
    tr.appendChild(tdPledges);
    tbody.appendChild(tr);
  });

  return summaryNode;
}

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
export const renderResults = (results, searchQuery, data) => {
  // 검색어 강조 템플릿 렌더링
  const searchQueryTemplate = document.getElementById('searchQueryTemplate');
  if (searchQueryTemplate) {
    const searchQueryNode = searchQueryTemplate.content.cloneNode(true);
    const valueSpan = searchQueryNode.querySelector('.search-keyword-value');

    if (valueSpan) {
      valueSpan.textContent = searchQuery;
    }

    results.appendChild(searchQueryNode);
  }

  // 후보자별 카드 렌더링
  const candidateCards = renderCandidateCards(data);
  if (candidateCards) results.appendChild(candidateCards);

  // 요약 비교 섹션 렌더링
  const summarySection = renderSummarySection(data);
  if (summarySection) results.appendChild(summarySection);

  // 결과 내 미리보기/공유 버튼 이벤트 바인딩
  bindRefimgPreviewHandlers();
  bindShareButton();
};
