import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV:   z.enum(['development', 'production', 'test']).default('development'),
  PORT:       z.string().default('3000').transform((v) => parseInt(v, 10)),
  API_PREFIX: z.string().default('/api/v1'),

  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida'),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_SECRET:             z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN:         z.string().default('15m'),
  REFRESH_TOKEN_SECRET:     z.string().min(32, 'REFRESH_TOKEN_SECRET debe tener al menos 32 caracteres'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173,http://localhost:3001')
    .transform((v) => v.split(',').map((o) => o.trim())),

  STORAGE_ENDPOINT:   z.string().url().optional(),
  STORAGE_BUCKET:     z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  STORAGE_PUBLIC_URL: z.string().url().optional(),

 

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM:     z.string().email().default('noreply@canchaapp.co'),

  FCM_SERVER_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n Variables de entorno inválidas:\n');
  const errors = parsed.error.flatten().fieldErrors;
  Object.entries(errors).forEach(([key, messages]) => {
    console.error(`   ${key}: ${messages?.join(', ')}`);
  });
  console.error('\nRevisa tu archivo .env y vuelve a intentarlo.\n');
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isDev:  () => parsed.data.NODE_ENV === 'development',
  isProd: () => parsed.data.NODE_ENV === 'production',
  isTest: () => parsed.data.NODE_ENV === 'test',
} as const;

export type Env = typeof env;