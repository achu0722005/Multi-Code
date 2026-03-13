import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import battleRoutes from './routes/battleRoutes.js';
import judgeRoutes from './routes/judgeRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import { registerSocketHandlers } from './socket/index.js';
import { initIo } from './socket/ioInstance.js';

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/judge', judgeRoutes);
app.use('/api/problems', problemRoutes);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/multicode';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Mongo connection error', err);
  });

// expose io instance for other modules (e.g. controllers) that need to emit events
initIo(io);

registerSocketHandlers(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Multicode backend running on http://localhost:${PORT}`);
});

