import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/index';
import { sequelize } from '../init';
import { JWT_SECRET } from '../config/jwt.config';
import SessionService, { UserSession } from '../services/session.service';
import { sanitizeLog, authLogSanitizer, sanitizePhone, sanitizeToken } from '../utils/log-sanitizer';
import { secureAuditLogService, AuditLogLevel, AuditLogCategory } from '../services/secure-audit-log.service';
import { decryptField } from '../utils/encryption.util';

// 从请求中提取客户端信息的辅助函数
const getRequestContext = (req: Request) => ({
  ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress || '',
  userAgent: req.headers['user-agent'] || ''
});

// 认证用户信息类型
export interface AuthenticatedUser {
  id: number;
  username: string;
  role: string;
  email: string;
  realName: string;
  phone: string;
  status: string;
  isAdmin: boolean;
  kindergartenId?: number;
  globalUserId?: string;
  authSource?: string;
  tenantCode?: string;
  tenantDomain?: string;
  tenantDatabaseName?: string;
}

// 统一租户系统API基础URL
const UNIFIED_TENANT_API_URL = process.env.UNIFIED_TENANT_API_URL || 'http://localhost:4001';

// Demo系统配置
const DEMO_DOMAIN = 'k.yyup.cc';
const DEMO_DATABASE = process.env.DEMO_DATABASE || 'kargerdensales';

/**
 * 检查是否为Demo系统域名
 * localhost 和 k.yyup.cc 使用本地认证,不调用统一认证中心
 * k001.yyup.cc, k213.yyup.cc 等子租户需要调用统一认证中心
 */
const isDemoSystem = (domain: string): boolean => {
  const cleanDomain = domain.split(':')[0];
  
  // localhost 和 127.0.0.1 使用本地认证(开发环境)
  if (cleanDomain === 'localhost' || cleanDomain === '127.0.0.1') {
    return true;
  }
  
  // k.yyup.cc 和 k.yyup.com 主租户使用本地认证
  if (cleanDomain === DEMO_DOMAIN || cleanDomain === 'k.yyup.com') {
    return true;
  }
  
  // k001.yyup.cc, k213.yyup.cc 等子租户需要统一认证
  return false;
};

export const mockAuthMiddleware = (req: any, res: any, next: any) => { next(); };

/**
 * 统一租户集成服务
 * 调用统一租户系统(rent.yyup.cc)的认证API
 */
const adminIntegrationService = {
  /**
   * 统一认证中心验证用户
   */
  authenticateUser: async (phone: string, password: string, clientType: string = 'web') => {
    try {
      const response = await axios.post(`${UNIFIED_TENANT_API_URL}/api/auth/login`, {
        phone,
        password
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });

      return response.data;
    } catch (error: any) {
      console.error('[认证] 认证失败:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || '认证失败'
      };
    }
  },

  /**
   * 更新用户租户关联关系
   */
  updateUserTenantRelation: async (data: {
    globalUserId: string;
    tenantCode: string;
    tenantUserId: string;
    lastLoginAt: string;
    loginCount: number;
  }) => {
    try {
      const response = await axios.post(`${UNIFIED_TENANT_API_URL}/api/v1/tenants/bind-user`, data, {
        timeout: 10000
      });
      return response.data;
    } catch (error: any) {
      console.error('[认证] 更新租户关联失败:', error.response?.data || error.message);
      return { success: false, message: '更新租户关联失败' };
    }
  },

  /**
   * 获取用户关联的租户列表
   */
  findUserTenants: async (data: { phone: string; password: string }) => {
    try {
      const response = await axios.post(`${UNIFIED_TENANT_API_URL}/api/v1/auth/tenants`, data, {
        timeout: 10000
      });
      return response.data;
    } catch (error: any) {
      console.error('[认证] 获取租户列表失败:', error.response?.data || error.message);
      return {
        success: false,
        message: '获取租户列表失败'
      };
    }
  },

  /**
   * 绑定用户到租户
   */
  bindUserToTenant: async (data: {
    globalUserId: string;
    tenantCode: string;
    role: string;
    permissions: string[];
  }) => {
    try {
      const response = await axios.post(`${UNIFIED_TENANT_API_URL}/api/v1/tenants/bind`, data, {
        timeout: 10000
      });
      return response.data;
    } catch (error: any) {
      console.error('[认证] 绑定租户失败:', error.response?.data || error.message);
      return { success: false, message: '绑定租户失败' };
    }
  },

  /**
   * 获取用户统计信息
   */
  getUserStats: async (globalUserId: string) => {
    try {
      const response = await axios.get(`${UNIFIED_TENANT_API_URL}/api/v1/users/${globalUserId}/stats`, {
        timeout: 10000
      });
      return response.data;
    } catch (error: any) {
      console.error('[认证] 获取用户统计失败:', error.response?.data || error.message);
      return { success: false, message: '获取用户统计失败' };
    }
  },

  /**
   * 验证token
   */
  verifyToken: async (token: string) => {
    try {
      const response = await axios.post(`${UNIFIED_TENANT_API_URL}/api/v1/auth/verify-token`, {
        token
      }, {
        timeout: 10000,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[认证] Token验证失败:', error.response?.data || error.message);
      return { success: false, message: 'Token验证失败' };
    }
  },

  // ========== 以下方法已迁移到统一认证系统 ==========
  // 前端应直接调用统一认证API，不再通过租户实例代理
  // - sendVerificationCode: 发送验证码
  // - loginWithCode: 验证码登录
  // - checkDomain: 检查域名
  // =============================================

  /**
   * 发送验证码（代理到统一认证系统）
   */
  sendVerificationCode: async (data: { phone: string; type: string; scene?: string }) => {
    try {
      const response = await axios.post(`${UNIFIED_TENANT_API_URL}/api/sms/send-code`, data, {
        timeout: 10000
      });
      return response.data;
    } catch (error: any) {
      console.error('[SMS代理] 发送验证码失败:', error.response?.data || error.message);
      return { success: false, message: '发送验证码失败' };
    }
  },

  /**
   * 验证验证码（代理到统一认证系统）
   */
  verifyCode: async (data: { phone: string; code: string; type?: string }) => {
    try {
      const response = await axios.post(`${UNIFIED_TENANT_API_URL}/api/sms/verify-code`, data, {
        timeout: 10000
      });
      return response.data;
    } catch (error: any) {
      console.error('[SMS代理] 验证验证码失败:', error.response?.data || error.message);
      return { success: false, message: '验证验证码失败' };
    }
  },

  /**
   * 验证码注册（代理到统一认证系统）
   */
  registerByCode: async (data: {
    name: string;
    phone: string;
    verificationCode: string;
    source?: string;
    referenceId?: number;
    inviteCode?: string;
    childName?: string;
    childAge?: number;
  }) => {
    try {
      const response = await axios.post(`${UNIFIED_TENANT_API_URL}/api/auth/register-by-code`, data, {
        timeout: 10000
      });
      return response.data;
    } catch (error: any) {
      console.error('[SMS代理] 验证码注册失败:', error.response?.data || error.message);
      return { success: false, message: '验证码注册失败' };
    }
  },
}; 

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('[认证] verifyToken被调用:', req.path);
  try {
    // 🔧 内部服务调用绕过认证（最高优先级）
    if (req.headers['x-internal-service'] === 'true') {
      const serviceName = req.headers['x-service-name'] || 'unknown-service';
      console.log('[认证] 内部服务调用绕过认证', {
        path: req.path,
        service: serviceName
      });
      req.user = {
        id: 0,  // 内部服务使用ID 0
        username: 'internal_service',
        role: 'admin',  // 内部服务拥有管理员权限
        email: 'internal@system.local',
        realName: '内部服务',
        phone: '',
        status: 'active',
        isAdmin: true,
        kindergartenId: 1
      } as any;
      next();
      return;
    }

    // ⚠️ 开发环境测试绕过（已禁用，必须使用统一认证）
    // 生产环境部署时必须完全移除此逻辑
    // if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_BYPASS === 'true') {
    //   console.log('[认证] 开发环境测试绕过认证:', req.path);
    //   req.user = {
    //     id: 121,
    //     username: 'admin',
    //     role: 'admin',
    //     email: 'admin@example.com',
    //     realName: '管理员',
    //     phone: '13800138000',
    //     status: 'active',
    //     isAdmin: true,
    //     kindergartenId: 1
    //   } as any;
    //   next();
    //   return;
    // }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '未提供认证令牌',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    const token = authHeader.substring(7);
    const domain = req.get('Host') || req.hostname;

    console.log('[认证] 开始验证Token', {
      path: req.path,
      domain,
      tokenLength: token.length,
      isDemo: isDemoSystem(domain)
    });

    // ========== Demo系统本地Token验证 ==========
    if (isDemoSystem(domain)) {
      console.log('[认证] Demo系统，使用本地JWT验证');
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        console.log('[认证] Token验证成功:', {
          userId: decoded.id,
          role: decoded.role,
          isDemo: decoded.isDemo
        });

        // 从Demo数据库查询用户
        const [userRows] = await sequelize.query(`
          SELECT u.id, u.username, u.email, u.real_name, u.phone, u.status
          FROM ${DEMO_DATABASE}.users u
          WHERE u.id = ? AND u.status = 'active'
          LIMIT 1
        `, {
          replacements: [decoded.id]
        });

        if (!userRows || (userRows as any[]).length === 0) {
          res.status(401).json({
            success: false,
            message: '用户不存在或已被禁用',
            error: 'USER_NOT_FOUND'
          });
          return;
        }

        const user = (userRows as any[])[0];

        // 获取用户角色
        let userRole = decoded.role || 'admin';
        try {
          const [roleRows] = await sequelize.query(`
            SELECT r.code as role_code
            FROM ${DEMO_DATABASE}.user_roles ur
            INNER JOIN ${DEMO_DATABASE}.roles r ON ur.role_id = r.id
            WHERE ur.user_id = ?
            ORDER BY CASE WHEN r.code = 'admin' THEN 1 WHEN r.code = 'principal' THEN 2 ELSE 3 END
            LIMIT 1
          `, { replacements: [user.id] });

          if (roleRows && (roleRows as any[]).length > 0) {
            userRole = (roleRows as any[])[0].role_code;
          }
        } catch (roleError) {
          console.warn('[认证] Demo系统角色查询失败，使用默认角色:', roleError);
        }

        // 解密phone字段（如果已加密）
        const decryptedPhone = user.phone ? (decryptField(user.phone) || user.phone) : '';

        // 设置用户信息，包含JWT中的园区数据范围字段
        req.user = {
          id: user.id,
          username: user.username,
          role: userRole,
          email: user.email || '',
          realName: user.real_name || user.username,
          phone: decryptedPhone,
          status: user.status,
          isAdmin: userRole === 'admin' || userRole === 'super_admin',
          // 从JWT Token中获取园区数据范围字段
          primaryKindergartenId: decoded.primaryKindergartenId || decoded.kindergartenId || 1,
          kindergartenId: decoded.kindergartenId || decoded.primaryKindergartenId || 1,
          dataScope: decoded.dataScope || 'single',
          allowedKindergartenIds: decoded.allowedKindergartenIds || null
        } as any;

        console.log('[认证] Demo系统Token验证成功:', {
          userId: (req.user as any).id,
          username: (req.user as any).username,
          role: (req.user as any).role
        });

        next();
        return;
      } catch (error: any) {
        console.error('[认证] Demo系统Token验证失败:', error.message);
        res.status(401).json({
          success: false,
          message: 'Token验证失败',
          error: 'INVALID_TOKEN'
        });
        return;
      }
    }

    // ========== 租户系统统一认证Token验证 ==========

    try {
      // 调用统一租户API验证Token
      const verifyResult = await adminIntegrationService.verifyToken(token);

      if (!verifyResult.success) {
        console.log('[统一认证中间件] 统一租户Token验证失败:', verifyResult.message);
        res.status(401).json({
          success: false,
          message: verifyResult.message || '认证令牌无效',
          error: 'INVALID_TOKEN'
        });
        return;
      }

      const { user: globalUser } = verifyResult.data;

      // 2. 根据租户信息选择数据库（共享连接池模式）
      let sequelizeInstance: any = sequelize;
      // 获取租户数据库名称，用于完整表名查询
      const tenantDatabaseName = (req as any).tenant?.databaseName || 'kindergarten';

      if ((req as any).tenant && (req as any).tenantDb) {
        sequelizeInstance = (req as any).tenantDb;
        console.log('[认证] 使用租户数据库（共享连接池）:', tenantDatabaseName);
      } else {
        console.log('[认证] 使用默认数据库');
      }

      // 3. 在租户数据库中查找或创建用户（使用完整表名）
      let tenantUser: any = null;
      try {
        // 首先尝试通过global_user_id查找现有用户
        const [userRows] = await sequelizeInstance.query(`
          SELECT u.id, u.username, u.email, u.real_name, u.phone, u.status, u.global_user_id, u.auth_source
          FROM ${tenantDatabaseName}.users u
          WHERE u.global_user_id = ? AND u.status = 'active'
          LIMIT 1
        `, {
          replacements: [globalUser.id]
        });

        if (userRows.length > 0) {
          tenantUser = userRows[0];
          console.log('[认证] 找到现有租户用户:', tenantUser.id);
        } else {
          // 用户不存在，创建新用户
          console.log('[认证] 创建新的租户用户:', globalUser.id);
          const [insertResult] = await sequelizeInstance.query(`
            INSERT INTO ${tenantDatabaseName}.users (
              global_user_id, username, email, real_name, phone,
              auth_source, status, role, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, 'unified', 'active', 'parent', NOW(), NOW())
          `, {
            replacements: [
              globalUser.id,
              globalUser.username || globalUser.phone,
              globalUser.email || '',
              globalUser.realName || '用户',
              globalUser.phone || ''
            ]
          });

          tenantUser = {
            id: insertResult.insertId,
            global_user_id: globalUser.id,
            username: globalUser.username || globalUser.phone,
            email: globalUser.email || '',
            real_name: globalUser.realName || '用户',
            phone: globalUser.phone || '',
            status: 'active',
            auth_source: 'unified'
          };
        }
      } catch (dbError) {
        console.error('[认证] 租户数据库操作失败:', dbError);
        res.status(500).json({
          success: false,
          message: '数据库操作失败'
        });
        return;
      }

      // 4. 获取用户角色（使用完整表名）
      let userRole: any = null;
      let kindergartenId: number | null = null;

      try {
        const [roleRows] = await sequelizeInstance.query(`
          SELECT r.code as role_code, r.name as role_name
          FROM ${tenantDatabaseName}.user_roles ur
          INNER JOIN ${tenantDatabaseName}.roles r ON ur.role_id = r.id
          WHERE ur.user_id = ?
          ORDER BY
            CASE
              WHEN r.code = 'super_admin' THEN 1
              WHEN r.code = 'admin' THEN 2
              ELSE 3
            END
          LIMIT 1
        `, {
          replacements: [tenantUser.id]
        });

        userRole = roleRows.length > 0 ? roleRows[0] as any : null;

        // 为管理员用户分配默认幼儿园ID
        if (userRole?.role_code === 'admin' || userRole?.role_code === 'super_admin') {
          const [kindergartenRows] = await sequelizeInstance.query(`
            SELECT id FROM ${tenantDatabaseName}.kindergartens ORDER BY id LIMIT 1
          `);
          if (kindergartenRows && kindergartenRows.length > 0) {
            kindergartenId = (kindergartenRows[0] as any).id;
          }
        }
      } catch (roleError) {
        console.error('[认证] 角色查询失败，使用默认角色:', roleError);
        userRole = { role_code: 'admin', role_name: '管理员' };
        kindergartenId = 1;
      }

      // 5. 构建用户对象
      const userObject: any = {
        id: tenantUser.id,
        username: tenantUser.username,
        role: userRole?.role_code || 'parent',
        email: tenantUser.email || '',
        realName: tenantUser.real_name || '',
        phone: tenantUser.phone || '',
        status: tenantUser.status,
        isAdmin: userRole?.role_code === 'admin' || userRole?.role_code === 'super_admin',
        kindergartenId: kindergartenId,
        globalUserId: tenantUser.global_user_id,
        authSource: 'unified'
      };

      // 添加租户信息
      if ((req as any).tenant) {
        userObject.tenantCode = (req as any).tenant.code;
        userObject.tenantDomain = (req as any).tenant.domain;
        userObject.tenantDatabaseName = (req as any).tenant.databaseName;
        console.log('[统一认证中间件] 用户信息包含租户信息:', {
          userId: tenantUser.id,
          tenantCode: userObject.tenantCode,
          databaseName: userObject.tenantDatabaseName
        });
      }

      req.user = userObject as any;

      console.log('[统一认证中间件] 认证成功:', {
        path: req.path,
        userId: tenantUser.id,
        username: tenantUser.username,
        role: userObject.role
      });

      next();
    } catch (error) {
      console.error('[统一认证中间件] 认证失败:', error);
      res.status(401).json({
        success: false,
        message: '认证失败',
        error: 'AUTHENTICATION_FAILED'
      });
      return;
    }
  } catch (error) {
    console.error('[统一认证中间件] 内部错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: 'SERVER_ERROR'
    });
    return;
  }
}; 

export const checkPermission = (permissionCode: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`[统一权限检查] 检查权限: ${permissionCode}, 用户:`, req.user?.id);

      // 开发环境跳过系统配置权限检查
      if (process.env.NODE_ENV === 'development' && permissionCode === 'SYSTEM_CONFIG_VIEW') {
        console.log('[统一权限检查] 开发环境，跳过系统配置权限检查');
        next();
        return;
      }

      // ⚠️ 直连聊天绕过（已禁用，必须使用统一认证）
      // 生产环境部署时必须完全移除此逻辑
      // if (req.path.includes('/direct-chat')) {
      //   console.log('[权限检查] 直连聊天绕过权限检查:', req.path);
      //   next();
      //   return;
      // }

      if (!req.user) {
        console.log('[统一权限检查] 用户未认证');
        res.status(401).json({
          success: false,
          message: '用户未认证',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      // 管理员拥有所有权限
      if ((req.user as any).isAdmin) {
        console.log('[权限检查] 管理员用户，直接通过');
        next();
        return;
      }

      // 园长角色对招生中心、教师中心等管理模块拥有查看权限
      const userRole = (req.user as any).role;
      if (userRole === 'principal') {
        // 园长可以访问的权限列表
        const principalAllowedPermissions = [
          'enrollment:overview:view',
          'enrollment:plans:view',
          'enrollment:applications:view',
          'enrollment:consultations:view',
          'enrollment:analytics:view',
          'teacher-dashboard:view',
          'dashboard:view',
          'centers:view',
          'activity:view',
          'finance:view',
          'marketing:view',
          'system:view',
          'principal:performance:view',
          // 添加绩效相关权限的别名，确保所有变体都被允许
          'principal:performance:stats:view',
          'principal:performance:rankings:view',
          'principal:performance:details:view',
          'principal:performance:trends:view',
          'principal:performance:export:view',
          'principal:performance:goals:view'
        ];

        // 支持通配符匹配：principal:performance:* -> principal:performance:view
        if (permissionCode.startsWith('principal:performance:') ||
            principalAllowedPermissions.includes(permissionCode)) {
          console.log(`[权限检查] 园长角色，允许访问: ${permissionCode}`);
          next();
          return;
        }
      }

      // 教师角色权限白名单
      if (userRole === 'teacher') {
        console.log(`[权限检查] 检测到教师用户，检查白名单权限: ${permissionCode}`);
        // 教师可以访问的权限列表
        const teacherAllowedPermissions = [
          'ENROLLMENT_INTERVIEW_MANAGE',  // 预约面试管理
          'ENROLLMENT_INTERVIEW_VIEW',    // 预约面试查看
          'activity:view',                // 活动查看
          'activity:manage',              // 活动管理
          'TEACHING_CENTER_VIEW',        // 教学中心查看
          'TASK_VIEW',                   // 任务查看
          'TASK_MANAGE'                  // 任务管理
        ];

        console.log(`[权限检查] 教师白名单:`, teacherAllowedPermissions);
        console.log(`[权限检查] 权限码是否在白名单: ${teacherAllowedPermissions.includes(permissionCode)}`);

        if (teacherAllowedPermissions.includes(permissionCode)) {
          console.log(`[权限检查] ✅ 教师角色白名单匹配，允许访问: ${permissionCode}`);
          next();
          return;
        }
        console.log(`[权限检查] ❌ 教师角色白名单不匹配，继续数据库查询...`);
      }

      // 家长角色权限白名单
      if (userRole === 'parent') {
        console.log(`[权限检查] 检测到家长用户，检查白名单权限: ${permissionCode}`);
        // 家长可以访问的权限列表
        const parentAllowedPermissions = [
          'parent:view',                  // 家长信息查看
          'parent:manage',                // 家长信息管理
          'PARENT_CENTER_VIEW',          // 家长中心查看
          'CHILDREN_VIEW',               // 孩子列表查看
          'ASSESSMENT_VIEW',             // 评估记录查看
          'ACTIVITY_VIEW',               // 活动查看
          'NOTIFICATION_VIEW',           // 通知查看
          'AI_ASSISTANT_VIEW'            // AI助手查看
        ];

        console.log(`[权限检查] 家长白名单:`, parentAllowedPermissions);
        console.log(`[权限检查] 权限码是否在白名单: ${parentAllowedPermissions.includes(permissionCode)}`);

        if (parentAllowedPermissions.includes(permissionCode)) {
          console.log(`[权限检查] ✅ 家长角色白名单匹配，允许访问: ${permissionCode}`);
          next();
          return;
        }
        console.log(`[权限检查] ❌ 家长角色白名单不匹配，继续数据库查询...`);
      }



      // 选择合适的数据库连接：优先使用租户数据库（共享连接池模式）
      let sequelizeInstance: any = sequelize;
      // 获取租户数据库名称，用于完整表名查询
      const tenantDatabaseName = (req as any).tenant?.databaseName || 'kindergarten';

      // 检查是否有租户信息
      if ((req as any).tenant && (req as any).tenantDb) {
        sequelizeInstance = (req as any).tenantDb;
        console.log(`[权限检查] 使用租户数据库（共享连接池）: ${tenantDatabaseName}`);
      } else {
        console.log(`[权限检查] 使用默认数据库`);
      }

      console.log(`[权限检查] 查询用户 ${req.user.id} 的权限 ${permissionCode}`);

      let hasPermission = false;

      try {
        const [permissionRows] = await sequelizeInstance.query(`
          SELECT COUNT(*) as count
          FROM ${tenantDatabaseName}.role_permissions rp
          INNER JOIN ${tenantDatabaseName}.permissions p ON rp.permission_id = p.id
          INNER JOIN ${tenantDatabaseName}.user_roles ur ON rp.role_id = ur.role_id
          WHERE ur.user_id = ? AND p.code = ? AND p.status = 1
        `, {
          replacements: [req.user.id, permissionCode]
        });

        hasPermission = (permissionRows[0] as any)?.count > 0;
      } catch (dbError) {
        console.error('[权限检查] 数据库查询失败:', dbError);
        hasPermission = false;
      }

      console.log(`[权限检查] 权限查询结果: ${hasPermission ? '有权限' : '无权限'}`);

      if (!hasPermission) {
        // 在开发环境下记录详细信息
        if (process.env.NODE_ENV === 'development') {
          const [userRoles] = await sequelizeInstance.query(`
            SELECT r.name, r.code
            FROM ${tenantDatabaseName}.user_roles ur
            INNER JOIN ${tenantDatabaseName}.roles r ON ur.role_id = r.id
            WHERE ur.user_id = ?
          `, {
            replacements: [req.user.id]
          });

          const [userPermissions] = await sequelizeInstance.query(`
            SELECT p.code, p.name
            FROM ${tenantDatabaseName}.role_permissions rp
            INNER JOIN ${tenantDatabaseName}.permissions p ON rp.permission_id = p.id
            INNER JOIN ${tenantDatabaseName}.user_roles ur ON rp.role_id = ur.role_id
            WHERE ur.user_id = ?
          `, {
            replacements: [req.user.id]
          });

          console.log(`[权限检查] 用户角色:`, userRoles);
          console.log(`[权限检查] 用户所有权限:`, userPermissions);
        }

        res.status(403).json({
          success: false,
          message: '权限不足',
          error: 'FORBIDDEN',
          details: process.env.NODE_ENV === 'development' ? {
            requiredPermission: permissionCode,
            userId: req.user.id,
            username: req.user.id
          } : undefined
        });
        return;
      }

      console.log('[权限检查] 权限验证通过');
      next();
    } catch (error) {
      console.error('权限检查错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
      return;
    }
  };
}; 

export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        void res.status(401).json({
          success: false,
          message: '用户未认证'
        });
        return;
      }

      if (!allowedRoles.includes((req.user as any).role)) {
        void res.status(403).json({
          success: false,
          message: '角色权限不足'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('角色检查错误:', error);
      void res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  };
}; 

export const authMiddleware = verifyToken;

export const authenticate = verifyToken;

// ========== 家长权限验证中间件 ==========

import { ParentPermissionService, PermissionScope } from '../services/parent-permission.service';

/**
 * 检查家长是否有相册访问权限
 */
export const checkAlbumPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as any;

    // 非家长角色直接通过
    if (!user || user.role !== 'parent') {
      console.log('[相册权限检查] 非家长用户，直接通过:', { userId: user?.id, role: user?.role });
      next();
      return;
    }

    // 开发环境跳过权限检查
    if (process.env.NODE_ENV === 'development') {
      console.log('[相册权限检查] 开发环境，跳过权限检查');
      next();
      return;
    }

    console.log('[相册权限检查] 检查家长相册权限:', { userId: user.id, role: user.role });

    // 检查家长的相册访问权限
    const permissionResult = await ParentPermissionService.checkParentPermission(
      user.id,
      PermissionScope.ALBUM,
      user.kindergartenId
    );

    if (!permissionResult.hasPermission) {
      console.log('[相册权限检查] 权限检查失败:', {
        userId: user.id,
        reason: permissionResult.reason,
        status: permissionResult.status
      });

      res.status(403).json({
        success: false,
        message: '您没有访问相册的权限，请联系园长进行权限确认',
        errorType: 'permission_denied',
        details: {
          requiredPermission: PermissionScope.ALBUM,
          status: permissionResult.status,
          reason: permissionResult.reason
        }
      });
      return;
    }

    console.log('[相册权限检查] 权限验证通过:', { userId: user.id });
    next();

  } catch (error) {
    console.error('[相册权限检查] 权限验证异常:', error);
    res.status(500).json({
      success: false,
      message: '权限验证服务异常'
    });
  }
};

/**
 * 检查家长是否有通知访问权限
 */
export const checkNotificationPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as any;

    // 非家长角色直接通过
    if (!user || user.role !== 'parent') {
      console.log('[通知权限检查] 非家长用户，直接通过:', { userId: user?.id, role: user?.role });
      next();
      return;
    }

    console.log('[通知权限检查] 检查家长通知权限:', { userId: user.id, role: user.role });

    // 检查家长的通知访问权限
    const permissionResult = await ParentPermissionService.checkParentPermission(
      user.id,
      PermissionScope.NOTIFICATION,
      user.kindergartenId
    );

    if (!permissionResult.hasPermission) {
      console.log('[通知权限检查] 权限检查失败:', {
        userId: user?.id,
        reason: permissionResult.reason,
        status: permissionResult.status
      });

      res.status(403).json({
        success: false,
        message: '您没有访问通知的权限，请联系园长进行权限确认',
        errorType: 'permission_denied',
        details: {
          requiredPermission: PermissionScope.NOTIFICATION,
          status: permissionResult.status,
          reason: permissionResult.reason
        }
      });
      return;
    }

    console.log('[通知权限检查] 权限验证通过:', { userId: user.id });
    next();

  } catch (error) {
    console.error('[通知权限检查] 权限验证异常:', error);
    res.status(500).json({
      success: false,
      message: '权限验证服务异常'
    });
  }
};

/**
 * 检查家长是否有活动访问权限
 */
export const checkActivityPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as any;

    // 非家长角色直接通过
    if (!user || user.role !== 'parent') {
      console.log('[活动权限检查] 非家长用户，直接通过:', { userId: user?.id, role: user?.role });
      next();
      return;
    }

    console.log('[活动权限检查] 检查家长活动权限:', { userId: user.id, role: user.role });

    // 检查家长的活动访问权限
    const permissionResult = await ParentPermissionService.checkParentPermission(
      user.id,
      PermissionScope.ACTIVITY,
      user.kindergartenId
    );

    if (!permissionResult.hasPermission) {
      console.log('[活动权限检查] 权限检查失败:', {
        userId: user.id,
        reason: permissionResult.reason,
        status: permissionResult.status
      });

      res.status(403).json({
        success: false,
        message: '您没有访问活动的权限，请联系园长进行权限确认',
        errorType: 'permission_denied',
        details: {
          requiredPermission: PermissionScope.ACTIVITY,
          status: permissionResult.status,
          reason: permissionResult.reason
        }
      });
      return;
    }

    console.log('[活动权限检查] 权限验证通过:', { userId: user.id });
    next();

  } catch (error) {
    console.error('[活动权限检查] 权限验证异常:', error);
    res.status(500).json({
      success: false,
      message: '权限验证服务异常'
    });
  }
};

/**
 * 检查家长是否有学业访问权限（成绩、表现等）
 */
export const checkAcademicPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as any;

    // 非家长角色直接通过
    if (!user || user.role !== 'parent') {
      console.log('[学业权限检查] 非家长用户，直接通过:', { userId: user?.id, role: user?.role });
      next();
      return;
    }

    console.log('[学业权限检查] 检查家长学业权限:', { userId: user.id, role: user.role });

    // 检查家长的学业访问权限
    const permissionResult = await ParentPermissionService.checkParentPermission(
      user.id,
      PermissionScope.ACADEMIC,
      user.kindergartenId
    );

    if (!permissionResult.hasPermission) {
      console.log('[学业权限检查] 权限检查失败:', {
        userId: user.id,
        reason: permissionResult.reason,
        status: permissionResult.status
      });

      res.status(403).json({
        success: false,
        message: '您没有访问学业信息的权限，请联系园长进行权限确认',
        errorType: 'permission_denied',
        details: {
          requiredPermission: PermissionScope.ACADEMIC,
          status: permissionResult.status,
          reason: permissionResult.reason
        }
      });
      return;
    }

    console.log('[学业权限检查] 权限验证通过:', { userId: user.id });
    next();

  } catch (error) {
    console.error('[学业权限检查] 权限验证异常:', error);
    res.status(500).json({
      success: false,
      message: '权限验证服务异常'
    });
  }
};

/**
 * 通用的家长权限检查中间件
 * 可以指定具体的权限范围
 */
export const checkParentPermission = (requiredPermission: PermissionScope) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as any;

      // 非家长角色直接通过
      if (!user || user.role !== 'parent') {
        console.log(`[${requiredPermission}权限检查] 非家长用户，直接通过:`, { userId: user?.id, role: user?.role });
        next();
        return;
      }

      console.log(`[${requiredPermission}权限检查] 检查家长权限:`, { userId: user.id, role: user.role });

      // 检查家长的指定权限
      const permissionResult = await ParentPermissionService.checkParentPermission(
        user.id,
        requiredPermission,
        user.kindergartenId
      );

      if (!permissionResult.hasPermission) {
        console.log(`[${requiredPermission}权限检查] 权限检查失败:`, {
          userId: user.id,
          reason: permissionResult.reason,
          status: permissionResult.status
        });

        const permissionNames = {
          [PermissionScope.BASIC]: '基础信息',
          [PermissionScope.ALBUM]: '相册',
          [PermissionScope.NOTIFICATION]: '通知',
          [PermissionScope.ACTIVITY]: '活动',
          [PermissionScope.ACADEMIC]: '学业信息',
          [PermissionScope.ALL]: '全部内容'
        };

        res.status(403).json({
          success: false,
          message: `您没有访问${permissionNames[requiredPermission]}的权限，请联系园长进行权限确认`,
          errorType: 'permission_denied',
          details: {
            requiredPermission,
            status: permissionResult.status,
            reason: permissionResult.reason
          }
        });
        return;
      }

      console.log(`[${requiredPermission}权限检查] 权限验证通过:`, { userId: user.id });
      next();

    } catch (error) {
      console.error(`[${requiredPermission}权限检查] 权限验证异常:`, error);
      res.status(500).json({
        success: false,
        message: '权限验证服务异常'
      });
    }
  };
};

// ========== 统一认证中间件 ==========

/**
 * Demo系统本地认证
 * k.yyup.cc 域名使用本地 kargerdensales 数据库认证，不走统一认证
 * 支持手机号或用户名登录
 */
const authenticateWithDemoSystem = async (req: Request, res: Response, loginIdentifier: string, password: string): Promise<void> => {
  try {
    // 判断是手机号还是用户名
    const isPhone = /^1[3-9]\d{9}$/.test(loginIdentifier);
    const logIdentifier = isPhone
      ? loginIdentifier.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      : loginIdentifier;

    console.log('[Demo认证] 开始本地认证', {
      identifier: logIdentifier,
      type: isPhone ? 'phone' : 'username',
      database: DEMO_DATABASE
    });

    let user: any = null;

    if (isPhone) {
      // 手机号登录：由于phone字段加密，需要查询所有活跃用户并解密匹配
      console.log('[Demo认证] 手机号登录，查询并解密phone字段');
      const [allUsers] = await sequelize.query(`
        SELECT u.id, u.username, u.email, u.real_name, u.phone, u.password, u.status, u.role,
               u.primary_kindergarten_id, u.kindergarten_id, u.data_scope, u.allowed_kindergarten_ids
        FROM ${DEMO_DATABASE}.users u
        WHERE u.status = 'active' AND u.phone IS NOT NULL AND u.phone != ''
      `);

      // 解密phone字段并匹配
      for (const dbUser of allUsers as any[]) {
        const decryptedPhone = decryptField(dbUser.phone);
        if (decryptedPhone === loginIdentifier) {
          user = dbUser;
          break;
        }
      }

      if (!user) {
        console.log('[Demo认证] 手机号未找到匹配用户');
        await secureAuditLogService.logAuth('Demo登录失败-用户不存在', {
          username: logIdentifier,
          ipAddress: getRequestContext(req).ipAddress,
          userAgent: getRequestContext(req).userAgent,
          details: { reason: '用户不存在或未激活', type: 'phone' }
        });
        res.status(401).json({
          success: false,
          message: '用户不存在或未激活',
          error: 'USER_NOT_FOUND'
        });
        return;
      }
    } else {
      // 用户名登录：直接查询username字段
      console.log('[Demo认证] 用户名登录，直接查询username');
      const [userRows] = await sequelize.query(`
        SELECT u.id, u.username, u.email, u.real_name, u.phone, u.password, u.status, u.role,
               u.primary_kindergarten_id, u.kindergarten_id, u.data_scope, u.allowed_kindergarten_ids
        FROM ${DEMO_DATABASE}.users u
        WHERE u.username = ? AND u.status = 'active'
        LIMIT 1
      `, {
        replacements: [loginIdentifier]
      });

      if (!userRows || (userRows as any[]).length === 0) {
        console.log('[Demo认证] 用户名未找到匹配用户');
        await secureAuditLogService.logAuth('Demo登录失败-用户不存在', {
          username: logIdentifier,
          ipAddress: getRequestContext(req).ipAddress,
          userAgent: getRequestContext(req).userAgent,
          details: { reason: '用户不存在或未激活', type: 'username' }
        });
        res.status(401).json({
          success: false,
          message: '用户不存在或未激活',
          error: 'USER_NOT_FOUND'
        });
        return;
      }

      user = (userRows as any[])[0];
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // 审计日志：登录失败 - 密码错误
      await secureAuditLogService.log(
        AuditLogLevel.WARNING,
        AuditLogCategory.AUTH,
        'Demo登录失败-密码错误',
        {
          userId: user.id,
          username: user.username,
          ipAddress: getRequestContext(req).ipAddress,
          userAgent: getRequestContext(req).userAgent,
          details: { reason: '密码错误' }
        }
      );
      res.status(401).json({
        success: false,
        message: '用户名/手机号或密码错误',
        error: 'INVALID_CREDENTIALS'
      });
      return;
    }

    // 生成本地 token
    const token = jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        role: user.role || 'parent',
        isDemo: true,
        // 添加园区数据范围字段，确保 applyDataScope 中间件能正常工作
        primaryKindergartenId: user.primary_kindergarten_id || null,
        kindergartenId: user.kindergarten_id || null,
        dataScope: user.data_scope || 'single'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 获取用户角色
    let userRole = user.role || 'parent';
    try {
      const [roleRows] = await sequelize.query(`
        SELECT r.code as role_code, r.name as role_name
        FROM ${DEMO_DATABASE}.user_roles ur
        INNER JOIN ${DEMO_DATABASE}.roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
        ORDER BY CASE WHEN r.code = 'admin' THEN 1 ELSE 2 END
        LIMIT 1
      `, { replacements: [user.id] });

      if (roleRows && (roleRows as any[]).length > 0) {
        userRole = (roleRows as any[])[0].role_code;
      }
    } catch (roleError) {
      console.warn('[Demo认证] 获取角色失败，使用默认角色', roleError);
    }

    console.log('[Demo认证] 本地认证成功', {
      userId: user.id,
      role: userRole
    });

    // 审计日志：登录成功
    await secureAuditLogService.logAuth('Demo登录成功', {
      userId: user.id,
      username: user.username,
      ipAddress: getRequestContext(req).ipAddress,
      userAgent: getRequestContext(req).userAgent,
      details: { role: userRole, loginType: isPhone ? 'phone' : 'username' }
    });

    // 解密phone字段（如果已加密）
    const decryptedPhone = user.phone ? (decryptField(user.phone) || user.phone) : '';

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email || '',
          realName: user.real_name || user.username,
          phone: decryptedPhone,
          role: userRole,
          isAdmin: userRole === 'admin' || userRole === 'super_admin',
          status: user.status
        },
        isDemo: true,
        tenantInfo: {
          tenantCode: 'demo',
          tenantName: 'Demo演示系统'
        }
      }
    });
  } catch (error) {
    console.error('[Demo认证] 本地认证失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: 'DEMO_AUTH_FAILED'
    });
  }
};

/**
 * 统一认证登录中间件
 * 支持手机号+密码的统一认证登录
 *
 * 核心逻辑:
 * 1. Demo系统(k.yyup.cc) -> 本地认证，使用 kargerdensales 数据库
 * 2. 租户系统(k001.yyup.cc等) -> 统一认证
 *    - 用户已绑定租户 -> 正常登录
 *    - 用户未绑定租户 -> 返回 needsRegistration，引导用户选择角色并绑定
 */
export const authenticateWithUnifiedAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, username, password, tenantCode } = req.body;
    const domain = req.get('Host') || req.hostname;

    // 支持 phone 或 username 登录
    const loginIdentifier = phone || username;

    // 参数验证
    if (!loginIdentifier || !password) {
      res.status(400).json({
        success: false,
        message: '手机号和密码不能为空',
        error: 'MISSING_CREDENTIALS'
      });
      return;
    }

    // ========== Demo系统本地认证 ==========
    // Demo系统支持手机号或用户名登录
    if (isDemoSystem(domain)) {
      console.log('[认证] 检测到Demo系统域名，使用本地认证', { domain });
      await authenticateWithDemoSystem(req, res, loginIdentifier, password);
      return;
    }

    // ========== 租户系统统一认证 ==========
    // 租户系统必须使用手机号
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      res.status(400).json({
        success: false,
        message: '手机号格式不正确',
        error: 'INVALID_PHONE'
      });
      return;
    }

    // ========== 租户系统统一认证 ==========

    // 验证租户代码格式（如果提供）
    if (tenantCode && !/^[a-zA-Z0-9_-]+$/.test(tenantCode)) {
      res.status(400).json({
        success: false,
        message: '租户代码格式不正确',
        error: 'INVALID_TENANT_CODE'
      });
      return;
    }

    // 从租户中间件获取租户信息
    const currentTenantCode = tenantCode || (req as any).tenant?.code;
    const tenantDatabaseName = (req as any).tenant?.databaseName;

    console.log('[认证] 开始统一认证', {
      phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      tenantCode: currentTenantCode,
      domain
    });

    // 1. 统一认证中心验证
    const authResult = await adminIntegrationService.authenticateUser(phone, password, 'web');

    if (!authResult.success) {
      console.log('[认证] 统一认证失败:', authResult.message);
      // 审计日志：统一认证失败
      await secureAuditLogService.log(
        AuditLogLevel.WARNING,
        AuditLogCategory.AUTH,
        '统一认证登录失败',
        {
          username: phone,
          ipAddress: getRequestContext(req).ipAddress,
          userAgent: getRequestContext(req).userAgent,
          details: { reason: authResult.message || '手机号或密码错误', tenantCode: currentTenantCode }
        }
      );
      res.status(401).json({
        success: false,
        message: authResult.message || '手机号或密码错误',
        error: 'INVALID_CREDENTIALS'
      });
      return;
    }

    const { user: globalUser, token } = authResult.data;

    console.log('[认证] 统一认证中心验证成功', {
      globalUserId: globalUser.id,
      phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    });

    // 2. 如果提供了租户代码，在租户数据库中查找用户
    if (currentTenantCode && tenantDatabaseName) {
      try {
        // 在租户数据库中查找用户（通过 global_user_id）
        const [userRows] = await sequelize.query(`
          SELECT u.id, u.username, u.email, u.real_name, u.phone, u.status, u.global_user_id, u.auth_source, u.role
          FROM ${tenantDatabaseName}.users u
          WHERE u.global_user_id = ? AND u.status = 'active'
          LIMIT 1
        `, {
          replacements: [globalUser.id]
        });

        if (!userRows || (userRows as any[]).length === 0) {
          // ========== 用户未绑定当前租户，返回 needsRegistration ==========
          console.log('[认证] 用户未绑定当前租户，需要注册', {
            globalUserId: globalUser.id,
            tenantCode: currentTenantCode
          });

          res.json({
            success: true,
            message: '您尚未在本园所注册，请选择角色完成注册',
            data: {
              needsRegistration: true,
              globalUserId: globalUser.id,
              phone: globalUser.phone || phone,
              realName: globalUser.realName || '',
              tenantCode: currentTenantCode,
              tenantName: (req as any).tenant?.name || `园所${currentTenantCode}`,
              availableRoles: ['principal', 'teacher', 'parent'],
              token // 提供token用于后续绑定操作
            }
          });
          return;
        }

        // 用户已存在，继续正常登录流程
        const tenantUser = (userRows as any[])[0];

        // 获取用户角色
        let userRole: any = { role_code: tenantUser.role || 'parent', role_name: '家长' };
        let kindergartenId: number | null = null;

        try {
          const [roleRows] = await sequelize.query(`
            SELECT r.code as role_code, r.name as role_name
            FROM ${tenantDatabaseName}.user_roles ur
            INNER JOIN ${tenantDatabaseName}.roles r ON ur.role_id = r.id
            WHERE ur.user_id = ?
            ORDER BY CASE WHEN r.code = 'admin' THEN 1 WHEN r.code = 'principal' THEN 2 ELSE 3 END
            LIMIT 1
          `, { replacements: [tenantUser.id] });

          if (roleRows && (roleRows as any[]).length > 0) {
            userRole = (roleRows as any[])[0];
          }

          // 获取幼儿园ID
          if (userRole.role_code === 'admin' || userRole.role_code === 'principal') {
            const [kRows] = await sequelize.query(`
              SELECT id FROM ${tenantDatabaseName}.kindergartens ORDER BY id LIMIT 1
            `);
            if (kRows && (kRows as any[]).length > 0) {
              kindergartenId = (kRows as any[])[0].id;
            }
          }
        } catch (roleError) {
          console.warn('[认证] 获取角色失败，使用默认角色', roleError);
        }

        // 检查用户审核状态
        let approvalStatus = 'approved'; // 默认已审核
        try {
          if (userRole.role_code === 'teacher') {
            const [approvalRows] = await sequelize.query(`
              SELECT status FROM ${tenantDatabaseName}.teacher_approvals
              WHERE teacher_id = ? ORDER BY created_at DESC LIMIT 1
            `, { replacements: [tenantUser.id] });
            if (approvalRows && (approvalRows as any[]).length > 0) {
              approvalStatus = (approvalRows as any[])[0].status;
            }
          } else if (userRole.role_code === 'parent') {
            const [approvalRows] = await sequelize.query(`
              SELECT status FROM ${tenantDatabaseName}.parent_approvals
              WHERE parent_id = ? ORDER BY created_at DESC LIMIT 1
            `, { replacements: [tenantUser.id] });
            if (approvalRows && (approvalRows as any[]).length > 0) {
              approvalStatus = (approvalRows as any[])[0].status;
            }
          }
        } catch (approvalError) {
          // 审核表可能不存在，忽略错误
          console.warn('[认证] 获取审核状态失败，默认为已审核', approvalError);
        }

        // 更新用户租户关联
        await adminIntegrationService.updateUserTenantRelation({
          globalUserId: globalUser.id,
          tenantCode: currentTenantCode,
          tenantUserId: tenantUser.id.toString(),
          lastLoginAt: new Date().toISOString(),
          loginCount: 1
        });

        console.log('[认证] 租户登录成功', {
          globalUserId: globalUser.id,
          tenantCode: currentTenantCode,
          tenantUserId: tenantUser.id,
          role: userRole.role_code,
          approvalStatus
        });

        // 审计日志：统一认证登录成功
        await secureAuditLogService.logAuth('统一认证登录成功', {
          userId: tenantUser.id,
          username: tenantUser.username,
          ipAddress: getRequestContext(req).ipAddress,
          userAgent: getRequestContext(req).userAgent,
          details: {
            globalUserId: globalUser.id,
            tenantCode: currentTenantCode,
            role: userRole.role_code,
            approvalStatus
          }
        });

        res.json({
          success: true,
          message: '登录成功',
          data: {
            token,
            user: {
              id: tenantUser.id,
              username: tenantUser.username,
              email: tenantUser.email || '',
              realName: tenantUser.real_name || tenantUser.username,
              phone: tenantUser.phone,
              role: userRole.role_code,
              isAdmin: userRole.role_code === 'admin' || userRole.role_code === 'super_admin',
              status: tenantUser.status,
              kindergartenId,
              globalUserId: tenantUser.global_user_id,
              authSource: 'unified'
            },
            tenantInfo: {
              tenantCode: currentTenantCode,
              tenantName: (req as any).tenant?.name || `园所${currentTenantCode}`
            },
            globalUserId: globalUser.id,
            approvalStatus, // 返回审核状态
            hasFullAccess: approvalStatus === 'approved' // 是否有完整数据访问权限
          }
        });

        return;
      } catch (tenantError) {
        console.error('[认证] 租户登录失败:', tenantError);
        res.status(500).json({
          success: false,
          message: '租户登录失败',
          error: 'TENANT_LOGIN_FAILED'
        });
        return;
      }
    }

    // 3. 如果没有提供租户代码，返回用户关联的租户列表
    try {
      const tenantsResult = await adminIntegrationService.findUserTenants({
        phone,
        password
      });

      if (tenantsResult.success && tenantsResult.data) {
        console.log('[认证] 获取用户租户列表成功', {
          globalUserId: globalUser.id,
          tenantCount: tenantsResult.data.tenants.length
        });

        res.json({
          success: true,
          message: '认证成功，请选择要登录的租户',
          data: {
            globalUserId: globalUser.id,
            phone,
            tenants: tenantsResult.data.tenants,
            requiresTenantSelection: true
          }
        });
        return;
      }

      // 如果没有关联任何租户，返回需要绑定租户
      console.log('[认证] 用户未关联任何租户', {
        globalUserId: globalUser.id
      });

      res.json({
        success: true,
        message: '认证成功，请绑定或创建租户',
        data: {
          globalUserId: globalUser.id,
          phone,
          tenants: [],
          requiresTenantBinding: true
        }
      });
    } catch (tenantError) {
      console.error('[认证] 获取租户列表失败:', tenantError);
      res.status(500).json({
        success: false,
        message: '获取租户列表失败',
        error: 'GET_TENANTS_FAILED'
      });
    }
  } catch (error) {
    console.error('[认证] 登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: 'LOGIN_FAILED'
    });
  }
};

/**
 * 获取用户关联的租户列表中间件
 */
export const getUserTenants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, password } = req.body;

    // 参数验证
    if (!phone || !password) {
      res.status(400).json({
        success: false,
        message: '手机号和密码不能为空'
      });
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
      return;
    }

    console.log('[认证] 开始获取用户租户列表', {
      phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    });

    // 1. 统一认证验证
    const authResult = await adminIntegrationService.authenticateUser(phone, password);

    if (!authResult.success) {
      console.log('[认证] 身份验证失败', {
        phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
        message: authResult.message
      });

      res.status(401).json({
        success: false,
        message: authResult.message || '手机号或密码错误'
      });
      return;
    }

    // 2. 获取用户关联租户
    const tenantsResult = await adminIntegrationService.findUserTenants({
      phone,
      password
    });

    if (tenantsResult.success) {
      console.log('[认证] 获取用户租户列表成功', {
        globalUserId: authResult.globalUserId,
        tenantCount: tenantsResult.data?.tenants.length || 0
      });

      res.json({
        success: true,
        message: '获取成功',
        data: {
          globalUserId: authResult.globalUserId,
          phone,
          tenants: tenantsResult.data?.tenants || []
        }
      });
    } else {
      console.log('[认证] 获取用户租户列表失败', {
        globalUserId: authResult.globalUserId,
        message: tenantsResult.message
      });

      res.status(400).json({
        success: false,
        message: tenantsResult.message || '获取租户列表失败'
      });
    }

  } catch (error) {
    console.error('[认证] 获取用户租户列表异常', {
      phone: req.body.phone ? req.body.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : 'unknown',
      error: (error as Error).message
    });

    res.status(500).json({
      success: false,
      message: '获取租户列表失败'
    });
  }
};

/**
 * 绑定用户到租户中间件
 *
 * 场景：用户已在统一认证中心注册，但未绑定当前租户
 * 流程：
 * 1. 验证参数
 * 2. 在统一认证中心绑定用户到租户
 * 3. 在租户数据库中创建用户记录
 * 4. 根据角色创建审核记录（教师/家长需要审核）
 * 5. 返回登录token
 */
export const bindUserToTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      globalUserId,
      tenantCode,
      role = 'parent',
      permissions = [],
      // 用户信息
      phone,
      realName,
      // 教师/家长特有字段
      kindergartenId,
      classId,
      teacherTitle,
      teachingSubjects,
      // 家长特有字段
      childName,
      childRelation,
      // token用于后续操作
      token
    } = req.body;

    // 从租户中间件获取租户信息
    const currentTenantCode = tenantCode || (req as any).tenant?.code;
    const tenantDatabaseName = (req as any).tenant?.databaseName;

    // 参数验证
    if (!globalUserId) {
      res.status(400).json({
        success: false,
        message: 'globalUserId不能为空',
        error: 'MISSING_GLOBAL_USER_ID'
      });
      return;
    }

    if (!currentTenantCode) {
      res.status(400).json({
        success: false,
        message: '无法识别租户',
        error: 'MISSING_TENANT_CODE'
      });
      return;
    }

    if (!role || !['principal', 'teacher', 'parent'].includes(role)) {
      res.status(400).json({
        success: false,
        message: '请选择有效的角色（园长/教师/家长）',
        error: 'INVALID_ROLE'
      });
      return;
    }

    // 教师必须选择幼儿园和班级
    if (role === 'teacher') {
      if (!kindergartenId) {
        res.status(400).json({
          success: false,
          message: '教师注册必须选择幼儿园',
          error: 'MISSING_KINDERGARTEN'
        });
        return;
      }
      if (!classId) {
        res.status(400).json({
          success: false,
          message: '教师注册必须选择班级',
          error: 'MISSING_CLASS'
        });
        return;
      }
    }

    // 家长必须选择幼儿园和班级
    if (role === 'parent') {
      if (!kindergartenId) {
        res.status(400).json({
          success: false,
          message: '家长注册必须选择幼儿园',
          error: 'MISSING_KINDERGARTEN'
        });
        return;
      }
      if (!classId) {
        res.status(400).json({
          success: false,
          message: '家长注册必须选择班级',
          error: 'MISSING_CLASS'
        });
        return;
      }
    }

    console.log('[绑定租户] 开始绑定用户到租户', {
      globalUserId,
      tenantCode: currentTenantCode,
      role,
      kindergartenId,
      classId
    });

    // 1. 绑定到统一认证中心
    const bindResult = await adminIntegrationService.bindUserToTenant({
      globalUserId,
      tenantCode: currentTenantCode,
      role,
      permissions
    });

    if (!bindResult.success) {
      console.log('[绑定租户] 统一认证绑定失败', {
        globalUserId,
        tenantCode: currentTenantCode,
        message: bindResult.message
      });

      res.status(400).json({
        success: false,
        message: bindResult.message || '绑定失败',
        error: 'UNIFIED_BIND_FAILED'
      });
      return;
    }

    // 2. 在租户数据库中创建用户记录
    let tenantUserId: number | null = null;
    let approvalStatus = 'pending';

    try {
      // 检查用户是否已存在
      const [existingRows] = await sequelize.query(`
        SELECT id FROM ${tenantDatabaseName}.users WHERE global_user_id = ? LIMIT 1
      `, { replacements: [globalUserId] });

      if (existingRows && (existingRows as any[]).length > 0) {
        tenantUserId = (existingRows as any[])[0].id;
        console.log('[绑定租户] 用户已存在', { tenantUserId });
      } else {
        // 创建新用户
        const [insertResult] = await sequelize.query(`
          INSERT INTO ${tenantDatabaseName}.users (
            global_user_id, username, email, real_name, phone,
            auth_source, status, role, created_at, updated_at
          ) VALUES (?, ?, '', ?, ?, 'unified', 'active', ?, NOW(), NOW())
        `, {
          replacements: [
            globalUserId,
            phone || `user_${globalUserId}`,
            realName || '用户',
            phone || '',
            role
          ]
        });

        tenantUserId = (insertResult as any).insertId || (insertResult as any);
        console.log('[绑定租户] 创建租户用户成功', { tenantUserId });
      }

      // 3. 分配角色
      try {
        const [roleRows] = await sequelize.query(`
          SELECT id FROM ${tenantDatabaseName}.roles WHERE code = ? LIMIT 1
        `, { replacements: [role] });

        if (roleRows && (roleRows as any[]).length > 0) {
          const roleId = (roleRows as any[])[0].id;

          // 检查是否已分配角色
          const [existingRoleRows] = await sequelize.query(`
            SELECT id FROM ${tenantDatabaseName}.user_roles
            WHERE user_id = ? AND role_id = ? LIMIT 1
          `, { replacements: [tenantUserId, roleId] });

          if (!existingRoleRows || (existingRoleRows as any[]).length === 0) {
            await sequelize.query(`
              INSERT INTO ${tenantDatabaseName}.user_roles (user_id, role_id, created_at, updated_at)
              VALUES (?, ?, NOW(), NOW())
            `, { replacements: [tenantUserId, roleId] });
            console.log('[绑定租户] 角色分配成功', { role });
          }
        }
      } catch (roleError) {
        console.warn('[绑定租户] 角色分配失败', roleError);
      }

      // 4. 根据角色创建审核记录
      if (role === 'teacher' && kindergartenId && classId) {
        try {
          // 获取园长ID
          const [principalRows] = await sequelize.query(`
            SELECT u.id FROM ${tenantDatabaseName}.users u
            INNER JOIN ${tenantDatabaseName}.user_roles ur ON u.id = ur.user_id
            INNER JOIN ${tenantDatabaseName}.roles r ON ur.role_id = r.id
            WHERE r.code IN ('principal', 'admin') AND u.status = 'active'
            ORDER BY u.id ASC LIMIT 1
          `);

          const principalId = principalRows && (principalRows as any[]).length > 0
            ? (principalRows as any[])[0].id
            : 1;

          // 创建教师审核记录
          await sequelize.query(`
            INSERT INTO ${tenantDatabaseName}.teacher_approvals (
              teacher_id, assigner_id, assigner_type, kindergarten_id, class_id,
              approval_scope, teacher_title, teaching_subjects, status,
              is_permanent, created_at, updated_at
            ) VALUES (?, ?, 'principal', ?, ?, 'basic', ?, ?, 'pending', 0, NOW(), NOW())
          `, {
            replacements: [
              tenantUserId,
              principalId,
              kindergartenId,
              classId,
              teacherTitle || null,
              JSON.stringify(teachingSubjects || [])
            ]
          });

          approvalStatus = 'pending';
          console.log('[绑定租户] 教师审核记录创建成功');
        } catch (approvalError) {
          console.error('[绑定租户] 创建教师审核记录失败', approvalError);
        }
      } else if (role === 'parent' && kindergartenId && classId) {
        try {
          // 创建家长审核记录
          await sequelize.query(`
            INSERT INTO ${tenantDatabaseName}.parent_approvals (
              parent_id, kindergarten_id, class_id, child_name, child_relation,
              status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())
          `, {
            replacements: [
              tenantUserId,
              kindergartenId,
              classId,
              childName || '',
              childRelation || 'parent'
            ]
          });

          approvalStatus = 'pending';
          console.log('[绑定租户] 家长审核记录创建成功');
        } catch (approvalError) {
          console.error('[绑定租户] 创建家长审核记录失败（表可能不存在）', approvalError);
          // 家长审核表可能不存在，默认为已审核
          approvalStatus = 'approved';
        }
      } else if (role === 'principal') {
        // 园长不需要审核
        approvalStatus = 'approved';
      }

    } catch (tenantError) {
      console.error('[绑定租户] 租户用户记录处理失败', {
        globalUserId,
        tenantCode: currentTenantCode,
        error: (tenantError as Error).message
      });

      res.status(500).json({
        success: false,
        message: '创建用户记录失败',
        error: 'CREATE_USER_FAILED'
      });
      return;
    }

    // 5. 生成登录token（如果没有提供）
    const loginToken = token || jwt.sign(
      {
        id: tenantUserId,
        globalUserId,
        phone,
        role,
        tenantCode: currentTenantCode
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('[绑定租户] 绑定成功', {
      globalUserId,
      tenantCode: currentTenantCode,
      tenantUserId,
      role,
      approvalStatus
    });

    res.json({
      success: true,
      message: approvalStatus === 'pending'
        ? '注册成功！请等待审核通过后即可使用完整功能。'
        : '注册成功！',
      data: {
        token: loginToken,
        user: {
          id: tenantUserId,
          globalUserId,
          phone,
          realName: realName || '用户',
          role,
          status: 'active',
          authSource: 'unified'
        },
        tenantInfo: {
          tenantCode: currentTenantCode,
          tenantName: (req as any).tenant?.name || `园所${currentTenantCode}`
        },
        approvalStatus,
        hasFullAccess: approvalStatus === 'approved'
      }
    });

  } catch (error) {
    console.error('[绑定租户] 绑定用户到租户异常', {
      globalUserId: req.body.globalUserId,
      tenantCode: req.body.tenantCode,
      error: (error as Error).message
    });

    res.status(500).json({
      success: false,
      message: '绑定失败',
      error: 'BIND_FAILED'
    });
  }
};

// ========== 统一认证辅助方法 ==========

/**
 * 切换到指定租户的数据库
 */
async function switchToTenantDatabase(tenantCode: string): Promise<void> {
  try {
    // 这里应该实现租户数据库切换逻辑
    // 例如：修改Sequelize连接的数据库配置
    console.log('[数据库切换] 切换到租户数据库', { tenantCode });

    // 示例实现（需要根据实际的数据库配置进行调整）
    // const tenantDbName = `tenant_${tenantCode}`;
    // await sequelize.query(`USE ${tenantDbName}`);

    // 临时实现：验证租户代码格式
    if (!/^[a-zA-Z0-9_-]+$/.test(tenantCode)) {
      throw new Error(`无效的租户代码: ${tenantCode}`);
    }

    console.log('[数据库切换] 租户数据库切换成功', { tenantCode });
  } catch (error) {
    console.error('[数据库切换] 切换失败', {
      tenantCode,
      error: (error as Error).message
    });
    throw error;
  }
}

/**
 * 在租户数据库中通过全局用户ID查找用户（使用完整表名）
 * @param globalUserId 全局用户ID
 * @param tenantDatabaseName 租户数据库名称（如 tenant_k001），默认使用 kindergarten
 */
async function findTenantUserByGlobalId(globalUserId: string, tenantDatabaseName: string = 'kindergarten'): Promise<any> {
  try {
    const sequelizeInstance = sequelize;

    const [userRows] = await sequelizeInstance.query(`
      SELECT * FROM ${tenantDatabaseName}.users
      WHERE global_user_id = ? AND auth_source = 'unified'
      LIMIT 1
    `, {
      replacements: [globalUserId]
    });

    return userRows.length > 0 ? (userRows[0] as any) : null;
  } catch (error) {
    console.error('[租户用户查询] 查询失败', {
      globalUserId,
      tenantDatabaseName,
      error: (error as Error).message
    });
    return null;
  }
}

/**
 * 在租户数据库中创建用户记录（使用完整表名）
 * @param globalUserId 全局用户ID
 * @param phone 手机号
 * @param realName 真实姓名
 * @param email 邮箱
 * @param tenantDatabaseName 租户数据库名称（如 tenant_k001），默认使用 kindergarten
 */
async function createTenantUser(
  globalUserId: string,
  phone: string,
  realName?: string,
  email?: string,
  tenantDatabaseName: string = 'kindergarten'
): Promise<any> {
  try {
    const sequelizeInstance = sequelize;

    const [result] = await sequelizeInstance.query(`
      INSERT INTO ${tenantDatabaseName}.users (
        global_user_id, username, phone, real_name, email,
        auth_source, status, role, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'unified', 'active', 'parent', NOW(), NOW())
    `, {
      replacements: [
        globalUserId,
        phone, // 使用手机号作为用户名
        phone,
        realName || '',
        email || ''
      ]
    });

    const insertId = (result as any).insertId;

    console.log('[租户用户创建] 创建成功', {
      globalUserId,
      phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      tenantUserId: insertId,
      tenantDatabaseName
    });

    // 返回创建的用户信息
    return {
      id: insertId,
      global_user_id: globalUserId,
      username: phone,
      phone,
      real_name: realName || '',
      email: email || '',
      auth_source: 'unified',
      status: 'active',
      role: 'parent'
    };
  } catch (error) {
    console.error('[租户用户创建] 创建失败', {
      globalUserId,
      phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      tenantDatabaseName,
      error: (error as Error).message
    });
    throw error;
  }
}

/**
 * 生成租户内JWT Token
 */
function generateTenantToken(user: any): string {
  try {
    const payload = {
      userId: user.id,
      globalUserId: user.global_user_id,
      username: user.username,
      role: user.role || 'user',
      authSource: 'unified',
      type: 'tenant_access'
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '24h',
      issuer: 'k.yyup.com',
      audience: 'tenant-user'
    });
  } catch (error) {
    console.error('[JWT生成] 生成失败', {
      userId: user?.id,
      error: (error as Error).message
    });
    throw error;
  }
}

/**
 * 格式化用户响应数据
 */
function formatUserResponse(user: any): any {
  return {
    id: user.id,
    globalUserId: user.global_user_id,
    username: user.username,
    realName: user.real_name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'user',
    status: user.status || 'active',
    authSource: user.auth_source || 'local'
  };
}

// ========== 家长数据访问控制中间件 ==========

/**
 * 检查家长是否有权访问特定学生的数据
 * @param studentIdParam 学生ID参数名，默认为 'id'
 * @param requireActive 是否要求关系状态为 active，默认为 true
 */
export const checkParentStudentAccess = (studentIdParam: string = 'id', requireActive: boolean = true) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as any;
      const studentId = parseInt(req.params[studentIdParam] || req.body.studentId || req.query.studentId);

      // 非家长角色直接通过（管理员、园长、教师有更高权限）
      if (user.role !== 'parent') {
        console.log('[家长权限检查] 非家长用户，直接通过', { userId: user.id, role: user.role });
        next();
        return;
      }

      if (!studentId || isNaN(studentId)) {
        void res.status(400).json({
          success: false,
          message: '学生ID参数无效',
          error: 'INVALID_STUDENT_ID'
        });
        return;
      }

      console.log('[家长权限检查] 检查家长-学生关系', {
        parentId: user.id,
        studentId,
        requireActive
      });

      // 获取租户数据库名称
      const tenantDatabaseName = (req as any).tenant?.databaseName || 'kindergarten';
      const sequelizeInstance = (req as any).tenantDb || sequelize;

      // 查询家长-学生关系
      const [relationRows] = await sequelizeInstance.query(`
        SELECT psr.id, psr.status, psr.created_at,
               s.id as student_id, s.real_name as student_name
        FROM ${tenantDatabaseName}.parent_student_relations psr
        INNER JOIN ${tenantDatabaseName}.students s ON psr.student_id = s.id
        WHERE psr.parent_id = ? AND psr.student_id = ?
        ${requireActive ? 'AND psr.status = ?' : ''}
        LIMIT 1
      `, {
        replacements: requireActive ? [user.id, studentId, 'active'] : [user.id, studentId]
      });

      if (!relationRows || (relationRows as any[]).length === 0) {
        console.log('[家长权限检查] 无权访问此学生信息', {
          parentId: user.id,
          studentId,
          reason: 'no_relation_found'
        });

        void res.status(403).json({
          success: false,
          message: '您无权访问此学生的信息，请确认您是该学生的监护人',
          error: 'PARENT_STUDENT_ACCESS_DENIED',
          details: {
            parentId: user.id,
            studentId
          }
        });
        return;
      }

      const relation = (relationRows as any[])[0];

      // 在请求对象中添加关系信息，供后续中间件使用
      (req as any).parentStudentRelation = {
        id: relation.id,
        status: relation.status,
        createdAt: relation.created_at,
        studentId: relation.student_id,
        studentName: relation.student_name
      };

      console.log('[家长权限检查] 权限验证通过', {
        parentId: user.id,
        studentId,
        studentName: relation.student_name,
        relationStatus: relation.status
      });

      next();
    } catch (error) {
      console.error('[家长权限检查] 权限验证异常:', error);
      res.status(500).json({
        success: false,
        message: '权限验证服务异常',
        error: 'PARENT_ACCESS_CHECK_ERROR'
      });
    }
  };
};

/**
 * 检查家长是否有权访问特定班级的数据（通过学生关系）
 * @param classIdParam 班级ID参数名，默认为 'classId'
 */
export const checkParentClassAccess = (classIdParam: string = 'classId') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as any;
      const classId = parseInt(req.params[classIdParam] || req.body.classId || req.query.classId);

      // 非家长角色直接通过
      if (user.role !== 'parent') {
        next();
        return;
      }

      if (!classId || isNaN(classId)) {
        void res.status(400).json({
          success: false,
          message: '班级ID参数无效',
          error: 'INVALID_CLASS_ID'
        });
        return;
      }

      console.log('[家长班级权限检查] 检查家长是否有学生在该班级', {
        parentId: user.id,
        classId
      });

      // 获取租户数据库名称
      const tenantDatabaseName = (req as any).tenant?.databaseName || 'kindergarten';
      const sequelizeInstance = (req as any).tenantDb || sequelize;

      // 通过学生关系查询班级权限
      const [relationRows] = await sequelizeInstance.query(`
        SELECT psr.id, s.id as student_id, s.real_name as student_name, c.id as class_id, c.name as class_name
        FROM ${tenantDatabaseName}.parent_student_relations psr
        INNER JOIN ${tenantDatabaseName}.students s ON psr.student_id = s.id
        INNER JOIN ${tenantDatabaseName}.classes c ON s.class_id = c.id
        WHERE psr.parent_id = ? AND c.id = ? AND psr.status = 'active'
        LIMIT 1
      `, {
        replacements: [user.id, classId]
      });

      if (!relationRows || (relationRows as any[]).length === 0) {
        console.log('[家长班级权限检查] 无权访问此班级信息', {
          parentId: user.id,
          classId,
          reason: 'no_student_in_class'
        });

        void res.status(403).json({
          success: false,
          message: '您无权访问此班级的信息，请确认您的孩子在该班级',
          error: 'PARENT_CLASS_ACCESS_DENIED',
          details: {
            parentId: user.id,
            classId
          }
        });
        return;
      }

      const relation = (relationRows as any[])[0];

      // 在请求对象中添加关系信息
      (req as any).parentClassRelation = {
        studentId: relation.student_id,
        studentName: relation.student_name,
        classId: relation.class_id,
        className: relation.class_name
      };

      console.log('[家长班级权限检查] 权限验证通过', {
        parentId: user.id,
        classId,
        className: relation.class_name,
        studentName: relation.student_name
      });

      next();
    } catch (error) {
      console.error('[家长班级权限检查] 权限验证异常:', error);
      void res.status(500).json({
        success: false,
        message: '权限验证服务异常',
        error: 'PARENT_CLASS_ACCESS_CHECK_ERROR'
      });
    }
  };
};

/**
 * 检查家长是否有权访问特定幼儿园的数据
 * 这个中间件应该在使用其他家长权限中间件之前调用
 * 它确保家长至少有一个孩子在当前幼儿园
 */
export const checkParentKindergartenAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as any;

    // 非家长角色直接通过
    if (user.role !== 'parent') {
      next();
      return;
    }

    const kindergartenId = user.kindergartenId || 1; // 从用户信息获取幼儿园ID

    console.log('[家长幼儿园权限检查] 检查家长是否在此幼儿园有孩子', {
      parentId: user.id,
      kindergartenId
    });

    // 获取租户数据库名称
    const tenantDatabaseName = (req as any).tenant?.databaseName || 'kindergarten';
    const sequelizeInstance = (req as any).tenantDb || sequelize;

    // 查询家长在此幼儿园是否有孩子
    const [relationRows] = await sequelizeInstance.query(`
      SELECT COUNT(*) as count
      FROM ${tenantDatabaseName}.parent_student_relations psr
      INNER JOIN ${tenantDatabaseName}.students s ON psr.student_id = s.id
      WHERE psr.parent_id = ? AND s.kindergarten_id = ? AND psr.status = 'active'
    `, {
      replacements: [user.id, kindergartenId]
    });

    const count = (relationRows as any[])[0]?.count || 0;

    if (count === 0) {
      console.log('[家长幼儿园权限检查] 无权访问此幼儿园信息', {
        parentId: user.id,
        kindergartenId,
        reason: 'no_children_in_kindergarten'
      });

      void res.status(403).json({
        success: false,
        message: '您在此幼儿园没有孩子，无法访问相关信息',
        error: 'PARENT_KINDERGARTEN_ACCESS_DENIED',
        details: {
          parentId: user.id,
          kindergartenId
        }
      });
      return;
    }

    console.log('[家长幼儿园权限检查] 权限验证通过', {
      parentId: user.id,
      kindergartenId,
      childrenCount: count
    });

    // 在请求对象中添加孩子数量信息
    (req as any).parentChildrenCount = count;

    next();
  } catch (error) {
    console.error('[家长幼儿园权限检查] 权限验证异常:', error);
    res.status(500).json({
      success: false,
      message: '权限验证服务异常',
      error: 'PARENT_KINDERGARTEN_ACCESS_CHECK_ERROR'
    });
  }
};

// 导出adminIntegrationService供路由使用
export { adminIntegrationService };

/**
 * 认证日志辅助函数
 * 自动脱敏敏感信息后记录日志
 */
export const authLogger = {
  /**
   * 记录认证日志（自动脱敏）
   */
  log: (message: string, data?: any) => {
    if (!data) {
      console.log(`[认证] ${message}`);
      return;
    }
    const sanitized = sanitizeLog(data);
    console.log(`[认证] ${message}`, sanitized);
  },

  /**
   * 记录错误日志（自动脱敏）
   */
  error: (message: string, error?: any) => {
    if (!error) {
      console.error(`[认证] ${message}`);
      return;
    }
    const sanitized = sanitizeLog(error);
    console.error(`[认证] ${message}`, sanitized);
  },

  /**
   * 记录带手机号的日志（自动脱敏手机号）
   */
  logWithPhone: (message: string, phone?: string) => {
    const sanitizedPhone = sanitizePhone(phone);
    console.log(`[认证] ${message}`, { phone: sanitizedPhone });
  },

  /**
   * 记录带Token的日志（自动脱敏Token）
   */
  logWithToken: (message: string, token?: string) => {
    const sanitizedToken = sanitizeToken(token);
    console.log(`[认证] ${message}`, { token: sanitizedToken });
  }
};
