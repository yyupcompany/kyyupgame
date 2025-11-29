/**
 * 改进的租户识别中间件 - 使用共享连接池
 * 根据域名识别租户，使用共享的全局数据库连接
 */

import { Request, Response, NextFunction } from 'express';
import { tenantDatabaseSharedPoolService } from '../services/tenant-database-shared-pool.service';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';

/**
 * 扩展Request接口
 */
interface RequestWithTenant extends Request {
  tenant?: {
    code: string;
    domain: string;
    databaseName: string;
  };
  tenantDb?: any; // 共享的全局数据库连接
}

/**
 * 改进的租户解析中间件 - 使用共享连接池
 */
export const tenantResolverSharedPoolMiddleware = async (
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

      if (process.env.NODE_ENV === 'production') {
        ApiResponse.error(res, '无法识别的租户域名', 'INVALID_TENANT_DOMAIN');
        return;
      } else {
        // 开发环境允许使用默认配置
        logger.info('[租户识别] 使用开发环境默认配置');
        req.tenant = {
          code: 'dev',
          domain: domain,
          databaseName: 'tenant_dev'
        };
        req.tenantDb = tenantDatabaseSharedPoolService.getGlobalConnection();
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
      req.tenantDb = tenantDatabaseSharedPoolService.getGlobalConnection();
      logger.info('[租户识别] 租户识别成功', {
        tenantCode,
        databaseName: req.tenant.databaseName
      });
    } catch (error) {
      logger.error('[租户识别] 获取数据库连接失败', { tenantCode, error });
      ApiResponse.error(res, '数据库连接失败', 'DB_CONNECTION_FAILED');
      return;
    }

    next();
  } catch (error) {
    logger.error('[租户识别] 中间件错误', error);
    ApiResponse.error(res, '租户识别失败', 'TENANT_RESOLVER_ERROR');
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
    return match[1];
  }

  // 支持其他格式
  const altMatch = cleanDomain.match(/^([a-zA-Z0-9]+)\.(kindergarten|kyyup)\.com$/);
  if (altMatch) {
    return altMatch[1];
  }

  return null;
}

/**
 * 验证租户是否存在
 * 从统一认证系统验证
 */
async function validateTenant(tenantCode: string): Promise<boolean> {
  try {
    // TODO: 调用统一认证系统验证租户
    // const result = await adminIntegrationService.validateTenant(tenantCode);
    // return result.success;

    // 临时实现：假设所有k开头的租户都有效
    return /^k\d+$/.test(tenantCode);
  } catch (error) {
    logger.error('[租户识别] 租户验证失败', { tenantCode, error });
    return false;
  }
}

export default tenantResolverSharedPoolMiddleware;

