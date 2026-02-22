/**
 * Game Validators
 */

import { z } from 'zod';

export const createGameSchema = z.object({
  mode: z.enum(['ONE_VS_ONE', 'TWO_VS_TWO', 'PRACTICE']),
  entryFee: z.number().positive(),
  hasLoan: z.boolean().optional(),
  collateralAmount: z.number().positive().optional(),
});

export const joinGameSchema = z.object({
  signature: z.string().optional(),
});
