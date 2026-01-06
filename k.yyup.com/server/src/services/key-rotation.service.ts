/**
 * 密钥轮换服务
 * 
 * 等保三级合规要求：
 * - 应定期更换密钥
 * - 密钥更换过程中应确保业务连续性
 * - 应记录密钥更换操作
 * 
 * 功能：
 * - 定期自动轮换JWT密钥
 * - 支持多密钥验证（新旧密钥并存期）
 * - 平滑过渡，不影响已登录用户
 * - 记录密钥轮换审计日志
 */

import crypto from 'crypto';
import { secureAuditLogService, AuditLogLevel, AuditLogCategory } from './secure-audit-log.service';

/**
 * 密钥信息
 */
interface KeyInfo {
  id: string;           // 密钥ID
  key: string;          // 密钥内容
  algorithm: string;    // 签名算法
  createdAt: Date;      // 创建时间
  expiresAt: Date;      // 过期时间
  status: KeyStatus;    // 状态
  version: number;      // 版本号
}

/**
 * 密钥状态
 */
export enum KeyStatus {
  ACTIVE = 'active',       // 活跃状态，用于签发新Token
  VERIFY_ONLY = 'verify_only', // 仅验证，不签发新Token
  EXPIRED = 'expired'      // 已过期
}

/**
 * 密钥轮换配置
 */
interface KeyRotationConfig {
  enabled: boolean;
  rotationInterval: number;    // 轮换间隔（毫秒）
  gracePeriod: number;         // 宽限期（毫秒），旧密钥在此期间仍可验证
  keyLength: number;           // 密钥长度（字节）
  algorithm: string;           // 签名算法
  maxActiveKeys: number;       // 最大活跃密钥数
}

/**
 * 默认配置
 */
const defaultConfig: KeyRotationConfig = {
  enabled: process.env.KEY_ROTATION_ENABLED === 'true',
  rotationInterval: parseInt(process.env.KEY_ROTATION_INTERVAL || '604800000', 10), // 默认7天
  gracePeriod: parseInt(process.env.KEY_ROTATION_GRACE_PERIOD || '86400000', 10),   // 默认1天
  keyLength: parseInt(process.env.KEY_ROTATION_KEY_LENGTH || '64', 10),             // 64字节
  algorithm: process.env.KEY_ROTATION_ALGORITHM || 'HS256',
  maxActiveKeys: parseInt(process.env.KEY_ROTATION_MAX_KEYS || '3', 10)
};

/**
 * 密钥轮换服务
 * 
 * 注意：当前使用内存存储，生产环境建议：
 * 1. 将密钥存储到安全的密钥管理服务（如阿里云KMS）
 * 2. 使用分布式缓存（Redis）同步多实例的密钥状态
 */
export class KeyRotationService {
  private static instance: KeyRotationService;
  private keys: Map<string, KeyInfo> = new Map();
  private config: KeyRotationConfig;
  private currentKeyId: string | null = null;
  private rotationTimer: NodeJS.Timeout | null = null;
  private version: number = 0;

  private constructor() {
    this.config = { ...defaultConfig };
    this.initializeKeys();
    
    if (this.config.enabled) {
      this.startRotationTimer();
    }
    
    console.log('✅ [密钥轮换] 服务已初始化');
  }

  static getInstance(): KeyRotationService {
    if (!KeyRotationService.instance) {
      KeyRotationService.instance = new KeyRotationService();
    }
    return KeyRotationService.instance;
  }

  /**
   * 生成新密钥
   */
  private generateKey(): string {
    return crypto.randomBytes(this.config.keyLength).toString('hex');
  }

  /**
   * 生成密钥ID
   */
  private generateKeyId(): string {
    return `key_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * 初始化密钥
   */
  private initializeKeys(): void {
    // 检查是否有环境变量配置的初始密钥
    const envSecret = process.env.JWT_SECRET;
    
    if (envSecret && envSecret.length >= 32) {
      // 使用环境变量中的密钥作为初始密钥
      const keyId = this.generateKeyId();
      const now = new Date();
      
      const keyInfo: KeyInfo = {
        id: keyId,
        key: envSecret,
        algorithm: this.config.algorithm,
        createdAt: now,
        expiresAt: new Date(now.getTime() + this.config.rotationInterval + this.config.gracePeriod),
        status: KeyStatus.ACTIVE,
        version: ++this.version
      };

      this.keys.set(keyId, keyInfo);
      this.currentKeyId = keyId;

      console.log(`[密钥轮换] 使用环境变量密钥初始化, ID: ${keyId}`);
    } else {
      // 生成新密钥
      this.createNewKey();
    }
  }

  /**
   * 创建新密钥
   */
  private async createNewKey(): Promise<KeyInfo> {
    const keyId = this.generateKeyId();
    const key = this.generateKey();
    const now = new Date();

    const keyInfo: KeyInfo = {
      id: keyId,
      key,
      algorithm: this.config.algorithm,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.config.rotationInterval + this.config.gracePeriod),
      status: KeyStatus.ACTIVE,
      version: ++this.version
    };

    // 将旧的活跃密钥设为仅验证状态
    if (this.currentKeyId) {
      const oldKey = this.keys.get(this.currentKeyId);
      if (oldKey && oldKey.status === KeyStatus.ACTIVE) {
        oldKey.status = KeyStatus.VERIFY_ONLY;
        oldKey.expiresAt = new Date(now.getTime() + this.config.gracePeriod);
      }
    }

    this.keys.set(keyId, keyInfo);
    this.currentKeyId = keyId;

    // 清理过期密钥
    this.cleanupExpiredKeys();

    console.log(`[密钥轮换] 创建新密钥, ID: ${keyId}, 版本: ${keyInfo.version}`);
    return keyInfo;
  }

  /**
   * 启动轮换定时器
   */
  private startRotationTimer(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }

    this.rotationTimer = setInterval(async () => {
      await this.rotate();
    }, this.config.rotationInterval);

    console.log(`[密钥轮换] 定时器已启动, 间隔: ${this.config.rotationInterval / 1000}秒`);
  }

  /**
   * 清理过期密钥
   */
  private cleanupExpiredKeys(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [keyId, keyInfo] of this.keys.entries()) {
      if (keyInfo.expiresAt < now) {
        keyInfo.status = KeyStatus.EXPIRED;
        this.keys.delete(keyId);
        cleanedCount++;
      }
    }

    // 保留最大密钥数量限制
    while (this.keys.size > this.config.maxActiveKeys) {
      const oldestKey = Array.from(this.keys.entries())
        .filter(([_, info]) => info.status !== KeyStatus.ACTIVE)
        .sort((a, b) => a[1].createdAt.getTime() - b[1].createdAt.getTime())[0];
      
      if (oldestKey) {
        this.keys.delete(oldestKey[0]);
        cleanedCount++;
      } else {
        break;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[密钥轮换] 已清理 ${cleanedCount} 个过期密钥`);
    }
  }

  /**
   * 执行密钥轮换
   */
  async rotate(): Promise<KeyInfo> {
    console.log('[密钥轮换] 开始执行密钥轮换...');

    const newKey = await this.createNewKey();

    // 记录审计日志
    await secureAuditLogService.log(
      AuditLogLevel.INFO,
      AuditLogCategory.SECURITY,
      '执行JWT密钥轮换',
      {
        resourceType: 'jwt_key',
        resourceId: newKey.id,
        details: {
          keyId: newKey.id,
          version: newKey.version,
          algorithm: newKey.algorithm,
          expiresAt: newKey.expiresAt.toISOString(),
          totalActiveKeys: this.keys.size
        }
      }
    );

    console.log(`[密钥轮换] 密钥轮换完成, 新密钥ID: ${newKey.id}`);
    return newKey;
  }

  /**
   * 获取当前用于签名的密钥
   */
  getCurrentKey(): string {
    if (!this.currentKeyId) {
      throw new Error('[密钥轮换] 没有可用的活跃密钥');
    }

    const keyInfo = this.keys.get(this.currentKeyId);
    if (!keyInfo || keyInfo.status !== KeyStatus.ACTIVE) {
      throw new Error('[密钥轮换] 当前密钥不可用');
    }

    return keyInfo.key;
  }

  /**
   * 获取当前密钥ID（用于JWT kid字段）
   */
  getCurrentKeyId(): string {
    if (!this.currentKeyId) {
      throw new Error('[密钥轮换] 没有可用的活跃密钥');
    }
    return this.currentKeyId;
  }

  /**
   * 获取用于验证的所有有效密钥
   */
  getValidationKeys(): Array<{ id: string; key: string }> {
    const now = new Date();
    const validKeys: Array<{ id: string; key: string }> = [];

    for (const [keyId, keyInfo] of this.keys.entries()) {
      if (keyInfo.status !== KeyStatus.EXPIRED && keyInfo.expiresAt > now) {
        validKeys.push({ id: keyId, key: keyInfo.key });
      }
    }

    return validKeys;
  }

  /**
   * 根据密钥ID获取密钥（用于验证带kid的JWT）
   */
  getKeyById(keyId: string): string | null {
    const keyInfo = this.keys.get(keyId);
    if (!keyInfo || keyInfo.status === KeyStatus.EXPIRED) {
      return null;
    }
    return keyInfo.key;
  }

  /**
   * 验证Token使用任何有效密钥
   * 返回匹配的密钥，如果都不匹配则返回null
   */
  findValidKey(verifyFn: (key: string) => boolean): string | null {
    const validKeys = this.getValidationKeys();
    
    for (const { key } of validKeys) {
      try {
        if (verifyFn(key)) {
          return key;
        }
      } catch {
        // 继续尝试下一个密钥
      }
    }
    
    return null;
  }

  /**
   * 手动触发密钥轮换
   */
  async forceRotate(): Promise<KeyInfo> {
    console.log('[密钥轮换] 手动触发密钥轮换');
    return this.rotate();
  }

  /**
   * 获取密钥状态统计
   */
  getStats(): {
    totalKeys: number;
    activeKeys: number;
    verifyOnlyKeys: number;
    currentKeyId: string | null;
    currentKeyVersion: number;
    nextRotation: Date | null;
  } {
    let activeCount = 0;
    let verifyOnlyCount = 0;

    for (const keyInfo of this.keys.values()) {
      if (keyInfo.status === KeyStatus.ACTIVE) activeCount++;
      if (keyInfo.status === KeyStatus.VERIFY_ONLY) verifyOnlyCount++;
    }

    const currentKey = this.currentKeyId ? this.keys.get(this.currentKeyId) : null;
    const nextRotation = currentKey 
      ? new Date(currentKey.createdAt.getTime() + this.config.rotationInterval)
      : null;

    return {
      totalKeys: this.keys.size,
      activeKeys: activeCount,
      verifyOnlyKeys: verifyOnlyCount,
      currentKeyId: this.currentKeyId,
      currentKeyVersion: this.version,
      nextRotation
    };
  }

  /**
   * 获取配置
   */
  getConfig(): KeyRotationConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<KeyRotationConfig>): void {
    const wasEnabled = this.config.enabled;
    this.config = { ...this.config, ...updates };

    // 如果启用状态变化，相应地启动或停止定时器
    if (!wasEnabled && this.config.enabled) {
      this.startRotationTimer();
    } else if (wasEnabled && !this.config.enabled) {
      this.stop();
    } else if (updates.rotationInterval && this.config.enabled) {
      // 轮换间隔变化，重启定时器
      this.startRotationTimer();
    }
  }

  /**
   * 停止服务
   */
  stop(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
      console.log('[密钥轮换] 服务已停止');
    }
  }

  /**
   * 重置服务（仅用于测试）
   */
  reset(): void {
    this.stop();
    this.keys.clear();
    this.currentKeyId = null;
    this.version = 0;
    this.initializeKeys();
    
    if (this.config.enabled) {
      this.startRotationTimer();
    }
  }
}

// 导出单例
export const keyRotationService = KeyRotationService.getInstance();
export default keyRotationService;
