/**
 * 基础认证控制器
 * 提供基本的登录、认证功能
 */

import { Request, Response, NextFunction } from 'express';
import { ApiResponseEnhanced } from '../utils/apiResponseEnhanced';
import { ApiError } from '../utils/apiError';
import { authenticateWithUnifiedAuth } from '../middlewares/auth.middleware';

/**
 * 用户登录
 * 调用统一认证中间件处理登录逻辑
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 调用统一认证中间件
    await authenticateWithUnifiedAuth(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * 用户登出
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    ApiResponseEnhanced.success(res, null, '登出成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as any;
    if (!user) {
      return next(ApiError.unauthorized('用户未认证'));
    }

    ApiResponseEnhanced.success(res, user, '获取用户信息成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 验证令牌
 * 注意：实际验证由 verifyToken 中间件处理
 */
export const verifyToken = async (): Promise<boolean> => {
  return true;
};

/**
 * 获取用户关联的租户列表
 */
export const getUserTenants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 调用统一认证中间件
    const { getUserTenants: getUserTenantsMiddleware } = require('../middlewares/auth.middleware');
    await getUserTenantsMiddleware(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * 绑定用户到租户
 */
export const bindUserToTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 调用统一认证中间件
    const { bindUserToTenant: bindUserToTenantMiddleware } = require('../middlewares/auth.middleware');
    await bindUserToTenantMiddleware(req, res, next);
  } catch (error) {
    next(error);
  }
};

export default {
  logout,
  getCurrentUser,
  verifyToken,
  getUserTenants,
  bindUserToTenant
};