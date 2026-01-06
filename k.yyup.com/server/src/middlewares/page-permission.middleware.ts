import { Request, Response, NextFunction } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { ApiError } from '../utils/apiError';

/**
 * 检查用户是否有访问指定页面权限的中间件
 * @param pagePath 页面路径
 * @returns 中间件函数
 */
export const requirePageAccess = (pagePath: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      if (!user || !user.id) {
        throw ApiError.unauthorized('用户未登录', 'USER_NOT_LOGGED_IN');
      }
      
      // 检查用户是否可以访问指定页面
      const checkQuery = `
        SELECT COUNT(*) as count
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        INNER JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = :userId AND p.path = :pagePath AND p.status = 1
      `;
      
      const [result] = await sequelize.query(checkQuery, {
        replacements: { userId: user.id, pagePath },
        type: QueryTypes.SELECT
      }) as [{ count: number }];
      
      const hasAccess = result.count > 0;
      
      if (!hasAccess) {
        throw ApiError.forbidden(
          `无权访问页面: ${pagePath}`,
          'PAGE_ACCESS_DENIED'
        );
      }
      
      next();
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code
        });
      }
      
      return res.status(500).json({
        success: false,
        message: '页面权限验证失败',
        code: 'PAGE_PERMISSION_CHECK_ERROR'
      });
    }
  };
};

/**
 * 常用页面权限中间件
 */
export const requireDashboardAccess = requirePageAccess('/dashboard');
export const requireUsersAccess = requirePageAccess('/users');
export const requireRolesAccess = requirePageAccess('/roles');
export const requirePermissionsAccess = requirePageAccess('/permissions');
export const requireKindergartensAccess = requirePageAccess('/kindergartens');
export const requireClassesAccess = requirePageAccess('/classes');
export const requireTeachersAccess = requirePageAccess('/teachers');
export const requireStudentsAccess = requirePageAccess('/students');
export const requireParentsAccess = requirePageAccess('/parents');
export const requireEnrollmentAccess = requirePageAccess('/enrollment/plans');
export const requireActivitiesAccess = requirePageAccess('/activities/plans');
export const requireMarketingAccess = requirePageAccess('/marketing/advertisements');
export const requireFinanceAccess = requirePageAccess('/finance/fees'); 