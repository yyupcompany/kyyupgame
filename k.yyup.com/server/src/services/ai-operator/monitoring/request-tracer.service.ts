/**
 * 请求追踪服务
 * 负责追踪请求的完整生命周期
 */

import { logger } from '../../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface TraceSpan {
  spanId: string;
  parentSpanId?: string;
  serviceName: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'success' | 'error';
  error?: string;
  metadata?: Record<string, any>;
}

export interface Trace {
  traceId: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  spans: TraceSpan[];
  status: 'pending' | 'success' | 'error';
}

/**
 * 请求追踪服务类
 */
export class RequestTracerService {
  private static instance: RequestTracerService;
  private traces: Map<string, Trace> = new Map();
  private readonly MAX_TRACES = 1000; // 最多保留1000条追踪
  private readonly TRACE_RETENTION_TIME = 60 * 60 * 1000; // 1小时保留时间

  private constructor() {
    logger.info('✅ [请求追踪] 请求追踪服务初始化完成');
    
    // 定期清理过期追踪
    setInterval(() => {
      this.cleanupOldTraces();
    }, 5 * 60 * 1000); // 每5分钟清理一次
  }

  /**
   * 获取单例实例
   */
  static getInstance(): RequestTracerService {
    if (!RequestTracerService.instance) {
      RequestTracerService.instance = new RequestTracerService();
    }
    return RequestTracerService.instance;
  }

  /**
   * 开始追踪
   */
  startTrace(userId?: string): string {
    const traceId = uuidv4();
    
    const trace: Trace = {
      traceId,
      userId,
      startTime: Date.now(),
      spans: [],
      status: 'pending'
    };

    this.traces.set(traceId, trace);

    // 如果超过最大数量，删除最旧的
    if (this.traces.size > this.MAX_TRACES) {
      const oldestTraceId = this.traces.keys().next().value;
      this.traces.delete(oldestTraceId);
    }

    logger.info(`🔍 [请求追踪] 开始追踪: ${traceId}`);
    return traceId;
  }

  /**
   * 结束追踪
   */
  endTrace(traceId: string, status: 'success' | 'error' = 'success'): void {
    const trace = this.traces.get(traceId);
    if (!trace) {
      logger.warn(`⚠️ [请求追踪] 追踪未找到: ${traceId}`);
      return;
    }

    trace.endTime = Date.now();
    trace.duration = trace.endTime - trace.startTime;
    trace.status = status;

    logger.info(`✅ [请求追踪] 追踪结束: ${traceId} (${trace.duration}ms, ${status})`);
  }

  /**
   * 开始span
   */
  startSpan(
    traceId: string,
    serviceName: string,
    operation: string,
    parentSpanId?: string,
    metadata?: Record<string, any>
  ): string {
    const trace = this.traces.get(traceId);
    if (!trace) {
      logger.warn(`⚠️ [请求追踪] 追踪未找到: ${traceId}`);
      return '';
    }

    const spanId = uuidv4();
    const span: TraceSpan = {
      spanId,
      parentSpanId,
      serviceName,
      operation,
      startTime: Date.now(),
      status: 'pending',
      metadata
    };

    trace.spans.push(span);
    return spanId;
  }

  /**
   * 结束span
   */
  endSpan(
    traceId: string,
    spanId: string,
    status: 'success' | 'error' = 'success',
    error?: string
  ): void {
    const trace = this.traces.get(traceId);
    if (!trace) {
      return;
    }

    const span = trace.spans.find(s => s.spanId === spanId);
    if (!span) {
      return;
    }

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;
    if (error) {
      span.error = error;
    }
  }

  /**
   * 获取追踪
   */
  getTrace(traceId: string): Trace | null {
    return this.traces.get(traceId) || null;
  }

  /**
   * 获取用户的追踪
   */
  getUserTraces(userId: string, limit: number = 10): Trace[] {
    return Array.from(this.traces.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);
  }

  /**
   * 获取慢追踪
   */
  getSlowTraces(threshold: number = 5000, limit: number = 10): Trace[] {
    return Array.from(this.traces.values())
      .filter(t => t.duration && t.duration > threshold)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, limit);
  }

  /**
   * 获取失败追踪
   */
  getFailedTraces(limit: number = 10): Trace[] {
    return Array.from(this.traces.values())
      .filter(t => t.status === 'error')
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);
  }

  /**
   * 分析追踪
   */
  analyzeTrace(traceId: string): {
    totalDuration: number;
    spanCount: number;
    slowestSpan: TraceSpan | null;
    failedSpans: TraceSpan[];
    spansByService: Record<string, number>;
  } | null {
    const trace = this.traces.get(traceId);
    if (!trace) {
      return null;
    }

    const slowestSpan = trace.spans
      .filter(s => s.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))[0] || null;

    const failedSpans = trace.spans.filter(s => s.status === 'error');

    const spansByService: Record<string, number> = {};
    trace.spans.forEach(span => {
      spansByService[span.serviceName] = (spansByService[span.serviceName] || 0) + 1;
    });

    return {
      totalDuration: trace.duration || 0,
      spanCount: trace.spans.length,
      slowestSpan,
      failedSpans,
      spansByService
    };
  }

  /**
   * 生成追踪报告
   */
  generateTraceReport(traceId: string): string {
    const trace = this.traces.get(traceId);
    if (!trace) {
      return '追踪未找到';
    }

    const analysis = this.analyzeTrace(traceId);
    if (!analysis) {
      return '分析失败';
    }

    let report = `# 追踪报告: ${traceId}\n\n`;
    report += `用户ID: ${trace.userId || 'N/A'}\n`;
    report += `状态: ${trace.status}\n`;
    report += `总耗时: ${trace.duration || 0}ms\n`;
    report += `Span数量: ${analysis.spanCount}\n\n`;

    report += '## Span详情\n\n';
    trace.spans.forEach((span, index) => {
      report += `${index + 1}. ${span.serviceName}.${span.operation}\n`;
      report += `   - 状态: ${span.status}\n`;
      report += `   - 耗时: ${span.duration || 0}ms\n`;
      if (span.error) {
        report += `   - 错误: ${span.error}\n`;
      }
      report += '\n';
    });

    if (analysis.slowestSpan) {
      report += '## 最慢Span\n\n';
      report += `${analysis.slowestSpan.serviceName}.${analysis.slowestSpan.operation} - ${analysis.slowestSpan.duration}ms\n\n`;
    }

    if (analysis.failedSpans.length > 0) {
      report += '## 失败Span\n\n';
      analysis.failedSpans.forEach((span, index) => {
        report += `${index + 1}. ${span.serviceName}.${span.operation}\n`;
        report += `   - 错误: ${span.error}\n\n`;
      });
    }

    return report;
  }

  /**
   * 清理过期追踪
   */
  private cleanupOldTraces(): void {
    const cutoffTime = Date.now() - this.TRACE_RETENTION_TIME;
    let cleaned = 0;

    for (const [traceId, trace] of this.traces.entries()) {
      if (trace.startTime < cutoffTime) {
        this.traces.delete(traceId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`🧹 [请求追踪] 清理了 ${cleaned} 条过期追踪`);
    }
  }

  /**
   * 清空所有追踪
   */
  clearAllTraces(): void {
    const count = this.traces.size;
    this.traces.clear();
    logger.info(`🧹 [请求追踪] 清空所有追踪: ${count} 条`);
  }

  /**
   * 获取统计
   */
  getStats(): {
    totalTraces: number;
    pendingTraces: number;
    successTraces: number;
    errorTraces: number;
  } {
    const traces = Array.from(this.traces.values());
    
    return {
      totalTraces: traces.length,
      pendingTraces: traces.filter(t => t.status === 'pending').length,
      successTraces: traces.filter(t => t.status === 'success').length,
      errorTraces: traces.filter(t => t.status === 'error').length
    };
  }
}

// 导出单例
export const requestTracer = RequestTracerService.getInstance();

