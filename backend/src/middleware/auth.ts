/**
 * Authentication Middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request
    (req as any).userId = session.userId;
    (req as any).user = session.user;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });

      if (session && session.expiresAt >= new Date()) {
        (req as any).userId = session.userId;
        (req as any).user = session.user;
      }
    }

    next();
  } catch (error) {
    next();
  }
}
