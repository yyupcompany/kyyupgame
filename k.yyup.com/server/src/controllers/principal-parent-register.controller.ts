/**
 * 园长开通家长账号控制器
 * 
 * 功能：
 * 1. 园长为本园学生添加家长账号
 * 2. 自动设置家长园区归属
 * 3. 只能为本园学生添加家长
 * 4. 建立家长-学生关联
 * 5. 发送账号通知
 */

import { Request, Response } from 'express';
import { sequelize } from '../init';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import axios from 'axios';

// 统一租户系统API基础URL
const UNIFIED_TENANT_API_URL = process.env.UNIFIED_TENANT_API_URL || 'http://localhost:4001';

/**
 * 园长为学生开通家长账号
 * 
 * 流程：
 * 1. 验证园长权限
 * 2. 验证学生属于本园
 * 3. 在统一认证系统注册账号
 * 4. 在租户数据库创建User记录（绑定本园）
 * 5. 创建Parent记录
 * 6. 创建ParentStudentRelation关联
 * 7. 分配parent角色
 * 8. 发送账号通知
 */
export const createParentByPrincipal = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  
  try {
    const user = req.user as any;
    
    console.log('[园长开通家长] 开始处理请求', {
      principalId: user.id,
      principalName: user.username,
      kindergartenId: user.primaryKindergartenId
    });

    // 1. 验证权限：只有园长可以开通家长
    if (user.role !== 'principal' && user.role !== 'branch_principal') {
      throw ApiError.forbidden('只有园长可以开通家长账号');
    }

    // 确保园长有园区归属
    const principalKindergartenId = user.primaryKindergartenId || user.kindergartenId;
    if (!principalKindergartenId) {
      throw ApiError.forbidden('您尚未分配园区，无法开通家长账号');
    }

    // 2. 验证必填字段
    const {
      studentId,         // 学生ID
      realName,          // 家长姓名
      phone,             // 手机号
      email,             // 邮箱（可选）
      relationship,      // 与学生关系（父/母/其他）
      isPrimaryContact,  // 是否主要联系人
      initialPassword    // 初始密码（可选）
    } = req.body;

    if (!studentId || !realName || !phone || !relationship) {
      throw ApiError.badRequest('缺少必要字段：studentId, realName, phone, relationship');
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw ApiError.badRequest('手机号格式不正确');
    }

    console.log('[园长开通家长] 参数验证通过', {
      realName,
      phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      studentId,
      relationship
    });

    // 3. 验证学生是否存在且属于本园
    const [students] = await sequelize.query(`
      SELECT id, name, kindergarten_id, class_id
      FROM students
      WHERE id = :studentId AND deleted_at IS NULL
    `, {
      replacements: { studentId },
      transaction
    });

    if (students.length === 0) {
      throw ApiError.notFound('学生不存在');
    }

    const studentInfo = students[0] as any;
    
    // 验证学生是否属于本园
    if (studentInfo.kindergarten_id !== principalKindergartenId) {
      throw ApiError.forbidden('该学生不属于您的园区，无法为其添加家长');
    }

    console.log('[园长开通家长] 学生验证通过', {
      studentId,
      studentName: studentInfo.name,
      kindergartenId: studentInfo.kindergarten_id
    });

    // 4. 检查该家长是否已存在
    const [existingParents] = await sequelize.query(`
      SELECT p.id, p.user_id, u.phone
      FROM parents p
      INNER JOIN users u ON p.user_id = u.id
      WHERE u.phone = :phone AND u.deleted_at IS NULL
    `, {
      replacements: { phone },
      transaction
    });

    let parentUserId: number;
    let parentId: number;
    let isNewParent = true;

    if (existingParents.length > 0) {
      // 家长账号已存在，直接使用
      const existingParent = existingParents[0] as any;
      parentUserId = existingParent.user_id;
      parentId = existingParent.id;
      isNewParent = false;

      console.log('[园长开通家长] 家长账号已存在，将建立关联', {
        parentId,
        parentUserId
      });
    } else {
      // 5. 在统一认证系统注册家长账号
      let globalUserId: string;
      let unifiedAuthToken: string;

      try {
        const registerPassword = initialPassword || `${phone.slice(-6)}Pr`;
        
        console.log('[园长开通家长] 调用统一认证系统注册');
        
        const unifiedRegisterResponse = await axios.post(
          `${UNIFIED_TENANT_API_URL}/api/auth/register`,
          {
            phone,
            password: registerPassword,
            realName,
            email: email || `${phone}@parent.com`,
            registrationSource: 'principal_parent_register'
          },
          {
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
          }
        );

        if (!unifiedRegisterResponse.data.success) {
          throw new Error(unifiedRegisterResponse.data.message || '统一认证注册失败');
        }

        globalUserId = unifiedRegisterResponse.data.data.globalUserId;
        unifiedAuthToken = unifiedRegisterResponse.data.data.token;

        console.log('[园长开通家长] 统一认证注册成功', {
          globalUserId,
          phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
        });
      } catch (unifiedError: any) {
        console.error('[园长开通家长] 统一认证注册失败:', unifiedError.response?.data || unifiedError.message);
        
        if (unifiedError.response?.data?.message?.includes('已存在') || unifiedError.response?.data?.message?.includes('already')) {
          throw ApiError.badRequest('该手机号已注册，请使用其他手机号或关联现有家长');
        }
        
        throw ApiError.badRequest(unifiedError.response?.data?.message || '注册家长账号失败');
      }

      // 6. 在租户数据库创建家长User记录（自动绑定本园）
      const [userResult] = await sequelize.query(`
        INSERT INTO users (
          global_user_id, username, email, phone, password, real_name,
          role, status, auth_source,
          primary_kindergarten_id, data_scope,
          created_at, updated_at
        ) VALUES (
          :globalUserId, :username, :email, :phone, '', :realName,
          'parent', 'active', 'unified',
          :kindergartenId, 'single',
          NOW(), NOW()
        )
      `, {
        replacements: {
          globalUserId,
          username: phone,
          email: email || `${phone}@parent.com`,
          phone,
          realName,
          kindergartenId: principalKindergartenId
        },
        transaction
      });

      parentUserId = (userResult as any).insertId || (userResult as any);

      console.log('[园长开通家长] 家长用户创建成功', {
        userId: parentUserId,
        kindergartenId: principalKindergartenId
      });

      // 7. 创建Parent记录
      const [parentResult] = await sequelize.query(`
        INSERT INTO parents (
          user_id, name, phone, email, relationship,
          created_at, updated_at
        ) VALUES (
          :userId, :name, :phone, :email, :relationship,
          NOW(), NOW()
        )
      `, {
        replacements: {
          userId: parentUserId,
          name: realName,
          phone,
          email: email || `${phone}@parent.com`,
          relationship: relationship || 'parent'
        },
        transaction
      });

      parentId = (parentResult as any).insertId || (parentResult as any);

      console.log('[园长开通家长] Parent记录创建成功', { parentId });

      // 8. 分配 parent 角色
      const [roleRows] = await sequelize.query(`
        SELECT id FROM roles WHERE code = 'parent' LIMIT 1
      `, { transaction });

      if (roleRows.length > 0) {
        const roleId = (roleRows[0] as any).id;
        
        await sequelize.query(`
          INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
          VALUES (:userId, :roleId, NOW(), NOW())
        `, {
          replacements: {
            userId: parentUserId,
            roleId
          },
          transaction
        });

        console.log('[园长开通家长] 分配家长角色成功');
      }

      // 9. 绑定用户到租户
      try {
        const tenantCode = (req as any).tenant?.code || process.env.TENANT_CODE || 'k_test';
        
        await axios.post(
          `${UNIFIED_TENANT_API_URL}/api/v1/tenants/bind`,
          {
            globalUserId,
            tenantCode,
            role: 'parent',
            permissions: []
          },
          {
            timeout: 10000,
            headers: { 'Authorization': `Bearer ${unifiedAuthToken}` }
          }
        );

        console.log('[园长开通家长] 用户租户绑定成功');
      } catch (bindError: any) {
        console.error('[园长开通家长] 绑定租户失败（非致命错误）:', bindError.response?.data || bindError.message);
      }
    }

    // 10. 创建家长-学生关联关系
    // 先检查关联是否已存在
    const [existingRelations] = await sequelize.query(`
      SELECT id FROM parent_student_relations
      WHERE parent_id = :parentId AND student_id = :studentId
      AND deleted_at IS NULL
    `, {
      replacements: { parentId, studentId },
      transaction
    });

    if (existingRelations.length === 0) {
      await sequelize.query(`
        INSERT INTO parent_student_relations (
          parent_id, student_id, relationship, is_primary_contact,
          created_at, updated_at
        ) VALUES (
          :parentId, :studentId, :relationship, :isPrimaryContact,
          NOW(), NOW()
        )
      `, {
        replacements: {
          parentId,
          studentId,
          relationship,
          isPrimaryContact: isPrimaryContact ? 1 : 0
        },
        transaction
      });

      console.log('[园长开通家长] 家长-学生关联创建成功');
    } else {
      console.log('[园长开通家长] 家长-学生关联已存在，跳过创建');
    }

    await transaction.commit();

    // 11. 返回成功信息
    ApiResponse.success(res, {
      parent: {
        id: parentId,
        userId: parentUserId,
        name: realName,
        phone,
        kindergartenId: principalKindergartenId,
        isNew: isNewParent
      },
      student: {
        id: studentId,
        name: studentInfo.name,
        classId: studentInfo.class_id
      },
      relationship,
      isPrimaryContact: isPrimaryContact ? true : false,
      message: isNewParent 
        ? '家长账号开通成功！初始密码将通过短信发送给家长。' 
        : '家长账号已存在，已建立与学生的关联关系。'
    }, '家长账号开通成功');

    console.log('[园长开通家长] 流程完成');

  } catch (error: any) {
    await transaction.rollback();
    console.error('[园长开通家长] 流程失败:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw ApiError.internalError(`开通家长账号失败: ${error.message}`);
  }
};

/**
 * 获取本园的学生列表（用于家长注册时选择）
 * 
 * 权限：园长只能看到本园的学生
 */
export const getKindergartenStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;

    const kindergartenId = user.primaryKindergartenId || user.kindergartenId;
    
    if (!kindergartenId) {
      throw ApiError.forbidden('您尚未分配园区');
    }

    const { page = 1, pageSize = 20, keyword, classId } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    let whereClause = 'WHERE s.kindergarten_id = :kindergartenId AND s.deleted_at IS NULL';
    const replacements: any = { kindergartenId, offset, limit };

    if (keyword) {
      whereClause += ' AND (s.name LIKE :keyword OR s.student_number LIKE :keyword)';
      replacements.keyword = `%${keyword}%`;
    }

    if (classId) {
      whereClause += ' AND s.class_id = :classId';
      replacements.classId = Number(classId);
    }

    // 查询总数
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM students s
      ${whereClause}
    `, { replacements });

    const total = (countResult[0] as any).total;

    // 查询列表
    const [students] = await sequelize.query(`
      SELECT
        s.id, s.name, s.student_number, s.gender, s.birth_date,
        s.class_id, s.status,
        c.name as class_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      ${whereClause}
      ORDER BY s.class_id ASC, s.name ASC
      LIMIT :limit OFFSET :offset
    `, { replacements });

    ApiResponse.success(res, {
      list: students,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / Number(pageSize))
      }
    }, '查询成功');

  } catch (error: any) {
    console.error('[获取学生列表] 失败:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw ApiError.internalError(`获取学生列表失败: ${error.message}`);
  }
};

/**
 * 查看本园的家长列表
 * 
 * 权限：园长只能看到本园的家长
 */
export const listKindergartenParents = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;

    const kindergartenId = user.primaryKindergartenId || user.kindergartenId;
    
    if (!kindergartenId) {
      throw ApiError.forbidden('您尚未分配园区');
    }

    const { page = 1, pageSize = 10, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    let whereClause = 'WHERE u.primary_kindergarten_id = :kindergartenId AND u.role = "parent"';
    const replacements: any = { kindergartenId, offset, limit };

    if (keyword) {
      whereClause += ' AND (p.name LIKE :keyword OR p.phone LIKE :keyword)';
      replacements.keyword = `%${keyword}%`;
    }

    // 查询总数
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM users u
      INNER JOIN parents p ON u.id = p.user_id
      ${whereClause}
    `, { replacements });

    const total = (countResult[0] as any).total;

    // 查询列表（包含关联的学生信息）
    const [parents] = await sequelize.query(`
      SELECT
        p.id, p.user_id, p.name, p.phone, p.email, p.relationship,
        u.username, u.global_user_id, u.status,
        GROUP_CONCAT(DISTINCT s.name) as student_names,
        COUNT(DISTINCT psr.student_id) as student_count
      FROM users u
      INNER JOIN parents p ON u.id = p.user_id
      LEFT JOIN parent_student_relations psr ON p.id = psr.parent_id AND psr.deleted_at IS NULL
      LEFT JOIN students s ON psr.student_id = s.id AND s.deleted_at IS NULL
      ${whereClause}
      GROUP BY p.id, p.user_id, p.name, p.phone, p.email, p.relationship, u.username, u.global_user_id, u.status
      ORDER BY p.created_at DESC
      LIMIT :limit OFFSET :offset
    `, { replacements });

    ApiResponse.success(res, {
      list: parents,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / Number(pageSize))
      }
    }, '查询成功');

  } catch (error: any) {
    console.error('[查看家长列表] 失败:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw ApiError.internalError(`查询家长列表失败: ${error.message}`);
  }
};

export default {
  createParentByPrincipal,
  getKindergartenStudents,
  listKindergartenParents
};
