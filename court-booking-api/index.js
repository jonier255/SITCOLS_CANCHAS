import env from './src/config/env.js';
import { connectDB } from './src/config/database.js';
import redis from './src/config/redis.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';

const {
  PORT,
  NODE_ENV,
  API_PREFIX,
  CORS_ORIGINS,
  isDev,
} = env;

const app = express();

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGINS,
    credentials: true,
  },
});

app.set('io', io);

app.use(helmet());

app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));

app.use(express.urlencoded({
  extended: true,
}));

app.use(morgan(isDev() ? 'dev' : 'combined'));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: NODE_ENV,
    time: new Date().toISOString(),
  });
});

// ─── Socket Events ────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] Cliente conectado: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket] Cliente desconectado: ${socket.id}`);
  });
});


app.use(API_PREFIX, (_req, res) => {
  res.json({
    message: 'Court Booking API v1 — rutas próximamente.',
  });
});

app.use((_req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
  });
});

app.use((err, _req, res, _next) => {
  const status = err.statusCode ?? err.status ?? 500;

  const message = isDev()
    ? err.message
    : 'Error interno del servidor';

  if (status >= 500) {
    console.error('[Error]', err);
  }

  res.status(status).json({
    error: message,
  });
});

async function start() {
  try {
    await connectDB();

    // Redis
    try {
      await redis.ping();

      console.log('[Redis] PING OK');
    } catch (e) {
      console.warn(
        '[Redis] No disponible, continuando sin caché:',
        e.message
      );
    }

    server.listen(PORT, () => {
      console.log('\n Court Booking API corriendo');

      console.log(`   Entorno  : ${NODE_ENV}`);

      console.log(`   URL      : http://localhost:${PORT}`);

      console.log(
        `   API base : http://localhost:${PORT}${API_PREFIX}`
      );

      console.log(
        `   Health   : http://localhost:${PORT}/health\n`
      );
    });

  } catch (err) {
    console.error(
      '[Fatal] No se pudo iniciar el servidor:',
      err.message
    );

    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));

process.on('SIGTERM', () => shutdown('SIGTERM'));

async function shutdown(signal) {
  console.log(`\n[Shutdown] Señal ${signal} recibida, cerrando...`);

  server.close(async () => {
    try {
      await redis.quit();

      console.log('[Redis] Conexión cerrada');
    } catch (err) {
      console.error(
        '[Redis] Error cerrando conexión:',
        err.message
      );
    }

    console.log('[Shutdown] Servidor cerrado limpiamente.');

    process.exit(0);
  });
}

start();