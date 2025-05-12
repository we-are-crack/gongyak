import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const home = (req, res) => {
  console.log('home controller called'); // 디버깅용 로그
  res.sendFile(path.join(__dirname, 'client', 'home.html'));
};
