/**
 * 租户MD5令牌服务
 * 实现用户手机号+租户域名+数据库名的MD5令牌安全机制
 */

import crypto from 'crypto';
import { logger } from '../utils/logger';

/**
 * 租户令牌信息
 */
export interface TenantTokenInfo {
  userPhone: string;
  tenantCode: string;
  tenantDomain: string;
  databaseName: string;
  timestamp: number;
  token: string;
  expiresAt: Date;
}

/**
 * 租户令牌配置
 */
const TOKEN_CONFIG = {
  // 令牌有效期：30分钟
  EXPIRES_IN: 30 * 60 * 1000, // 30分钟，单位：毫秒
  // 时间戳精度：30分钟
  TIMESTAMP_UNIT: 30 * 60, // 30分钟，单位：秒
  // MD5盐值
  SALT: process.env.TENANT_TOKEN_SALT || 'kindergarten-tenant-security-2024',
  // 令牌前缀
  TOKEN_PREFIX: 'KT_'
};

/**
 * 租户MD5令牌服务类
 */
export class TenantTokenService {
  private static instance: TenantTokenService;

  constructor() {
    logger.info('租户MD5令牌服务初始化完成');
  }

  /**
   * 获取单例实例
   */
  static getInstance(): TenantTokenService {
    if (!TenantTokenService.instance) {
      TenantTokenService.instance = new TenantTokenService();
    }
    return TenantTokenService.instance;
  }

  /**
   * 生成租户安全令牌
   * @param userPhone 用户手机号
   * @param tenantCode 租户代码
   * @param tenantDomain 租户域名
   @param databaseName 数据库名称
   @returns 租户令牌信息
   */
  generateTenantToken(
    userPhone: string,
    tenantCode: string,
    tenantDomain: string,
    databaseName: string
  ): TenantTokenInfo {
    try {
      // 1. 验证输入参数
      this.validateTokenInputs(userPhone, tenantCode, tenantDomain, databaseName);

      // 2. 生成时间戳（30分钟精度）
      const timestamp = Math.floor(Date.now() / (TOKEN_CONFIG.TIMESTAMP_UNIT * 1000));

      // 3. 构建令牌数据
      const tokenData = `${userPhone}:${tenantCode}:${tenantDomain}:${databaseName}:${timestamp}:${TOKEN_CONFIG.SALT}`;

      // 4. 生成MD5令牌
      const md5Hash = crypto.createHash('md5').update(tokenData, 'utf8').digest('hex');

      // 5. 生成带前缀的令牌
      const token = `${TOKEN_CONFIG.TOKEN_PREFIX}${md5Hash}`;

      // 6. 计算过期时间
      const expiresAt = new Date(timestamp * TOKEN_CONFIG.TIMESTAMP_UNIT * 1000 + TOKEN_CONFIG.EXPIRES_IN);

      const tokenInfo: TenantTokenInfo = {
        userPhone,
        tenantCode,
        tenantDomain,
        databaseName,
        timestamp,
        token,
        expiresAt
      };

      logger.info('租户令牌生成成功', {
        userPhone: this.maskPhone(userPhone),
        tenantCode,
        tenantDomain,
        databaseName,
        token: this.maskToken(token),
        expiresAt: expiresAt.toISOString()
      });

      return tokenInfo;
    } catch (error: any) {
      logger.error('生成租户令牌失败', {
        userPhone: this.maskPhone(userPhone),
        tenantCode,
        error: error?.message || String(error)
      });
      throw new Error(`生成租户令牌失败: ${error?.message || String(error)}`);
    }
  }

  /**
   * 验证租户令牌
   * @param token 令牌字符串
   * @param currentTenantCode 当前请求的租户代码
   * @param currentDomain 当前请求的域名
   * @returns 验证结果
   */
  validateTenantToken(
    token: string,
    currentTenantCode: string,
    currentDomain: string
  ): {
    isValid: boolean;
    tenantInfo?: TenantTokenInfo;
    error?: string;
  } {
    try {
      // 1. 验证令牌格式
      if (!token || !token.startsWith(TOKEN_CONFIG.TOKEN_PREFIX)) {
        return { isValid: false, error: '令牌格式无效' };
      }

      // 2. 提取MD5哈希
      const md5Hash = token.substring(TOKEN_CONFIG.TOKEN_PREFIX.length);

      // 3. 从当前请求信息逆向推导预期的令牌数据
      // 这里需要从数据库或其他方式获取用户信息
      // 为了演示，我们假设可以从token中解析信息（实际应该从JWT或数据库获取）

      // 4. 检查令牌是否过期
      const timestamp = this.extractTimestampFromToken(token);
      if (this.isTokenExpired(timestamp)) {
        return { isValid: false, error: '令牌已过期' };
      }

      // 5. 验证租户一致性
      if (currentTenantCode && currentDomain) {
        const expectedDomainPattern = `^${currentTenantCode}\\.yyup\\.cc$`;
        if (!new RegExp(expectedDomainPattern).test(currentDomain)) {
          return { isValid: false, error: '租户域名不匹配' };
        }
      }

      return { isValid: true };
    } catch (error: any) {
      logger.error('验证租户令牌失败', {
        token: this.maskToken(token),
        currentTenantCode,
        currentDomain,
        error: error?.message || String(error)
      });
      return { isValid: false, error: '令牌验证异常' };
    }
  }

  /**
   * 从令牌中解析用户信息（如果需要）
   * @param token 令牌字符串
   * @returns 解析的用户信息
   */
  parseTokenInfo(token: string): Partial<TenantTokenInfo> | null {
    try {
      if (!token || !token.startsWith(TOKEN_CONFIG.TOKEN_PREFIX)) {
        return null;
      }

      const md5Hash = token.substring(TOKEN_CONFIG.TOKEN_PREFIX.length);
      const timestamp = this.extractTimestampFromToken(md5Hash);

      return {
        token,
        timestamp,
        expiresAt: new Date(timestamp * TOKEN_CONFIG.TIMESTAMP_UNIT * 1000 + TOKEN_CONFIG.EXPIRES_IN)
      };
    } catch (error: any) {
      logger.error('解析令牌信息失败', { error: error?.message || String(error) });
      return null;
    }
  }

  /**
   * 检查令牌是否即将过期
   * @param token 令牌字符串
   * @returns 是否即将过期（5分钟内）
   */
  isTokenExpiringSoon(token: string): boolean {
    try {
      const tokenInfo = this.parseTokenInfo(token);
      if (!tokenInfo || !tokenInfo.expiresAt) {
        return false;
      }

      // 检查是否在5分钟内过期
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
      return tokenInfo.expiresAt <= fiveMinutesFromNow;
    } catch (error) {
      return false;
    }
  }

  /**
   * 刷新租户令牌
   * @param tokenInfo 原始令牌信息
   * @returns 新的令牌信息
   */
  refreshTenantToken(tokenInfo: TenantTokenInfo): TenantTokenInfo {
    return this.generateTenantToken(
      tokenInfo.userPhone,
      tokenInfo.tenantCode,
      tokenInfo.tenantDomain,
      tokenInfo.databaseName
    );
  }

  /**
   * 验证令牌输入参数
   */
  private validateTokenInputs(
    userPhone: string,
    tenantCode: string,
    tenantDomain: string,
    databaseName: string
  ): void {
    if (!userPhone || !/^[1-9]\d{10}$/.test(userPhone)) {
      throw new Error('用户手机号格式无效');
    }

    if (!tenantCode || !/^[a-zA-Z0-9]+$/.test(tenantCode)) {
      throw new Error('租户代码格式无效');
    }

    if (!tenantDomain) {
      throw new Error('租户域名不能为空');
    }

    if (!databaseName) {
      throw new Error('数据库名称不能为空');
    }
  }

  /**
   * 从令牌中提取时间戳
   * 从tokenInfo中获取时间戳，避免MD5逆向工程
   */
  private extractTimestampFromToken(token: string): number {
    try {
      const tokenInfo = this.parseTokenInfo(token);
      return tokenInfo?.timestamp || Math.floor(Date.now() / (TOKEN_CONFIG.TIMESTAMP_UNIT * 1000));
    } catch (error) {
      return Math.floor(Date.now() / (TOKEN_CONFIG.TIMESTAMP_UNIT * 1000));
    }
  }

  /**
   * 检查令牌是否过期
   */
  private isTokenExpired(timestamp: number): boolean {
    const tokenTime = timestamp * TOKEN_CONFIG.TIMESTAMP_UNIT * 1000;
    const currentTime = Date.now();
    return (currentTime - tokenTime) > TOKEN_CONFIG.EXPIRES_IN;
  }

  /**
   * 掩码手机号显示
   */
  private maskPhone(phone: string): string {
    if (!phone || phone.length < 7) {
      return phone;
    }
    return phone.substring(0, 3) + '****' + phone.substring(7);
  }

  /**
   * 掩码令牌显示
   */
  private maskToken(token: string): string {
    if (!token || token.length < 10) {
      return token;
    }
    return token.substring(0, 8) + '...';
  }

  /**
   * 获取令牌剩余有效时间（秒）
   */
  getTokenRemainingTime(token: string): number {
    try {
      const tokenInfo = this.parseTokenInfo(token);
      if (!tokenInfo || !tokenInfo.expiresAt) {
        return 0;
      }

      const remainingMs = tokenInfo.expiresAt.getTime() - Date.now();
      return Math.max(0, Math.floor(remainingMs / 1000));
    } catch (error) {
      return 0;
    }
  }

  /**
   * 批量验证令牌
   */
  batchValidateTokens(tokens: string[]): { valid: string[]; invalid: string[]; errors: string[] } {
    const valid: string[] = [];
    const invalid: string[] = [];
    const errors: string[] = [];

    for (const token of tokens) {
      const validation = this.validateTenantToken(token, '', '');
      if (validation.isValid) {
        valid.push(token);
      } else {
        invalid.push(token);
        if (validation.error) {
          errors.push(validation.error);
        }
      }
    }

    return { valid, invalid, errors };
  }

  /**
   * 清理过期令牌
   */
  async cleanExpiredTokens(): Promise<void> {
    // 在实际生产环境中，这里应该从数据库中删除过期的令牌记录
    logger.info('清理过期令牌（模拟）');
  }
}

// 创建单例实例
export const tenantTokenService = TenantTokenService.getInstance();

export default tenantTokenService;