import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { RequestHandler } from 'express';

export const validateRequest = (schema: any): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errorMessage
        }
      });
      return;
    }

    next();
  };
}; 