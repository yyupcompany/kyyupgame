/**
 * OSS安全中间件
 * 拦截和验证OSS资源访问请求，确保租户隔离
 */

import { Request, Response, NextFunction } from 'express';
import { ossTenantSecurityService } from '../services/oss-tenant-security.service';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';
import '../types/express.d'; // 确保类型扩展被加载

/**
 * OSS请求体接口
 */
interface OSSRequestBody {
  ossUrl?: string;
  ossPath?: string;
  filePath?: string;
  url?: string;
}

/**
 * OSS安全中间件
 * 验证请求中的OSS URL/路径是否属于当前租户
 */
export const ossSecurityMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
	  try {
	    // 1. 获取租户信息（req.user 由认证中间件注入，这里做一次宽松断言以避免类型冲突）
	    const userPhone = ((req.user as any)?.phone as string | undefined) || (req.headers['x-user-phone'] as string);
	    const tenantCode = req.tenant?.code || (req.headers['x-tenant-code'] as string);

    // 2. 如果没有租户信息，跳过验证（公开API）
    if (!userPhone || !tenantCode) {
      return next();
    }

    // 3. 提取请求中的OSS路径
    const body = req.body as OSSRequestBody;
    const query = req.query as OSSRequestBody;
    
    const ossUrls: string[] = [];
    
    // 从body中提取
    if (body.ossUrl) ossUrls.push(body.ossUrl);
    if (body.ossPath) ossUrls.push(body.ossPath);
    if (body.filePath) ossUrls.push(body.filePath);
    if (body.url && body.url.includes('oss')) ossUrls.push(body.url);
    
    // 从query中提取
    if (typeof query.ossUrl === 'string') ossUrls.push(query.ossUrl);
    if (typeof query.ossPath === 'string') ossUrls.push(query.ossPath);

    // 4. 如果没有OSS相关参数，跳过验证
    if (ossUrls.length === 0) {
      return next();
    }

    // 5. 验证每个OSS路径
    for (const ossUrl of ossUrls) {
      const validation = ossTenantSecurityService.validateOSSPathAccess(
        userPhone,
        tenantCode,
        ossUrl
      );

      if (!validation.isValid) {
        logger.warn('OSS安全中间件拦截越权访问', {
          userPhone: userPhone.substring(0, 3) + '****' + userPhone.substring(7),
          tenantCode,
          ossUrl: ossUrl.substring(0, 50),
          error: validation.error,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        ApiResponse.error(res, validation.error || 'OSS资源访问越权', 'OSS_ACCESS_DENIED');
        return;
      }
    }

    // 6. 验证通过，继续处理
    logger.debug('OSS安全验证通过', {
      userPhone: userPhone.substring(0, 3) + '****' + userPhone.substring(7),
      tenantCode,
      urlCount: ossUrls.length
    });

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('OSS安全中间件异常', {
      error: errorMessage,
      url: req.url,
      method: req.method
    });

    // 发生异常时拒绝访问
    ApiResponse.error(res, 'OSS安全验证异常', 'OSS_SECURITY_ERROR');
  }
};

/**
 * OSS上传安全中间件
 * 验证上传目标路径是否属于当前租户
 */
export const ossUploadSecurityMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
	  try {
	    const userPhone = ((req.user as any)?.phone as string | undefined) || (req.headers['x-user-phone'] as string);
	    const tenantCode = req.tenant?.code || (req.headers['x-tenant-code'] as string);

    if (!userPhone || !tenantCode) {
      return next();
    }

    // 检查上传目标路径
    const targetPath = req.body?.targetPath || req.body?.directory;
    
    if (targetPath && targetPath.includes('rent/')) {
      const validation = ossTenantSecurityService.validateOSSPathAccess(
        userPhone,
        tenantCode,
        targetPath
      );

      if (!validation.isValid) {
        logger.warn('OSS上传安全中间件拦截越权上传', {
          userPhone: userPhone.substring(0, 3) + '****' + userPhone.substring(7),
          tenantCode,
          targetPath,
          error: validation.error
        });

        ApiResponse.error(res, '无权上传到此目录', 'OSS_UPLOAD_DENIED');
        return;
      }
    }

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('OSS上传安全中间件异常', { error: errorMessage });
    ApiResponse.error(res, 'OSS上传安全验证异常', 'OSS_UPLOAD_SECURITY_ERROR');
  }
};

/**
 * 租户文件访问中间件
 * 验证用户只能访问自己租户的文件
 * 用于 /api/oss-proxy/tenant/:fileType/:filename 路由
 * 从 req.tenant 自动获取租户信息
 */
export const tenantFileAccessMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
	  try {
	    // 1. 从 req.tenant 获取租户信息
	    const tenant = (req as any).tenant;

    // 2. 验证租户信息
    if (!tenant || !tenant.phone) {
      logger.warn('租户文件访问: 未找到租户信息', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      ApiResponse.error(res, '未找到租户信息', 'TENANT_INFO_NOT_FOUND');
      return;
    }

    // 3. 验证通过
    logger.debug('租户文件访问验证通过', {
      tenantPhone: tenant.phone.substring(0, 3) + '****' + tenant.phone.substring(7),
      fileType: req.params.fileType
    });

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('租户文件访问中间件异常', { error: errorMessage });
    ApiResponse.error(res, '文件访问验证异常', 'TENANT_FILE_ACCESS_ERROR');
  }
};

export default {
  ossSecurityMiddleware,
  ossUploadSecurityMiddleware,
  tenantFileAccessMiddleware
};

