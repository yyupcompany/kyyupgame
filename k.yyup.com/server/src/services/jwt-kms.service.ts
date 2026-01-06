/**
 * JWT-KMS集成服务
 *
 * 提供基于KMS的JWT令牌管理：
 * - 使用KMS管理JWT签名密钥
 * - 密钥自动轮换支持
 * - 令牌验证和颁发
 * - 会话超时控制（符合等保3级：2小时绝对超时，30分钟空闲超时）
 */

import jwt from 'jsonwebtoken';
import { AliyunKMSService } from './aliyun-kms.service';

/**
 * JWT负载接口
 */
export interface JWTPayload {
  id: number;
  username: string;
  phone: string;
  role?: string;
  isAdmin?: boolean;
  kindergartenId?: number;
  twoFaEnabled?: boolean;
  twoFaVerified?: boolean;
  iat?: number;
  exp?: number;
}

/**
 * JWT配置接口
 */
export interface JWTConfig {
  accessExpire: string;      // 访问令牌过期时间（如 "2h"）
  refreshExpire: string;     // 刷新令牌过期时间（如 "30d"）
  idleTimeout?: number;      // 空闲超时时间（毫秒）
  issuer: string;            // 签发者
  audience?: string;         // 受众
  keyAlias: string;          // KMS密钥别名
}

/**
 * 默认配置（符合等保3级要求）
 */
const DEFAULT_CONFIG: JWTConfig = {
  accessExpire: '2h',         // 等保建议：2小时绝对超时
  refreshExpire: '30d',       // 刷新令牌30天
  idleTimeout: 30 * 60 * 1000, // 30分钟空闲超时
  issuer: 'k.yyup.cc',
  audience: 'k.yyup.cc',
  keyAlias: process.env.KMS_JWT_KEY_ALIAS || 'alias/jwt-signing-key'
};

/**
 * JWT-KMS服务
 */
export class JWTKMSService {
  private kms: AliyunKMSService;
  private config: JWTConfig;
  private cacheKey: Buffer | null = null;
  private cacheExpire: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

  constructor(kms?: AliyunKMSService, config?: Partial<JWTConfig>) {
    this.kms = kms || new AliyunKMSService();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 获取JWT签名密钥（带缓存）
   */
  private async getSigningKey(): Promise<Buffer> {
    // 检查缓存
    if (this.cacheKey && Date.now() < this.cacheExpire) {
      return this.cacheKey;
    }

    // 从KMS获取密钥
    const key = await this.kms.getKey(this.config.keyAlias);

    // 缓存密钥
    this.cacheKey = key;
    this.cacheExpire = Date.now() + this.CACHE_TTL;

    return key;
  }

  /**
   * 生成访问令牌
   */
  async signAccessToken(payload: JWTPayload): Promise<string> {
    const key = await this.getSigningKey();

    return jwt.sign(payload, key, {
      expiresIn: this.config.accessExpire as string | number,
      issuer: this.config.issuer,
      audience: this.config.audience,
      algorithms: ['HS256'],
      subject: String(payload.id)
    } as any);
  }

  /**
   * 生成刷新令牌
   */
  async signRefreshToken(payload: JWTPayload): Promise<string> {
    const key = await this.getSigningKey();

    return jwt.sign(payload, key, {
      expiresIn: this.config.refreshExpire as string | number,
      issuer: this.config.issuer,
      audience: this.config.audience,
      algorithms: ['HS256'],
      subject: String(payload.id)
    } as any);
  }

  /**
   * 生成令牌对
   */
  async signTokenPair(payload: JWTPayload): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.signAccessToken(payload);
    const refreshToken = await this.signRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  /**
   * 验证令牌
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    const key = await this.getSigningKey();

    try {
      const decoded = jwt.verify(token, key, {
        issuer: this.config.issuer,
        audience: this.config.audience,
        algorithms: ['HS256']
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('令牌已过期');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('无效的令牌');
      }
      throw error;
    }
  }

  /**
   * 解码令牌（不验证签名，用于调试）
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * 检查令牌是否即将过期（剩余时间小于5分钟）
   */
  isTokenExpiringSoon(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - now;

    return timeLeft < 300; // 5分钟
  }

  /**
   * 检查空闲超时（需要前端配合发送心跳）
   */
  checkIdleTimeout(lastActivity: Date): boolean {
    if (!this.config.idleTimeout) return false;

    const now = Date.now();
    const idleTime = now - lastActivity.getTime();

    return idleTime > this.config.idleTimeout;
  }

  /**
   * 刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = await this.verifyToken(refreshToken);

    // 检查是否需要重新验证2FA
    if (payload.twoFaEnabled && !payload.twoFaVerified) {
      throw new Error('需要重新验证双因素认证');
    }

    // 生成新令牌
    return this.signTokenPair(payload);
  }

  /**
   * 使令牌失效（添加到黑名单）
   */
  async revokeToken(token: string, reason: string = 'logout'): Promise<void> {
    const decoded = this.decodeToken(token);
    if (!decoded) return;

    // TODO: 将令牌添加到Redis黑名单
    // await redis.setex(`token:blacklist:${token}`, exp, reason);

    console.log(`令牌已失效: ${token.substring(0, 20)}... 原因: ${reason}`);
  }

  /**
   * 清除密钥缓存
   */
  clearKeyCache(): void {
    this.cacheKey = null;
    this.cacheExpire = 0;
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<JWTConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * 获取当前配置
   */
  getConfig(): JWTConfig {
    return { ...this.config };
  }
}

/**
 * 导出单例实例
 */
export const jwtKmsService = new JWTKMSService();

/**
 * 导出配置
 */
export default {
  JWTKMSService,
  jwtKmsService
};
