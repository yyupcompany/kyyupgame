/**
 * 简化的认证中间件
 * 临时替换认证中间件以解决编译问题
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.config';
import '../types/express-extensions';

// 简化的用户类型
interface SimpleUser {
  id: number;
  username: string;
  role: string;
  email: string;
  realName: string;
  phone: string;
  status: string;
  isAdmin: boolean;
  kindergartenId: number;
  tenantCode?: string;
}

export const verifyTokenSimplified = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 🔧 开发环境跳过认证
    if (process.env.NODE_ENV === 'development') {
      console.log('[简化认证中间件] 开发环境跳过认证');

      // 如果有租户信息，在开发环境下也支持租户识别
      const domain = req.get('Host') || req.hostname;
      const tenantMatch = domain.match(/^(k\d+)\.yyup\.cc$/);

      req.user = {
        id: 121,
        username: 'admin',
        role: 'admin',
        email: 'admin@example.com',
        realName: '管理员',
        phone: '13800138000',
        status: 'active',
        isAdmin: true,
        kindergartenId: 1,
        tenantCode: tenantMatch ? tenantMatch[1] : undefined
      } as any;

      next();
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // 简化的用户对象
      req.user = {
        id: decoded.userId || 121,
        username: decoded.username || 'admin',
        role: decoded.role || 'admin',
        email: decoded.email || 'admin@example.com',
        realName: decoded.realName || '管理员',
        phone: decoded.phone || '13800138000',
        status: 'active',
        isAdmin: decoded.role === 'admin' || decoded.role === 'super_admin',
        kindergartenId: decoded.kindergartenId || 1
      } as any;

      next();
    } catch (jwtError) {
      console.log('[简化认证中间件] JWT验证失败:', jwtError);
      res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
      return;
    }
  } catch (error) {
    console.error('[简化认证中间件] 认证中间件错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
    return;
  }
};

export const checkPermissionSimplified = (permissionCode: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      // 管理员拥有所有权限
      if ((req.user as SimpleUser).isAdmin) {
        next();
        return;
      }

      // 在开发环境中跳过权限检查
      if (process.env.NODE_ENV === 'development') {
        console.log(`[简化权限检查] 开发环境跳过权限检查: ${permissionCode}`);
        next();
        return;
      }

      res.status(403).json({
        success: false,
        message: '权限不足',
        details: {
          requiredPermission: permissionCode
        }
      });
    } catch (error) {
      console.error('[简化权限检查] 权限检查错误:', error);
      res.status(500).json({
        success: false,
        message: '权限检查服务异常'
      });
    }
  };
};

export default verifyTokenSimplified;