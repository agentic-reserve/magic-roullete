/**
 * Stats Routes
 */

import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';

const statsRouter = Router();
const statsController = new StatsController();

statsRouter.get('/', statsController.getGlobalStats);
statsRouter.get('/daily', statsController.getDailyStats);

export { statsRouter };
