/**
 * Redis配置文件
 * 
 * 支持三种模式：
 * 1. Standalone - 单机模式（开发环境）
 * 2. Sentinel - 哨兵模式（生产环境推荐）
 * 3. Cluster - 集群模式（大规模部署）
 */

import { RedisClientOptions } from 'redis';

// Redis连接模式
export enum RedisMode {
  STANDALONE = 'standalone',
  SENTINEL = 'sentinel',
  CLUSTER = 'cluster'
}

// Redis配置接口
export interface RedisConfig {
  mode: RedisMode;
  standalone?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  sentinel?: {
    sentinels: Array<{ host: string; port: number }>;
    name: string;
    password?: string;
    db?: number;
  };
  cluster?: {
    nodes: Array<{ host: string; port: number }>;
    password?: string;
  };
  options?: {
    connectTimeout?: number;
    commandTimeout?: number;
    retryStrategy?: (retries: number) => number | Error;
    maxRetriesPerRequest?: number;
  };
}

/**
 * 检查Redis是否启用
 */
export function isRedisEnabled(): boolean {
  const enabled = process.env.REDIS_ENABLED;
  if (enabled === undefined) {
    return true; // 默认启用
  }
  return enabled.toLowerCase() === 'true';
}

/**
 * 获取Redis配置
 */
export function getRedisConfig(): RedisConfig {
  const mode = (process.env.REDIS_MODE || RedisMode.STANDALONE) as RedisMode;

  const config: RedisConfig = {
    mode,
    options: {
      connectTimeout: 30000, // 30秒连接超时（更宽松）
      commandTimeout: 10000, // 10秒命令超时（更宽松）
      maxRetriesPerRequest: 5, // 增加重试次数
      retryStrategy: (retries: number) => {
        if (retries > 20) { // 增加最大重试次数
          return new Error('Redis连接重试次数过多');
        }
        return Math.min(retries * 100, 5000); // 更长的重试间隔，最多等待5秒
      }
    }
  };

  // 根据模式配置
  switch (mode) {
    case RedisMode.STANDALONE:
      config.standalone = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0')
      };
      break;

    case RedisMode.SENTINEL:
      const sentinelHosts = process.env.REDIS_SENTINEL_HOSTS?.split(',') || [];
      config.sentinel = {
        sentinels: sentinelHosts.map(host => {
          const [h, p] = host.split(':');
          return { host: h, port: parseInt(p || '26379') };
        }),
        name: process.env.REDIS_SENTINEL_NAME || 'mymaster',
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0')
      };
      break;

    case RedisMode.CLUSTER:
      const clusterNodes = process.env.REDIS_CLUSTER_NODES?.split(',') || [];
      config.cluster = {
        nodes: clusterNodes.map(node => {
          const [h, p] = node.split(':');
          return { host: h, port: parseInt(p || '6379') };
        }),
        password: process.env.REDIS_PASSWORD
      };
      break;
  }

  return config;
}

/**
 * 转换为redis客户端配置
 */
export function toRedisClientOptions(config: RedisConfig): RedisClientOptions {
  const baseOptions: RedisClientOptions = {
    socket: {
      connectTimeout: config.options?.connectTimeout,
      reconnectStrategy: (retries: number) => {
        if (retries > 20) { // 与上面保持一致
          return new Error('Redis连接重试次数过多');
        }
        return Math.min(retries * 100, 5000); // 与上面保持一致
      },
      // 添加更多稳定性配置
      keepAlive: true,
      noDelay: true
    },
    // 添加更宽松的配置
    commandsQueueMaxLength: 1000
  };

  // 根据模式配置
  switch (config.mode) {
    case RedisMode.STANDALONE:
      if (config.standalone) {
        return {
          ...baseOptions,
          socket: {
            ...baseOptions.socket,
            host: config.standalone.host,
            port: config.standalone.port
          },
          password: config.standalone.password,
          database: config.standalone.db
        };
      }
      break;

    case RedisMode.SENTINEL:
      if (config.sentinel) {
        // Redis v5不直接支持Sentinel，需要使用@redis/client
        // 这里先返回第一个sentinel的配置
        const firstSentinel = config.sentinel.sentinels[0];
        return {
          ...baseOptions,
          socket: {
            ...baseOptions.socket,
            host: firstSentinel.host,
            port: firstSentinel.port
          },
          password: config.sentinel.password,
          database: config.sentinel.db
        };
      }
      break;

    case RedisMode.CLUSTER:
      if (config.cluster) {
        // Redis v5的Cluster配置
        const firstNode = config.cluster.nodes[0];
        return {
          ...baseOptions,
          socket: {
            ...baseOptions.socket,
            host: firstNode.host,
            port: firstNode.port
          },
          password: config.cluster.password
        };
      }
      break;
  }

  throw new Error(`无效的Redis配置模式: ${config.mode}`);
}

/**
 * Redis缓存TTL配置（秒）
 */
export const RedisTTL = {
  // 权限相关
  USER_PERMISSIONS: 30 * 60,      // 30分钟
  ROLE_PERMISSIONS: 30 * 60,      // 30分钟
  DYNAMIC_ROUTES: 30 * 60,        // 30分钟
  PERMISSION_CHECK: 15 * 60,      // 15分钟
  PATH_PERMISSION: 15 * 60,       // 15分钟
  USER_PERMISSION_INFO: 30 * 60,  // 30分钟

  // 会话管理相关
  TOKEN_BLACKLIST: 24 * 60 * 60,  // 24小时（与Token过期时间一致）
  USER_SESSION: 24 * 60 * 60,     // 24小时
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7天
  SESSION: 24 * 60 * 60,          // 24小时
  ONLINE_USER: 30 * 60,           // 30分钟

  // 中心页面缓存
  DASHBOARD_CENTER: 5 * 60,       // 5分钟（实时数据）
  DASHBOARD: 5 * 60,              // 5分钟
  TASK_CENTER: 5 * 60,            // 5分钟（实时数据）
  ACTIVITY_CENTER: 10 * 60,       // 10分钟（高频访问）
  ENROLLMENT_CENTER: 10 * 60,     // 10分钟（高频访问）
  PERSONNEL_CENTER: 15 * 60,      // 15分钟（高频访问）
  MARKETING_CENTER: 15 * 60,      // 15分钟（高频访问）
  SYSTEM_CENTER: 60 * 60,         // 1小时（低频访问）
  CUSTOMER_POOL: 10 * 60,         // 10分钟
  CUSTOMER_POOL_CENTER: 10 * 60,  // 10分钟（高频访问）
  ANALYTICS_CENTER: 30 * 60,      // 30分钟
  FINANCE_CENTER: 15 * 60,        // 15分钟
  SCRIPT_CENTER: 60 * 60,         // 1小时
  TEACHING_CENTER: 15 * 60,       // 15分钟
  MEDIA_CENTER: 15 * 60,          // 15分钟
  BUSINESS_CENTER: 10 * 60,       // 10分钟
  DEFAULT_CENTER: 15 * 60,        // 15分钟（默认）

  // 数据缓存
  USER_DETAIL: 15 * 60,           // 15分钟
  STUDENT_DETAIL: 15 * 60,        // 15分钟
  TEACHER_DETAIL: 15 * 60,        // 15分钟
  CLASS_DETAIL: 15 * 60,          // 15分钟
  ACTIVITY_DETAIL: 10 * 60,       // 10分钟

  // 列表缓存
  LIST_SHORT: 5 * 60,             // 5分钟（高频更新）
  LIST_MEDIUM: 15 * 60,           // 15分钟（中频更新）
  LIST_LONG: 60 * 60,             // 1小时（低频更新）

  // 统计数据
  STATS_REALTIME: 1 * 60,         // 1分钟（实时统计）
  STATS_HOURLY: 60 * 60,          // 1小时（小时统计）
  STATS_DAILY: 24 * 60 * 60,      // 24小时（日统计）

  // 限流
  RATE_LIMIT_MINUTE: 60,          // 1分钟
  RATE_LIMIT_HOUR: 60 * 60,       // 1小时
  RATE_LIMIT_DAY: 24 * 60 * 60,   // 24小时

  // 分布式锁
  LOCK_SHORT: 10,                 // 10秒
  LOCK_MEDIUM: 30,                // 30秒
  LOCK_LONG: 5 * 60,              // 5分钟
};

/**
 * Redis Key前缀
 */
export const RedisKeyPrefix = {
  // 权限
  USER_PERMISSIONS: 'user:permissions:',
  ROLE_PERMISSIONS: 'role:permissions:',
  DYNAMIC_ROUTES: 'user:routes:',
  PERMISSION_CHECK: 'permission:check:',
  PATH_PERMISSION: 'permission:path:',
  USER_PERMISSION_INFO: 'user:permission:info:',

  // 会话
  SESSION: 'session:',
  TOKEN_BLACKLIST: 'token:blacklist:',
  ONLINE_USER: 'online:user:',
  ONLINE_USERS_SET: 'online:users',

  // 中心页面
  CENTER: 'center:',
  TEACHER_CENTER: 'teacher-center:',

  // 数据缓存
  USER: 'user:',
  STUDENT: 'student:',
  TEACHER: 'teacher:',
  CLASS: 'class:',
  ACTIVITY: 'activity:',

  // 限流
  RATE_LIMIT: 'ratelimit:',

  // 分布式锁
  LOCK: 'lock:',

  // 排行榜
  RANKING: 'ranking:',

  // 计数器
  COUNTER: 'counter:',
};

export default {
  getRedisConfig,
  toRedisClientOptions,
  RedisTTL,
  RedisKeyPrefix,
  RedisMode
};

