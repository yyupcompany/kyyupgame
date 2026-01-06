/**
 * 用户注册相关API接口
 * 注册流程：统一租户认证系统注册 + 租户数据库同步
 */

import { Request, Response } from 'express';
import axios from 'axios';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { hashPassword } from '../utils/password';
import { sequelize } from '../init';
import { User, UserRole, UserStatus } from '../models/user.model';
import { Role } from '../models/role.model';
import { Class } from '../models/class.model';
import { Kindergarten } from '../models/kindergarten.model';
import { TeacherApproval, TeacherApprovalScope } from '../models/teacher-approval.model';
import { TeacherApprovalService } from '../services/teacher-approval.service';

// 统一租户系统API基础URL
const UNIFIED_TENANT_API_URL = process.env.UNIFIED_TENANT_API_URL || 'http://localhost:4001';

/**
 * 用户注册接口
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const {
      username,
      email,
      phone,
      password,
      role,
      realName,
      // 教师特有字段
      classId,
      teacherTitle,
      teachingSubjects,
      kindergartenId,
    } = req.body;

    console.log('[用户注册] 收到注册请求:', {
      username,
      email,
      phone,
      role,
      realName
    });

    // 基础字段验证 - 注册必须提供手机号
    if (!phone || !password || !role) {
      throw ApiError.badRequest('手机号、密码和角色为必填字段');
    }

    // 手机号格式验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw ApiError.badRequest('手机号格式不正确');
    }

    // ========== 第一步：在统一租户认证系统注册 ==========
    console.log('[用户注册] 步骤1: 调用统一租户系统注册API');
    let globalUserId: string;
    let unifiedAuthToken: string;

    try {
      const unifiedRegisterResponse = await axios.post(
        `${UNIFIED_TENANT_API_URL}/api/auth/register`,
        {
          phone,
          password,
          realName: realName || username,
          email,
          registrationSource: 'tenant_register'
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

      console.log('[用户注册] 统一租户注册成功:', {
        globalUserId,
        phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      });
    } catch (unifiedError: any) {
      console.error('[用户注册] 统一租户注册失败:', unifiedError.response?.data || unifiedError.message);
      
      if (unifiedError.response?.data?.message) {
        throw ApiError.badRequest(unifiedError.response.data.message);
      }
      
      throw ApiError.internalError('注册失败：无法连接到统一认证系统');
    }

    // 检查角色是否有效
    const validRoles = ['parent', 'teacher', 'admin', 'principal'];
    if (!validRoles.includes(role)) {
      throw ApiError.badRequest('无效的用户角色');
    }

    // 如果是教师角色，验证必填字段
    if (role === 'teacher') {
      if (!classId) {
        throw ApiError.badRequest('教师注册必须选择班级');
      }
      if (!kindergartenId) {
        throw ApiError.badRequest('教师注册必须选择幼儿园');
      }

      // 验证班级是否存在
      const classExists = await Class.findByPk(classId, {
        include: [{ model: Kindergarten, as: 'kindergarten' }],
        transaction
      });

      if (!classExists) {
        throw ApiError.badRequest('所选班级不存在');
      }

      // 验证班级是否属于指定的幼儿园
      if (classExists.kindergarten && classExists.kindergarten.id !== kindergartenId) {
        throw ApiError.badRequest('班级与幼儿园不匹配');
      }
    }

    // ========== 第二步：在租户数据库中创建用户（双写） ==========
    console.log('[用户注册] 步骤2: 在租户数据库中创建用户记录');

    // 注意：不需要加密密码，因为认证在统一系统完成
    // 租户数据库的users表不需要存储密码
    const newUser = await User.create({
      global_user_id: globalUserId,  // 关键：关联全局用户ID
      username: username || phone,   // 使用手机号作为默认用户名
      email: email || '',
      phone: phone,
      password: '',  // 租户数据库不存储密码，认证在统一系统完成
      realName: realName || username || '用户',
      role,
      status: UserStatus.ACTIVE,
      auth_source: 'unified',  // 标记为统一认证用户
      // kindergartenId: role === 'teacher' ? kindergartenId : null,
    }, { transaction });

    console.log('[用户注册] 租户数据库用户创建成功:', {
      tenantUserId: newUser.id,
      globalUserId,
      phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    });

    // 为用户分配角色
    const userRole = await Role.findOne({
      where: { code: role },
      transaction
    });

    if (userRole) {
      await (newUser as any).addRole(userRole, { transaction });
      console.log('[用户注册] 角色分配成功:', role);
    }

    // 如果是教师注册，创建教师审核申请
    if (role === 'teacher') {
      try {
        // 获取园长ID（这里简化处理，取第一个管理员或园长）
        const principalUser = await User.findOne({
          where: {
            role: ['principal', 'admin'],
            status: 'active'
          },
          order: [['id', 'ASC']],
          transaction
        });

        if (!principalUser) {
          throw new Error('系统中没有找到园长或管理员，无法处理教师审核');
        }

        await TeacherApprovalService.createTeacherRequest({
          teacherId: newUser.id,
          assignerId: principalUser.id,
          assignerType: 'principal',
          kindergartenId: kindergartenId!,
          classId: classId!,
          approvalScope: TeacherApprovalScope.BASIC, // 教师注册默认基础权限
          teacherTitle: teacherTitle || null,
          teachingSubjects: teachingSubjects || [],
          isPermanent: false, // 教师权限默认非永久
        });

        console.log('[用户注册] 教师审核申请创建成功');
      } catch (approvalError: any) {
        console.error('[用户注册] 创建教师审核申请失败:', approvalError);
        throw ApiError.internalError(`创建教师审核申请失败: ${approvalError.message}`);
      }
    }

    // ========== 第三步：绑定用户到租户（调用统一租户API） ==========
    console.log('[用户注册] 步骤3: 绑定用户到租户');

    try {
      // 获取当前租户代码（优先从请求对象获取，然后是环境变量，最后是默认值）
      const tenantCode = req.tenant?.code || process.env.TENANT_CODE || 'k_test';
      
      await axios.post(
        `${UNIFIED_TENANT_API_URL}/api/v1/tenants/bind`,
        {
          globalUserId,
          tenantCode,
          role,
          permissions: []
        },
        {
          timeout: 10000,
          headers: { 'Authorization': `Bearer ${unifiedAuthToken}` }
        }
      );

      console.log('[用户注册] 用户租户绑定成功');
    } catch (bindError: any) {
      console.error('[用户注册] 绑定租户失败（非致命错误）:', bindError.response?.data || bindError.message);
      // 绑定失败不影响注册流程，用户首次登录时会自动绑定
    }

    await transaction.commit();

    // 返回注册成功信息（不包含敏感信息）
    const response = {
      id: newUser.id,
      globalUserId,  // 返回全局用户ID
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      realName: newUser.realName,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt,
      token: unifiedAuthToken,  // 返回统一认证token
      message: role === 'teacher'
        ? '教师注册成功！您的账户已创建，请等待园长审核激活。'
        : '注册成功！您可以使用手机号和密码登录。'
    };

    ApiResponse.success(res, response, '用户注册成功');

  } catch (error: any) {
    await transaction.rollback();
    console.error('[用户注册] 注册失败:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw ApiError.internalError(`注册失败: ${error.message}`);
  }
};

/**
 * 检查用户名是否可用
 */
export const checkUsernameAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.query;

    if (!username || typeof username !== 'string') {
      throw ApiError.badRequest('用户名参数无效');
    }

    const existingUser = await User.findOne({
      where: { username }
    });

    const isAvailable = !existingUser;

    ApiResponse.success(res, {
      username,
      available: isAvailable,
      message: isAvailable ? '用户名可用' : '用户名已被使用'
    }, '用户名可用性检查完成');

  } catch (error: any) {
    console.error('[用户注册] 用户名检查失败:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw ApiError.internalError(`用户名检查失败: ${error.message}`);
  }
};

/**
 * 检查邮箱是否可用
 */
export const checkEmailAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      throw ApiError.badRequest('邮箱参数无效');
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw ApiError.badRequest('邮箱格式无效');
    }

    const existingUser = await User.findOne({
      where: { email }
    });

    const isAvailable = !existingUser;

    ApiResponse.success(res, {
      email,
      available: isAvailable,
      message: isAvailable ? '邮箱可用' : '邮箱已被使用'
    }, '邮箱可用性检查完成');

  } catch (error: any) {
    console.error('[用户注册] 邮箱检查失败:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw ApiError.internalError(`邮箱检查失败: ${error.message}`);
  }
};

/**
 * 获取注册表单所需的基础数据
 */
export const getRegistrationFormData = async (req: Request, res: Response): Promise<void> => {
  try {
    // 获取幼儿园列表
    const kindergartens = await Kindergarten.findAll({
      attributes: ['id', 'name'],
      where: { status: 'active' },
      order: [['name', 'ASC']]
    });

    // 获取班级列表（如果有幼儿园ID参数则过滤）
    const { kindergartenId } = req.query;
    let classes = [];

    if (kindergartenId && typeof kindergartenId === 'string') {
      classes = await Class.findAll({
        attributes: ['id', 'name', 'kindergartenId'],
        where: {
          kindergartenId: parseInt(kindergartenId),
          status: 'active'
        },
        order: [['name', 'ASC']]
      });
    } else {
      classes = await Class.findAll({
        attributes: ['id', 'name', 'kindergartenId'],
        where: { status: 'active' },
        include: [{
          model: Kindergarten,
          as: 'kindergarten',
          attributes: ['id', 'name']
        }],
        order: [['name', 'ASC']]
      });
    }

    const formData = {
      kindergartens: kindergartens.map(k => ({
        id: k.id,
        name: k.name
      })),
      classes: classes.map(c => ({
        id: c.id,
        name: c.name,
        kindergartenId: c.kindergartenId,
        kindergartenName: (c as any).kindergarten?.name || null
      }))
    };

    ApiResponse.success(res, formData, '获取注册表单数据成功');

  } catch (error: any) {
    console.error('[用户注册] 获取表单数据失败:', error);
    throw ApiError.internalError(`获取注册表单数据失败: ${error.message}`);
  }
};

export default {
  register,
  checkUsernameAvailability,
  checkEmailAvailability,
  getRegistrationFormData
};