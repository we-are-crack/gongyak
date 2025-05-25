import { createClient } from 'redis';
import redisClient from '../../config/redisConfig.js';

describe('Redis Config', () => {
  afterAll(async () => {
    await redisClient.quit();
  });

  test('should connect to Redis and respond to PING', async () => {
    const pong = await redisClient.ping();
    expect(pong).toBe('PONG');
  });

  test('should emit error event on wrong config', async () => {
    const badClient = createClient({
      socket: {
        host: 'localhost',
        port: 9999, // 잘못된 포트
        reconnectStrategy: false,
        connectTimeout: 5000, // 5초 타임아웃 설정
      },
    });

    let errorEmitted = false;
    badClient.on('error', () => {
      errorEmitted = true;
    });

    try {
      await badClient.connect();
    } catch (e) {
      // ignore
    } finally {
      await badClient.quit().catch(() => {});
    }
    await new Promise(res => setTimeout(res, 200));
    expect(errorEmitted).toBe(true);
    await badClient.quit().catch(() => {});
  });
});
