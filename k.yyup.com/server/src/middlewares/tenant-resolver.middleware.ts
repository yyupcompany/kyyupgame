/**
 * 租户识别中间件 - 共享连接池版本
 * 根据域名识别租户，使用全局共享数据库连接
 *
 * 核心改进：
 * - 所有租户共享一个连接池（默认30个连接）
 * - 通过完整表名访问租户数据库：tenant_k001.users
 */

import { Request, Response, NextFunction } from 'express';
import { tenantDatabaseService } from '../services/tenant-database.service';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';

/**
 * 租户数据库连接实例
 */
interface RequestWithTenant extends Request {
  tenant?: {
    code: string;
    domain: string;
    databaseName: string;
  }; // 租户信息
  tenantDb?: any; // 共享的全局数据库连接
}

/**
 * 租户解析中间件
 */
export const tenantResolverMiddleware = async (
  req: RequestWithTenant,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 获取请求域名
    const domain = req.get('Host') || req.hostname;

    logger.info('[租户识别] 处理请求', {
      method: req.method,
      url: req.url,
      domain
    });

    // 提取租户代码
    const tenantCode = extractTenantCode(domain);

    if (!tenantCode) {
      logger.warn('[租户识别] 无法解析租户代码', { domain });

      // 对于无法识别的域名，返回错误或使用默认配置
      if (process.env.NODE_ENV === 'production') {
        ApiResponse.error(res, '无法识别的租户域名', 'INVALID_TENANT_DOMAIN');
        return;
      } else {
        // 开发环境允许使用默认配置
        logger.info('[租户识别] 使用开发环境默认配置');
        req.tenant = {
          code: 'dev',
          domain: domain,
          databaseName: process.env.DB_NAME || 'tenant_dev'
        };

        // 获取共享连接
        try {
          req.tenantDb = tenantDatabaseService.getGlobalConnection();
        } catch (error) {
          // 如果连接未初始化，尝试初始化
          await tenantDatabaseService.initializeGlobalConnection();
          req.tenantDb = tenantDatabaseService.getGlobalConnection();
        }

        next();
        return;
      }
    }

    // 验证租户是否存在
    const tenantInfo = await validateTenant(tenantCode);
    if (!tenantInfo) {
      logger.warn('[租户识别] 租户不存在或未激活', { tenantCode, domain });
      ApiResponse.error(res, '租户不存在或未激活', 'TENANT_NOT_FOUND');
      return;
    }

    // 设置租户信息到请求对象
    req.tenant = {
      code: tenantCode,
      domain: domain,
      databaseName: `tenant_${tenantCode}`
    };

    // 获取共享的全局数据库连接
    try {
      // 尝试获取已初始化的连接
      try {
        req.tenantDb = tenantDatabaseService.getGlobalConnection();
      } catch (error) {
        // 如果连接未初始化，尝试初始化
        await tenantDatabaseService.initializeGlobalConnection();
        req.tenantDb = tenantDatabaseService.getGlobalConnection();
      }

      logger.info('[租户识别] ✅ 租户识别成功（共享连接池模式）', {
        tenantCode,
        databaseName: req.tenant.databaseName
      });
    } catch (error) {
      logger.error('[租户识别] ❌ 获取数据库连接失败', { tenantCode, error });
      ApiResponse.error(res, '数据库连接失败', 'DB_CONNECTION_FAILED');
      return;
    }

    next();
  } catch (error) {
    logger.error('[租户识别] 中间件错误', error);
    ApiResponse.error(res, '租户解析失败', 'TENANT_RESOLVER_ERROR');
  }
};

/**
 * 从域名中提取租户代码
 * 支持格式: k001.yyup.cc -> k001
 */
function extractTenantCode(domain: string): string | null {
  // 移除端口号
  const cleanDomain = domain.split(':')[0];

  // 匹配格式: k001.yyup.cc
  const match = cleanDomain.match(/^(k\d+)\.yyup\.cc$/);

  if (match) {
    return match[1]; // 返回 k001
  }

  // 支持其他格式，如: tenant1.kindergarten.com
  const altMatch = cleanDomain.match(/^([a-zA-Z0-9]+)\.(kindergarten|kyyup)\.com$/);

  if (altMatch) {
    return altMatch[1];
  }

  return null;
}

/**
 * 验证租户是否存在且已激活
 */
async function validateTenant(tenantCode: string): Promise<boolean> {
  try {
    // 开发环境：直接支持k001租户用于测试
    if (process.env.NODE_ENV !== 'production' && tenantCode === 'k001') {
      logger.info('开发环境：k001租户验证通过（模拟）');
      return true;
    }

    // 这里可以调用统一租户中心的API验证租户
    // 或者从缓存中获取租户信息
    const response = await fetch(`${process.env.UNIFIED_TENANT_API_URL || 'http://localhost:4001'}/api/tenants/${tenantCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Name': 'kindergarten-system'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.success && data.data.status === 'active';
    }

    return false;
  } catch (error) {
    logger.error('验证租户失败', { tenantCode, error });

    // 开发环境：如果API调用失败，允许k001租户通过验证
    if (process.env.NODE_ENV !== 'production' && tenantCode === 'k001') {
      logger.warn('API调用失败，开发环境允许k001租户通过');
      return true;
    }

    return false;
  }
}

/**
 * 可选的租户中间件 - 用于不需要强制租户识别的路由
 */
export const optionalTenantResolverMiddleware = async (
  req: RequestWithTenant,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const domain = req.get('Host') || req.hostname;
    const tenantCode = extractTenantCode(domain);

    if (tenantCode) {
      const tenantInfo = await validateTenant(tenantCode);
      if (tenantInfo) {
        req.tenant = {
          code: tenantCode,
          domain: domain,
          databaseName: `tenant_${tenantCode}`
        };

        // 获取共享连接
        try {
          try {
            req.tenantDb = tenantDatabaseService.getGlobalConnection();
          } catch (error) {
            await tenantDatabaseService.initializeGlobalConnection();
            req.tenantDb = tenantDatabaseService.getGlobalConnection();
          }
        } catch (error) {
          logger.warn('[租户识别] 可选租户数据库连接失败，继续执行', { tenantCode, error });
        }
      }
    }

    next();
  } catch (error) {
    logger.error('[租户识别] 可选租户解析中间件错误', error);
    // 不返回错误，继续执行
    next();
  }
};

export default tenantResolverMiddleware;