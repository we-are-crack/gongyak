import app from './app.js';

const PORT = process.env.PORT || 4000;

const handleListening = () => console.log(`✅ Server listening on http://localhost:${PORT} 🚀`);

console.log('Starting server setup...'); // 서버 시작 로그

try {
  app.listen(PORT, handleListening);
  console.log('Server is running...'); // 디버깅용 로그
} catch (error) {
  console.error('Error starting server:', error); // 오류 로그
}

console.log('Server setup complete.'); // 서버 설정 완료 로그
