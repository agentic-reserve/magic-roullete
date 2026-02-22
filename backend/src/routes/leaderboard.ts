/**
 * Leaderboard Routes
 */

import { Router } from 'express';
import { LeaderboardController } from '../controllers/leaderboard.controller';

const leaderboardRouter = Router();
const leaderboardController = new LeaderboardController();

leaderboardRouter.get('/', leaderboardController.getLeaderboard);
leaderboardRouter.get('/top/:limit', leaderboardController.getTopPlayers);

export { leaderboardRouter };
