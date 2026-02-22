/**
 * 404 Not Found Handler
 */

import { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
  });
}
