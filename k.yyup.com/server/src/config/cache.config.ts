/**
 * 缓存机制配置
 *
 * 提供统一的缓存接口，支持内存和Redis
 */

import { CACHE_KEYS, CACHE_TTL } from '../constants/business.constants';

/**
 * 缓存适配器接口
 */
export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
  clear(pattern?: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

/**
 * 内存缓存实现
 */
class MemoryCacheAdapter implements CacheAdapter {
  private cache: Map<string, { value: any; expiresAt: number }> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      await this.del(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
    const expiresAt = Date.now() + ttl * 1000;

    this.cache.set(key, { value, expiresAt });

    // 清除旧的定时器
    const oldTimer = this.timers.get(key);
    if (oldTimer) {
      clearTimeout(oldTimer);
    }

    // 设置新的过期定时器
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttl * 1000);

    this.timers.set(key, timer);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);

    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  async clear(pattern?: string): Promise<void> {
    if (pattern) {
      const keysToDelete = await this.keys(pattern);
      for (const key of keysToDelete) {
        await this.del(key);
      }
    } else {
      this.cache.clear();
      this.timers.clear();
    }
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key);
  }
}

/**
 * Redis缓存实现（需要redis客户端）
 */
class RedisCacheAdapter implements CacheAdapter {
  constructor(private redis: any) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern);
  }

  async clear(pattern?: string): Promise<void> {
    if (pattern) {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } else {
      // 清空所有缓存（谨慎使用）
      await this.redis.flushdb();
    }
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }
}

/**
 * 缓存管理器
 */
export class CacheManager {
  private adapter: CacheAdapter;

  constructor(adapter?: CacheAdapter) {
    // 优先使用Redis，否则使用内存缓存
    if (adapter) {
      this.adapter = adapter;
    } else {
      this.adapter = new MemoryCacheAdapter();
    }
  }

  /**
   * 获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    return this.adapter.get<T>(key);
  }

  /**
   * 设置缓存
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    return this.adapter.set(key, value, ttl);
  }

  /**
   * 删除缓存
   */
  async del(key: string): Promise<void> {
    return this.adapter.del(key);
  }

  /**
   * 获取或设置缓存（Cache-Aside模式）
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);

    return value;
  }

  /**
   * 批量获取
   */
  async getMany<T>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>();

    for (const key of keys) {
      const value = await this.get<T>(key);
      if (value !== null) {
        result.set(key, value);
      }
    }

    return result;
  }

  /**
   * 批量设置
   */
  async setMany<T>(entries: Map<string, T>, ttl?: number): Promise<void> {
    const promises = Array.from(entries.entries()).map(([key, value]) =>
      this.set(key, value, ttl)
    );

    await Promise.all(promises);
  }

  /**
   * 按模式清除缓存
   */
  async clearPattern(pattern: string): Promise<void> {
    return this.adapter.clear(pattern);
  }

  /**
   * 检查缓存是否存在
   */
  async exists(key: string): Promise<boolean> {
    return this.adapter.exists(key);
  }

  /**
   * 命名空间缓存操作
   */
  async namespaced(namespace: string) {
    return {
      get: <T>(key: string) => this.get<T>(`${namespace}:${key}`),
      set: <T>(key: string, value: T, ttl?: number) => this.set(`${namespace}:${key}`, value, ttl),
      del: (key: string) => this.del(`${namespace}:${key}`),
      clear: () => this.clearPattern(`${namespace}:*`)
    };
  }
}

/**
 * 创建默认缓存管理器
 */
let defaultCacheManager: CacheManager;

export function getCacheManager(): CacheManager {
  if (!defaultCacheManager) {
    // 尝试使用Redis（如果配置了）
    if (process.env.REDIS_HOST) {
      try {
        const Redis = require('redis');
        const redisClient = Redis.createClient({
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '6379')
        });
        defaultCacheManager = new CacheManager(new RedisCacheAdapter(redisClient));
        console.log('✅ 使用Redis缓存');
      } catch (error) {
        console.warn('⚠️ Redis连接失败，使用内存缓存:', error);
        defaultCacheManager = new CacheManager();
      }
    } else {
      defaultCacheManager = new CacheManager();
      console.log('✅ 使用内存缓存');
    }
  }

  return defaultCacheManager;
}

/**
 * 缓存装饰器工厂
 */
export function Cached(ttl: number = CACHE_TTL.MEDIUM) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = getCacheManager();
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;

      // 尝试从缓存获取
      const cached = await cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args);

      // 缓存结果
      await cache.set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * 缓存预热
 */
export async function warmUpCache(): Promise<void> {
  const cache = getCacheManager();

  // 预热常用数据
  // 例如：系统配置、权限列表等

  console.log('✅ 缓存预热完成');
}

/**
 * 导出配置
 */
export default {
  CacheManager,
  MemoryCacheAdapter,
  RedisCacheAdapter,
  getCacheManager,
  Cached,
  warmUpCache,
  CACHE_KEYS,
  CACHE_TTL
};
