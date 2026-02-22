/**
 * Game Controller
 * 
 * Handles game-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { SolanaService } from '../services/solana';
import { RedisService } from '../services/redis';

const prisma = new PrismaClient();

export class GameController {
  private solana: SolanaService;
  private redis: RedisService;

  constructor() {
    this.solana = SolanaService.getInstance();
    this.redis = RedisService.getInstance();
  }

  /**
   * Get all games with pagination
   */
  public getGames = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const [games, total] = await Promise.all([
        prisma.game.findMany({
          where,
          include: {
            players: {
              include: {
                user: {
                  select: {
                    walletAddress: true,
                    username: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.game.count({ where }),
      ]);

      res.json({
        games,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get single game by ID
   */
  public getGame = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Check cache first
      const cached = await this.redis.getCachedGame(id);
      if (cached) {
        return res.json(cached);
      }

      const game = await prisma.game.findUnique({
        where: { id },
        include: {
          players: {
            include: {
              user: {
                select: {
                  walletAddress: true,
                  username: true,
                  avatar: true,
                  level: true,
                },
              },
            },
          },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      // Cache for 5 minutes
      await this.redis.cacheGame(id, game, 300);

      res.json(game);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get game players
   */
  public getGamePlayers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const players = await prisma.gamePlayer.findMany({
        where: { gameId: id },
        include: {
          user: {
            select: {
              walletAddress: true,
              username: true,
              avatar: true,
              level: true,
              totalGames: true,
              gamesWon: true,
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      });

      res.json(players);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get active games count
   */
  public getActiveGamesCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await prisma.game.count({
        where: {
          status: 'IN_PROGRESS',
        },
      });

      res.json({ count });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new game
   */
  public createGame = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { mode, entryFee, hasLoan, collateralAmount } = req.body;
      const userId = (req as any).userId;

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Create game in database
      const game = await prisma.game.create({
        data: {
          gameId: BigInt(Date.now()), // Temporary, will be updated from on-chain
          onChainAddress: 'pending',
          mode,
          entryFee,
          hasLoan: hasLoan || false,
          collateralAmount: collateralAmount || null,
          maxPlayers: mode === 'ONE_VS_ONE' ? 2 : 4,
          status: 'WAITING',
          players: {
            create: {
              userId: user.id,
              team: 0,
              position: 0,
            },
          },
        },
        include: {
          players: {
            include: {
              user: true,
            },
          },
        },
      });

      res.status(201).json(game);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Join game
   */
  public joinGame = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      const game = await prisma.game.findUnique({
        where: { id },
        include: { players: true },
      });

      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      if (game.status !== 'WAITING') {
        return res.status(400).json({ error: 'Game is not accepting players' });
      }

      if (game.currentPlayers >= game.maxPlayers) {
        return res.status(400).json({ error: 'Game is full' });
      }

      // Check if user already in game
      const existingPlayer = game.players.find(p => p.userId === userId);
      if (existingPlayer) {
        return res.status(400).json({ error: 'Already in game' });
      }

      // Add player
      const updatedGame = await prisma.game.update({
        where: { id },
        data: {
          currentPlayers: { increment: 1 },
          players: {
            create: {
              userId,
              team: game.currentPlayers % 2,
              position: Math.floor(game.currentPlayers / 2),
            },
          },
        },
        include: {
          players: {
            include: {
              user: true,
            },
          },
        },
      });

      // Invalidate cache
      await this.redis.invalidateGameCache(id);

      // Broadcast update via Redis
      await this.redis.publish('game:updates', JSON.stringify({
        gameId: id,
        type: 'player_joined',
        data: updatedGame,
      }));

      res.json(updatedGame);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Leave game
   */
  public leaveGame = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      const game = await prisma.game.findUnique({
        where: { id },
        include: { players: true },
      });

      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      if (game.status !== 'WAITING') {
        return res.status(400).json({ error: 'Cannot leave game in progress' });
      }

      const player = game.players.find(p => p.userId === userId);
      if (!player) {
        return res.status(400).json({ error: 'Not in this game' });
      }

      // Remove player
      await prisma.gamePlayer.delete({
        where: { id: player.id },
      });

      // Update game
      const updatedGame = await prisma.game.update({
        where: { id },
        data: {
          currentPlayers: { decrement: 1 },
        },
        include: {
          players: {
            include: {
              user: true,
            },
          },
        },
      });

      // Invalidate cache
      await this.redis.invalidateGameCache(id);

      // Broadcast update
      await this.redis.publish('game:updates', JSON.stringify({
        gameId: id,
        type: 'player_left',
        data: updatedGame,
      }));

      res.json({ message: 'Left game successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's games
   */
  public getUserGames = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { walletAddress } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const user = await prisma.user.findUnique({
        where: { walletAddress },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const [games, total] = await Promise.all([
        prisma.game.findMany({
          where: {
            players: {
              some: {
                userId: user.id,
              },
            },
          },
          include: {
            players: {
              include: {
                user: {
                  select: {
                    walletAddress: true,
                    username: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.game.count({
          where: {
            players: {
              some: {
                userId: user.id,
              },
            },
          },
        }),
      ]);

      res.json({
        games,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
