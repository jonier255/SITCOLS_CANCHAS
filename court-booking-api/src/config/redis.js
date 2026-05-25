import Redis from 'ioredis';
import env from './env.js';

const { REDIS_URL } = env;

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,

  retryStrategy(times) {
    if (times > 5) {
      console.error('[Redis] Demasiados reintentos, abortando conexión.');
      return null;
    }

    return Math.min(times * 200, 2000);
  },
});

redis.on('connect', () => {
  console.log('[Redis] Conectado OK');
});

redis.on('error', (err) => {
  console.error('[Redis] Error:', err.message);
});

export default redis;