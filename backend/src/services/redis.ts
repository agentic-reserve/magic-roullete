/**
 * Redis Service
 * 
 * Handles caching and real-time data
 */

import { createClient, RedisClientType } from 'redis';

export class RedisService {
  private static instance: RedisService;
  private client: RedisClientType;
  private isConnected: boolean = false;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('❌ Redis disconnected');
      this.isConnected = false;
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async connect() {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  public async disconnect() {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  /**
   * Get value
   */
  public async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  /**
   * Set value with optional expiration
   */
  public async set(key: string, value: string, expirationSeconds?: number): Promise<void> {
    if (expirationSeconds) {
      await this.client.setEx(key, expirationSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Delete key
   */
  public async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Check if key exists
   */
  public async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Increment value
   */
  public async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  /**
   * Get all keys matching pattern
   */
  public async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  /**
   * Publish message to channel
   */
  public async publish(channel: string, message: string): Promise<void> {
    await this.client.publish(channel, message);
  }

  /**
   * Subscribe to channel
   */
  public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const subscriber = this.client.duplicate();
    await subscriber.connect();
    await subscriber.subscribe(channel, callback);
  }

  // Cache helpers
  public async cacheGame(gameId: string, data: any, ttl: number = 300) {
    await this.set(`game:${gameId}`, JSON.stringify(data), ttl);
  }

  public async getCachedGame(gameId: string): Promise<any | null> {
    const data = await this.get(`game:${gameId}`);
    return data ? JSON.parse(data) : null;
  }

  public async cacheUser(walletAddress: string, data: any, ttl: number = 600) {
    await this.set(`user:${walletAddress}`, JSON.stringify(data), ttl);
  }

  public async getCachedUser(walletAddress: string): Promise<any | null> {
    const data = await this.get(`user:${walletAddress}`);
    return data ? JSON.parse(data) : null;
  }

  public async invalidateGameCache(gameId: string) {
    await this.del(`game:${gameId}`);
  }

  public async invalidateUserCache(walletAddress: string) {
    await this.del(`user:${walletAddress}`);
  }
}
