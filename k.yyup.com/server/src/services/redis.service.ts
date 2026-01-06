/**
 * Redis服务封装
 * 
 * 提供统一的Redis操作接口，支持：
 * - 基础操作（get, set, del, exists, expire）
 * - Hash操作（hset, hget, hgetall, hdel）
 * - Set操作（sadd, smembers, sismember, srem）
 * - 分布式锁（acquireLock, releaseLock）
 * - 计数器（incr, decr）
 * - 批量操作（mget, mset, del）
 */

import { createClient, RedisClientType } from 'redis';
import { getRedisConfig, toRedisClientOptions, isRedisEnabled } from '../config/redis.config';

class RedisService {
  private static instance: RedisService;
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * 检查Redis是否已连接
   */
  public getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * 连接Redis
   */
  public async connect(): Promise<void> {
    // 检查Redis是否启用
    if (!isRedisEnabled()) {
      console.log('🚫 Redis已禁用，跳过连接');
      this.isConnected = false;
      return;
    }

    if (this.isConnected && this.client) {
      return;
    }

    // 如果正在连接，等待连接完成
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this._connect();
    return this.connectionPromise;
  }

  private async _connect(): Promise<void> {
    try {
      const config = getRedisConfig();
      const options = toRedisClientOptions(config);

      console.log('🔌 正在连接Redis...', {
        mode: config.mode,
        host: config.standalone?.host || 'N/A',
        port: config.standalone?.port || 'N/A',
        hasPassword: !!config.standalone?.password
      });

      console.log('🔑 Redis配置:', {
        password: config.standalone?.password ? '***已设置***' : '未设置',
        db: config.standalone?.db
      });

      this.client = createClient(options) as RedisClientType;

      // 错误处理 - 更宽松的错误处理
      this.client.on('error', (err) => {
        console.warn('⚠️ Redis错误 (将继续尝试重连):', err.message);
        // 不要立即设置 isConnected = false，让重连机制处理
      });

      // 连接成功
      this.client.on('connect', () => {
        console.log('✅ Redis连接成功');
        this.isConnected = true;
      });

      // 准备就绪
      this.client.on('ready', () => {
        console.log('🎯 Redis准备就绪');
        this.isConnected = true;
      });

      // 重连
      this.client.on('reconnecting', () => {
        console.log('🔄 Redis重新连接中...');
        this.isConnected = false;
      });

      // 断开连接
      this.client.on('end', () => {
        console.log('🔌 Redis连接已断开');
        this.isConnected = false;
      });

      // 使用更宽松的连接策略
      try {
        await this.client.connect();
        this.isConnected = true;
        this.connectionPromise = null;
        console.log('🎉 Redis服务初始化完成');
      } catch (connectError) {
        this.connectionPromise = null;
        console.warn('⚠️ Redis初始连接失败，但服务将继续运行:', (connectError as Error).message);
        console.log('💡 Redis将在需要时自动重连');
        // 不抛出错误，让应用继续运行
        this.isConnected = false;
      }
    } catch (error) {
      this.connectionPromise = null;
      console.error('❌ Redis配置错误:', error);
      // 只有配置错误才抛出异常
      if ((error as Error).message.includes('配置') || (error as Error).message.includes('config')) {
        throw error;
      }
      // 连接错误不阻止应用启动
      console.log('💡 应用将在无Redis缓存模式下运行');
      this.isConnected = false;
    }
  }

  /**
   * 断开连接
   */
  public async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      this.client = null;
      console.log('👋 Redis连接已关闭');
    }
  }

  /**
   * 确保已连接 - 优化版本，更好的错误处理
   */
  private async ensureConnected(): Promise<RedisClientType> {
    // 如果Redis被禁用，抛出错误
    if (!isRedisEnabled()) {
      throw new Error('Redis已禁用');
    }

    if (!this.isConnected || !this.client) {
      try {
        await this.connect();
      } catch (error) {
        console.warn('⚠️ Redis连接失败，某些功能可能不可用:', error);
        throw new Error('Redis服务不可用');
      }
    }
    if (!this.client) {
      throw new Error('Redis客户端未初始化');
    }
    return this.client;
  }

  // ==================== 健康检查 ====================

  /**
   * Redis健康检查
   */
  public async healthCheck(): Promise<{ status: 'up' | 'down'; message: string; latency?: number }> {
    if (!isRedisEnabled()) {
      return {
        status: 'down',
        message: 'Redis已禁用'
      };
    }

    try {
      const start = Date.now();
      const client = await this.ensureConnected();
      const result = await client.ping();
      const latency = Date.now() - start;

      if (result === 'PONG') {
        return {
          status: 'up',
          message: 'Redis连接正常',
          latency
        };
      } else {
        return {
          status: 'down',
          message: 'Redis ping响应异常'
        };
      }
    } catch (error) {
      return {
        status: 'down',
        message: `Redis连接失败: ${error}`
      };
    }
  }

  /**
   * 获取Redis信息
   */
  public async getInfo(): Promise<any> {
    try {
      const client = await this.ensureConnected();
      const info = await client.info();
      return info;
    } catch (error) {
      console.error('获取Redis信息失败:', error);
      return null;
    }
  }

  // ==================== 基础操作 ====================

  /**
   * 获取值
   */
  public async get<T = any>(key: string): Promise<T | null> {
    if (!isRedisEnabled()) {
      return null; // Redis禁用时返回null，表示缓存未命中
    }

    try {
      const client = await this.ensureConnected();
      const value = await client.get(key);

      if (value === null) {
        return null;
      }

      // 尝试解析JSON
      try {
        return JSON.parse(value as string) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error(`Redis GET错误 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 设置值
   */
  public async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!isRedisEnabled()) {
      return true; // Redis禁用时返回true，表示操作成功（但实际未存储）
    }

    try {
      const client = await this.ensureConnected();
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

      if (ttl) {
        await client.setEx(key, ttl, stringValue);
      } else {
        await client.set(key, stringValue);
      }

      return true;
    } catch (error) {
      console.error(`Redis SET错误 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 删除键
   */
  public async del(key: string | string[]): Promise<number> {
    if (!isRedisEnabled()) {
      return Array.isArray(key) ? key.length : 1; // Redis禁用时返回假设的删除数量
    }

    try {
      const client = await this.ensureConnected();
      const keys = Array.isArray(key) ? key : [key];
      return await client.del(keys);
    } catch (error) {
      console.error(`Redis DEL错误:`, error);
      return 0;
    }
  }

  /**
   * 检查键是否存在
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const client = await this.ensureConnected();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS错误 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 设置过期时间
   */
  public async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const client = await this.ensureConnected();
      const result = await client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXPIRE错误 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 获取剩余过期时间
   */
  public async ttl(key: string): Promise<number> {
    try {
      const client = await this.ensureConnected();
      return await client.ttl(key);
    } catch (error) {
      console.error(`Redis TTL错误 [${key}]:`, error);
      return -2;
    }
  }

  // ==================== Hash操作 ====================

  /**
   * 设置Hash字段
   */
  public async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      const client = await this.ensureConnected();
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await client.hSet(key, field, stringValue);
      return true;
    } catch (error) {
      console.error(`Redis HSET错误 [${key}.${field}]:`, error);
      return false;
    }
  }

  /**
   * 获取Hash字段
   */
  public async hget<T = any>(key: string, field: string): Promise<T | null> {
    try {
      const client = await this.ensureConnected();
      const value = await client.hGet(key, field);
      
      if (value === undefined || value === null) {
        return null;
      }

      try {
        return JSON.parse(value as string) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error(`Redis HGET错误 [${key}.${field}]:`, error);
      return null;
    }
  }

  /**
   * 获取Hash所有字段
   */
  public async hgetall<T = any>(key: string): Promise<T | null> {
    try {
      const client = await this.ensureConnected();
      const data = await client.hGetAll(key);
      
      if (!data || Object.keys(data).length === 0) {
        return null;
      }

      // 尝试解析每个字段的JSON
      const result: any = {};
      for (const [field, value] of Object.entries(data)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }
      
      return result as T;
    } catch (error) {
      console.error(`Redis HGETALL错误 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 删除Hash字段
   */
  public async hdel(key: string, field: string | string[]): Promise<number> {
    try {
      const client = await this.ensureConnected();
      const fields = Array.isArray(field) ? field : [field];
      return await client.hDel(key, fields);
    } catch (error) {
      console.error(`Redis HDEL错误 [${key}]:`, error);
      return 0;
    }
  }

  // ==================== Set操作 ====================

  /**
   * 添加Set成员
   */
  public async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      const client = await this.ensureConnected();
      return await client.sAdd(key, members);
    } catch (error) {
      console.error(`Redis SADD错误 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * 获取Set所有成员
   */
  public async smembers(key: string): Promise<string[]> {
    try {
      const client = await this.ensureConnected();
      return await client.sMembers(key);
    } catch (error) {
      console.error(`Redis SMEMBERS错误 [${key}]:`, error);
      return [];
    }
  }

  /**
   * 检查Set成员是否存在
   */
  public async sismember(key: string, member: string): Promise<boolean> {
    try {
      const client = await this.ensureConnected();
      const result = await client.sIsMember(key, member);
      return Boolean(result);
    } catch (error) {
      console.error(`Redis SISMEMBER错误 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 删除Set成员
   */
  public async srem(key: string, ...members: string[]): Promise<number> {
    try {
      const client = await this.ensureConnected();
      return await client.sRem(key, members);
    } catch (error) {
      console.error(`Redis SREM错误 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * 获取Set成员数量
   */
  public async scard(key: string): Promise<number> {
    try {
      const client = await this.ensureConnected();
      return await client.sCard(key);
    } catch (error) {
      console.error(`Redis SCARD错误 [${key}]:`, error);
      return 0;
    }
  }

  // ==================== 计数器操作 ====================

  /**
   * 递增
   */
  public async incr(key: string): Promise<number> {
    try {
      const client = await this.ensureConnected();
      return await client.incr(key);
    } catch (error) {
      console.error(`Redis INCR错误 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * 递减
   */
  public async decr(key: string): Promise<number> {
    try {
      const client = await this.ensureConnected();
      return await client.decr(key);
    } catch (error) {
      console.error(`Redis DECR错误 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * 增加指定值
   */
  public async incrby(key: string, increment: number): Promise<number> {
    try {
      const client = await this.ensureConnected();
      return await client.incrBy(key, increment);
    } catch (error) {
      console.error(`Redis INCRBY错误 [${key}]:`, error);
      return 0;
    }
  }

  // ==================== 分布式锁操作 ====================

  /**
   * 获取分布式锁
   * @param key 锁的键名
   * @param ttl 锁的过期时间（秒）
   * @param retryTimes 重试次数
   * @param retryDelay 重试延迟（毫秒）
   */
  public async acquireLock(
    key: string,
    ttl: number = 30,
    retryTimes: number = 3,
    retryDelay: number = 100
  ): Promise<boolean> {
    try {
      const client = await this.ensureConnected();
      const lockKey = `lock:${key}`;
      const lockValue = `${Date.now()}-${Math.random()}`;

      for (let i = 0; i < retryTimes; i++) {
        // 使用SET NX EX原子操作
        const result = await client.set(lockKey, lockValue, {
          NX: true,
          EX: ttl
        });

        if (result === 'OK') {
          console.log(`🔒 获取锁成功 [${key}]`);
          return true;
        }

        // 等待后重试
        if (i < retryTimes - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }

      console.log(`❌ 获取锁失败 [${key}]，已重试${retryTimes}次`);
      return false;
    } catch (error) {
      console.error(`Redis LOCK错误 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 释放分布式锁
   */
  public async releaseLock(key: string): Promise<boolean> {
    try {
      const client = await this.ensureConnected();
      const lockKey = `lock:${key}`;
      const result = await client.del(lockKey);

      if (result > 0) {
        console.log(`🔓 释放锁成功 [${key}]`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Redis UNLOCK错误 [${key}]:`, error);
      return false;
    }
  }

  // ==================== 批量操作 ====================

  /**
   * 批量获取
   */
  public async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    try {
      const client = await this.ensureConnected();
      const values = await client.mGet(keys);

      return values.map(value => {
        if (value === null || value === undefined) {
          return null;
        }
        try {
          return JSON.parse(value as string) as T;
        } catch {
          return value as T;
        }
      });
    } catch (error) {
      console.error(`Redis MGET错误:`, error);
      return keys.map(() => null);
    }
  }

  /**
   * 批量设置
   */
  public async mset(data: Record<string, any>): Promise<boolean> {
    try {
      const client = await this.ensureConnected();
      const pairs: [string, string][] = Object.entries(data).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value)
      ]);

      await client.mSet(pairs);
      return true;
    } catch (error) {
      console.error(`Redis MSET错误:`, error);
      return false;
    }
  }

  /**
   * 按模式删除键
   */
  public async delPattern(pattern: string): Promise<number> {
    try {
      const client = await this.ensureConnected();
      const keys = await client.keys(pattern);

      if (keys.length === 0) {
        return 0;
      }

      return await client.del(keys);
    } catch (error) {
      console.error(`Redis DEL PATTERN错误 [${pattern}]:`, error);
      return 0;
    }
  }

  // ==================== Sorted Set操作 ====================

  /**
   * 添加Sorted Set成员
   */
  public async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      const client = await this.ensureConnected();
      return await client.zAdd(key, { score, value: member });
    } catch (error) {
      console.error(`Redis ZADD错误 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * 获取Sorted Set范围
   */
  public async zrange(key: string, start: number, stop: number, withScores: boolean = false): Promise<any[]> {
    try {
      const client = await this.ensureConnected();
      if (withScores) {
        return await client.zRangeWithScores(key, start, stop);
      } else {
        return await client.zRange(key, start, stop);
      }
    } catch (error) {
      console.error(`Redis ZRANGE错误 [${key}]:`, error);
      return [];
    }
  }

  /**
   * 删除Sorted Set成员
   */
  public async zrem(key: string, ...members: string[]): Promise<number> {
    try {
      const client = await this.ensureConnected();
      return await client.zRem(key, members);
    } catch (error) {
      console.error(`Redis ZREM错误 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * 增加Sorted Set成员分数
   */
  public async zincrby(key: string, increment: number, member: string): Promise<number> {
    try {
      const client = await this.ensureConnected();
      return await client.zIncrBy(key, increment, member);
    } catch (error) {
      console.error(`Redis ZINCRBY错误 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * 获取Sorted Set范围（从高到低）
   */
  public async zrevrange(key: string, start: number, stop: number, withScores: boolean = false): Promise<any[]> {
    try {
      const client = await this.ensureConnected();
      if (withScores) {
        const results = await client.zRangeWithScores(key, start, stop, { REV: true });
        // 转换为 [member, score, member, score, ...] 格式
        const flattened: any[] = [];
        results.forEach(item => {
          flattened.push(item.value, item.score.toString());
        });
        return flattened;
      } else {
        return await client.zRange(key, start, stop, { REV: true });
      }
    } catch (error) {
      console.error(`Redis ZREVRANGE错误 [${key}]:`, error);
      return [];
    }
  }

  /**
   * 获取成员排名（从高到低）
   */
  public async zrevrank(key: string, member: string): Promise<number | null> {
    try {
      const client = await this.ensureConnected();
      const result = await client.zRevRank(key, member);
      return result !== null ? Number(result) : null;
    } catch (error) {
      console.error(`Redis ZREVRANK错误 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 获取成员分数
   */
  public async zscore(key: string, member: string): Promise<number | null> {
    try {
      const client = await this.ensureConnected();
      return await client.zScore(key, member);
    } catch (error) {
      console.error(`Redis ZSCORE错误 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 获取Sorted Set成员数量
   */
  public async zcard(key: string): Promise<number> {
    try {
      const client = await this.ensureConnected();
      return await client.zCard(key);
    } catch (error) {
      console.error(`Redis ZCARD错误 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * 按分数范围获取成员
   */
  public async zrangebyscore(
    key: string,
    min: number,
    max: number,
    withScores: boolean = false
  ): Promise<any[]> {
    try {
      const client = await this.ensureConnected();
      if (withScores) {
        const results = await client.zRangeByScoreWithScores(key, min, max);
        // 转换为 [member, score, member, score, ...] 格式
        const flattened: any[] = [];
        results.forEach(item => {
          flattened.push(item.value, item.score.toString());
        });
        return flattened;
      } else {
        return await client.zRangeByScore(key, min, max);
      }
    } catch (error) {
      console.error(`Redis ZRANGEBYSCORE错误 [${key}]:`, error);
      return [];
    }
  }

  /**
   * 按排名范围删除成员
   */
  public async zremrangebyrank(key: string, start: number, stop: number): Promise<number> {
    try {
      const client = await this.ensureConnected();
      return await client.zRemRangeByRank(key, start, stop);
    } catch (error) {
      console.error(`Redis ZREMRANGEBYRANK错误 [${key}]:`, error);
      return 0;
    }
  }

  // ==================== 工具方法 ====================

  /**
   * 获取所有匹配的键
   */
  public async keys(pattern: string): Promise<string[]> {
    try {
      const client = await this.ensureConnected();
      return await client.keys(pattern);
    } catch (error) {
      console.error(`Redis KEYS错误 [${pattern}]:`, error);
      return [];
    }
  }

  /**
   * 清空当前数据库
   */
  public async flushdb(): Promise<boolean> {
    try {
      const client = await this.ensureConnected();
      await client.flushDb();
      console.log('🗑️  Redis数据库已清空');
      return true;
    } catch (error) {
      console.error(`Redis FLUSHDB错误:`, error);
      return false;
    }
  }

  /**
   * 获取Redis信息
   */
  public async info(section?: string): Promise<string> {
    try {
      const client = await this.ensureConnected();
      return await client.info(section);
    } catch (error) {
      console.error(`Redis INFO错误:`, error);
      return '';
    }
  }

  /**
   * Ping测试
   */
  public async ping(): Promise<boolean> {
    try {
      const client = await this.ensureConnected();
      const result = await client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error(`Redis PING错误:`, error);
      return false;
    }
  }

  /**
   * 删除key（别名方法）
   */
  public async delete(key: string): Promise<number> {
    return this.del(key);
  }

  /**
   * 扫描所有匹配的key
   * 注意：这是一个便捷方法，会自动处理SCAN迭代
   */
  public async scanAllKeys(pattern: string = '*', batchSize: number = 100): Promise<string[]> {
    try {
      const client = await this.ensureConnected();
      const keys: string[] = [];
      let cursor = 0;  // cursor应该是数字类型

      do {
        const result = await client.scan(cursor as any, {
          MATCH: pattern,
          COUNT: batchSize
        });

        cursor = Number(result.cursor);
        keys.push(...result.keys);
      } while (cursor !== 0);

      return keys;
    } catch (error) {
      console.error(`扫描keys错误 [pattern=${pattern}]:`, error);
      throw error;
    }
  }
}

// 导出单例实例
export default RedisService.getInstance();

