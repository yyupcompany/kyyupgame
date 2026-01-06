import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { getTenantDatabaseName } from '../utils/tenant-database-helper';

/**
 * 权限控制器 - 简化版本，只处理页面权限
 * 🔄 多租户支持：使用完整表名查询
 */
export class PermissionController {

  /**
   * 获取所有页面权限列表
   * @param req 请求对象
   * @param res 响应对象
   */
  public async getPagePermissions(req: Request, res: Response): Promise<void> {
    try {
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      const { page = 1, pageSize = 50 } = req.query;
      const pageNum = Math.max(1, Number(page) || 1);
      const pageSizeNum = Math.max(1, Math.min(100, Number(pageSize) || 10));
      const offset = Math.max(0, (pageNum - 1) * pageSizeNum);

      // 查询页面权限总数（使用完整表名）
      const countQuery = `SELECT COUNT(*) as total FROM ${tenantDb}.permissions WHERE status = 1`;
      const [countResults] = await sequelize.query(countQuery, {
        type: QueryTypes.SELECT
      }) as [Record<string, any>[]];

      const total = countResults && countResults.length > 0 ? countResults[0].total : 0;

      // 查询页面权限列表（使用完整表名）
      const permissionQuery = `
        SELECT id, name, code, path, icon, status, created_at, updated_at
        FROM ${tenantDb}.permissions
        WHERE status = 1
        ORDER BY id
        LIMIT :limit OFFSET :offset
      `;

      const permissions = await sequelize.query(permissionQuery, {
        replacements: {
          limit: Number(pageSize) || 0,
          offset: offset
        },
        type: QueryTypes.SELECT
      }) as Record<string, any>[];

      ApiResponse.success(res, {
        total,
        items: permissions,
        page: Number(page) || 0,
        pageSize: Number(pageSize) || 0
      }, '获取页面权限列表成功');

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('获取页面权限列表失败', 'GET_PAGE_PERMISSIONS_ERROR');
    }
  }

  /**
   * 获取用户可访问的页面列表
   * @param req 请求对象
   * @param res 响应对象
   */
  public async getUserPagePermissions(req: Request, res: Response): Promise<void> {
    try {
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      const user = (req as any).user;

      if (!user || !user.id) {
        throw ApiError.unauthorized('用户未登录', 'USER_NOT_LOGGED_IN');
      }

      // 查询用户可访问的页面（使用完整表名）
      const pageQuery = `
        SELECT DISTINCT p.id, p.name, p.code, p.path, p.icon
        FROM ${tenantDb}.permissions p
        INNER JOIN ${tenantDb}.role_permissions rp ON p.id = rp.permission_id
        INNER JOIN ${tenantDb}.user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = :userId AND p.status = 1
        ORDER BY p.id
      `;

      const pages = await sequelize.query(pageQuery, {
        replacements: { userId: user.id },
        type: QueryTypes.SELECT
      }) as Record<string, any>[];

      ApiResponse.success(res, {
        userId: user.id,
        pages: pages
      }, '获取用户页面权限成功');

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('获取用户页面权限失败', 'GET_USER_PAGE_PERMISSIONS_ERROR');
    }
  }

  /**
   * 检查用户是否可以访问指定页面
   * @param req 请求对象
   * @param res 响应对象
   */
  public async checkPageAccess(req: Request, res: Response): Promise<void> {
    try {
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      const user = (req as any).user;
      const { pagePath } = req.params;

      if (!user || !user.id) {
        throw ApiError.unauthorized('用户未登录', 'USER_NOT_LOGGED_IN');
      }

      if (!pagePath) {
        throw ApiError.badRequest('页面路径不能为空', 'PAGE_PATH_REQUIRED');
      }

      // 检查用户是否可以访问指定页面（使用完整表名）
      const checkQuery = `
        SELECT COUNT(*) as count
        FROM ${tenantDb}.permissions p
        INNER JOIN ${tenantDb}.role_permissions rp ON p.id = rp.permission_id
        INNER JOIN ${tenantDb}.user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = :userId AND p.path = :pagePath AND p.status = 1
      `;

      const [resultRows] = await sequelize.query(checkQuery, {
        replacements: { userId: user.id, pagePath: `/${pagePath}` },
        type: QueryTypes.SELECT
      }) as [Record<string, any>[]];

      const result = resultRows && resultRows.length > 0 ? resultRows[0] : { count: 0 };
      const hasAccess = result.count > 0;

      ApiResponse.success(res, {
        userId: user.id,
        pagePath,
        hasAccess
      }, hasAccess ? '用户可以访问该页面' : '用户无权访问该页面');

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('检查页面访问权限失败', 'CHECK_PAGE_ACCESS_ERROR');
    }
  }
  
  /**
   * 获取角色的页面权限
   * @param req 请求对象
   * @param res 响应对象
   */
  public async getRolePagePermissions(req: Request, res: Response): Promise<void> {
    try {
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      const { roleId } = req.params;

      if (!roleId || isNaN(Number(roleId) || 0)) {
        throw ApiError.badRequest('无效的角色ID', 'INVALID_ROLE_ID');
      }

      // 查询角色信息（使用完整表名）
      const roleQuery = `SELECT id, name, code FROM ${tenantDb}.roles WHERE id = :roleId AND status = 1`;
      const [roleResults] = await sequelize.query(roleQuery, {
        replacements: { roleId: Number(roleId) || 0 },
        type: QueryTypes.SELECT
      }) as [Record<string, any>[]];

      if (!roleResults || roleResults.length === 0) {
        throw ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
      }

      const role = roleResults[0];

      // 查询角色的页面权限（使用完整表名）
      const pageQuery = `
        SELECT p.id, p.name, p.code, p.path, p.icon
        FROM ${tenantDb}.permissions p
        INNER JOIN ${tenantDb}.role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = :roleId AND p.status = 1
        ORDER BY p.id
      `;

      const pages = await sequelize.query(pageQuery, {
        replacements: { roleId: Number(roleId) || 0 },
        type: QueryTypes.SELECT
      }) as Record<string, any>[];

      ApiResponse.success(res, {
        role,
        pages
      }, '获取角色页面权限成功');

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('获取角色页面权限失败', 'GET_ROLE_PAGE_PERMISSIONS_ERROR');
    }
  }

  /**
   * 更新角色的页面权限
   * @param req 请求对象
   * @param res 响应对象
   */
  public async updateRolePagePermissions(req: Request, res: Response): Promise<void> {
    try {
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      const { roleId } = req.params;
      const { permissionIds } = req.body;

      if (!roleId || isNaN(Number(roleId) || 0)) {
        throw ApiError.badRequest('无效的角色ID', 'INVALID_ROLE_ID');
      }

      if (!Array.isArray(permissionIds)) {
        throw ApiError.badRequest('权限ID列表格式错误', 'INVALID_PERMISSION_IDS');
      }

      // 检查角色是否存在（使用完整表名）
      const roleQuery = `SELECT id FROM ${tenantDb}.roles WHERE id = :roleId AND status = 1`;
      const [roleResults] = await sequelize.query(roleQuery, {
        replacements: { roleId: Number(roleId) || 0 },
        type: QueryTypes.SELECT
      }) as [Record<string, any>[]];
      
      if (!roleResults || roleResults.length === 0) {
        throw ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
      }

      // 验证权限ID是否有效（使用完整表名）
      if (permissionIds.length > 0) {
        const permissionQuery = `
          SELECT COUNT(*) as count
          FROM ${tenantDb}.permissions
          WHERE id IN (${permissionIds.join(',')}) AND status = 1
        `;

        const [permissionResults] = await sequelize.query(permissionQuery, {
          type: QueryTypes.SELECT
        }) as [Record<string, any>[]];

        const permissionResult = permissionResults && permissionResults.length > 0 ? permissionResults[0] : { count: 0 };
        if (permissionResult.count !== permissionIds.length) {
          throw ApiError.badRequest('部分权限ID无效', 'INVALID_PERMISSION_IDS');
        }
      }

      // 这里应该在事务中执行，但由于只读限制，我们返回操作指令（使用完整表名）
      ApiResponse.success(res, {
        message: '权限更新操作准备就绪',
        operations: [
          `DELETE FROM ${tenantDb}.role_permissions WHERE role_id = ${roleId}`,
          ...permissionIds.map((permId: number) =>
            `INSERT INTO ${tenantDb}.role_permissions (role_id, permission_id, created_at, updated_at) VALUES (${roleId}, ${permId}, NOW(), NOW())`
          )
        ]
      }, '角色页面权限更新准备完成');

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('更新角色页面权限失败', 'UPDATE_ROLE_PAGE_PERMISSIONS_ERROR');
    }
  }
}

export const permissionController = new PermissionController(); 
