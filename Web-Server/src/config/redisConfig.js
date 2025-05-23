import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    connectTimeout: 10000,
  },
  password: process.env.REDIS_PASSWORD,
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', err => {
  console.error('Redis error:', err);
});

(async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
  } catch (err) {
    console.error('Redis 연결 실패:', err);
  }
})();

export default client;

// 서버 종료 시 자원 반납
process.on('SIGINT', async () => {
  await client.quit();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await client.quit();
  process.exit(0);
});
