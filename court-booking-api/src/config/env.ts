import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable de entorno requerida no definida: ${name}`);
  }
  return value;
}

function optional(name: string, defaultValue = ''): string {
  return process.env[name] ?? defaultValue;
}

const env = {
  NODE_ENV:   optional('NODE_ENV', 'development'),
  PORT:       parseInt(optional('PORT', '3000'), 10),
  API_PREFIX: optional('API_PREFIX', '/api/v1'),

  DATABASE_URL: required('DATABASE_URL'),
  

  REDIS_URL: optional('REDIS_URL', 'redis://localhost:6379'),

  JWT_SECRET:               required('JWT_SECRET'),
  JWT_EXPIRES_IN:           optional('JWT_EXPIRES_IN', '15m'),
  REFRESH_TOKEN_SECRET:     optional('REFRESH_TOKEN_SECRET', ''),
  REFRESH_TOKEN_EXPIRES_IN: optional('REFRESH_TOKEN_EXPIRES_IN', '30d'),

  CORS_ORIGINS: optional('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3001')
    .split(',')
    .map((o) => o.trim()),

  isDev:  (): boolean => env.NODE_ENV === 'development',
  isProd: (): boolean => env.NODE_ENV === 'production',
} as const;

export type Env = typeof env;

export default env;