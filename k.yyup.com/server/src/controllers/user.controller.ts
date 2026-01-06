import { Request, Response } from 'express';
import { sequelize } from '../init';
import { CreateUserDto, UpdateUserDto, PaginationQuery } from '../types';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { hashPassword, verifyPassword } from '../utils/password';
import { RequestWithUser } from '../types/express';
import { User } from '../models/user.model';
import { SearchHelper, SearchParams, PaginationHelper } from '../utils/search-helper';
import { getTenantDatabaseName } from '../utils/tenant-database-helper';

// 检查用户是否有重要关联数据的辅助函数（支持多租户）
const checkUserImportantData = async (db: any, userId: number, transaction: any, tenantDb: string = 'kindergarten'): Promise<{hasData: boolean, reasons: string[]}> => {
  const reasons: string[] = [];

  try {
    // 检查是否有创建的重要数据（如活动、课程等）- 使用完整表名
    const tableChecks = [
      { table: `${tenantDb}.activities`, column: 'creator_id', reason: '创建的活动' },
      { table: `${tenantDb}.enrollment_consultations`, column: 'consultant_id', reason: '咨询记录' },
      { table: `${tenantDb}.marketing_campaigns`, column: 'creator_id', reason: '营销活动' },
      { table: `${tenantDb}.system_logs`, column: 'user_id', reason: '系统日志' },
      { table: `${tenantDb}.operation_logs`, column: 'user_id', reason: '操作日志' }
    ];

    for (const check of tableChecks) {
      try {
        const results = await db.query(
          `SELECT COUNT(*) as count FROM ${check.table} WHERE ${check.column} = :userId`,
          {
            replacements: { userId },
            type: 'SELECT',
            transaction
          }
        );

        const count = Array.isArray(results) && results.length > 0 ? (results[0] as any).count : 0;
        if (count > 0) {
          reasons.push(`${check.reason}(${count}条)`);
        }
      } catch (error) {
        // 表可能不存在，继续检查其他表
        console.log(`检查表 ${check.table} 时出错（可能是表不存在）:`, error);
      }
    }
  } catch (error) {
    console.error('检查用户重要数据时出错:', error);
  }

  return {
    hasData: reasons.length > 0,
    reasons
  };
};

// 添加sequelize实例检查函数
const getSequelizeInstance = () => {
  if (!sequelize) {
    throw new Error('Sequelize实例未初始化，请检查数据库连接');
  }
  return sequelize;
};

/**
 * 创建用户
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const db = getSequelizeInstance();
  // 获取租户数据库名称（共享连接池模式）
  const tenantDb = getTenantDatabaseName(req);
  const transaction = await db.transaction();
  try {
    const userData = req.body as CreateUserDto;
    console.log('创建用户数据:', userData);

    // 检查用户名是否已存在（使用完整表名）
    const existingUsersResult = await db.query(
      `SELECT id FROM ${tenantDb}.users WHERE username = :username`,
      {
        replacements: { username: userData.username },
        type: 'SELECT',
        transaction
      }
    );

    // 安全地检查结果，确保存在且是数组
    const existingUsers = Array.isArray(existingUsersResult) ? existingUsersResult : [];

    if (existingUsers && existingUsers.length > 0) {
      await transaction.rollback();
      return ApiResponse.error(res, '用户名已存在', 'USER_USERNAME_EXISTS', 400);
    }

    // 检查邮箱是否已存在（使用完整表名）
    const existingEmailsResult = await db.query(
      `SELECT id FROM ${tenantDb}.users WHERE email = :email`,
      {
        replacements: { email: userData.email },
        type: 'SELECT',
        transaction
      }
    );

    // 安全地检查结果，确保存在且是数组
    const existingEmails = Array.isArray(existingEmailsResult) ? existingEmailsResult : [];
    
    if (existingEmails && existingEmails.length > 0) {
      await transaction.rollback();
      return ApiResponse.error(res, '邮箱已存在', 'USER_EMAIL_EXISTS', 400);
    }

    // 加密密码
    const hashedPassword = await hashPassword(userData.password);

    try {
      // 创建用户（使用完整表名）
      const insertResult = await db.query(
        `INSERT INTO ${tenantDb}.users
        (username, email, password, real_name, phone, status, created_at, updated_at)
        VALUES
        (:username, :email, :password, :realName, :phone, :status, NOW(), NOW())`,
        {
          replacements: {
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            realName: userData.realName || '',
            phone: userData.phone || '',
            status: userData.status || 1
          },
          type: 'INSERT',
          transaction
        }
      );

      console.log('用户插入结果:', insertResult);

      // 检查插入结果，确保获取到正确的insertId
      let userId: number | null = null;
      if (insertResult && Array.isArray(insertResult) && insertResult.length > 0) {
        userId = Number(insertResult[0]);
      }

      if (!userId) {
        throw new Error('创建用户失败，未获取到用户ID');
      }

      console.log('用户创建成功，ID:', userId);

      // 如果指定了角色，关联角色
      if (userData.roleIds && Array.isArray(userData.roleIds) && userData.roleIds.length > 0) {
        try {
          // 验证角色是否存在（使用完整表名）
          const validRoleResults = await db.query(
            `SELECT id FROM ${tenantDb}.roles WHERE id IN (:roleIds)`,
            {
              replacements: { roleIds: userData.roleIds },
              type: 'SELECT',
              transaction
            }
          );

          const validRoles = Array.isArray(validRoleResults) ? validRoleResults : [];
          const validRoleIds = validRoles.map((role: any) => role.id);

          if (validRoleIds.length !== userData.roleIds.length) {
            const invalidRoleIds = userData.roleIds.filter(id => !validRoleIds.includes(id));
            throw new Error(`无效的角色ID: ${invalidRoleIds.join(', ')}`);
          }

          // 使用简化的user_roles插入语句（使用完整表名）
          for (const roleId of userData.roleIds) {
            await db.query(
              `INSERT INTO ${tenantDb}.user_roles (user_id, role_id, created_at, updated_at)
               VALUES (:userId, :roleId, NOW(), NOW())`,
              {
                replacements: { userId, roleId },
                transaction
              }
            );
          }
          console.log('用户角色关联成功');
        } catch (error) {
          console.error('角色关联失败:', error);
          throw error;
        }
      }

      await transaction.commit();
      console.log('事务提交成功');

      // 获取新创建的用户
      const newUserResult = await db.query(
        `SELECT id, username, email, real_name as realName, phone, status, created_at as createdAt, updated_at as updatedAt
         FROM ${tenantDb}.users WHERE id = :userId`,
        {
          replacements: { userId },
          type: 'SELECT'
        }
      );
      
      // 安全地检查结果，确保存在且有数据
      const users = Array.isArray(newUserResult) ? newUserResult : [];
      
      if (!users || users.length === 0) {
        return ApiResponse.error(res, `创建用户成功但无法查询到用户信息，ID: ${userId}`, 'USER_QUERY_ERROR', 500);
      }

      return ApiResponse.success(res, users[0], '创建用户成功');
    } catch (insertError) {
      console.error('插入用户时出错:', insertError);
      throw insertError;
    }
  } catch (error: unknown) {
    if (transaction) {
      await transaction.rollback().catch((rollbackError: Error) => {
        console.error('回滚事务失败:', rollbackError);
      });
    }
    
    console.error('创建用户失败:', error);
    
    if (error instanceof ApiError) {
      return ApiResponse.error(res, error.message, error.code, error.statusCode);
    } else {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return ApiResponse.error(res, `创建用户失败: ${errorMessage}`, 'USER_CREATE_ERROR', 500);
    }
  }
};

/**
 * 获取用户列表
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  console.log('🔍 [DEBUG] getUsers函数开始执行');
  console.log('🔍 [DEBUG] 请求参数:', req.query);
  console.log('🔍 [DEBUG] 用户信息:', req.user);
  try {
    const db = getSequelizeInstance();
    // 获取租户数据库名称（共享连接池模式）
    const tenantDb = getTenantDatabaseName(req);

    // 简化查询 - 不使用SearchHelper，直接构建简单查询
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;
    const limit = Math.min(100, Math.max(1, pageSize));
    const offset = (page - 1) * limit;

    // 获取总数（使用完整表名）
    const countResults = await db.query(
      `SELECT COUNT(*) as total FROM ${tenantDb}.users`,
      { type: 'SELECT' }
    );

    const countResult = Array.isArray(countResults) && countResults.length > 0
      ? countResults[0]
      : { total: 0 };
    const total = typeof countResult === 'object' && countResult !== null && 'total' in countResult
      ? Number(countResult.total)
      : 0;

    // 查询用户列表（使用完整表名）
    const query = `
      SELECT
        id, username, email, real_name as realName, phone, status,
        created_at as createdAt, updated_at as updatedAt
      FROM ${tenantDb}.users
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}`;

    console.log('执行简化SQL查询:', query);

    // 查询用户列表
    const usersResults = await db.query(query, {
      type: 'SELECT'
    });

    // 确保用户列表是一个数组
    const usersList = Array.isArray(usersResults) ? usersResults : [];

    console.log('用户列表查询结果:', {
      isArray: Array.isArray(usersList),
      length: usersList.length,
      sampleUser: usersList.length > 0 ? JSON.stringify(usersList[0]) : 'none'
    });

    if (usersList.length > 0) {
      // 获取所有用户ID
      const userIds = usersList.map(user => (user as any).id);

      // 一次性获取所有用户的角色（使用完整表名）
      const rolesResults = await db.query(
        `SELECT ur.user_id as userId, r.id, r.name, r.code
         FROM ${tenantDb}.roles r
         JOIN ${tenantDb}.user_roles ur ON r.id = ur.role_id
         WHERE ur.user_id IN (:userIds)`,
        {
          replacements: { userIds },
          type: 'SELECT'
        }
      );
      
      // 将角色映射到对应的用户
      const rolesByUserId: Record<number, any[]> = {};
      const roles = Array.isArray(rolesResults) ? rolesResults : [];
      
      if (roles.length > 0) {
        roles.forEach(role => {
          const roleObj = role as any;
          const userId = roleObj.userId;
          if (!rolesByUserId[userId]) {
            rolesByUserId[userId] = [];
          }
          rolesByUserId[userId].push({
            id: roleObj.id,
            name: roleObj.name,
            code: roleObj.code
          });
        });
      }
      
      // 为每个用户添加角色
      usersList.forEach(user => {
        const userObj = user as any;
        userObj.roles = rolesByUserId[userObj.id] || [];
      });
    }
    
    // 返回结果，保持原有的list字段格式
    return ApiResponse.success(res, {
      total: total,
      page: page,
      pageSize: limit,
      items: usersList
    }, '获取用户列表成功');
  } catch (error: unknown) {
    console.error('获取用户列表失败:', error);
    
    if (error instanceof ApiError) {
      return ApiResponse.error(res, error.message, error.code, error.statusCode);
    } else {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return ApiResponse.error(res, `获取用户列表失败: ${errorMessage}`, 'USER_QUERY_ERROR', 500);
    }
  }
};

/**
 * 获取用户详情
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getSequelizeInstance();
    // 获取租户数据库名称（共享连接池模式）
    const tenantDb = getTenantDatabaseName(req);
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      return ApiResponse.error(res, '无效的用户ID', 'USER_INVALID_ID', 400);
    }

    // 查询用户详情（使用完整表名）
    const userResults = await db.query(
      `SELECT
        u.id, u.username, u.email, u.real_name as realName, u.phone, u.status,
        u.created_at as createdAt, u.updated_at as updatedAt
       FROM ${tenantDb}.users u
       WHERE u.id = :userId`,
      {
        replacements: { userId },
        type: 'SELECT'
      }
    );

    const users = Array.isArray(userResults) ? userResults : [];

    if (!users || users.length === 0) {
      return ApiResponse.error(res, '用户不存在', 'USER_NOT_FOUND', 404);
    }

    // 查询用户角色（使用完整表名）
    const rolesResults = await db.query(
      `SELECT r.id, r.name, r.code
       FROM ${tenantDb}.roles r
       JOIN ${tenantDb}.user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = :userId`,
      {
        replacements: { userId },
        type: 'SELECT'
      }
    );

    // 添加角色信息
    const user = users[0] as any;
    const roles = Array.isArray(rolesResults) ? rolesResults : [];
    user.roles = roles;

    return ApiResponse.success(res, user);
  } catch (error: unknown) {
    console.error('获取用户详情失败:', error);

    if (error instanceof ApiError) {
      return ApiResponse.error(res, error.message, error.code, error.statusCode);
    } else {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return ApiResponse.error(res, `获取用户详情失败: ${errorMessage}`, 'USER_QUERY_ERROR', 500);
    }
  }
};

/**
 * 更新用户信息
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const db = getSequelizeInstance();
  // 获取租户数据库名称（共享连接池模式）
  const tenantDb = getTenantDatabaseName(req);
  const transaction = await db.transaction();
  try {
    const userId = Number(req.params.id);
    const updateData = req.body as UpdateUserDto;

    if (isNaN(userId)) {
      await transaction.rollback();
      return ApiResponse.error(res, '无效的用户ID', 'USER_INVALID_ID', 400);
    }

    // 检查用户是否存在（使用完整表名）
    const userResults = await db.query(
      `SELECT id FROM ${tenantDb}.users WHERE id = :userId`,
      {
        replacements: { userId },
        type: 'SELECT',
        transaction
      }
    );

    const users = Array.isArray(userResults) ? userResults : [];

    if (!users || users.length === 0) {
      await transaction.rollback();
      return ApiResponse.error(res, '用户不存在', 'USER_NOT_FOUND', 404);
    }

    // 检查用户名是否已被其他用户使用（使用完整表名）
    if (updateData.username) {
      const emailResults = await db.query(
        `SELECT id FROM ${tenantDb}.users WHERE username = :username AND id != :userId`,
        {
          replacements: { username: updateData.username, userId },
          type: 'SELECT',
          transaction
        }
      );

      const existingUsers = Array.isArray(emailResults) ? emailResults : [];

      if (existingUsers && existingUsers.length > 0) {
        await transaction.rollback();
        return ApiResponse.error(res, '用户名已被其他用户使用', 'USER_USERNAME_EXISTS', 400);
      }
    }

    // 检查邮箱是否已被其他用户使用（使用完整表名）
    if (updateData.email) {
      const emailResults = await db.query(
        `SELECT id FROM ${tenantDb}.users WHERE email = :email AND id != :userId`,
        {
          replacements: { email: updateData.email, userId },
          type: 'SELECT',
          transaction
        }
      );

      const existingEmails = Array.isArray(emailResults) ? emailResults : [];

      if (existingEmails && existingEmails.length > 0) {
        await transaction.rollback();
        return ApiResponse.error(res, '邮箱已被其他用户使用', 'USER_EMAIL_EXISTS', 400);
      }
    }

    // 构建更新字段
    const updateFields: string[] = [];
    const updateValues: Record<string, any> = { userId };

    if (updateData.username !== undefined) {
      updateFields.push('username = :username');
      updateValues.username = updateData.username;
    }
    if (updateData.email !== undefined) {
      updateFields.push('email = :email');
      updateValues.email = updateData.email;
    }
    if (updateData.realName !== undefined) {
      updateFields.push('real_name = :realName');
      updateValues.realName = updateData.realName;
    }
    if (updateData.phone !== undefined) {
      updateFields.push('phone = :phone');
      updateValues.phone = updateData.phone;
    }
    if (updateData.status !== undefined) {
      updateFields.push('status = :status');
      updateValues.status = updateData.status;
    }

    // 添加更新时间
    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 1) { // 只有updated_at字段
      await transaction.rollback();
      return ApiResponse.error(res, '没有需要更新的字段', 'NO_UPDATE_FIELDS', 400);
    }

    // 更新用户信息（使用完整表名）
    await db.query(
      `UPDATE ${tenantDb}.users SET ${updateFields.join(', ')} WHERE id = :userId`,
      {
        replacements: updateValues,
        transaction
      }
    );

    // 更新角色关联
    if (updateData.roleIds && Array.isArray(updateData.roleIds)) {
      // 验证角色是否存在（使用完整表名）
      if (updateData.roleIds.length > 0) {
        const validRoleResults = await db.query(
          `SELECT id FROM ${tenantDb}.roles WHERE id IN (:roleIds)`,
          {
            replacements: { roleIds: updateData.roleIds },
            type: 'SELECT',
            transaction
          }
        );

        const validRoles = Array.isArray(validRoleResults) ? validRoleResults : [];
        const validRoleIds = validRoles.map((role: any) => role.id);

        if (validRoleIds.length !== updateData.roleIds.length) {
          const invalidRoleIds = updateData.roleIds.filter(id => !validRoleIds.includes(id));
          await transaction.rollback();
          return ApiResponse.error(res, `无效的角色ID: ${invalidRoleIds.join(', ')}`, 'INVALID_ROLE_IDS', 400);
        }
      }

      // 删除现有角色关联（使用完整表名）
      await db.query(
        `DELETE FROM ${tenantDb}.user_roles WHERE user_id = :userId`,
        {
          replacements: { userId },
          transaction
        }
      );

      // 添加新的角色关联（使用完整表名）
      if (updateData.roleIds.length > 0) {
        for (const roleId of updateData.roleIds) {
          await db.query(
            `INSERT INTO ${tenantDb}.user_roles (user_id, role_id, created_at, updated_at)
             VALUES (:userId, :roleId, NOW(), NOW())`,
            {
              replacements: { userId, roleId },
              transaction
            }
          );
        }
      }
    }

    await transaction.commit();

    // 获取更新后的用户信息（使用完整表名）
    const updatedUserResults = await db.query(
      `SELECT id, username, email, real_name as realName, phone, status, created_at as createdAt, updated_at as updatedAt
       FROM ${tenantDb}.users WHERE id = :userId`,
      {
        replacements: { userId },
        type: 'SELECT'
      }
    );

    const updatedUsers = Array.isArray(updatedUserResults) ? updatedUserResults : [];

    if (!updatedUsers || updatedUsers.length === 0) {
      return ApiResponse.error(res, '更新用户成功但无法查询到用户信息', 'USER_QUERY_ERROR', 500);
    }

    // 查询用户角色（使用完整表名）
    const rolesResults = await db.query(
      `SELECT r.id, r.name, r.code
       FROM ${tenantDb}.roles r
       JOIN ${tenantDb}.user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = :userId`,
      {
        replacements: { userId },
        type: 'SELECT'
      }
    );

    // 添加角色信息
    const updatedUser = updatedUsers[0] as any;
    const roles = Array.isArray(rolesResults) ? rolesResults : [];
    updatedUser.roles = roles;

    return ApiResponse.success(res, updatedUser, '更新用户成功');
  } catch (error: unknown) {
    if (transaction) {
      await transaction.rollback().catch((rollbackError: Error) => {
        console.error('回滚事务失败:', rollbackError);
      });
    }
    
    console.error('更新用户失败:', error);
    
    if (error instanceof ApiError) {
      return ApiResponse.error(res, error.message, error.code, error.statusCode);
    } else {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return ApiResponse.error(res, `更新用户失败: ${errorMessage}`, 'USER_UPDATE_ERROR', 500);
    }
  }
};

/**
 * 删除用户
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const db = getSequelizeInstance();
  // 获取租户数据库名称（共享连接池模式）
  const tenantDb = getTenantDatabaseName(req);
  const transaction = await db.transaction();
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      await transaction.rollback();
      return ApiResponse.error(res, '无效的用户ID', 'USER_INVALID_ID', 400);
    }

    // 检查用户是否存在（使用完整表名）
    const userResults = await db.query(
      `SELECT id, username FROM ${tenantDb}.users WHERE id = :userId`,
      {
        replacements: { userId },
        type: 'SELECT',
        transaction
      }
    );

    const users = Array.isArray(userResults) ? userResults : [];

    if (!users || users.length === 0) {
      await transaction.rollback();
      return ApiResponse.success(res, null, '用户不存在或已删除');
    }

    const user = users[0] as any;

    // 检查是否为管理员账户
    if (user.username === 'admin') {
      await transaction.rollback();
      return ApiResponse.error(res, '不能删除系统管理员账户', 'CANNOT_DELETE_ADMIN', 403);
    }

    // 检查是否为当前操作用户自己
    const currentUserId = (req as any).user?.id;
    if (currentUserId && currentUserId === userId) {
      await transaction.rollback();
      return ApiResponse.error(res, '不能删除自己的账户', 'CANNOT_DELETE_SELF', 403);
    }

    // 检查用户是否有重要的关联数据（可选，根据业务需求）- 传递租户数据库名称
    const hasImportantData = await checkUserImportantData(db, userId, transaction, tenantDb);
    if (hasImportantData.hasData) {
      await transaction.rollback();
      return ApiResponse.error(res, `用户存在重要关联数据，无法删除: ${hasImportantData.reasons.join(', ')}`, 'USER_HAS_IMPORTANT_DATA', 400);
    }

    // 删除所有相关的外键引用（按依赖顺序）- 使用完整表名

    // 1. 删除用户角色关联
    await db.query(
      `DELETE FROM ${tenantDb}.user_roles WHERE user_id = :userId`,
      {
        replacements: { userId },
        transaction
      }
    );

    // 2. 删除用户配置文件（如果存在）
    try {
      await db.query(
        `DELETE FROM ${tenantDb}.user_profiles WHERE user_id = :userId`,
        {
          replacements: { userId },
          transaction
        }
      );
    } catch (error) {
      // user_profiles表可能不存在，忽略错误
      console.log('删除用户配置文件时出错（可能是表不存在）:', error);
    }

    // 3. 删除AI相关关联（如果存在）
    try {
      await db.query(
        `DELETE FROM ${tenantDb}.ai_user_permissions WHERE user_id = :userId`,
        {
          replacements: { userId },
          transaction
        }
      );
    } catch (error) {
      // 表可能不存在，忽略错误
      console.log('删除AI用户权限时出错（可能是表不存在）:', error);
    }

    // 4. 最后删除用户
    await db.query(
      `DELETE FROM ${tenantDb}.users WHERE id = :userId`,
      {
        replacements: { userId },
        transaction
      }
    );

    await transaction.commit();

    return ApiResponse.success(res, null, '删除用户成功');
  } catch (error: unknown) {
    if (transaction) {
      await transaction.rollback().catch((rollbackError: Error) => {
        console.error('回滚事务失败:', rollbackError);
      });
    }
    
    console.error('删除用户失败:', error);
    
    if (error instanceof ApiError) {
      return ApiResponse.error(res, error.message, error.code, error.statusCode);
    } else {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return ApiResponse.error(res, `删除用户失败: ${errorMessage}`, 'USER_DELETE_ERROR', 500);
    }
  }
};

/**
 * 修改密码
 */
/**
 * 获取用户资料
 */
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return ApiResponse.error(res, '无效的用户ID', 'USER_INVALID_ID', 400);
    }

    const db = getSequelizeInstance();
    // 获取租户数据库名称（共享连接池模式）
    const tenantDb = getTenantDatabaseName(req);

    // 查询用户基本信息（使用完整表名）
    const userResults = await db.query(
      `SELECT id, username, email, real_name as realName, phone, status, created_at as createdAt, updated_at as updatedAt
       FROM ${tenantDb}.users WHERE id = :userId AND status = 'active'`,
      {
        replacements: { userId },
        type: 'SELECT'
      }
    );

    const users = Array.isArray(userResults) ? userResults : [];

    if (!users || users.length === 0) {
      return ApiResponse.error(res, '用户不存在', 'USER_NOT_FOUND', 404);
    }

    const user = users[0];

    // 查询用户角色（使用完整表名）
    const roleResults = await db.query(
      `SELECT r.code as roleCode, r.name as roleName
       FROM ${tenantDb}.user_roles ur
       INNER JOIN ${tenantDb}.roles r ON ur.role_id = r.id
       WHERE ur.user_id = :userId
       ORDER BY
         CASE
           WHEN r.code = 'super_admin' THEN 1
           WHEN r.code = 'admin' THEN 2
           ELSE 3
         END
       LIMIT 1`,
      {
        replacements: { userId },
        type: 'SELECT'
      }
    );

    const roles = Array.isArray(roleResults) ? roleResults : [];
    const primaryRole = roles.length > 0 ? roles[0] : null;

    // 获取默认幼儿园ID（如果是管理员）- 使用完整表名
    let kindergartenId = null;
    if (primaryRole && ['admin', 'super_admin'].includes(primaryRole.roleCode)) {
      const kindergartenResults = await db.query(
        `SELECT id FROM ${tenantDb}.kindergartens ORDER BY id LIMIT 1`,
        { type: 'SELECT' }
      );
      const kindergartens = Array.isArray(kindergartenResults) ? kindergartenResults : [];
      if (kindergartens.length > 0) {
        kindergartenId = kindergartens[0].id;
      }
    }

    const profileData = {
      ...user,
      role: primaryRole?.roleCode || 'user',
      roleName: primaryRole?.roleName || '普通用户',
      isAdmin: primaryRole ? ['admin', 'super_admin'].includes(primaryRole.roleCode) : false,
      kindergartenId
    };

    return ApiResponse.success(res, profileData, '获取用户资料成功');
  } catch (error: unknown) {
    console.error('获取用户资料失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return ApiResponse.error(res, `获取用户资料失败: ${errorMessage}`, 'USER_PROFILE_ERROR', 500);
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const db = getSequelizeInstance();
  // 获取租户数据库名称（共享连接池模式）
  const tenantDb = getTenantDatabaseName(req);
  const transaction = await db.transaction();
  try {
    const userId = Number(req.params.id);
    const { oldPassword, newPassword } = req.body;

    if (isNaN(userId)) {
      await transaction.rollback();
      return ApiResponse.error(res, '无效的用户ID', 'USER_INVALID_ID', 400);
    }

    // 查询用户信息（使用完整表名）
    const userResults = await db.query(
      `SELECT id, password FROM ${tenantDb}.users WHERE id = :userId`,
      {
        replacements: { userId },
        type: 'SELECT',
        transaction
      }
    );

    const users = Array.isArray(userResults) ? userResults : [];

    if (!users || users.length === 0) {
      await transaction.rollback();
      return ApiResponse.error(res, '用户不存在', 'USER_NOT_FOUND', 404);
    }

    const user = users[0] as any;

    // 验证旧密码（如果提供了旧密码）
    if (oldPassword) {
      const isOldPasswordValid = await verifyPassword(oldPassword, user.password);
      if (!isOldPasswordValid) {
        await transaction.rollback();
        return ApiResponse.error(res, '旧密码不正确', 'OLD_PASSWORD_INCORRECT', 400);
      }
    } else {
      // 如果没有提供旧密码，检查是否是管理员操作
      const currentUser = (req as any).user;
      const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

      if (!isAdmin) {
        await transaction.rollback();
        return ApiResponse.error(res, '修改密码需要提供旧密码', 'OLD_PASSWORD_REQUIRED', 400);
      }
    }

    // 加密新密码
    const hashedNewPassword = await hashPassword(newPassword);

    // 更新密码（使用完整表名）
    await db.query(
      `UPDATE ${tenantDb}.users SET password = :password, updated_at = NOW() WHERE id = :userId`,
      {
        replacements: { password: hashedNewPassword, userId },
        transaction
      }
    );

    await transaction.commit();

    return ApiResponse.success(res, null, '修改密码成功');
  } catch (error: unknown) {
    if (transaction) {
      await transaction.rollback().catch((rollbackError: Error) => {
        console.error('回滚事务失败:', rollbackError);
      });
    }

    console.error('修改密码失败:', error);

    if (error instanceof ApiError) {
      return ApiResponse.error(res, error.message, error.code, error.statusCode);
    } else {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return ApiResponse.error(res, `修改密码失败: ${errorMessage}`, 'PASSWORD_CHANGE_ERROR', 500);
    }
  }
};

// 导出默认对象，方便导入
export default {
  createUser,
  getUsers,
  getUserById,
  getUserProfile,
  updateUser,
  deleteUser,
  changePassword
}; 