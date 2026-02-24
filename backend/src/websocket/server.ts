/**
 * WebSocket Server for Real-time Multiplayer
 */

import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

interface GameSubscription {
  gameId: string;
  clients: Set<WebSocket>;
}

interface PlayerAction {
  type: "join" | "shoot" | "leave" | "subscribe" | "unsubscribe";
  gameId: string;
  playerId?: string;
  data?: any;
}

interface GameUpdate {
  type: "player_joined" | "player_shot" | "player_eliminated" | "game_finished" | "turn_changed";
  gameId: string;
  data: any;
  timestamp: number;
}

export class GameWebSocketServer {
  private wss: WebSocketServer;
  private gameSubscriptions: Map<string, GameSubscription> = new Map();
  private clientGames: Map<WebSocket, Set<string>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/ws" });
    this.initialize();
  }

  private initialize(): void {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("✅ New WebSocket connection");
      
      // Initialize client games set
      this.clientGames.set(ws, new Set());

      ws.on("message", (data: Buffer) => {
        try {
          const message: PlayerAction = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
          ws.send(JSON.stringify({ error: "Invalid message format" }));
        }
      });

      ws.on("close", () => {
        console.log("❌ WebSocket connection closed");
        this.handleDisconnect(ws);
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: "connected",
        message: "Connected to Magic Roulette WebSocket server",
        timestamp: Date.now(),
      }));
    });

    console.log("🚀 WebSocket server initialized");
  }

  private handleMessage(ws: WebSocket, message: PlayerAction): void {
    switch (message.type) {
      case "subscribe":
        this.subscribeToGame(ws, message.gameId);
        break;
      case "unsubscribe":
        this.unsubscribeFromGame(ws, message.gameId);
        break;
      case "join":
        this.handleJoinGame(message);
        break;
      case "shoot":
        this.handleShoot(message);
        break;
      case "leave":
        this.handleLeaveGame(message);
        break;
      default:
        ws.send(JSON.stringify({ error: "Unknown message type" }));
    }
  }

  private subscribeToGame(ws: WebSocket, gameId: string): void {
    if (!this.gameSubscriptions.has(gameId)) {
      this.gameSubscriptions.set(gameId, {
        gameId,
        clients: new Set(),
      });
    }

    const subscription = this.gameSubscriptions.get(gameId)!;
    subscription.clients.add(ws);
    
    const clientGames = this.clientGames.get(ws)!;
    clientGames.add(gameId);

    console.log(`📡 Client subscribed to game ${gameId}`);
    
    ws.send(JSON.stringify({
      type: "subscribed",
      gameId,
      timestamp: Date.now(),
    }));
  }

  private unsubscribeFromGame(ws: WebSocket, gameId: string): void {
    const subscription = this.gameSubscriptions.get(gameId);
    if (subscription) {
      subscription.clients.delete(ws);
      
      if (subscription.clients.size === 0) {
        this.gameSubscriptions.delete(gameId);
      }
    }

    const clientGames = this.clientGames.get(ws);
    if (clientGames) {
      clientGames.delete(gameId);
    }

    console.log(`📡 Client unsubscribed from game ${gameId}`);
  }

  private handleDisconnect(ws: WebSocket): void {
    const clientGames = this.clientGames.get(ws);
    if (clientGames) {
      clientGames.forEach(gameId => {
        this.unsubscribeFromGame(ws, gameId);
      });
      this.clientGames.delete(ws);
    }
  }

  private handleJoinGame(message: PlayerAction): void {
    const update: GameUpdate = {
      type: "player_joined",
      gameId: message.gameId,
      data: {
        playerId: message.playerId,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };

    this.broadcastToGame(message.gameId, update);
    console.log(`🎮 Player ${message.playerId} joined game ${message.gameId}`);
  }

  private handleShoot(message: PlayerAction): void {
    const update: GameUpdate = {
      type: "player_shot",
      gameId: message.gameId,
      data: {
        playerId: message.playerId,
        ...message.data,
      },
      timestamp: Date.now(),
    };

    this.broadcastToGame(message.gameId, update);
    console.log(`🔫 Player ${message.playerId} shot in game ${message.gameId}`);
  }

  private handleLeaveGame(message: PlayerAction): void {
    const update: GameUpdate = {
      type: "player_eliminated",
      gameId: message.gameId,
      data: {
        playerId: message.playerId,
      },
      timestamp: Date.now(),
    };

    this.broadcastToGame(message.gameId, update);
    console.log(`👋 Player ${message.playerId} left game ${message.gameId}`);
  }

  /**
   * Broadcast update to all clients subscribed to a game
   */
  public broadcastToGame(gameId: string, update: GameUpdate): void {
    const subscription = this.gameSubscriptions.get(gameId);
    if (!subscription) {
      console.log(`No subscribers for game ${gameId}`);
      return;
    }

    const message = JSON.stringify(update);
    let sentCount = 0;

    subscription.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        sentCount++;
      }
    });

    console.log(`📤 Broadcast to ${sentCount} clients for game ${gameId}`);
  }

  /**
   * Get number of active connections
   */
  public getConnectionCount(): number {
    return this.wss.clients.size;
  }

  /**
   * Get number of active game subscriptions
   */
  public getGameSubscriptionCount(): number {
    return this.gameSubscriptions.size;
  }

  /**
   * Close the WebSocket server
   */
  public close(): void {
    this.wss.close(() => {
      console.log("WebSocket server closed");
    });
  }
}
