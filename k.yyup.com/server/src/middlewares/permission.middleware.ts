import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '../types/express';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';

/**
 * 权限验证中间件
 * 用于验证用户是否具有特定权限
 * @param requiredPermissions 必需的权限标识符列表
 * @returns 中间件函数
 */
export const permissionMiddleware = (requiredPermissions: string[]) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🔍 权限中间件被调用');
      console.log('需要的权限:', requiredPermissions);
      console.log('用户信息:', req.user);
      
      // 确保用户已登录
      if (!req.user) {
        console.log('❌ 用户未登录');
        res.status(401).json({
          success: false,
          message: '未授权访问'
        });
        return;
      }

      const userId = req.user.id;
      const userRole = req.user.role;
      console.log('用户ID:', userId, '用户角色:', userRole);

      // 管理员拥有所有权限
      if ((req.user as any).isAdmin) {
        console.log('✅ 管理员用户，允许通过');
        return next();
      }

      // 如果没有指定权限要求，直接通过
      if (!requiredPermissions || requiredPermissions.length === 0) {
        console.log('✅ 无权限要求，允许通过');
        return next();
      }

      // 查询用户是否有任何一个所需权限
      const permissionQuery = `
        SELECT COUNT(*) as count
        FROM role_permissions rp
        INNER JOIN permissions p ON rp.permission_id = p.id
        INNER JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = :userId 
          AND p.code IN (:permissionCodes) 
          AND p.status = 1
      `;
      
      const [result] = await sequelize.query(permissionQuery, {
        replacements: { 
          userId: userId,
          permissionCodes: requiredPermissions
        },
        type: QueryTypes.SELECT
      }) as [{ count: number }];

      const hasPermission = result.count > 0;
      
      if (!hasPermission) {
        console.log('❌ 权限不足，需要权限:', requiredPermissions);
        res.status(403).json({
          success: false,
          message: '权限不足',
          requiredPermissions
        });
        return;
      }
      
      console.log('✅ 权限验证通过');
      next();
    } catch (error) {
      console.error('❌ 权限验证失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
      return;
    }
  };
};

/**
 * 模拟权限中间件(用于开发测试)
 * 不执行实际权限检查，直接放行所有请求
 */
export const mockPermissionMiddleware = (requiredPermissions: string[]) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
}; 