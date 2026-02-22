/**
 * Transactions Routes
 */

import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';

const transactionsRouter = Router();
const transactionController = new TransactionController();

transactionsRouter.get('/', transactionController.getTransactions);
transactionsRouter.get('/:signature', transactionController.getTransaction);
transactionsRouter.get('/user/:walletAddress', transactionController.getUserTransactions);

export { transactionsRouter };
