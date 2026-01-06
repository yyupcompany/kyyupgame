import express from 'express';
import { AuthenticatedUser } from '../middlewares/auth.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      userId?: number;
      permissions?: string[];
      tenantId?: number;
    }
  }
}

export interface RequestWithUser extends express.Request {
  user?: AuthenticatedUser;
  userId?: number;
  permissions?: string[];
  tenantId?: number;
}

export {};