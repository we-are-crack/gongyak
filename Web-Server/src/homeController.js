import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const home = (req, res) => {
  console.log('home controller called');
  res.sendFile(path.join(__dirname, 'client', 'home.html'));
};

export const pledges = async (req, res) => {
  // 클라이언트에서 전달된 검색어 추출
  const searchQuery = req.query.q || '';
  const url = `http://127.0.0.1:5000/query?q=${encodeURIComponent(searchQuery)}`;
  const headers = { Accept: 'application/json' };

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`AI 서버 응답 오류: ${response.status}`);
    }

    const { htmlData = '', ...rest } = await response.json();

    // htmlData가 문자열인지 확인 후 처리
    const trimmedHtmlData = typeof htmlData === 'string' ? htmlData.substring(7, htmlData.length - 3) : '';

    res
      .status(200)
      .set('Content-Type', 'application/json; charset=utf-8')
      .json({ ...rest, htmlData: trimmedHtmlData });
  } catch (error) {
    console.error('fetchPledges Error:', error);

    res.status(500).set('Content-Type', 'application/json; charset=utf-8').json({
      search: '',
      status: 'error',
      htmlData: '',
    });
  }
};
