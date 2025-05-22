import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
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

if (!client.isOpen) {
  await client.connect();
}

export default client;
