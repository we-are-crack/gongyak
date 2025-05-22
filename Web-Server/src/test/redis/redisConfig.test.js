import redisClient from '../../config/redisConfig.js';
import { createClient } from 'redis';

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
    }
    await new Promise(res => setTimeout(res, 200));
    expect(errorEmitted).toBe(true);
    await badClient.quit().catch(() => {});
  });
});
