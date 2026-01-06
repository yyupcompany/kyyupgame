import { Request, Response } from 'express';
import { sequelize } from '../init';
import { ApiResponse } from '../utils/apiResponse';

const getSequelizeInstance = () => {
  if (!sequelize) {
    throw new Error('Sequelize实例未初始化，请检查数据库连接');
  }
  return sequelize;
};

/**
 * 获取用户列表 - 简化版本
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  console.log('🔍 [DEBUG] getUsers函数开始执行');
  console.log('🔍 [DEBUG] 请求参数:', req.query);
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const db = getSequelizeInstance();
    
    // 简化查询参数
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;
    const limit = Math.min(100, Math.max(1, pageSize));
    const offset = (page - 1) * limit;

    console.log('🔍 分页参数:', { page, pageSize, limit, offset });

    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM ${tenantDb}.users`;
    console.log('🔍 计数查询:', countQuery);
    
    const countResults = await db.query(countQuery, { type: 'SELECT' });
    const total = countResults && Array.isArray(countResults) && countResults.length > 0 
      ? Number((countResults[0] as any).total) 
      : 0;

    console.log('🔍 用户总数:', total);

    // 查询用户列表
    const listQuery = `
      SELECT
        id, username, email, realName, phone, status,
        createdAt, updatedAt
      FROM ${tenantDb}.users
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?`;
      
    console.log('🔍 列表查询:', listQuery, '参数:', [limit, offset]);

    const usersResults = await db.query(listQuery, {
      replacements: [limit, offset],
      type: 'SELECT'
    });
    
    const usersList = Array.isArray(usersResults) ? usersResults : [];
    
    console.log('🔍 查询结果:', {
      isArray: Array.isArray(usersList),
      length: usersList.length
    });
    
    // 返回结果
    return ApiResponse.success(res, {
      total: total,
      page: page,
      pageSize: limit,
      items: usersList
    }, '获取用户列表成功');
    
  } catch (error: any) {
    console.error('❌ 获取用户列表失败:', error);
    return ApiResponse.error(res, `获取用户列表失败: ${error.message}`, 'USER_QUERY_ERROR', 500);
  }
};