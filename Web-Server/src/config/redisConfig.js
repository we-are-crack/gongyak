import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    connectTimeout: 10000,
  },
  username: process.env.REDIS_USERNAME, // ACL 유저 이름
  password: process.env.REDIS_PASSWORD, // 해당 유저의 비밀번호
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
