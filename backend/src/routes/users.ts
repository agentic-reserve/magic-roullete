/**
 * Users Routes
 */

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const usersRouter = Router();
const userController = new UserController();

// Public routes
usersRouter.get('/:walletAddress', userController.getUser);
usersRouter.get('/:walletAddress/stats', userController.getUserStats);

// Protected routes
usersRouter.post('/auth/login', userController.login);
usersRouter.post('/auth/logout', authenticate, userController.logout);
usersRouter.put('/profile', authenticate, userController.updateProfile);

export { usersRouter };
