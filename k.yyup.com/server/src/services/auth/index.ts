/**
 * 用户认证服务层索引文件
 * 用于导出所有认证相关服务
 */

// 导入实现的服务实例
import AuthService from './auth.service';

// 导出已实现的服务实例
export { AuthService };

/**
 * 导出所有认证服务
 * @description 随着服务实现，将依次取消注释
 */
export default {
  AuthService,
  // OAuthService,
  // MFAService,
  // JWTService,
  // TokenBlacklistService,
};

/**
 * 开发计划:
 * 1. 认证服务 (auth.service.ts) ✓
 * 2. OAuth认证服务 (oauth.service.ts)
 * 3. 多因素认证服务 (mfa.service.ts)
 * 4. JWT令牌服务 (jwt.service.ts)
 * 5. 令牌黑名单服务 (token-blacklist.service.ts)
 */ 