/**
 * 改进的认证中间件示例 - 使用共享连接池
 * 演示如何在查询时使用完整的表名访问租户数据库
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';

interface RequestWithUser extends Request {
  user?: any;
  tenant?: { code: string };
  tenantDb?: any;
}

/**
 * 改进的Token验证中间件 - 使用共享连接池
 */
export const verifyTokenSharedPool = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 获取token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '缺少认证令牌',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    const token = authHeader.substring(7);

    // 调用统一认证系统验证token
    const verifyResult = await adminIntegrationService.verifyToken(token);
    if (!verifyResult.success) {
      res.status(401).json({
        success: false,
        message: verifyResult.message || '认证令牌无效',
        error: 'INVALID_TOKEN'
      });
      return;
    }

    const { user: globalUser } = verifyResult.data;
    const tenantCode = req.tenant?.code;

    if (!tenantCode) {
      res.status(400).json({
        success: false,
        message: '租户信息缺失',
        error: 'MISSING_TENANT_INFO'
      });
      return;
    }

    // ✅ 关键改进：使用完整表名查询租户数据库
    // 格式: SELECT * FROM tenant_${tenantCode}.users
    const [userRows] = await req.tenantDb.query(`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.real_name, 
        u.phone, 
        u.status, 
        u.global_user_id
      FROM tenant_${tenantCode}.users u
      WHERE u.global_user_id = ? AND u.status = 'active'
      LIMIT 1
    `, {
      replacements: [globalUser.id]
    });

    if (userRows.length === 0) {
      res.status(401).json({
        success: false,
        message: '用户不存在',
        error: 'USER_NOT_FOUND'
      });
      return;
    }

    const tenantUser = userRows[0];

    // ✅ 获取用户角色 - 也使用完整表名
    const [roleRows] = await req.tenantDb.query(`
      SELECT r.code as role_code, r.name as role_name
      FROM tenant_${tenantCode}.user_roles ur
      INNER JOIN tenant_${tenantCode}.roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
      LIMIT 1
    `, {
      replacements: [tenantUser.id]
    });

    const userRole = roleRows.length > 0 ? roleRows[0] : null;

    // 构建用户对象
    const userObject: any = {
      id: tenantUser.id,
      username: tenantUser.username,
      role: userRole?.role_code || 'parent',
      email: tenantUser.email || '',
      realName: tenantUser.real_name || '',
      phone: tenantUser.phone || '',
      status: tenantUser.status,
      globalUserId: tenantUser.global_user_id,
      authSource: 'unified',
      tenantCode: tenantCode,
      databaseName: `tenant_${tenantCode}`
    };

    req.user = userObject;

    logger.info('[认证] Token验证成功', {
      userId: tenantUser.id,
      tenantCode: tenantCode,
      role: userRole?.role_code
    });

    next();

  } catch (error) {
    logger.error('[认证] Token验证失败', error);
    res.status(401).json({
      success: false,
      message: '认证失败',
      error: 'AUTHENTICATION_FAILED'
    });
  }
};

/**
 * 改进的登录中间件 - 使用共享连接池
 */
export const loginSharedPool = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone, password } = req.body;
    const tenantCode = req.tenant?.code;

    if (!phone || !password) {
      res.status(400).json({
        success: false,
        message: '手机号和密码不能为空',
        error: 'MISSING_CREDENTIALS'
      });
      return;
    }

    // 调用统一认证系统验证用户
    const authResult = await adminIntegrationService.authenticateUser(phone, password);
    if (!authResult.success) {
      res.status(401).json({
        success: false,
        message: authResult.message || '手机号或密码错误',
        error: 'INVALID_CREDENTIALS'
      });
      return;
    }

    const { user: globalUser, token } = authResult.data;

    // ✅ 关键改进：使用完整表名查询租户数据库
    const [userRows] = await req.tenantDb.query(`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.real_name, 
        u.phone, 
        u.status, 
        u.global_user_id
      FROM tenant_${tenantCode}.users u
      WHERE u.global_user_id = ? AND u.status = 'active'
      LIMIT 1
    `, {
      replacements: [globalUser.id]
    });

    let tenantUser: any;
    if (userRows.length > 0) {
      tenantUser = userRows[0];
      logger.info('[认证] 找到现有租户用户', { userId: tenantUser.id });
    } else {
      // 自动创建租户用户
      logger.info('[认证] 创建新的租户用户', { globalUserId: globalUser.id });
      
      await req.tenantDb.query(`
        INSERT INTO tenant_${tenantCode}.users (
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
        id: (await req.tenantDb.query(
          `SELECT id FROM tenant_${tenantCode}.users WHERE global_user_id = ? LIMIT 1`,
          { replacements: [globalUser.id] }
        ))[0][0].id,
        global_user_id: globalUser.id,
        username: globalUser.username || globalUser.phone,
        email: globalUser.email || '',
        real_name: globalUser.realName || '用户',
        phone: globalUser.phone || '',
        status: 'active',
        auth_source: 'unified'
      };
    }

    // 返回登录响应
    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: tenantUser.id,
          globalUserId: tenantUser.global_user_id,
          username: tenantUser.username,
          phone: tenantUser.phone,
          realName: tenantUser.real_name,
          tenantCode: tenantCode,
          tenantDatabaseName: `tenant_${tenantCode}`
        }
      }
    });

  } catch (error) {
    logger.error('[认证] 登录失败', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: 'LOGIN_FAILED'
    });
  }
};

