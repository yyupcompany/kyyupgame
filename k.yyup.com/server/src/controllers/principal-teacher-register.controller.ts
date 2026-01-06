/**
 * 园长开通教师账号控制器
 * 
 * 功能：
 * 1. 园长为本园开通教师账号
 * 2. 自动设置教师园区归属
 * 3. 只能为本园班级分配教师
 * 4. 发送账号通知
 */

import { Request, Response } from 'express';
import { sequelize } from '../init';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import axios from 'axios';

// 统一租户系统API基础URL
const UNIFIED_TENANT_API_URL = process.env.UNIFIED_TENANT_API_URL || 'http://localhost:4001';

/**
 * 园长开通教师账号
 * 
 * 流程：
 * 1. 验证园长权限
 * 2. 验证班级属于本园
 * 3. 在统一认证系统注册账号
 * 4. 在租户数据库创建User记录（绑定本园）
 * 5. 创建Teacher记录
 * 6. 分配teacher角色
 * 7. 发送账号通知
 */
export const createTeacherByPrincipal = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  
  try {
    const user = req.user as any;
    
    console.log('[园长开通教师] 开始处理请求', {
      principalId: user.id,
      principalName: user.username,
      kindergartenId: user.primaryKindergartenId
    });

    // 1. 验证权限：只有园长可以开通教师
    if (user.role !== 'principal' && user.role !== 'branch_principal') {
      throw ApiError.forbidden('只有园长可以开通教师账号');
    }

    // 确保园长有园区归属
    const principalKindergartenId = user.primaryKindergartenId || user.kindergartenId;
    if (!principalKindergartenId) {
      throw ApiError.forbidden('您尚未分配园区，无法开通教师账号');
    }

    // 2. 验证必填字段
    const {
      realName,          // 教师姓名
      phone,             // 手机号
      email,             // 邮箱（可选）
      classId,           // 所属班级
      teacherTitle,      // 职称（可选）
      teachingSubjects,  // 任教科目（可选）
      initialPassword    // 初始密码（可选）
    } = req.body;

    if (!realName || !phone || !classId) {
      throw ApiError.badRequest('缺少必要字段：realName, phone, classId');
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw ApiError.badRequest('手机号格式不正确');
    }

    console.log('[园长开通教师] 参数验证通过', {
      realName,
      phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      classId
    });

    // 3. 验证班级是否存在且属于本园
    const [classes] = await sequelize.query(`
      SELECT id, name, kindergarten_id
      FROM classes
      WHERE id = :classId AND deleted_at IS NULL
    `, {
      replacements: { classId },
      transaction
    });

    if (classes.length === 0) {
      throw ApiError.notFound('班级不存在');
    }

    const classInfo = classes[0] as any;
    
    // 验证班级是否属于本园
    if (classInfo.kindergarten_id !== principalKindergartenId) {
      throw ApiError.forbidden('该班级不属于您的园区，无法为其分配教师');
    }

    console.log('[园长开通教师] 班级验证通过', {
      classId,
      className: classInfo.name,
      kindergartenId: classInfo.kindergarten_id
    });

    // 4. 在统一认证系统注册教师账号
    let globalUserId: string;
    let unifiedAuthToken: string;

    try {
      const registerPassword = initialPassword || `${phone.slice(-6)}Tc`;
      
      console.log('[园长开通教师] 调用统一认证系统注册');
      
      const unifiedRegisterResponse = await axios.post(
        `${UNIFIED_TENANT_API_URL}/api/auth/register`,
        {
          phone,
          password: registerPassword,
          realName,
          email: email || `${phone}@kindergarten.com`,
          registrationSource: 'principal_teacher_register'
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

      console.log('[园长开通教师] 统一认证注册成功', {
        globalUserId,
        phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      });
    } catch (unifiedError: any) {
      console.error('[园长开通教师] 统一认证注册失败:', unifiedError.response?.data || unifiedError.message);
      
      if (unifiedError.response?.data?.message?.includes('已存在') || unifiedError.response?.data?.message?.includes('already')) {
        throw ApiError.badRequest('该手机号已注册，请使用其他手机号');
      }
      
      throw ApiError.badRequest(unifiedError.response?.data?.message || '注册教师账号失败');
    }

    // 5. 在租户数据库创建教师User记录（自动绑定本园）
    const [userResult] = await sequelize.query(`
      INSERT INTO users (
        global_user_id, username, email, phone, password, real_name,
        role, status, auth_source,
        primary_kindergarten_id, data_scope,
        created_at, updated_at
      ) VALUES (
        :globalUserId, :username, :email, :phone, '', :realName,
        'teacher', 'active', 'unified',
        :kindergartenId, 'single',
        NOW(), NOW()
      )
    `, {
      replacements: {
        globalUserId,
        username: phone,
        email: email || `${phone}@kindergarten.com`,
        phone,
        realName,
        kindergartenId: principalKindergartenId
      },
      transaction
    });

    const teacherUserId = (userResult as any).insertId || (userResult as any);

    console.log('[园长开通教师] 教师用户创建成功', {
      userId: teacherUserId,
      kindergartenId: principalKindergartenId
    });

    // 6. 创建Teacher记录
    const [teacherResult] = await sequelize.query(`
      INSERT INTO teachers (
        user_id, kindergarten_id, name, phone, email,
        title, subjects, status,
        created_at, updated_at
      ) VALUES (
        :userId, :kindergartenId, :name, :phone, :email,
        :title, :subjects, 1,
        NOW(), NOW()
      )
    `, {
      replacements: {
        userId: teacherUserId,
        kindergartenId: principalKindergartenId,
        name: realName,
        phone,
        email: email || `${phone}@kindergarten.com`,
        title: teacherTitle || '',
        subjects: teachingSubjects ? JSON.stringify(teachingSubjects) : '[]'
      },
      transaction
    });

    const teacherId = (teacherResult as any).insertId || (teacherResult as any);

    console.log('[园长开通教师] Teacher记录创建成功', { teacherId });

    // 7. 分配 teacher 角色
    const [roleRows] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'teacher' LIMIT 1
    `, { transaction });

    if (roleRows.length > 0) {
      const roleId = (roleRows[0] as any).id;
      
      await sequelize.query(`
        INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
        VALUES (:userId, :roleId, NOW(), NOW())
      `, {
        replacements: {
          userId: teacherUserId,
          roleId
        },
        transaction
      });

      console.log('[园长开通教师] 分配教师角色成功');
    }

    // 8. 建立教师-班级关联
    await sequelize.query(`
      INSERT INTO class_teachers (
        class_id, teacher_id, role, is_primary,
        created_at, updated_at
      ) VALUES (
        :classId, :teacherId, 'class_teacher', 1,
        NOW(), NOW()
      )
    `, {
      replacements: {
        classId,
        teacherId
      },
      transaction
    });

    console.log('[园长开通教师] 教师-班级关联成功');

    // 9. 绑定用户到租户
    try {
      const tenantCode = (req as any).tenant?.code || process.env.TENANT_CODE || 'k_test';
      
      await axios.post(
        `${UNIFIED_TENANT_API_URL}/api/v1/tenants/bind`,
        {
          globalUserId,
          tenantCode,
          role: 'teacher',
          permissions: []
        },
        {
          timeout: 10000,
          headers: { 'Authorization': `Bearer ${unifiedAuthToken}` }
        }
      );

      console.log('[园长开通教师] 用户租户绑定成功');
    } catch (bindError: any) {
      console.error('[园长开通教师] 绑定租户失败（非致命错误）:', bindError.response?.data || bindError.message);
    }

    await transaction.commit();

    // 10. 返回成功信息
    ApiResponse.success(res, {
      teacher: {
        id: teacherId,
        userId: teacherUserId,
        name: realName,
        phone,
        globalUserId,
        kindergartenId: principalKindergartenId
      },
      class: {
        id: classId,
        name: classInfo.name
      },
      message: '教师账号开通成功！初始密码将通过短信发送给教师。'
    }, '教师账号开通成功');

    console.log('[园长开通教师] 流程完成');

  } catch (error: any) {
    await transaction.rollback();
    console.error('[园长开通教师] 流程失败:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw ApiError.internalError(`开通教师账号失败: ${error.message}`);
  }
};

/**
 * 获取本园的班级列表（用于教师注册时选择）
 * 
 * 权限：园长只能看到本园的班级
 */
export const getKindergartenClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;

    const kindergartenId = user.primaryKindergartenId || user.kindergartenId;
    
    if (!kindergartenId) {
      throw ApiError.forbidden('您尚未分配园区');
    }

    const [classes] = await sequelize.query(`
      SELECT
        id, name, grade_level, class_type, capacity, current_count, status
      FROM classes
      WHERE kindergarten_id = :kindergartenId AND deleted_at IS NULL AND status = 1
      ORDER BY grade_level ASC, name ASC
    `, {
      replacements: { kindergartenId }
    });

    ApiResponse.success(res, {
      kindergartenId,
      classes
    }, '查询成功');

  } catch (error: any) {
    console.error('[获取班级列表] 失败:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw ApiError.internalError(`获取班级列表失败: ${error.message}`);
  }
};

/**
 * 查看本园的教师列表
 * 
 * 权限：园长只能看到本园的教师
 */
export const listKindergartenTeachers = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;

    const kindergartenId = user.primaryKindergartenId || user.kindergartenId;
    
    if (!kindergartenId) {
      throw ApiError.forbidden('您尚未分配园区');
    }

    const { page = 1, pageSize = 10, keyword, status } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    let whereClause = 'WHERE t.kindergarten_id = :kindergartenId';
    const replacements: any = { kindergartenId, offset, limit };

    if (keyword) {
      whereClause += ' AND (t.name LIKE :keyword OR t.phone LIKE :keyword)';
      replacements.keyword = `%${keyword}%`;
    }

    if (status !== undefined) {
      whereClause += ' AND t.status = :status';
      replacements.status = Number(status);
    }

    // 查询总数
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM teachers t
      ${whereClause}
    `, { replacements });

    const total = (countResult[0] as any).total;

    // 查询列表
    const [teachers] = await sequelize.query(`
      SELECT
        t.id, t.user_id, t.name, t.phone, t.email, t.title, t.subjects, t.status,
        t.created_at, t.updated_at,
        u.username, u.global_user_id
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT :limit OFFSET :offset
    `, { replacements });

    ApiResponse.success(res, {
      list: teachers,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / Number(pageSize))
      }
    }, '查询成功');

  } catch (error: any) {
    console.error('[查看教师列表] 失败:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw ApiError.internalError(`查询教师列表失败: ${error.message}`);
  }
};

export default {
  createTeacherByPrincipal,
  getKindergartenClasses,
  listKindergartenTeachers
};
