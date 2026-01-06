/**
 * 数据库查询超时配置
 *
 * 防止长时间运行的查询占用资源
 */

/**
 * 开发环境检测
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

/**
 * 数据库超时配置（毫秒）
 */
export const DATABASE_TIMEOUTS = {
  // 连接超时
  connectionTimeout: isDevelopment ? 30000 : 10000, // 开发: 30s, 生产: 10s

  // 获取连接超时
  acquireTimeout: isDevelopment ? 60000 : 15000, // 开发: 60s, 生产: 15s

  // 查询超时（默认）
  queryTimeout: isDevelopment ? 60000 : 30000, // 开发: 60s, 生产: 30s

  // 慢查询阈值（用于日志记录）
  slowQueryThreshold: isDevelopment ? 5000 : 1000, // 开发: 5s, 生产: 1s
};

/**
 * 查询类型超时配置
 * 不同类型的查询可能有不同的超时时间
 */
export const QUERY_TYPE_TIMEOUTS = {
  // 简单查询（单条记录）
  simple: isDevelopment ? 5000 : 3000, // 开发: 5s, 生产: 3s

  // 列表查询（多条记录）
  list: isDevelopment ? 10000 : 5000, // 开发: 10s, 生产: 5s

  // 聚合查询（统计、分组等）
  aggregate: isDevelopment ? 15000 : 8000, // 开发: 15s, 生产: 8s

  // 报表查询（复杂报表）
  report: isDevelopment ? 30000 : 15000, // 开发: 30s, 生产: 15s

  // 导出查询（大量数据）
  export: isDevelopment ? 120000 : 60000, // 开发: 2分钟, 生产: 1分钟
};

/**
 * Sequelize查询选项增强
 *
 * @param queryType 查询类型
 * @param customTimeout 自定义超时时间（可选）
 * @returns Sequelize查询选项
 */
export function getQueryOptions(
  queryType: keyof typeof QUERY_TYPE_TIMEOUTS = 'simple',
  customTimeout?: number
): { timeout: number; benchmark: boolean; logging?: boolean } {
  const timeout = customTimeout || QUERY_TYPE_TIMEOUTS[queryType];

  return {
    timeout,
    benchmark: true, // 启用基准测试（记录查询时间）
    logging: isDevelopment
      ? ((sql: string, timing?: number) => {
          if (timing && timing > DATABASE_TIMEOUTS.slowQueryThreshold) {
            console.warn(`⚠️ 慢查询检测 (${timing}ms):`, sql.substring(0, 200));
          }
        }) as any
      : false
  };
}

/**
 * 包装Sequelize查询方法，添加超时和慢查询监控
 *
 * @param model Sequelize模型
 * @param method 查询方法名（如 'findAll', 'findOne'）
 * @param queryType 查询类型
 * @returns 包装后的查询方法
 */
export function wrapQueryWithTimeout<T extends Record<string, any>>(
  model: T,
  method: keyof T,
  queryType: keyof typeof QUERY_TYPE_TIMEOUTS = 'simple'
): any {
  const originalMethod = model[method];

  return function (this: any, ...args: any[]) {
    // 获取超时配置
    const options = getQueryOptions(queryType);

    // 如果最后一个参数是选项对象，合并超时配置
    if (args.length > 0 && typeof args[args.length - 1] === 'object') {
      args[args.length - 1] = {
        ...args[args.length - 1],
        ...options
      };
    } else {
      args.push({ ...options });
    }

    // 调用原始方法
    return originalMethod.apply(this, args);
  };
}

/**
 * 创建带超时的查询函数
 *
 * @param queryFn 查询函数
 * @param timeoutMs 超时时间（毫秒）
 * @returns 包装后的查询函数
 */
export function createTimeoutQuery<T>(
  queryFn: () => Promise<T>,
  timeoutMs: number = DATABASE_TIMEOUTS.queryTimeout
): Promise<T> {
  return Promise.race([
    queryFn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`查询超时 (${timeoutMs}ms)`)), timeoutMs)
    )
  ]);
}

/**
 * 慢查询日志记录器
 */
export class SlowQueryLogger {
  private threshold: number;

  constructor(threshold: number = DATABASE_TIMEOUTS.slowQueryThreshold) {
    this.threshold = threshold;
  }

  /**
   * 记录查询时间
   */
  log(sql: string, duration: number): void {
    if (duration > this.threshold) {
      console.warn(`⚠️ 慢查询 (${duration}ms > ${this.threshold}ms):`, {
        sql: sql.substring(0, 200),
        duration
      });
    }
  }

  /**
   * 更新阈值
   */
  setThreshold(threshold: number): void {
    this.threshold = threshold;
  }
}

/**
 * 导出单例实例
 */
export const slowQueryLogger = new SlowQueryLogger();

/**
 * 导出配置
 */
export default {
  DATABASE_TIMEOUTS,
  QUERY_TYPE_TIMEOUTS,
  getQueryOptions,
  wrapQueryWithTimeout,
  createTimeoutQuery,
  SlowQueryLogger,
  slowQueryLogger
};
