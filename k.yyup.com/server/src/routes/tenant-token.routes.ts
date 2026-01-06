/**
 * 租户令牌路由
 * 定义MD5租户安全令牌相关的API端点
*/

import { Router } from 'express';
import tenantTokenController from '../controllers/tenant-token.controller';
import { tenantResolverMiddleware } from '../middlewares/tenant-resolver.middleware';
import { tenantSecurityMiddleware } from '../middlewares/tenant-security.middleware';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
 * 租户令牌路由前缀：/api/tenant-token
*
 * 安全策略：
 * - 生成令牌需要租户上下文
 * - 验证令牌是公开接口（用于客户端验证）
 * - 管理操作需要租户安全验证
*/

/**
 * POST /api/tenant-token/generate
 * 生成租户安全令牌
*
 * 请求体：
 * {
 *   "userPhone": "13800138000",
 *   "tenantCode": "k001",        // 可选，优先使用租户解析结果
 *   "tenantDomain": "k001.yyup.cc", // 可选，优先使用请求域名
 *   "databaseName": "tenant_001"    // 可选，默认根据租户代码生成
 * }
*
 * 响应：
 * {
 *   "success": true,
 *   "data": {
 *     "token": "KT_abc123...",
 *     "tenantCode": "k001",
 *     "tenantDomain": "k001.yyup.cc",
 *     "expiresAt": "2024-01-01T12:00:00.000Z",
 *     "expiresIn": 1800
 *   }
 * }
*/
router.post('/generate',
  tenantResolverMiddleware,     // 必须有租户上下文
  tenantTokenController.generateTenantToken
);

/**
 * POST /api/tenant-token/validate
 * 验证租户安全令牌
*
 * 请求体：
 * {
 *   "token": "KT_abc123...",
 *   "tenantCode": "k001",        // 可选，用于双重验证
 *   "tenantDomain": "k001.yyup.cc" // 可选，用于双重验证
 * }
*
 * 响应：
 * {
 *   "success": true,
 *   "data": {
 *     "isValid": true,
 *     "tenantInfo": {
 *       "userPhone": "13800138000",
 *       "tenantCode": "k001",
 *       "tenantDomain": "k001.yyup.cc",
 *       "databaseName": "tenant_001"
 *     },
 *     "remainingTime": 1200,
 *     "isExpiringSoon": false
 *   }
 * }
*/
router.post('/validate', tenantTokenController.validateTenantToken);

/**
 * POST /api/tenant-token/refresh
 * 刷新租户安全令牌
*
 * 请求体：
 * {
 *   "token": "KT_abc123..."
 * }
*
 * 响应：
 * {
 *   "success": true,
 *   "data": {
 *     "token": "KT_def456...",
 *     "tenantCode": "k001",
 *     "tenantDomain": "k001.yyup.cc",
 *     "expiresAt": "2024-01-01T12:30:00.000Z",
 *     "expiresIn": 1800
 *   }
 * }
*/
router.post('/refresh', tenantTokenController.refreshTenantToken);

/**
 * GET /api/tenant-token/info?token=KT_abc123...
 * 获取令牌详细信息
*
 * 响应：
 * {
 *   "success": true,
 *   "data": {
 *     "tokenInfo": {
 *       "tenantCode": "k001",
 *       "tenantDomain": "k001.yyup.cc",
 *       "expiresAt": "2024-01-01T12:00:00.000Z",
 *       "timestamp": 1704067200
 *     },
 *     "remainingTime": 1200,
 *     "isExpiringSoon": false,
 *     "isValid": true
 *   }
 * }
*/
router.get('/info', tenantTokenController.getTokenInfo);

/**
 * GET /api/tenant-token/status?token=KT_abc123...
 * 检查令牌状态
*
 * 响应：
 * {
 *   "success": true,
 *   "data": {
 *     "isValid": true,
 *     "isExpired": false,
 *     "isExpiringSoon": false,
 *     "remainingTime": 1200,
 *     "tokenInfo": {
 *       "tenantCode": "k001",
 *       "expiresAt": "2024-01-01T12:00:00.000Z"
 *     }
 *   }
 * }
*/
router.get('/status', tenantTokenController.checkTokenStatus);

/**
 * DELETE /api/tenant-token/cleanup
 * 清理过期令牌（管理员操作）
*
 * 响应：
 * {
 *   "success": true,
 *   "data": {
 *     "message": "过期令牌清理完成"
 *   }
 * }
*/
router.delete('/cleanup',
  tenantResolverMiddleware,     // 需要租户上下文
  tenantSecurityMiddleware,    // 需要安全验证
  async (req: any, res: any) => {
    try {
      const { tenantTokenService } = await import('../services/tenant-token.service');
      await tenantTokenService.cleanExpiredTokens();

      const { ApiResponse } = await import('../utils/apiResponse');
      ApiResponse.success(res, { message: '过期令牌清理完成' }, '清理完成');
    } catch (error: any) {
      const { logger } = await import('../utils/logger');
      const { ApiResponse } = await import('../utils/apiResponse');

      logger.error('清理过期令牌失败', { error: error?.message || String(error) });
      ApiResponse.error(res, '清理过期令牌失败', 'CLEANUP_FAILED');
    }
  }
);

export default router;