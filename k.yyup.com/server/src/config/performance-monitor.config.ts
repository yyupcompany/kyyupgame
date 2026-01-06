/**
 * 性能监控配置
 *
 * 监控应用程序性能指标
 */

import { EventEmitter } from 'events';

/**
 * 性能指标类型
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMING = 'timing'
}

/**
 * 性能指标接口
 */
export interface PerformanceMetric {
  name: string;
  type: MetricType;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

/**
 * 性能统计数据
 */
export interface PerformanceStats {
  requestCount: number;
  errorCount: number;
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: number;
}

/**
 * 请求响应时间数据
 */
const responseTimes: number[] = [];

/**
 * 性能监控事件发射器
 */
export const performanceEmitter = new EventEmitter();

/**
 * 记录请求响应时间
 */
export function recordResponseTime(duration: number): void {
  responseTimes.push(duration);

  // 只保留最近1000次请求的数据
  if (responseTimes.length > 1000) {
    responseTimes.shift();
  }

  // 发出响应时间事件
  performanceEmitter.emit('responseTime', {
    value: duration,
    timestamp: Date.now()
  });
}

/**
 * 计算百分位数
 */
export function calculatePercentile(data: number[], percentile: number): number {
  if (data.length === 0) return 0;

  const sorted = [...data].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;

  return sorted[index];
}

/**
 * 获取性能统计
 */
export function getPerformanceStats(): PerformanceStats {
  const memoryUsage = process.memoryUsage();
  const responseTimeStats = {
    avg: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0,
    min: Math.min(...responseTimes) || 0,
    max: Math.max(...responseTimes) || 0,
    p50: calculatePercentile(responseTimes, 50),
    p95: calculatePercentile(responseTimes, 95),
    p99: calculatePercentile(responseTimes, 99)
  };

  return {
    requestCount: responseTimes.length,
    errorCount: 0, // 需要从错误计数器获取
    avgResponseTime: responseTimeStats.avg,
    maxResponseTime: responseTimeStats.max,
    minResponseTime: responseTimeStats.min,
    p50ResponseTime: responseTimeStats.p50,
    p95ResponseTime: responseTimeStats.p95,
    p99ResponseTime: responseTimeStats.p99,
    memoryUsage,
    cpuUsage: 0 // CPU使用率需要额外计算
  };
}

/**
 * 性能监控中间件
 */
export function performanceMonitorMiddleware(req: any, res: any, next: any) {
  const startTime = Date.now();

  // 监听响应完成事件
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    recordResponseTime(duration);

    // 记录慢请求
    if (duration > 3000) {
      console.warn(`[性能] 慢请求检测: ${req.method} ${req.path} - ${duration}ms`);
    }

    performanceEmitter.emit('requestComplete', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      timestamp: Date.now()
    });
  });

  next();
}

/**
 * 内存使用监控
 */
export function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: usage.rss,
    heapTotal: usage.heapTotal,
    heapUsed: usage.heapUsed,
    external: usage.external,
    arrayBuffers: usage.arrayBuffers,
    // 计算使用百分比
    heapUsagePercent: (usage.heapUsed / usage.heapTotal) * 100
  };
}

/**
 * 事件循环延迟监控
 */
export function getEventLoopLag(): Promise<number> {
  return new Promise((resolve) => {
    const start = Date.now();
    setImmediate(() => {
      const lag = Date.now() - start;
      resolve(lag);
    });
  });
}

/**
 * HTTP请求统计
 */
export interface HttpRequestStats {
  total: number;
  byMethod: Record<string, number>;
  byStatus: Record<number, number>;
  byPath: Record<string, number>;
}

const requestStats: HttpRequestStats = {
  total: 0,
  byMethod: {},
  byStatus: {},
  byPath: {}
};

/**
 * 更新请求统计
 */
export function updateRequestStats(
  method: string,
  path: string,
  statusCode: number
): void {
  requestStats.total++;

  requestStats.byMethod[method] = (requestStats.byMethod[method] || 0) + 1;
  requestStats.byStatus[statusCode] = (requestStats.byStatus[statusCode] || 0) + 1;
  requestStats.byPath[path] = (requestStats.byPath[path] || 0) + 1;
}

/**
 * 获取请求统计
 */
export function getRequestStats(): HttpRequestStats {
  return { ...requestStats };
}

/**
 * 性能警报阈值
 */
export const PERFORMANCE_THRESHOLDS = {
  SLOW_REQUEST_MS: 3000,
  HIGH_MEMORY_PERCENT: 85,
  HIGH_EVENT_LOOP_LAG_MS: 100,
  HIGH_ERROR_RATE: 0.05 // 5%
} as const;

/**
 * 检查性能阈值
 */
export function checkPerformanceThresholds(): string[] {
  const alerts: string[] = [];
  const stats = getPerformanceStats();
  const memUsage = getMemoryUsage();

  // 检查内存使用
  if (memUsage.heapUsagePercent > PERFORMANCE_THRESHOLDS.HIGH_MEMORY_PERCENT) {
    alerts.push(`高内存使用率: ${memUsage.heapUsagePercent.toFixed(2)}%`);
  }

  // 检查P95响应时间
  if (stats.p95ResponseTime > PERFORMANCE_THRESHOLDS.SLOW_REQUEST_MS) {
    alerts.push(`高P95响应时间: ${stats.p95ResponseTime}ms`);
  }

  return alerts;
}

/**
 * 导出配置
 */
export default {
  MetricType,
  performanceEmitter,
  recordResponseTime,
  getPerformanceStats,
  performanceMonitorMiddleware,
  getMemoryUsage,
  getEventLoopLag,
  updateRequestStats,
  getRequestStats,
  PERFORMANCE_THRESHOLDS,
  checkPerformanceThresholds
};
