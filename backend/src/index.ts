/**
 * Magic Roulette Backend API
 * 
 * Main entry point for the backend server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

// Import routes
import { apiRouter } from './routes';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';
import { WebSocketServer } from './services/websocket';
import { SolanaService } from './services/solana';
import { RedisService } from './services/redis';

// Initialize app
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || 'v1';

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: API_VERSION,
  });
});

// API routes
app.use(`/api/${API_VERSION}`, apiRouter);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize services
async function initializeServices() {
  try {
    console.log('🚀 Initializing services...');
    
    // Initialize Redis
    await RedisService.getInstance().connect();
    console.log('✅ Redis connected');
    
    // Initialize Solana
    await SolanaService.getInstance().initialize();
    console.log('✅ Solana service initialized');
    
    // Initialize WebSocket
    const wsServer = new WebSocketServer(httpServer);
    wsServer.initialize();
    console.log('✅ WebSocket server initialized');
    
    console.log('✅ All services initialized');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    httpServer.listen(PORT, () => {
      console.log('╔════════════════════════════════════════════╗');
      console.log('║   Magic Roulette Backend API              ║');
      console.log('╚════════════════════════════════════════════╝');
      console.log('');
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📡 API endpoint: http://localhost:${PORT}/api/${API_VERSION}`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log('');
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  
  httpServer.close(async () => {
    console.log('✅ HTTP server closed');
    
    // Close Redis connection
    await RedisService.getInstance().disconnect();
    console.log('✅ Redis disconnected');
    
    console.log('✅ Shutdown complete');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  
  httpServer.close(async () => {
    console.log('✅ HTTP server closed');
    
    // Close Redis connection
    await RedisService.getInstance().disconnect();
    console.log('✅ Redis disconnected');
    
    console.log('✅ Shutdown complete');
    process.exit(0);
  });
});

// Start the server
startServer();

export { app, httpServer };
