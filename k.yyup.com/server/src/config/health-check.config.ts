/**
 * 健康检查配置
 *
 * 提供详细的系统健康检查端点
 */

import { Sequelize } from 'sequelize';
import { performance } from 'perf_hooks';
import { getMemoryUsage, getEventLoopLag, PERFORMANCE_THRESHOLDS } from './performance-monitor.config';

/**
 * 健康状态
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy'
}

/**
 * 健康检查结果
 */
export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  checks: {
    database: CheckResult;
    memory: CheckResult;
    eventLoop: CheckResult;
    diskSpace?: CheckResult;
    externalServices?: CheckResult[];
  };
}

/**
 * 单项检查结果
 */
export interface CheckResult {
  status: HealthStatus;
  message: string;
  responseTime?: number;
  details?: any;
}

/**
 * 执行健康检查
 */
export async function performHealthChecks(db: Sequelize): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();

  // 并行执行所有检查
  const [database, memory, eventLoop] = await Promise.all([
    checkDatabase(db),
    checkMemory(),
    checkEventLoop()
  ]);

  // 确定整体状态
  const allChecks = [database, memory, eventLoop];
  const hasUnhealthy = allChecks.some(c => c.status === HealthStatus.UNHEALTHY);
  const hasDegraded = allChecks.some(c => c.status === HealthStatus.DEGRADED);

  const overallStatus = hasUnhealthy
    ? HealthStatus.UNHEALTHY
    : hasDegraded
    ? HealthStatus.DEGRADED
    : HealthStatus.HEALTHY;

  return {
    status: overallStatus,
    timestamp,
    uptime,
    checks: {
      database,
      memory,
      eventLoop
    }
  };
}

/**
 * 检查数据库连接
 */
async function checkDatabase(db: Sequelize): Promise<CheckResult> {
  const startTime = performance.now();

  try {
    // 测试查询
    await db.query('SELECT 1');

    const responseTime = performance.now() - startTime;

    // 检查连接池状态
    const connectionManager = db.connectionManager as any;
    const poolSize = connectionManager?.pool?.config?.max || 0;
    const availableConnections = connectionManager?.pool?.availableConnectionsCount || 0;

    if (responseTime > 1000) {
      return {
        status: HealthStatus.DEGRADED,
        message: `数据库响应较慢: ${responseTime.toFixed(2)}ms`,
        responseTime,
        details: {
          poolSize,
          availableConnections
        }
      };
    }

    return {
      status: HealthStatus.HEALTHY,
      message: '数据库连接正常',
      responseTime,
      details: {
        poolSize,
        availableConnections
      }
    };
  } catch (error: any) {
    return {
      status: HealthStatus.UNHEALTHY,
      message: `数据库连接失败: ${error.message}`,
      details: {
        error: error.message
      }
    };
  }
}

/**
 * 检查内存使用
 */
async function checkMemory(): Promise<CheckResult> {
  const startTime = performance.now();
  const memUsage = getMemoryUsage();

  const responseTime = performance.now() - startTime;
  const usagePercent = memUsage.heapUsagePercent;

  if (usagePercent > 95) {
    return {
      status: HealthStatus.UNHEALTHY,
      message: `内存使用率过高: ${usagePercent.toFixed(2)}%`,
      responseTime,
      details: {
        heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        usagePercent
      }
    };
  }

  if (usagePercent > PERFORMANCE_THRESHOLDS.HIGH_MEMORY_PERCENT) {
    return {
      status: HealthStatus.DEGRADED,
      message: `内存使用率较高: ${usagePercent.toFixed(2)}%`,
      responseTime,
      details: {
        heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        usagePercent
      }
    };
  }

  return {
    status: HealthStatus.HEALTHY,
    message: '内存使用正常',
    responseTime,
    details: {
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      usagePercent
    }
  };
}

/**
 * 检查事件循环延迟
 */
async function checkEventLoop(): Promise<CheckResult> {
  const startTime = performance.now();
  const lag = await getEventLoopLag();
  const responseTime = performance.now() - startTime;

  if (lag > 500) {
    return {
      status: HealthStatus.UNHEALTHY,
      message: `事件循环阻塞严重: ${lag}ms`,
      responseTime,
      details: { lag }
    };
  }

  if (lag > PERFORMANCE_THRESHOLDS.HIGH_EVENT_LOOP_LAG_MS) {
    return {
      status: HealthStatus.DEGRADED,
      message: `事件循环延迟较高: ${lag}ms`,
      responseTime,
      details: { lag }
    };
  }

  return {
    status: HealthStatus.HEALTHY,
    message: '事件循环正常',
    responseTime,
    details: { lag }
  };
}

/**
 * 简化的健康检查（用于负载均衡器）
 */
export function simpleHealthCheck(): { status: string } {
  return {
    status: 'ok'
  };
}

/**
 * 就绪检查（检查应用是否准备好接收流量）
 */
export async function readinessCheck(db: Sequelize): Promise<{ ready: boolean }> {
  try {
    // 检查数据库连接
    await db.query('SELECT 1');

    return { ready: true };
  } catch {
    return { ready: false };
  }
}

/**
 * 存活检查（检查应用是否正在运行）
 */
export function livenessCheck(): { alive: boolean } {
  return {
    alive: true
  };
}

/**
 * 导出配置
 */
export default {
  HealthStatus,
  performHealthChecks,
  simpleHealthCheck,
  readinessCheck,
  livenessCheck
};
