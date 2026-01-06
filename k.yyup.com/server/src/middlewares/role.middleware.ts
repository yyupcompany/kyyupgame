import { Request, Response, NextFunction, RequestHandler } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { ApiError } from '../utils/apiError';

/**
 * 检查用户是否有指定角色的中间件
 * @param allowedRoles 允许的角色代码数组
 * @returns 中间件函数
 */
export const requireRole = (allowedRoles: string[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      
      if (!user || !user.id) {
        throw ApiError.unauthorized('用户未登录', 'USER_NOT_LOGGED_IN');
      }
      
      // 查询用户的角色
      const roleQuery = `
        SELECT DISTINCT r.code
        FROM roles r
        INNER JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = :userId AND r.status = 1
      `;
      
      const userRoles = await sequelize.query(roleQuery, {
        replacements: { userId: user.id },
        type: QueryTypes.SELECT
      }) as { code: string }[];
      
      const userRoleCodes = userRoles.map(role => role.code);
      
      // 检查用户是否有任何一个允许的角色
      const hasPermission = allowedRoles.some(role => userRoleCodes.includes(role));
      
      if (!hasPermission) {
        throw ApiError.forbidden(
          `需要以下角色之一: ${allowedRoles.join(', ')}`,
          'INSUFFICIENT_ROLE'
        );
      }
      
      // 将用户角色添加到请求对象中，方便后续使用
      (req as any).userRoles = userRoleCodes;
      
      next();
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: (error as ApiError).message,
          code: (error as ApiError).code
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: '角色验证失败',
        code: 'ROLE_CHECK_ERROR'
      });
      return;
    }
  };
};

/**
 * 检查用户是否是管理员
 */
export const requireAdmin = requireRole(['admin', 'super_admin']);

/**
 * 检查用户是否是园长
 */
export const requirePrincipal = requireRole(['principal', 'admin', 'super_admin']);

/**
 * 检查用户是否是教师或更高权限
 */
export const requireTeacher = requireRole(['teacher', 'principal', 'admin', 'super_admin']);

/**
 * 检查用户是否是营销人员或更高权限
 */
export const requireMarketing = requireRole(['marketing', 'admin', 'super_admin']);

/**
 * 检查用户是否是财务人员或更高权限
 */
export const requireFinance = requireRole(['finance', 'admin', 'super_admin']); 