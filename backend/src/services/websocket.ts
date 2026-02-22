/**
 * WebSocket Service
 * 
 * Real-time communication for game updates
 */

import { Server as HTTPServer } from 'http';
import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { RedisService } from './redis';

interface Client {
  ws: WebSocket;
  userId?: string;
  subscribedGames: Set<string>;
}

export class WebSocketServer {
  private wss: WSServer;
  private clients: Map<string, Client> = new Map();
  private redis: RedisService;

  constructor(httpServer: HTTPServer) {
    this.wss = new WSServer({ server: httpServer, path: '/ws' });
    this.redis = RedisService.getInstance();
    
    console.log('🔌 WebSocket server created');
  }

  public initialize() {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateClientId();
      
      const client: Client = {
        ws,
        subscribedGames: new Set(),
      };
      
      this.clients.set(clientId, client);
      console.log(`✅ Client connected: ${clientId}`);

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connected',
        clientId,
        timestamp: Date.now(),
      });

      // Handle messages
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        console.log(`❌ Client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });
    });

    // Subscribe to Redis pub/sub for game updates
    this.subscribeToGameUpdates();
  }

  private handleMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'subscribe_game':
        this.subscribeToGame(clientId, message.gameId);
        break;
      
      case 'unsubscribe_game':
        this.unsubscribeFromGame(clientId, message.gameId);
        break;
      
      case 'ping':
        this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private subscribeToGame(clientId: string, gameId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.subscribedGames.add(gameId);
    
    this.sendToClient(clientId, {
      type: 'subscribed',
      gameId,
      timestamp: Date.now(),
    });

    console.log(`Client ${clientId} subscribed to game ${gameId}`);
  }

  private unsubscribeFromGame(clientId: string, gameId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.subscribedGames.delete(gameId);
    
    this.sendToClient(clientId, {
      type: 'unsubscribed',
      gameId,
      timestamp: Date.now(),
    });

    console.log(`Client ${clientId} unsubscribed from game ${gameId}`);
  }

  private async subscribeToGameUpdates() {
    await this.redis.subscribe('game:updates', (message) => {
      try {
        const update = JSON.parse(message);
        this.broadcastGameUpdate(update.gameId, update);
      } catch (error) {
        console.error('Error processing game update:', error);
      }
    });
  }

  public broadcastGameUpdate(gameId: string, data: any) {
    const message = {
      type: 'game_update',
      gameId,
      data,
      timestamp: Date.now(),
    };

    // Send to all clients subscribed to this game
    for (const [clientId, client] of this.clients.entries()) {
      if (client.subscribedGames.has(gameId)) {
        this.sendToClient(clientId, message);
      }
    }
  }

  public broadcastToAll(data: any) {
    const message = {
      type: 'broadcast',
      data,
      timestamp: Date.now(),
    };

    for (const clientId of this.clients.keys()) {
      this.sendToClient(clientId, message);
    }
  }

  private sendToClient(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      client.ws.send(JSON.stringify(data));
    } catch (error) {
      console.error(`Error sending to client ${clientId}:`, error);
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }
}
