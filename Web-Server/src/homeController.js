import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const home = (req, res) => {
  console.log('home controller called');
  res.sendFile(path.join(__dirname, 'client', 'home.html'));
};

export const pledges = async (req, res) => {
  // 클라이언트에서 전달된 검색어 추출
  let searchQuery = req.query.q || '';

  // 검색어 길이 제한 검사
  if (isSearchQueryTooLong(searchQuery)) {
    return res.status(200).set('Content-Type', 'application/json; charset=utf-8').json({
      search: '',
      status: 'tooLong',
      htmlData: '',
    });
  }

  const url = `http://127.0.0.1:5000/query?q=${encodeURIComponent(searchQuery)}`;
  const headers = { Accept: 'application/json' };

  try {
    let htmlData;
    let rest = {};
    let finalHtmlData;

    // 개발/테스트 환경에서는 testData.json에서 데이터 읽기
    if (process.env.NODE_ENV === 'development') {
      const testDataPath = path.join(__dirname, 'test', 'testData.json');
      const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));

      // 5초 딜레이 추가
      await new Promise(resolve => setTimeout(resolve, 5000));

      htmlData = testData.htmlData;
      rest = { search: testData.search, status: testData.status };
    } else {
      // 운영 환경에서는 기존 로직 사용
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`AI 서버 응답 오류: ${response.status}`);
      }

      const data = await response.json();

      htmlData = data.htmlData;
      rest = { search: data.search, status: data.status };
    }

    finalHtmlData = typeof htmlData === 'string' ? htmlData.substring(7, htmlData.length - 3) : '';

    res
      .status(200)
      .set('Content-Type', 'application/json; charset=utf-8')
      .json({ ...rest, htmlData: finalHtmlData });
  } catch (error) {
    console.error('fetchPledges Error:', error);

    res.status(500).set('Content-Type', 'application/json; charset=utf-8').json({
      search: '',
      status: 'error',
      htmlData: '',
    });
  }
};

// 검색어 길이 검사 함수
function isSearchQueryTooLong(query, maxLength = 50) {
  if (typeof query === 'string' && query.length > maxLength) {
    return true;
  } else {
    return false;
  }
}
