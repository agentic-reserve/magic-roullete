/**
 * Magic Roulette Backend - Simple WebSocket Server
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { GameWebSocketServer } from './websocket/server';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API endpoint untuk testing
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    websocket: 'active',
    port: PORT,
  });
});

// Initialize WebSocket server
const wsServer = new GameWebSocketServer(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Magic Roulette WebSocket Server         ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('✅ WebSocket server ready for connections');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down...');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down...');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export { app, httpServer, wsServer };
