import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * 验证请求中间件
 * 用于处理express-validator的验证结果
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: (error as any).param,
      message: (error as any).msg,
      value: (error as any).value
    }));

    res.status(400).json({
      success: false,
      message: '请求参数验证失败',
      errors: errorMessages
    });
    return;
  }

  next();
};


