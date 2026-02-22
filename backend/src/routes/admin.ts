/**
 * Admin Routes
 */

import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';

const adminRouter = Router();
const adminController = new AdminController();

// All admin routes require authentication
adminRouter.use(authenticate);

adminRouter.get('/dashboard', adminController.getDashboard);
adminRouter.get('/users', adminController.getUsers);
adminRouter.get('/games', adminController.getGames);
adminRouter.post('/games/:id/cancel', adminController.cancelGame);

export { adminRouter };
