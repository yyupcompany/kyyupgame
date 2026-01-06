/**
 * 防刷服务
 * 
 * 检测和防止恶意刷接口行为
 */

import RedisService from './redis.service';
import { logger } from '../utils/logger';

/**
 * 防刷配置
 */
export interface AntiSpamConfig {
  // 时间窗口（秒）
  windowSeconds: number;
  // 最大请求数
  maxRequests: number;
  // 封禁时长（秒）
  banDuration: number;
  // 检测阈值（超过此阈值触发封禁）
  threshold: number;
}

/**
 * 防刷统计
 */
interface AntiSpamStats {
  totalChecks: number;
  spamDetected: number;
  bannedUsers: number;
  detectionRate: number;
}

/**
 * 防刷服务类
 */
class AntiSpamService {
  private stats: AntiSpamStats = {
    totalChecks: 0,
    spamDetected: 0,
    bannedUsers: 0,
    detectionRate: 0
  };

  /**
   * 检查是否被封禁
   */
  async isBanned(identifier: string): Promise<boolean> {
    try {
      const key = `antispam:ban:${identifier}`;
      const banned = await RedisService.get(key);
      return banned !== null;
    } catch (error) {
      logger.error('检查封禁状态失败:', error);
      return false;
    }
  }

  /**
   * 封禁用户
   */
  async ban(identifier: string, duration: number, reason?: string): Promise<void> {
    try {
      const key = `antispam:ban:${identifier}`;
      const value = {
        bannedAt: new Date().toISOString(),
        reason: reason || '触发防刷机制',
        duration
      };

      await RedisService.set(key, JSON.stringify(value), duration);
      
      this.stats.bannedUsers++;
      
      logger.warn(`用户已封禁: ${identifier}, 时长: ${duration}秒, 原因: ${reason}`);
    } catch (error) {
      logger.error('封禁用户失败:', error);
      throw error;
    }
  }

  /**
   * 解除封禁
   */
  async unban(identifier: string): Promise<void> {
    try {
      const key = `antispam:ban:${identifier}`;
      await RedisService.delete(key);
      
      this.stats.bannedUsers = Math.max(0, this.stats.bannedUsers - 1);
      
      logger.info(`用户已解封: ${identifier}`);
    } catch (error) {
      logger.error('解除封禁失败:', error);
      throw error;
    }
  }

  /**
   * 检查并记录请求
   * 返回是否允许请求
   */
  async checkAndRecord(
    identifier: string,
    config: AntiSpamConfig
  ): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    try {
      this.stats.totalChecks++;

      // 检查是否已被封禁
      const banned = await this.isBanned(identifier);
      if (banned) {
        return {
          allowed: false,
          reason: '您已被暂时封禁，请稍后再试'
        };
      }

      // 记录请求
      const key = `antispam:requests:${identifier}`;
      const count = await RedisService.incr(key);

      // 如果是第一次请求，设置过期时间
      if (count === 1) {
        await RedisService.expire(key, config.windowSeconds);
      }

      // 检查是否超过阈值
      if (count > config.threshold) {
        // 触发封禁
        await this.ban(
          identifier,
          config.banDuration,
          `在${config.windowSeconds}秒内请求${count}次，超过阈值${config.threshold}`
        );

        this.stats.spamDetected++;
        this.updateDetectionRate();

        return {
          allowed: false,
          reason: `请求过于频繁，已被封禁${config.banDuration}秒`
        };
      }

      // 检查是否超过最大请求数
      if (count > config.maxRequests) {
        this.stats.spamDetected++;
        this.updateDetectionRate();

        return {
          allowed: false,
          reason: '请求过于频繁，请稍后再试',
          remaining: 0
        };
      }

      return {
        allowed: true,
        remaining: config.maxRequests - count
      };
    } catch (error) {
      logger.error('防刷检查失败:', error);
      // 失败时允许请求，避免误伤
      return { allowed: true };
    }
  }

  /**
   * 更新检测率
   */
  private updateDetectionRate(): void {
    if (this.stats.totalChecks > 0) {
      this.stats.detectionRate = 
        (this.stats.spamDetected / this.stats.totalChecks) * 100;
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): AntiSpamStats {
    return { ...this.stats };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      totalChecks: 0,
      spamDetected: 0,
      bannedUsers: 0,
      detectionRate: 0
    };
  }

  /**
   * 获取封禁列表
   */
  async getBannedList(): Promise<Array<{ identifier: string; info: any }>> {
    try {
      const keys = await RedisService.scanAllKeys('antispam:ban:*');
      const bannedList: Array<{ identifier: string; info: any }> = [];

      for (const key of keys) {
        const identifier = key.replace('antispam:ban:', '');
        const info = await RedisService.get(key);
        
        if (info) {
          try {
            bannedList.push({
              identifier,
              info: typeof info === 'string' ? JSON.parse(info) : info
            });
          } catch {
            bannedList.push({
              identifier,
              info
            });
          }
        }
      }

      return bannedList;
    } catch (error) {
      logger.error('获取封禁列表失败:', error);
      return [];
    }
  }

  /**
   * 清除所有封禁
   */
  async clearAllBans(): Promise<void> {
    try {
      const keys = await RedisService.scanAllKeys('antispam:ban:*');
      
      for (const key of keys) {
        await RedisService.delete(key);
      }

      this.stats.bannedUsers = 0;
      
      logger.info(`已清除所有封禁，共${keys.length}个`);
    } catch (error) {
      logger.error('清除封禁失败:', error);
      throw error;
    }
  }
}

/**
 * 预定义的防刷配置
 */
export const AntiSpamPresets = {
  /**
   * 严格模式 - 用于敏感操作
   */
  strict: {
    windowSeconds: 60,
    maxRequests: 10,
    banDuration: 300,  // 5分钟
    threshold: 15
  },

  /**
   * 标准模式 - 用于普通API
   */
  standard: {
    windowSeconds: 60,
    maxRequests: 60,
    banDuration: 180,  // 3分钟
    threshold: 100
  },

  /**
   * 宽松模式 - 用于查询接口
   */
  loose: {
    windowSeconds: 60,
    maxRequests: 120,
    banDuration: 60,   // 1分钟
    threshold: 200
  },

  /**
   * 登录防刷
   */
  login: {
    windowSeconds: 300,  // 5分钟
    maxRequests: 5,
    banDuration: 900,    // 15分钟
    threshold: 10
  },

  /**
   * 注册防刷
   */
  register: {
    windowSeconds: 3600,  // 1小时
    maxRequests: 3,
    banDuration: 3600,    // 1小时
    threshold: 5
  }
};

// 导出单例
export default new AntiSpamService();

