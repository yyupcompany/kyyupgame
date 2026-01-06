/**
 * 租户注册控制器
 * 处理统一租户系统的注册回调
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';
import { 
  tenantRegistrationService, 
  TenantRegistrationRequest 
} from '../services/tenant-registration.service';

/**
 * 租户注册回调
 * POST /api/tenant/register-callback
 * 
 * 接收来自统一租户系统的注册回调，创建主园区和总园长账号
 */
export const registerTenantCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tenantPhoneNumber, tenantName, tenantId }: TenantRegistrationRequest = req.body;

    // 验证必填字段
    if (!tenantPhoneNumber) {
      ApiResponse.error(res, '租户手机号不能为空', 'MISSING_TENANT_PHONE', 400);
      return;
    }

    if (!tenantName) {
      ApiResponse.error(res, '租户名称不能为空', 'MISSING_TENANT_NAME', 400);
      return;
    }

    logger.info('收到租户注册回调请求', {
      tenantPhoneNumber: tenantPhoneNumber.slice(0, 3) + '****' + tenantPhoneNumber.slice(-4),
      tenantName,
      tenantId
    });

    // 调用服务层处理租户注册
    const result = await tenantRegistrationService.registerTenant({
      tenantPhoneNumber,
      tenantName,
      tenantId
    });

    // 返回成功响应
    ApiResponse.success(res, result, '租户注册成功', 201);

    logger.info('租户注册回调处理成功', {
      kindergartenId: result.kindergartenId,
      principalUserId: result.principalUserId
    });

  } catch (error: any) {
    logger.error('租户注册回调处理失败', {
      error: error?.message || String(error),
      stack: error?.stack,
      body: req.body
    });

    // 根据错误类型返回不同的错误码
    if (error.message.includes('手机号格式不正确')) {
      ApiResponse.error(res, error.message, 'INVALID_PHONE_FORMAT', 400);
    } else if (error.message.includes('已注册')) {
      ApiResponse.error(res, error.message, 'TENANT_ALREADY_REGISTERED', 409);
    } else if (error.message.includes('角色不存在')) {
      ApiResponse.error(res, error.message, 'ROLE_NOT_FOUND', 500);
    } else {
      ApiResponse.error(res, '租户注册失败', 'TENANT_REGISTRATION_FAILED', 500);
    }
  }
};

export default {
  registerTenantCallback
};
