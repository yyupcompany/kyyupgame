/**
 * 性能监控服务
 * 负责收集、分析和报告系统性能指标
 */

import { logger } from '../../../utils/logger';

export interface PerformanceMetric {
  serviceName: string;
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface ServiceStats {
  serviceName: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  p50Duration: number;
  p95Duration: number;
  p99Duration: number;
  errorRate: number;
  requestsPerMinute: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, ServiceStats>;
  overallErrorRate: number;
  overallAverageDuration: number;
  timestamp: number;
}

/**
 * 性能监控服务类
 */
export class PerformanceMonitorService {
  private static instance: PerformanceMonitorService;
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 10000; // 最多保留10000条指标
  private readonly METRIC_RETENTION_TIME = 60 * 60 * 1000; // 1小时保留时间

  private constructor() {
    logger.info('✅ [性能监控] 性能监控服务初始化完成');
    
    // 定期清理过期指标
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 5 * 60 * 1000); // 每5分钟清理一次
  }

  /**
   * 获取单例实例
   */
  static getInstance(): PerformanceMonitorService {
    if (!PerformanceMonitorService.instance) {
      PerformanceMonitorService.instance = new PerformanceMonitorService();
    }
    return PerformanceMonitorService.instance;
  }

  /**
   * 记录性能指标
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // 如果超过最大数量，删除最旧的
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // 记录慢请求
    if (metric.duration > 3000) {
      logger.warn(`⚠️ [性能监控] 慢请求: ${metric.serviceName}.${metric.operation} (${metric.duration}ms)`);
    }

    // 记录失败请求
    if (!metric.success) {
      logger.error(`❌ [性能监控] 失败请求: ${metric.serviceName}.${metric.operation}`);
    }
  }

  /**
   * 开始追踪操作
   */
  startTrace(serviceName: string, operation: string): () => void {
    const startTime = Date.now();

    return (success: boolean = true, metadata?: Record<string, any>) => {
      const duration = Date.now() - startTime;
      
      this.recordMetric({
        serviceName,
        operation,
        duration,
        timestamp: Date.now(),
        success,
        metadata
      });
    };
  }

  /**
   * 获取服务统计
   */
  getServiceStats(serviceName: string, timeWindow?: number): ServiceStats | null {
    const windowStart = timeWindow ? Date.now() - timeWindow : 0;
    const serviceMetrics = this.metrics.filter(
      m => m.serviceName === serviceName && m.timestamp >= windowStart
    );

    if (serviceMetrics.length === 0) {
      return null;
    }

    const totalRequests = serviceMetrics.length;
    const successfulRequests = serviceMetrics.filter(m => m.success).length;
    const failedRequests = totalRequests - successfulRequests;

    const durations = serviceMetrics.map(m => m.duration).sort((a, b) => a - b);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);

    const p50Index = Math.floor(durations.length * 0.5);
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    // 计算每分钟请求数
    const timeSpan = timeWindow || this.METRIC_RETENTION_TIME;
    const requestsPerMinute = (totalRequests / (timeSpan / 60000));

    return {
      serviceName,
      totalRequests,
      successfulRequests,
      failedRequests,
      averageDuration: totalDuration / totalRequests,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      p50Duration: durations[p50Index],
      p95Duration: durations[p95Index],
      p99Duration: durations[p99Index],
      errorRate: (failedRequests / totalRequests) * 100,
      requestsPerMinute
    };
  }

  /**
   * 获取所有服务统计
   */
  getAllServiceStats(timeWindow?: number): Record<string, ServiceStats> {
    const serviceNames = [...new Set(this.metrics.map(m => m.serviceName))];
    const stats: Record<string, ServiceStats> = {};

    serviceNames.forEach(serviceName => {
      const serviceStats = this.getServiceStats(serviceName, timeWindow);
      if (serviceStats) {
        stats[serviceName] = serviceStats;
      }
    });

    return stats;
  }

  /**
   * 获取系统健康状态
   */
  getSystemHealth(timeWindow?: number): SystemHealth {
    const services = this.getAllServiceStats(timeWindow);
    const serviceList = Object.values(services);

    if (serviceList.length === 0) {
      return {
        status: 'healthy',
        services: {},
        overallErrorRate: 0,
        overallAverageDuration: 0,
        timestamp: Date.now()
      };
    }

    // 计算整体指标
    const totalRequests = serviceList.reduce((sum, s) => sum + s.totalRequests, 0);
    const totalErrors = serviceList.reduce((sum, s) => sum + s.failedRequests, 0);
    const totalDuration = serviceList.reduce((sum, s) => sum + (s.averageDuration * s.totalRequests), 0);

    const overallErrorRate = (totalErrors / totalRequests) * 100;
    const overallAverageDuration = totalDuration / totalRequests;

    // 判断健康状态
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (overallErrorRate > 10 || overallAverageDuration > 5000) {
      status = 'unhealthy';
    } else if (overallErrorRate > 5 || overallAverageDuration > 3000) {
      status = 'degraded';
    }

    return {
      status,
      services,
      overallErrorRate,
      overallAverageDuration,
      timestamp: Date.now()
    };
  }

  /**
   * 获取慢请求
   */
  getSlowRequests(threshold: number = 3000, limit: number = 10): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.duration > threshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * 获取失败请求
   */
  getFailedRequests(limit: number = 10): PerformanceMetric[] {
    return this.metrics
      .filter(m => !m.success)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * 获取操作统计
   */
  getOperationStats(serviceName: string, operation: string, timeWindow?: number): {
    count: number;
    averageDuration: number;
    successRate: number;
  } | null {
    const windowStart = timeWindow ? Date.now() - timeWindow : 0;
    const operationMetrics = this.metrics.filter(
      m => m.serviceName === serviceName && 
           m.operation === operation && 
           m.timestamp >= windowStart
    );

    if (operationMetrics.length === 0) {
      return null;
    }

    const successCount = operationMetrics.filter(m => m.success).length;
    const totalDuration = operationMetrics.reduce((sum, m) => sum + m.duration, 0);

    return {
      count: operationMetrics.length,
      averageDuration: totalDuration / operationMetrics.length,
      successRate: (successCount / operationMetrics.length) * 100
    };
  }

  /**
   * 清理过期指标
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.METRIC_RETENTION_TIME;
    const beforeCount = this.metrics.length;
    
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoffTime);
    
    const cleaned = beforeCount - this.metrics.length;
    if (cleaned > 0) {
      logger.info(`🧹 [性能监控] 清理了 ${cleaned} 条过期指标`);
    }
  }

  /**
   * 清空所有指标
   */
  clearAllMetrics(): void {
    const count = this.metrics.length;
    this.metrics = [];
    logger.info(`🧹 [性能监控] 清空所有指标: ${count} 条`);
  }

  /**
   * 获取监控统计
   */
  getMonitorStats(): {
    totalMetrics: number;
    oldestMetric: number;
    newestMetric: number;
    retentionTime: number;
  } {
    return {
      totalMetrics: this.metrics.length,
      oldestMetric: this.metrics.length > 0 ? this.metrics[0].timestamp : 0,
      newestMetric: this.metrics.length > 0 ? this.metrics[this.metrics.length - 1].timestamp : 0,
      retentionTime: this.METRIC_RETENTION_TIME
    };
  }

  /**
   * 生成性能报告
   */
  generateReport(timeWindow?: number): string {
    const health = this.getSystemHealth(timeWindow);
    const slowRequests = this.getSlowRequests(3000, 5);
    const failedRequests = this.getFailedRequests(5);

    let report = '# 性能监控报告\n\n';
    report += `生成时间: ${new Date().toISOString()}\n`;
    report += `系统状态: ${health.status}\n`;
    report += `整体错误率: ${health.overallErrorRate.toFixed(2)}%\n`;
    report += `平均响应时间: ${health.overallAverageDuration.toFixed(2)}ms\n\n`;

    report += '## 服务统计\n\n';
    Object.values(health.services).forEach(service => {
      report += `### ${service.serviceName}\n`;
      report += `- 总请求: ${service.totalRequests}\n`;
      report += `- 成功率: ${((service.successfulRequests / service.totalRequests) * 100).toFixed(2)}%\n`;
      report += `- 平均耗时: ${service.averageDuration.toFixed(2)}ms\n`;
      report += `- P95耗时: ${service.p95Duration.toFixed(2)}ms\n`;
      report += `- 每分钟请求: ${service.requestsPerMinute.toFixed(2)}\n\n`;
    });

    if (slowRequests.length > 0) {
      report += '## 慢请求 (Top 5)\n\n';
      slowRequests.forEach((req, index) => {
        report += `${index + 1}. ${req.serviceName}.${req.operation} - ${req.duration}ms\n`;
      });
      report += '\n';
    }

    if (failedRequests.length > 0) {
      report += '## 失败请求 (最近5条)\n\n';
      failedRequests.forEach((req, index) => {
        report += `${index + 1}. ${req.serviceName}.${req.operation} - ${new Date(req.timestamp).toISOString()}\n`;
      });
    }

    return report;
  }
}

// 导出单例
export const performanceMonitor = PerformanceMonitorService.getInstance();

