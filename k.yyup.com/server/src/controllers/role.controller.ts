import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { Role } from '../models/role.model';
import { getTenantDatabaseName } from '../utils/tenant-database-helper';

// 获取数据库实例
const getSequelizeInstance = () => {
  return sequelize;
};

/**
 * 角色控制器 - 简化版本，只处理角色信息
 * 🔄 多租户支持：使用完整表名查询
 */
export class RoleController {

  /**
   * 获取用户角色列表
   * @param req 请求对象
   * @param res 响应对象
   */
  public async getUserRoles(req: Request, res: Response): Promise<void> {
    try {
      console.log('[角色调试] 开始获取用户角色');
      const user = (req as any).user;
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);
      console.log('[角色调试] 用户信息:', user, '租户数据库:', tenantDb);

      if (!user || !user.id) {
        console.log('[角色调试] 用户未登录');
        throw ApiError.unauthorized('用户未登录', 'USER_NOT_LOGGED_IN');
      }

      console.log('[角色调试] 用户ID:', user.id);

      // 查询用户的角色（使用完整表名）
      const roleQuery = `
        SELECT DISTINCT r.id, r.name, r.code, r.description
        FROM ${tenantDb}.roles r
        INNER JOIN ${tenantDb}.user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = :userId AND r.status = 1
        ORDER BY r.id
      `;

      console.log('[角色调试] 执行SQL查询:', roleQuery);
      console.log('[角色调试] 查询参数:', { userId: user.id });

      const db = getSequelizeInstance();
      const roles = await db.query(roleQuery, {
        replacements: { userId: user.id },
        type: 'SELECT'
      });

      const rolesList = Array.isArray(roles) ? roles : [];

      console.log('[角色调试] 查询结果:', roles);

      const responseData = {
        userId: user.id,
        username: user.username,
        roles: rolesList
      };

      console.log('[角色调试] 响应数据:', responseData);

      ApiResponse.success(res, responseData, '获取用户角色成功');

    } catch (error) {
      console.error('[角色调试] 错误:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('获取用户角色失败', 'GET_USER_ROLES_ERROR');
    }
  }
  
  /**
   * 获取所有角色列表（管理员用）
   * @param req 请求对象
   * @param res 响应对象
   */
  public async getAllRoles(req: Request, res: Response): Promise<void> {
    try {
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      const {
        page = 1,
        pageSize = 20,
        search = '',
        sortBy = 'id',
        sortOrder = 'asc',
        status = '1'
      } = req.query;

      const pageNum = Math.max(1, Number(page) || 1);
      const pageSizeNum = Math.max(1, Math.min(100, Number(pageSize) || 20));
      const offset = Math.max(0, (pageNum - 1) * pageSizeNum);

      // 构建WHERE条件
      let whereConditions = ['status = :status'];
      const replacements: any = { status: Number(status) || 1 };

      // 添加搜索条件
      if (search && typeof search === 'string' && search.trim()) {
        whereConditions.push('(name LIKE :search OR code LIKE :search OR description LIKE :search)');
        replacements.search = `%${search.trim()}%`;
      }

      const whereClause = whereConditions.join(' AND ');

      // 构建排序条件
      const validSortFields = ['id', 'name', 'code', 'created_at', 'updated_at'];
      const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'id';
      const sortDirection = (sortOrder as string)?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

      const db = getSequelizeInstance();

      // 查询角色总数（使用完整表名）
      const countQuery = `SELECT COUNT(*) as total FROM ${tenantDb}.roles WHERE ${whereClause}`;
      const countResult = await db.query(countQuery, {
        replacements,
        type: 'SELECT'
      });

      const countList = Array.isArray(countResult) ? countResult : [];
      const total = countList.length > 0 ? (countList[0] as any).total : 0;

      // 查询角色列表（使用完整表名）
      const roleQuery = `
        SELECT id, name, code, description, status, created_at, updated_at
        FROM ${tenantDb}.roles
        WHERE ${whereClause}
        ORDER BY ${sortField} ${sortDirection}
        LIMIT :limit OFFSET :offset
      `;

      const roles = await db.query(roleQuery, {
        replacements: {
          ...replacements,
          limit: pageSizeNum,
          offset: offset
        },
        type: 'SELECT'
      });

      const rolesList = Array.isArray(roles) ? roles : [];

      ApiResponse.success(res, {
        total,
        items: rolesList,
        page: pageNum,
        pageSize: pageSizeNum
      }, '获取角色列表成功');

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('获取角色列表失败', 'GET_ROLES_ERROR');
    }
  }
  
  /**
   * 检查用户是否有指定角色
   * @param req 请求对象
   * @param res 响应对象
   */
  public async checkUserRole(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { roleCode } = req.params;
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      if (!user || !user.id) {
        throw ApiError.unauthorized('用户未登录', 'USER_NOT_LOGGED_IN');
      }

      if (!roleCode) {
        throw ApiError.badRequest('角色代码不能为空', 'ROLE_CODE_REQUIRED');
      }

      // 检查用户是否有指定角色（使用完整表名）
      const checkQuery = `
        SELECT COUNT(*) as count
        FROM ${tenantDb}.user_roles ur
        INNER JOIN ${tenantDb}.roles r ON ur.role_id = r.id
        WHERE ur.user_id = :userId AND r.code = :roleCode AND r.status = 1
      `;

      const db = getSequelizeInstance();
      const result = await db.query(checkQuery, {
        replacements: { userId: user.id, roleCode },
        type: 'SELECT'
      });

      const resultList = Array.isArray(result) ? result : [];
      const hasRole = resultList.length > 0 ? (resultList[0] as any).count > 0 : false;

      ApiResponse.success(res, {
        userId: user.id,
        roleCode,
        hasRole
      }, hasRole ? '用户拥有该角色' : '用户没有该角色');

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('检查用户角色失败', 'CHECK_USER_ROLE_ERROR');
    }
  }

  /**
   * 创建角色
   * @param req 请求对象
   * @param res 响应对象
   */
  public async createRole(req: Request, res: Response): Promise<Response | void> {
    try {
      console.log('[角色创建] 开始处理请求');
      console.log('[角色创建] 请求体:', req.body);

      const { name, code, description } = req.body;
      const user = (req as any).user;
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      console.log('[角色创建] 解析参数:', { name, code, description });

      if (!name || !code) {
        console.log('[角色创建] 参数验证失败');
        throw ApiError.badRequest('角色名称和代码不能为空', 'ROLE_NAME_CODE_REQUIRED');
      }

      // 检查角色代码是否已存在（使用完整表名）
      const existQuery = `SELECT COUNT(*) as count FROM ${tenantDb}.roles WHERE code = :code`;
      const [existResult] = await sequelize.query(existQuery, {
        replacements: { code },
        type: QueryTypes.SELECT
      }) as [{ count: number }];

      if (existResult.count > 0) {
        throw ApiError.badRequest('角色代码已存在', 'ROLE_CODE_EXISTS');
      }

      // 创建角色（使用完整表名）
      const createQuery = `
        INSERT INTO ${tenantDb}.roles (name, code, description, status, created_at, updated_at)
        VALUES (:name, :code, :description, 1, NOW(), NOW())
      `;
      
      await sequelize.query(createQuery, {
        replacements: {
          name,
          code,
          description: description || ''
        },
        type: QueryTypes.INSERT
      });
      
      // 暂时返回基本信息，避免查询问题
      console.log('[角色创建] 角色创建成功，代码:', code);

      return res.status(200).json({
        success: true,
        data: {
          name,
          code,
          description: description || '',
          status: 1,
          message: '角色创建成功，但暂时无法返回完整信息'
        },
        message: '创建角色成功'
      });
      
    } catch (error) {
      console.log('[角色创建] 发生错误:', error);
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code
        });
      }
      return res.status(500).json({
        success: false,
        message: '创建角色失败',
        code: 'CREATE_ROLE_ERROR'
      });
    }
  }

  /**
   * 更新角色
   * @param req 请求对象
   * @param res 响应对象
   */
  public async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const user = (req as any).user;
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      if (!id || isNaN(Number(id) || 0)) {
        throw ApiError.badRequest('无效的角色ID', 'INVALID_ROLE_ID');
      }

      // 检查角色是否存在（使用完整表名）
      const existQuery = `SELECT id FROM ${tenantDb}.roles WHERE id = :id AND status = 1`;
      const [existResult] = await sequelize.query(existQuery, {
        replacements: { id: Number(id) || 0 },
        type: QueryTypes.SELECT
      }) as [Record<string, any>[]];

      if (!existResult || existResult.length === 0) {
        throw ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
      }

      // 更新角色（使用完整表名）
      const updateQuery = `
        UPDATE ${tenantDb}.roles
        SET name = :name, description = :description, updated_at = NOW()
        WHERE id = :id
      `;

      await sequelize.query(updateQuery, {
        replacements: {
          id: Number(id) || 0,
          name,
          description: description || ''
        },
        type: QueryTypes.UPDATE
      });
      
      // 获取更新后的角色信息（使用完整表名）
      const roleQuery = `SELECT id, name, code, description, status, updated_at FROM ${tenantDb}.roles WHERE id = :id`;
      const [roleResults] = await sequelize.query(roleQuery, {
        replacements: { id: Number(id) || 0 },
        type: QueryTypes.SELECT
      }) as [Record<string, any>[]];

      if (!roleResults || roleResults.length === 0) {
        throw ApiError.serverError('更新角色成功但无法查询到角色信息', 'ROLE_QUERY_ERROR');
      }

      const updatedRole = roleResults[0];
      ApiResponse.success(res, updatedRole, '更新角色成功');

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('更新角色失败', 'UPDATE_ROLE_ERROR');
    }
  }

  /**
   * 删除角色
   * @param req 请求对象
   * @param res 响应对象
   */
  public async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      console.log('[角色删除] 开始删除角色，ID:', id);

      if (!id || isNaN(Number(id) || 0)) {
        throw ApiError.badRequest('无效的角色ID', 'INVALID_ROLE_ID');
      }

      // 检查角色是否存在且未被删除（使用完整表名）
      const existQuery = `SELECT id, code FROM ${tenantDb}.roles WHERE id = :id AND status = 1`;
      console.log('[角色删除] 执行存在性查询:', existQuery);
      const existResult = await sequelize.query(existQuery, {
        replacements: { id: Number(id) || 0 },
        type: QueryTypes.SELECT
      });

      console.log('[角色删除] 存在性查询结果:', existResult);

      // 如果角色不存在或已被删除，也返回成功（幂等性）
      if (!existResult || existResult.length === 0) {
        console.log('[角色删除] 角色不存在，返回成功');
        return ApiResponse.success(res, { id: Number(id) || 0 }, '删除角色成功');
      }

      const role = existResult[0] as any;

      // 检查是否为系统角色（不允许删除）
      console.log('[角色删除] 检查系统角色，角色代码:', role.code);
      if (role.code === 'admin' || role.code === 'user') {
        console.log('[角色删除] 系统角色不允许删除');
        throw ApiError.badRequest('系统角色不允许删除', 'SYSTEM_ROLE_CANNOT_DELETE');
      }

      // 检查是否有用户使用该角色（使用完整表名）
      const userRoleQuery = `SELECT COUNT(*) as count FROM ${tenantDb}.user_roles WHERE role_id = :roleId`;
      console.log('[角色删除] 执行用户角色查询:', userRoleQuery);
      const userRoleResult = await sequelize.query(userRoleQuery, {
        replacements: { roleId: Number(id) || 0 },
        type: QueryTypes.SELECT
      });

      console.log('[角色删除] 用户角色查询结果:', userRoleResult);
      const count = (userRoleResult[0] as any)?.count || 0;
      console.log('[角色删除] 使用该角色的用户数量:', count);

      if (count > 0) {
        console.log('[角色删除] 角色正在被用户使用，无法删除');
        throw ApiError.badRequest('该角色正在被用户使用，无法删除', 'ROLE_IN_USE');
      }
      
      // 软删除角色（使用完整表名）
      const deleteQuery = `
        UPDATE ${tenantDb}.roles
        SET status = 0, updated_at = NOW(), deleted_at = NOW()
        WHERE id = :id
      `;

      console.log('[角色删除] 执行删除查询:', deleteQuery);
      await sequelize.query(deleteQuery, {
        replacements: {
          id: Number(id) || 0
        },
        type: QueryTypes.UPDATE
      });

      console.log('[角色删除] 删除成功');
      ApiResponse.success(res, { id: Number(id) || 0 }, '删除角色成功');

    } catch (error) {
      console.error('[角色删除] 删除失败:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('删除角色失败', 'DELETE_ROLE_ERROR');
    }
  }
}

export const roleController = new RoleController(); 
