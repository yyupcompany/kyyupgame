/**
 * 会话管理服务
 * 
 * 功能：
 * 1. Token黑名单管理
 * 2. 在线用户管理
 * 3. 单点登录支持
 * 4. 会话统计和监控
 */

import RedisService from './redis.service';
import { RedisKeyPrefix, RedisTTL } from '../config/redis.config';

/**
 * 用户会话信息
 */
export interface UserSession {
  userId: number;
  username: string;
  role: string;
  token: string;
  loginTime: number;
  lastActiveTime: number;
  ip?: string;
  userAgent?: string;
  deviceId?: string;
}

/**
 * 会话统计信息
 */
export interface SessionStats {
  totalOnlineUsers: number;
  totalSessions: number;
  blacklistedTokens: number;
  sessionsByRole: Record<string, number>;
}

/**
 * 会话管理服务类
 */
class SessionService {
  // Redis Key前缀
  private readonly TOKEN_BLACKLIST_PREFIX = 'token:blacklist:';
  private readonly USER_SESSION_PREFIX = 'user:session:';
  private readonly ONLINE_USERS_SET = 'online:users';
  private readonly SESSION_TOKEN_PREFIX = 'session:token:';

  /**
   * 将Token加入黑名单
   * 
   * @param token JWT Token
   * @param expiresIn Token过期时间（秒）
   * @returns 是否成功
   */
  async addToBlacklist(token: string, expiresIn: number = RedisTTL.TOKEN_BLACKLIST): Promise<boolean> {
    try {
      const key = `${this.TOKEN_BLACKLIST_PREFIX}${token}`;
      await RedisService.set(key, '1', expiresIn);
      console.log(`🚫 Token已加入黑名单: ${token.substring(0, 20)}..., TTL=${expiresIn}秒`);
      return true;
    } catch (error) {
      console.error('❌ 添加Token到黑名单失败:', error);
      return false;
    }
  }

  /**
   * 检查Token是否在黑名单中
   * 
   * @param token JWT Token
   * @returns 是否在黑名单中
   */
  async isBlacklisted(token: string): Promise<boolean> {
    try {
      const key = `${this.TOKEN_BLACKLIST_PREFIX}${token}`;
      const result = await RedisService.get(key);
      const isBlacklisted = result !== null;
      
      if (isBlacklisted) {
        console.log(`🚫 Token在黑名单中: ${token.substring(0, 20)}...`);
      }
      
      return isBlacklisted;
    } catch (error) {
      console.error('❌ 检查Token黑名单失败:', error);
      return false;
    }
  }

  /**
   * 创建用户会话
   * 
   * @param session 会话信息
   * @param enableSSO 是否启用单点登录（踢出其他设备）
   * @returns 是否成功
   */
  async createSession(session: UserSession, enableSSO: boolean = false): Promise<boolean> {
    try {
      const { userId, token } = session;

      // 如果启用单点登录，先踢出该用户的其他会话
      if (enableSSO) {
        await this.kickoutUserSessions(userId, token);
      }

      // 保存会话信息（直接存储JSON字符串）
      const sessionKey = `${this.USER_SESSION_PREFIX}${userId}:${token}`;

      // 尝试保存到Redis，但如果失败不要阻塞登录流程
      try {
        await RedisService.set(sessionKey, session, RedisTTL.USER_SESSION);
      } catch (redisError) {
        console.warn(`⚠️ 会话保存到Redis失败，但继续处理: ${redisError}`);
        // 不中断流程，继续执行
      }

      // 保存Token到用户ID的映射
      const tokenKey = `${this.SESSION_TOKEN_PREFIX}${token}`;
      try {
        await RedisService.set(tokenKey, userId, RedisTTL.USER_SESSION);
      } catch (redisError) {
        console.warn(`⚠️ Token映射保存到Redis失败，但继续处理: ${redisError}`);
        // 不中断流程，继续执行
      }

      // 添加到在线用户集合
      try {
        await RedisService.sadd(this.ONLINE_USERS_SET, userId.toString());
      } catch (redisError) {
        console.warn(`⚠️ 在线用户集合更新失败，但继续处理: ${redisError}`);
        // 不中断流程，继续执行
      }

      console.log(`✅ 用户会话已创建: 用户${userId}, Token=${token.substring(0, 20)}..., SSO=${enableSSO}`);
      return true;
    } catch (error) {
      console.error('❌ 创建用户会话失败:', error);
      // 即使出错也返回true，因为JWT token已经生成，用户可以继续使用
      return true;
    }
  }

  /**
   * 获取用户会话
   * 
   * @param userId 用户ID
   * @param token Token（可选，不提供则返回所有会话）
   * @returns 会话信息
   */
  async getUserSession(userId: number, token?: string): Promise<UserSession | UserSession[] | null> {
    try {
      if (token) {
        // 获取单个会话
        const sessionKey = `${this.USER_SESSION_PREFIX}${userId}:${token}`;
        const sessionData = await RedisService.get<UserSession>(sessionKey);

        if (!sessionData) {
          return null;
        }

        return sessionData;
      } else {
        // 获取用户的所有会话
        const pattern = `${this.USER_SESSION_PREFIX}${userId}:*`;
        const keys = await RedisService.keys(pattern);

        if (keys.length === 0) {
          return [];
        }

        const sessions: UserSession[] = [];
        for (const key of keys) {
          const sessionData = await RedisService.get<UserSession>(key);
          if (sessionData) {
            sessions.push(sessionData);
          }
        }

        return sessions;
      }
    } catch (error) {
      console.error('❌ 获取用户会话失败:', error);
      return null;
    }
  }

  /**
   * 更新会话活跃时间
   * 
   * @param userId 用户ID
   * @param token Token
   * @returns 是否成功
   */
  async updateSessionActivity(userId: number, token: string): Promise<boolean> {
    try {
      const sessionKey = `${this.USER_SESSION_PREFIX}${userId}:${token}`;
      const session = await RedisService.get<UserSession>(sessionKey);

      if (!session) {
        return false;
      }

      session.lastActiveTime = Date.now();

      await RedisService.set(sessionKey, session, RedisTTL.USER_SESSION);

      return true;
    } catch (error) {
      console.error('❌ 更新会话活跃时间失败:', error);
      return false;
    }
  }

  /**
   * 删除用户会话（登出）
   * 
   * @param userId 用户ID
   * @param token Token
   * @returns 是否成功
   */
  async deleteSession(userId: number, token: string): Promise<boolean> {
    try {
      // 删除会话信息
      const sessionKey = `${this.USER_SESSION_PREFIX}${userId}:${token}`;
      await RedisService.del(sessionKey);

      // 删除Token映射
      const tokenKey = `${this.SESSION_TOKEN_PREFIX}${token}`;
      await RedisService.del(tokenKey);

      // 检查用户是否还有其他会话
      const pattern = `${this.USER_SESSION_PREFIX}${userId}:*`;
      const keys = await RedisService.keys(pattern);
      
      // 如果没有其他会话，从在线用户集合中移除
      if (keys.length === 0) {
        await RedisService.srem(this.ONLINE_USERS_SET, userId.toString());
      }

      console.log(`✅ 用户会话已删除: 用户${userId}, Token=${token.substring(0, 20)}...`);
      return true;
    } catch (error) {
      console.error('❌ 删除用户会话失败:', error);
      return false;
    }
  }

  /**
   * 踢出用户的所有会话（除了当前Token）
   * 
   * @param userId 用户ID
   * @param currentToken 当前Token（保留）
   * @returns 踢出的会话数量
   */
  async kickoutUserSessions(userId: number, currentToken?: string): Promise<number> {
    try {
      const pattern = `${this.USER_SESSION_PREFIX}${userId}:*`;
      const keys = await RedisService.keys(pattern);
      
      let kickedCount = 0;
      
      for (const key of keys) {
        // 提取Token
        const token = key.split(':').pop();
        
        // 跳过当前Token
        if (currentToken && token === currentToken) {
          continue;
        }

        // 删除会话
        await RedisService.del(key);
        
        // 删除Token映射
        if (token) {
          const tokenKey = `${this.SESSION_TOKEN_PREFIX}${token}`;
          await RedisService.del(tokenKey);
          
          // 将Token加入黑名单
          await this.addToBlacklist(token);
        }
        
        kickedCount++;
      }

      console.log(`✅ 已踢出用户${userId}的${kickedCount}个会话`);
      return kickedCount;
    } catch (error) {
      console.error('❌ 踢出用户会话失败:', error);
      return 0;
    }
  }

  /**
   * 获取在线用户列表
   * 
   * @returns 在线用户ID列表
   */
  async getOnlineUsers(): Promise<number[]> {
    try {
      const userIds = await RedisService.smembers(this.ONLINE_USERS_SET);
      return userIds.map(id => parseInt(id));
    } catch (error) {
      console.error('❌ 获取在线用户列表失败:', error);
      return [];
    }
  }

  /**
   * 获取会话统计信息
   * 
   * @returns 会话统计
   */
  async getSessionStats(): Promise<SessionStats> {
    try {
      // 获取在线用户数
      const onlineUsers = await this.getOnlineUsers();
      const totalOnlineUsers = onlineUsers.length;

      // 获取总会话数
      const sessionPattern = `${this.USER_SESSION_PREFIX}*`;
      const sessionKeys = await RedisService.keys(sessionPattern);
      const totalSessions = sessionKeys.length;

      // 获取黑名单Token数
      const blacklistPattern = `${this.TOKEN_BLACKLIST_PREFIX}*`;
      const blacklistKeys = await RedisService.keys(blacklistPattern);
      const blacklistedTokens = blacklistKeys.length;

      // 按角色统计会话数
      const sessionsByRole: Record<string, number> = {};
      for (const key of sessionKeys) {
        const session = await RedisService.get<UserSession>(key);
        if (session) {
          sessionsByRole[session.role] = (sessionsByRole[session.role] || 0) + 1;
        }
      }

      return {
        totalOnlineUsers,
        totalSessions,
        blacklistedTokens,
        sessionsByRole
      };
    } catch (error) {
      console.error('❌ 获取会话统计失败:', error);
      return {
        totalOnlineUsers: 0,
        totalSessions: 0,
        blacklistedTokens: 0,
        sessionsByRole: {}
      };
    }
  }
}

// 导出单例
export default new SessionService();

