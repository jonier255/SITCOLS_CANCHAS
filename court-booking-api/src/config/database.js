import pg from 'pg';
import env from './env.js';

const { Pool } = pg;

const {
  DATABASE_URL,
  DB_POOL_MIN,
  DB_POOL_MAX,
  isProd,
  isDev,
} = env;

const pool = new Pool({
  connectionString: DATABASE_URL,
  min: DB_POOL_MIN,
  max: DB_POOL_MAX,

  // para prudccion
  ssl: isProd() ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('[DB] Error inesperado en cliente idle:', err.message);
});

async function connectDB() {
  const client = await pool.connect();

  await client.query('SELECT 1');

  client.release();

  console.log('[DB] Conexión a PostgreSQL OK');
}

async function query(text, params) {
  const start = Date.now();

  const result = await pool.query(text, params);

  if (isDev()) {
    console.log(
      `[DB] query (${Date.now() - start}ms):`,
      text.slice(0, 80)
    );
  }

  return result;
}

export { pool, query, connectDB };