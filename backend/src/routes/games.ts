/**
 * Games Routes
 */

import { Router } from 'express';
import { GameController } from '../controllers/game.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createGameSchema, joinGameSchema } from '../validators/game.validator';

const gamesRouter = Router();
const gameController = new GameController();

// Public routes
gamesRouter.get('/', gameController.getGames);
gamesRouter.get('/:id', gameController.getGame);
gamesRouter.get('/:id/players', gameController.getGamePlayers);
gamesRouter.get('/active/count', gameController.getActiveGamesCount);

// Protected routes
gamesRouter.post(
  '/',
  authenticate,
  validateRequest(createGameSchema),
  gameController.createGame
);

gamesRouter.post(
  '/:id/join',
  authenticate,
  validateRequest(joinGameSchema),
  gameController.joinGame
);

gamesRouter.post(
  '/:id/leave',
  authenticate,
  gameController.leaveGame
);

gamesRouter.get(
  '/user/:walletAddress',
  gameController.getUserGames
);

export { gamesRouter };
