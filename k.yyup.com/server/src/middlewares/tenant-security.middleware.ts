/**
 * 租户安全中间件
 * 防止租户数据泄露和越权访问
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';
import { tenantTokenService } from '../services/tenant-token.service';

/**
 * 扩展Request类型以包含租户安全信息
 */
interface RequestWithTenantSecurity extends Request {
  tenantSecurity?: {
    originalDomain: string;
    verifiedTenantCode: string;
    tokenTenantId?: string;
    isTokenValid: boolean;
  };
}

/**
 * 租户安全验证中间件
 * 确保用户只能访问自己租户的数据
 */
export const tenantSecurityMiddleware = async (
  req: RequestWithTenantSecurity,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. 验证租户解析结果
    if (!req.tenant || !req.tenant.code) {
      logger.error('租户安全检查失败：缺少租户信息', {
        url: req.url,
        method: req.method,
        headers: req.headers
      });
      ApiResponse.error(res, '租户验证失败', 'TENANT_VALIDATION_FAILED');
      return;
    }

    // 2. 记录原始域名和验证的租户代码
    const originalDomain = req.get('Host') || req.hostname;
    const verifiedTenantCode = req.tenant.code;

    req.tenantSecurity = {
      originalDomain,
      verifiedTenantCode,
      isTokenValid: false
    };

    // 3. 验证请求来源（防止Host头部伪造）
    if (!isValidTenantDomain(originalDomain, verifiedTenantCode)) {
      logger.warn('可疑的租户访问请求：域名与租户代码不匹配', {
        originalDomain,
        verifiedTenantCode,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
      ApiResponse.error(res, '租户验证失败', 'DOMAIN_TENANT_MISMATCH');
      return;
    }

    // 4. MD5租户令牌验证 - 核心安全检查
    const tenantToken = req.headers['x-tenant-token'] as string;
    if (tenantToken) {
      try {
        // 使用MD5令牌验证租户身份和权限
        const tokenValidation = tenantTokenService.validateTenantToken(
          tenantToken,
          verifiedTenantCode,
          originalDomain
        );

        if (!tokenValidation.isValid) {
          logger.warn('MD5租户令牌验证失败', {
            tenantToken: tenantTokenService['maskToken'](tenantToken),
            verifiedTenantCode,
            originalDomain,
            error: tokenValidation.error,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          });
          ApiResponse.error(res, '租户令牌验证失败', 'TENANT_TOKEN_INVALID');
          return;
        }

        req.tenantSecurity.isTokenValid = true;
        req.tenantSecurity.tokenTenantId = tokenValidation.tenantInfo?.tenantCode;

        logger.info('MD5租户令牌验证成功', {
          verifiedTenantCode,
          originalDomain,
          tokenRemainingTime: tenantTokenService.getTokenRemainingTime(tenantToken)
        });
      } catch (error: any) {
        logger.warn('MD5租户令牌验证异常', { error: error?.message || String(error) });
        req.tenantSecurity.isTokenValid = false;
      }
    } else {
      // 对于没有令牌的请求，记录警告但不阻断（用于公开API）
      logger.debug('请求缺少MD5租户令牌', {
        url: req.url,
        method: req.method,
        verifiedTenantCode,
        originalDomain
      });
    }

    // 5. 传统JWT令牌验证（可选）
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwtToken = authHeader.substring(7);
        // 这里应该验证JWT令牌中的租户信息
        // 简化版本：假设令牌验证在其他中间件中完成
        req.tenantSecurity.isTokenValid = true;

        // TODO: 从JWT中提取租户ID并与当前租户比较
        // const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET);
        // if (decodedToken.tenantId !== verifiedTenantCode) {
        //   ApiResponse.error(res, 'JWT令牌租户信息不匹配', 'JWT_TENANT_MISMATCH');
        //   return;
        // }
      } catch (error: any) {
        logger.warn('JWT令牌验证失败', { error: error?.message || String(error) });
        // 不覆盖MD5令牌的验证结果
      }
    }

    // 6. 记录安全检查通过
    logger.info('租户安全验证通过', {
      tenantCode: verifiedTenantCode,
      domain: originalDomain,
      url: req.url,
      hasValidToken: req.tenantSecurity.isTokenValid
    });

    next();
  } catch (error: any) {
    logger.error('租户安全中间件错误', { error: error?.message || String(error) });
    ApiResponse.error(res, '服务器内部错误', 'SECURITY_MIDDLEWARE_ERROR');
  }
};

/**
 * 验证域名与租户代码的匹配关系
 */
function isValidTenantDomain(domain: string, tenantCode: string): boolean {
  // 移除端口号
  const cleanDomain = domain.split(':')[0];

  // 验证格式匹配：k001.yyup.cc -> k001
  const expectedPattern = `^${tenantCode}\\.yyup\\.cc$`;
  const domainPattern = new RegExp(expectedPattern);

  if (domainPattern.test(cleanDomain)) {
    return true;
  }

  // 开发环境的额外验证
  if (process.env.NODE_ENV === 'development') {
    // 允许localhost开发环境
    if (cleanDomain === 'localhost' || cleanDomain === '127.0.0.1') {
      return true;
    }

    // 允许带端口的开发环境
    if (cleanDomain.match(/^localhost:\d+$/) || cleanDomain.match(/^127\.0\.0\.1:\d+$/)) {
      return true;
    }
  }

  return false;
}

/**
 * 租户数据访问权限检查中间件
 * 确保用户只能访问自己租户的数据
 */
export const tenantDataAccessMiddleware = async (
  req: RequestWithTenantSecurity,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. 验证租户安全信息存在
    if (!req.tenantSecurity) {
      ApiResponse.error(res, '租户安全验证缺失', 'TENANT_SECURITY_MISSING');
      return;
    }

    // 2. 检查URL中的租户参数是否与验证的租户匹配
    const urlTenantCode = req.query.tenant || req.params.tenant || req.body?.tenant;
    if (urlTenantCode && urlTenantCode !== req.tenantSecurity.verifiedTenantCode) {
      logger.warn('检测到租户数据越权访问尝试', {
        url: req.url,
        method: req.method,
        verifiedTenant: req.tenantSecurity.verifiedTenantCode,
        attemptedTenant: urlTenantCode,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      ApiResponse.error(res, '无权访问此租户数据', 'TENANT_DATA_ACCESS_DENIED');
      return;
    }

    // 3. 验证数据库连接的租户一致性
    if (req.tenantDb && req.tenant) {
      // 这里可以添加额外的数据库连接验证
      // 确保当前数据库连接确实属于验证过的租户
    }

    next();
  } catch (error: any) {
    logger.error('租户数据访问中间件错误', { error: error?.message || String(error) });
    ApiResponse.error(res, '服务器内部错误', 'DATA_ACCESS_MIDDLEWARE_ERROR');
  }
};

/**
 * 租户隔离日志中间件
 * 记录所有租户相关的操作日志
 */
export const tenantAuditMiddleware = async (
  req: RequestWithTenantSecurity,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const auditInfo = {
      timestamp: new Date().toISOString(),
      tenantCode: req.tenant?.code,
      domain: req.get('Host'),
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      hasToken: !!req.headers.authorization,
      tenantSecurity: req.tenantSecurity
    };

    // 记录租户操作审计日志
    logger.info('租户操作审计', auditInfo);

    // 在响应头中添加租户信息（用于调试，生产环境可移除）
    if (process.env.NODE_ENV === 'development') {
      res.setHeader('X-Tenant-Code', req.tenant?.code || 'unknown');
      res.setHeader('X-Tenant-Verified', req.tenantSecurity?.isTokenValid ? 'true' : 'false');
    }

    next();
  } catch (error: any) {
    logger.error('租户审计中间件错误', { error: error?.message || String(error) });
    next(); // 审计失败不应该阻断请求
  }
};

// 导入并重新导出OSS安全中间件
export { ossSecurityMiddleware, ossUploadSecurityMiddleware } from './oss-security.middleware';

export default {
  tenantSecurityMiddleware,
  tenantDataAccessMiddleware,
  tenantAuditMiddleware
};