import env from './config/env.js';
import prisma from './config/prisma.js';import redis from './config/redis.js';

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app    = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin:      env.CORS_ORIGINS,
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[Socket] Cliente conectado: ${socket.id}`);

  socket.on('join:court', (courtId: string) => {
    void socket.join(`court:${courtId}`);
    console.log(`[Socket] ${socket.id} → court:${courtId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Cliente desconectado: ${socket.id}`);
  });
});

app.use(helmet());

app.use(cors({
  origin:      env.CORS_ORIGINS,
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.isDev() ? 'dev' : 'combined'));

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    env:    env.NODE_ENV,
    time:   new Date().toISOString(),
  });
});

// Aqui iran las rutas api, ejemplo:
//
// import authRoutes   from './modules/auth/auth.routes.js';
// import tenantRoutes from './modules/tenant/tenant.routes.js';
//
// app.use(`${env.API_PREFIX}/auth`,    authRoutes);
// app.use(`${env.API_PREFIX}/tenants`, tenantRoutes); 

// y ya eso es todo sapos. 

app.use(env.API_PREFIX, (_req: Request, res: Response) => {
  res.json({ message: 'Court Booking API v1' });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

interface AppError extends Error {
  statusCode?: number;
  status?: number;
}

app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  const status  = err.statusCode ?? err.status ?? 500;
  const message = env.isDev() ? err.message : 'Error interno del servidor';
  if (status >= 500) console.error('[Error]', err);
  res.status(status).json({ error: message });
});

async function start(): Promise<void> {
  try {
    await prisma.$connect();

    console.log('[Prisma] PostgreSQL conectado');
    
    try {
      await redis.ping();
      console.log('[Redis] PING OK');
    } catch (e) {
      console.warn('[Redis] No disponible, continuando sin caché:', (e as Error).message);
    }

    server.listen(env.PORT, () => {
      console.log('\n🏟️  Court Booking API corriendo');
      console.log(`   Entorno  : ${env.NODE_ENV}`);
      console.log(`   URL      : http://localhost:${env.PORT}`);
      console.log(`   API base : http://localhost:${env.PORT}${env.API_PREFIX}`);
      console.log(`   Health   : http://localhost:${env.PORT}/health\n`);
    });
  } catch (err) {
    console.error('[Fatal] No se pudo iniciar el servidor:', (err as Error).message);
    process.exit(1);
  }
}

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[Shutdown] Señal ${signal} recibida, cerrando...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      await redis.quit();
      console.log('[Redis] Conexión cerrada');
    } catch (err) {
      console.error('[Redis] Error cerrando:', (err as Error).message);
    }
    console.log('[Shutdown] Servidor cerrado limpiamente.');
    
    process.exit(0);
  });
}

process.on('SIGINT',  () => { void shutdown('SIGINT'); });
process.on('SIGTERM', () => { void shutdown('SIGTERM'); });

void start();