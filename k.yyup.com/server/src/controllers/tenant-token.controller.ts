/**
 * 租户令牌控制器
 * 提供MD5租户安全令牌的生成、验证和管理功能
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';
import { tenantTokenService, TenantTokenInfo } from '../services/tenant-token.service';

/**
 * 租户令牌请求体
 */
interface TenantTokenRequest {
  userPhone: string;
  tenantCode?: string;
  tenantDomain?: string;
  databaseName?: string;
}

/**
 * 租户令牌验证请求体
 */
interface TenantTokenValidationRequest {
  token: string;
  tenantCode?: string;
  tenantDomain?: string;
}

/**
 * 生成租户安全令牌
 * POST /api/tenant-token/generate
 */
export const generateTenantToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userPhone, tenantCode, tenantDomain, databaseName }: TenantTokenRequest = req.body;

    // 验证必填字段
    if (!userPhone) {
      ApiResponse.error(res, '用户手机号不能为空', 'MISSING_USER_PHONE');
      return;
    }

    // 从请求中获取租户信息（优先使用请求中的，其次使用已解析的租户信息）
    const finalTenantCode = tenantCode || req.tenant?.code;
    const finalTenantDomain = tenantDomain || req.get('Host') || req.hostname;
    const finalDatabaseName = databaseName || req.tenant?.databaseName || `tenant_${finalTenantCode}`;

    if (!finalTenantCode || !finalTenantDomain) {
      ApiResponse.error(res, '租户信息不完整', 'INCOMPLETE_TENANT_INFO');
      return;
    }

    logger.info('开始生成租户令牌', {
      userPhone: tenantTokenService['maskPhone'](userPhone),
      tenantCode: finalTenantCode,
      tenantDomain: finalTenantDomain,
      databaseName: finalDatabaseName
    });

    // 生成租户令牌
    const tokenInfo: TenantTokenInfo = tenantTokenService.generateTenantToken(
      userPhone,
      finalTenantCode,
      finalTenantDomain,
      finalDatabaseName
    );

    ApiResponse.success(res, {
      token: tokenInfo.token,
      tenantCode: tokenInfo.tenantCode,
      tenantDomain: tokenInfo.tenantDomain,
      expiresAt: tokenInfo.expiresAt.toISOString(),
      expiresIn: Math.floor((tokenInfo.expiresAt.getTime() - Date.now()) / 1000) // 秒
    }, '租户令牌生成成功');

    logger.info('租户令牌生成成功', {
      userPhone: tenantTokenService['maskPhone'](userPhone),
      tenantCode: finalTenantCode,
      token: tenantTokenService['maskToken'](tokenInfo.token),
      expiresAt: tokenInfo.expiresAt.toISOString()
    });
  } catch (error: any) {
    logger.error('生成租户令牌失败', {
      error: error?.message || String(error),
      body: req.body
    });
    ApiResponse.error(res, '生成租户令牌失败', 'TOKEN_GENERATION_FAILED');
  }
};

/**
 * 验证租户安全令牌
 * POST /api/tenant-token/validate
 */
export const validateTenantToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, tenantCode, tenantDomain }: TenantTokenValidationRequest = req.body;

    if (!token) {
      ApiResponse.error(res, '令牌不能为空', 'MISSING_TOKEN');
      return;
    }

    // 使用请求中的租户信息或已解析的租户信息进行验证
    const finalTenantCode = tenantCode || req.tenant?.code;
    const finalTenantDomain = tenantDomain || req.get('Host') || req.hostname;

    logger.info('开始验证租户令牌', {
      token: tenantTokenService['maskToken'](token),
      tenantCode: finalTenantCode,
      tenantDomain: finalTenantDomain
    });

    // 验证租户令牌
    const validation = tenantTokenService.validateTenantToken(
      token,
      finalTenantCode,
      finalTenantDomain
    );

    if (validation.isValid) {
      const remainingTime = tenantTokenService.getTokenRemainingTime(token);

      ApiResponse.success(res, {
        isValid: true,
        tenantInfo: validation.tenantInfo,
        remainingTime,
        isExpiringSoon: tenantTokenService.isTokenExpiringSoon(token)
      }, '租户令牌验证成功');

      logger.info('租户令牌验证成功', {
        token: tenantTokenService['maskToken'](token),
        tenantCode: finalTenantCode,
        remainingTime
      });
    } else {
      ApiResponse.error(res, validation.error || '令牌验证失败', 'TOKEN_VALIDATION_FAILED', 400);

      logger.warn('租户令牌验证失败', {
        token: tenantTokenService['maskToken'](token),
        tenantCode: finalTenantCode,
        error: validation.error
      });
    }
  } catch (error: any) {
    logger.error('验证租户令牌失败', {
      error: error?.message || String(error),
      body: req.body
    });
    ApiResponse.error(res, '验证租户令牌失败', 'TOKEN_VALIDATION_ERROR');
  }
};

/**
 * 刷新租户安全令牌
 * POST /api/tenant-token/refresh
 */
export const refreshTenantToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token }: { token: string } = req.body;

    if (!token) {
      ApiResponse.error(res, '原令牌不能为空', 'MISSING_ORIGINAL_TOKEN');
      return;
    }

    logger.info('开始刷新租户令牌', {
      token: tenantTokenService['maskToken'](token)
    });

    // 解析原令牌信息
    const originalTokenInfo = tenantTokenService.parseTokenInfo(token);
    if (!originalTokenInfo || !originalTokenInfo.tenantCode || !originalTokenInfo.tenantDomain) {
      ApiResponse.error(res, '无法解析原令牌信息', 'INVALID_TOKEN_FORMAT');
      return;
    }

    // 构建完整的租户信息用于刷新
    const fullTokenInfo: TenantTokenInfo = {
      userPhone: originalTokenInfo.userPhone || 'unknown',
      tenantCode: originalTokenInfo.tenantCode,
      tenantDomain: originalTokenInfo.tenantDomain,
      databaseName: originalTokenInfo.databaseName || `tenant_${originalTokenInfo.tenantCode}`,
      timestamp: originalTokenInfo.timestamp,
      token: originalTokenInfo.token || token,
      expiresAt: originalTokenInfo.expiresAt || new Date()
    };

    // 生成新令牌
    const newTokenInfo = tenantTokenService.refreshTenantToken(fullTokenInfo);

    ApiResponse.success(res, {
      token: newTokenInfo.token,
      tenantCode: newTokenInfo.tenantCode,
      tenantDomain: newTokenInfo.tenantDomain,
      expiresAt: newTokenInfo.expiresAt.toISOString(),
      expiresIn: Math.floor((newTokenInfo.expiresAt.getTime() - Date.now()) / 1000)
    }, '租户令牌刷新成功');

    logger.info('租户令牌刷新成功', {
      tenantCode: newTokenInfo.tenantCode,
      oldToken: tenantTokenService['maskToken'](token),
      newToken: tenantTokenService['maskToken'](newTokenInfo.token)
    });
  } catch (error: any) {
    logger.error('刷新租户令牌失败', {
      error: error?.message || String(error),
      body: req.body
    });
    ApiResponse.error(res, '刷新租户令牌失败', 'TOKEN_REFRESH_FAILED');
  }
};

/**
 * 获取令牌信息
 * GET /api/tenant-token/info
 */
export const getTokenInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      ApiResponse.error(res, '令牌参数不能为空', 'MISSING_TOKEN_PARAM');
      return;
    }

    logger.info('获取令牌信息', {
      token: tenantTokenService['maskToken'](token)
    });

    const tokenInfo = tenantTokenService.parseTokenInfo(token);

    if (!tokenInfo) {
      ApiResponse.error(res, '令牌格式无效', 'INVALID_TOKEN_FORMAT');
      return;
    }

    const remainingTime = tenantTokenService.getTokenRemainingTime(token);
    const isExpiringSoon = tenantTokenService.isTokenExpiringSoon(token);

    ApiResponse.success(res, {
      tokenInfo: {
        tenantCode: tokenInfo.tenantCode,
        tenantDomain: tokenInfo.tenantDomain,
        expiresAt: tokenInfo.expiresAt?.toISOString(),
        timestamp: tokenInfo.timestamp
      },
      remainingTime,
      isExpiringSoon,
      isValid: remainingTime > 0
    }, '令牌信息获取成功');

    logger.info('令牌信息获取成功', {
      token: tenantTokenService['maskToken'](token),
      remainingTime,
      isExpiringSoon
    });
  } catch (error: any) {
    logger.error('获取令牌信息失败', {
      error: error?.message || String(error),
      query: req.query
    });
    ApiResponse.error(res, '获取令牌信息失败', 'TOKEN_INFO_FAILED');
  }
};

/**
 * 检查令牌状态
 * GET /api/tenant-token/status
 */
export const checkTokenStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      ApiResponse.error(res, '令牌参数不能为空', 'MISSING_TOKEN_PARAM');
      return;
    }

    const remainingTime = tenantTokenService.getTokenRemainingTime(token);
    const isExpiringSoon = tenantTokenService.isTokenExpiringSoon(token);
    const tokenInfo = tenantTokenService.parseTokenInfo(token);

    ApiResponse.success(res, {
      isValid: remainingTime > 0,
      isExpired: remainingTime <= 0,
      isExpiringSoon,
      remainingTime,
      tokenInfo: tokenInfo ? {
        tenantCode: tokenInfo.tenantCode,
        expiresAt: tokenInfo.expiresAt?.toISOString()
      } : null
    }, '令牌状态检查完成');
  } catch (error: any) {
    logger.error('检查令牌状态失败', {
      error: error?.message || String(error),
      query: req.query
    });
    ApiResponse.error(res, '检查令牌状态失败', 'TOKEN_STATUS_CHECK_FAILED');
  }
};

export default {
  generateTenantToken,
  validateTenantToken,
  refreshTenantToken,
  getTokenInfo,
  checkTokenStatus
};