/**
 * API Routes
 */

import { Router } from 'express';
import { gamesRouter } from './games';
import { usersRouter } from './users';
import { leaderboardRouter } from './leaderboard';
import { transactionsRouter } from './transactions';
import { statsRouter } from './stats';
import { adminRouter } from './admin';

const apiRouter = Router();

// Mount routes
apiRouter.use('/games', gamesRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/leaderboard', leaderboardRouter);
apiRouter.use('/transactions', transactionsRouter);
apiRouter.use('/stats', statsRouter);
apiRouter.use('/admin', adminRouter);

// API info
apiRouter.get('/', (req, res) => {
  res.json({
    name: 'Magic Roulette API',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      games: '/games',
      users: '/users',
      leaderboard: '/leaderboard',
      transactions: '/transactions',
      stats: '/stats',
      admin: '/admin',
    },
    documentation: 'https://docs.magic-roulette.com',
  });
});

export { apiRouter };
