/**
 * 统一认证中间件
 * 解决项目中verifyToken未定义的系统性问题
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * 验证JWT令牌的中间件
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '认证令牌不能为空',
        code: 'EMPTY_TOKEN'
      });
      return;
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    if (!token) {
      res.status(401).json({
        success: false,
        message: '认证令牌不能为空',
        code: 'EMPTY_TOKEN'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;

      if (!decoded || !decoded.id) {
        res.status(401).json({
          success: false,
          message: '无效的认证令牌',
          code: 'INVALID_TOKEN'
        });
        return;
      }

      req.user = decoded;
      next();
    } catch (jwtError: any) {
      let message = '令牌验证失败';
      let code = 'TOKEN_VERIFY_ERROR';

      if (jwtError.name === 'TokenExpiredError') {
        message = '认证令牌已过期';
        code = 'TOKEN_EXPIRED';
      } else if (jwtError.name === 'JsonWebTokenError') {
        message = '无效的认证令牌';
        code = 'INVALID_TOKEN';
      }

      res.status(401).json({
        success: false,
        message,
        code
      });
      return;
    }
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: '认证失败: ' + error.message,
      code: 'AUTH_ERROR'
    });
    return;
  }
};

/**
 * 可选的认证中间件（不强制要求认证）
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      if (decoded && decoded.id) {
        req.user = decoded;
      }
    } catch (jwtError) {
      // 可选认证失败时不阻止请求继续
      console.warn('可选认证验证失败:', jwtError);
    }

    next();
  } catch (error) {
    // 可选认证失败时不阻止请求继续
    console.warn('可选认证处理失败:', error);
    next();
  }
};