/**
 * Token黑名单服务
 * 
 * 等保三级合规要求：
 * - 应对会话进行有效管理
 * - 应确保用户登出后会话立即失效
 * - 应防止会话劫持和重放攻击
 * 
 * 功能：
 * - 存储已失效的Token（登出、密码修改等场景）
 * - 自动清理过期的黑名单条目
 * - 支持按用户ID批量失效Token
 */

import crypto from 'crypto';

/**
 * 黑名单条目
 */
interface BlacklistEntry {
  tokenHash: string;      // Token的哈希值（不存储原始Token）
  userId?: number;        // 关联的用户ID
  reason: string;         // 加入黑名单的原因
  expiresAt: Date;        // 过期时间
  createdAt: Date;        // 创建时间
}

/**
 * 黑名单原因
 */
export enum BlacklistReason {
  LOGOUT = 'logout',                    // 用户主动登出
  PASSWORD_CHANGE = 'password_change',  // 密码修改
  ACCOUNT_DISABLED = 'account_disabled', // 账户禁用
  SECURITY_BREACH = 'security_breach',  // 安全事件
  ADMIN_REVOKE = 'admin_revoke',        // 管理员撤销
  SESSION_TIMEOUT = 'session_timeout',  // 会话超时
  DEVICE_CHANGE = 'device_change',      // 设备变更
  MFA_RESET = 'mfa_reset'              // MFA重置
}

/**
 * Token黑名单服务配置
 */
interface BlacklistConfig {
  enabled: boolean;
  maxSize: number;        // 最大黑名单条目数
  cleanupInterval: number; // 清理间隔（毫秒）
}

/**
 * 默认配置
 */
const defaultConfig: BlacklistConfig = {
  enabled: process.env.TOKEN_BLACKLIST_ENABLED !== 'false',
  maxSize: parseInt(process.env.TOKEN_BLACKLIST_MAX_SIZE || '100000', 10),
  cleanupInterval: parseInt(process.env.TOKEN_BLACKLIST_CLEANUP_INTERVAL || '3600000', 10) // 1小时
};

/**
 * Token黑名单服务
 * 
 * 注意：当前使用内存存储，生产环境建议使用 Redis
 * TODO: 添加 Redis 支持以实现分布式部署
 */
export class TokenBlacklistService {
  private static instance: TokenBlacklistService;
  private blacklist: Map<string, BlacklistEntry> = new Map();
  private userTokenMap: Map<number, Set<string>> = new Map(); // userId -> tokenHashes
  private config: BlacklistConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = { ...defaultConfig };
    this.startCleanupTimer();
    console.log('✅ [Token黑名单] 服务已初始化');
  }

  static getInstance(): TokenBlacklistService {
    if (!TokenBlacklistService.instance) {
      TokenBlacklistService.instance = new TokenBlacklistService();
    }
    return TokenBlacklistService.instance;
  }

  /**
   * 计算Token的哈希值
   * 使用哈希可以避免存储原始Token，增加安全性
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * 清理过期的黑名单条目
   */
  private cleanup(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [hash, entry] of this.blacklist.entries()) {
      if (entry.expiresAt < now) {
        this.blacklist.delete(hash);
        
        // 从用户映射中移除
        if (entry.userId) {
          const userTokens = this.userTokenMap.get(entry.userId);
          if (userTokens) {
            userTokens.delete(hash);
            if (userTokens.size === 0) {
              this.userTokenMap.delete(entry.userId);
            }
          }
        }
        
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[Token黑名单] 已清理 ${cleanedCount} 个过期条目，当前大小: ${this.blacklist.size}`);
    }
  }

  /**
   * 将Token加入黑名单
   * 
   * @param token 要加入黑名单的Token
   * @param reason 加入原因
   * @param expiresAt Token原本的过期时间
   * @param userId 关联的用户ID（可选）
   */
  async addToBlacklist(
    token: string,
    reason: BlacklistReason,
    expiresAt: Date,
    userId?: number
  ): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    // 检查是否超过最大大小
    if (this.blacklist.size >= this.config.maxSize) {
      console.warn('[Token黑名单] 已达到最大容量，执行紧急清理');
      this.cleanup();
      
      // 如果仍然超过，移除最早的条目
      if (this.blacklist.size >= this.config.maxSize) {
        const oldestKey = this.blacklist.keys().next().value;
        if (oldestKey) {
          this.blacklist.delete(oldestKey);
        }
      }
    }

    const tokenHash = this.hashToken(token);

    const entry: BlacklistEntry = {
      tokenHash,
      userId,
      reason,
      expiresAt,
      createdAt: new Date()
    };

    this.blacklist.set(tokenHash, entry);

    // 添加到用户映射
    if (userId) {
      let userTokens = this.userTokenMap.get(userId);
      if (!userTokens) {
        userTokens = new Set();
        this.userTokenMap.set(userId, userTokens);
      }
      userTokens.add(tokenHash);
    }

    console.log(`[Token黑名单] Token已加入黑名单, 原因: ${reason}, 用户ID: ${userId || '未知'}`);
    return true;
  }

  /**
   * 检查Token是否在黑名单中
   */
  isBlacklisted(token: string): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const tokenHash = this.hashToken(token);
    const entry = this.blacklist.get(tokenHash);

    if (!entry) {
      return false;
    }

    // 检查是否已过期
    if (entry.expiresAt < new Date()) {
      this.blacklist.delete(tokenHash);
      return false;
    }

    return true;
  }

  /**
   * 获取Token被加入黑名单的原因
   */
  getBlacklistReason(token: string): BlacklistReason | null {
    if (!this.config.enabled) {
      return null;
    }

    const tokenHash = this.hashToken(token);
    const entry = this.blacklist.get(tokenHash);

    return entry?.reason as BlacklistReason || null;
  }

  /**
   * 使用户的所有Token失效
   * 用于密码修改、账户禁用等场景
   */
  async revokeAllUserTokens(
    userId: number,
    reason: BlacklistReason,
    tokenExpireTime: Date
  ): Promise<number> {
    const userTokens = this.userTokenMap.get(userId);
    
    if (!userTokens || userTokens.size === 0) {
      console.log(`[Token黑名单] 用户 ${userId} 没有活跃的Token需要撤销`);
      return 0;
    }

    // 更新所有Token的原因
    for (const tokenHash of userTokens) {
      const entry = this.blacklist.get(tokenHash);
      if (entry) {
        entry.reason = reason;
        entry.expiresAt = tokenExpireTime;
      }
    }

    const count = userTokens.size;
    console.log(`[Token黑名单] 用户 ${userId} 的 ${count} 个Token已被撤销, 原因: ${reason}`);
    return count;
  }

  /**
   * 用户登出时撤销Token
   */
  async revokeOnLogout(token: string, userId: number, tokenExpireTime: Date): Promise<boolean> {
    return this.addToBlacklist(token, BlacklistReason.LOGOUT, tokenExpireTime, userId);
  }

  /**
   * 密码修改时撤销所有Token
   */
  async revokeOnPasswordChange(userId: number, tokenExpireTime: Date): Promise<number> {
    return this.revokeAllUserTokens(userId, BlacklistReason.PASSWORD_CHANGE, tokenExpireTime);
  }

  /**
   * 账户禁用时撤销所有Token
   */
  async revokeOnAccountDisabled(userId: number, tokenExpireTime: Date): Promise<number> {
    return this.revokeAllUserTokens(userId, BlacklistReason.ACCOUNT_DISABLED, tokenExpireTime);
  }

  /**
   * 安全事件时撤销Token
   */
  async revokeOnSecurityBreach(token: string, userId: number, tokenExpireTime: Date): Promise<boolean> {
    return this.addToBlacklist(token, BlacklistReason.SECURITY_BREACH, tokenExpireTime, userId);
  }

  /**
   * 获取黑名单统计信息
   */
  getStats(): {
    total: number;
    byReason: Record<string, number>;
    byUser: number;
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    const stats: Record<string, number> = {};
    let oldestEntry: Date | undefined;
    let newestEntry: Date | undefined;

    for (const entry of this.blacklist.values()) {
      stats[entry.reason] = (stats[entry.reason] || 0) + 1;

      if (!oldestEntry || entry.createdAt < oldestEntry) {
        oldestEntry = entry.createdAt;
      }
      if (!newestEntry || entry.createdAt > newestEntry) {
        newestEntry = entry.createdAt;
      }
    }

    return {
      total: this.blacklist.size,
      byReason: stats,
      byUser: this.userTokenMap.size,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * 获取配置
   */
  getConfig(): BlacklistConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<BlacklistConfig>): void {
    this.config = { ...this.config, ...updates };

    if (updates.cleanupInterval) {
      this.startCleanupTimer();
    }
  }

  /**
   * 清空黑名单（仅用于测试）
   */
  clear(): void {
    this.blacklist.clear();
    this.userTokenMap.clear();
    console.log('[Token黑名单] 已清空黑名单');
  }

  /**
   * 停止清理定时器
   */
  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

// 导出单例
export const tokenBlacklistService = TokenBlacklistService.getInstance();
export default tokenBlacklistService;
