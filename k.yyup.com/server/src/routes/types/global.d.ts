import { AuthenticatedUser } from '../../middlewares/auth.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      tenant?: {
        code: string;
        domain: string;
        databaseName: string;
      };
      tenantDb?: any;
    }
  }
}

export {};