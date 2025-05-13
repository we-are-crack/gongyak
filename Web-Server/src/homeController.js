import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch'; // 추가

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const home = (req, res) => {
  console.log('home controller called'); // 디버깅용 로그
  res.sendFile(path.join(__dirname, 'client', 'home.html'));
};

// 공약 데이터를 처리하는 컨트롤러
export const fetchPledges = async (req, res) => {
  try {
    const response = await fetch('http://localhost:4000/ai');

    if (!response.ok) {
      throw new Error(`AI 서버 응답 오류: ${response.status}`);
    }

    const data = await response.json();

    res.set('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json(data);
  } catch (error) {
    console.error('fetchPledges Error:', error);
    res.status(500).json({ status: 'error', htmlData: '' });
  }
};
