import { Request, Response, NextFunction } from 'express';
import { SystemMonitorService } from '../../services/system-monitor.service';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/async-handler';

// 第三方AI服务性能接口
interface AIServicePerformance {
  id: string;
  name: string;
  provider: string;
  version: string;
  status: 'running' | 'error' | 'maintenance';
  metrics: {
    responseTime: number;
    successRate: number;
    requestsPerMinute: number;
    errorRate: number;
    lastUpdated: Date;
    costPerRequest?: number;
  };
  usage: {
    totalRequests: number;
    totalTokens?: number;
    dailyCost: number;
  };
}

// 性能日志接口
interface PerformanceLog {
  id: string;
  timestamp: Date;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  service: string;
  message: string;
  details?: any;
}

// 性能警报接口
interface PerformanceAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  source: string;
}

export class AIPerformanceMonitorController {
  private systemMonitor = SystemMonitorService.getInstance();
  
  // 基于数据库配置的AI服务数据
  private mockAIServices: AIServicePerformance[] = [
    {
      id: 'doubao-text-service',
      name: '豆包文本生成模型',
      provider: '字节跳动豆包',
      version: 'doubao-seed-1-6-thinking-250615',
      status: 'running',
      metrics: {
        responseTime: 1280,
        successRate: 99.1,
        requestsPerMinute: 45,
        errorRate: 0.9,
        lastUpdated: new Date(),
        costPerRequest: 0.028
      },
      usage: {
        totalRequests: 12500,
        totalTokens: 1250000,
        dailyCost: 138
      }
    },
    {
      id: 'doubao-image-service',
      name: '豆包图像生成模型',
      provider: '字节跳动豆包',
      version: 'doubao-seedream-3-0-t2i-250415',
      status: 'running',
      metrics: {
        responseTime: 1018,
        successRate: 97.6,
        requestsPerMinute: 28,
        errorRate: 2.4,
        lastUpdated: new Date(),
        costPerRequest: 0.045
      },
      usage: {
        totalRequests: 3200,
        totalTokens: 0,
        dailyCost: 115
      }
    },
    {
      id: 'doubao-tts-service',
      name: '豆包语音合成模型',
      provider: '字节跳动豆包',
      version: 'doubao-tts-bigmodel',
      status: 'running',
      metrics: {
        responseTime: 850,
        successRate: 98.9,
        requestsPerMinute: 15,
        errorRate: 1.1,
        lastUpdated: new Date(),
        costPerRequest: 0.015
      },
      usage: {
        totalRequests: 1800,
        totalTokens: 0,
        dailyCost: 45
      }
    },
    {
      id: 'volcano-search-service',
      name: '火山引擎搜索服务',
      provider: '字节跳动火山引擎',
      version: 'volcano-fusion-search',
      status: 'running',
      metrics: {
        responseTime: 148,
        successRate: 98.9,
        requestsPerMinute: 85,
        errorRate: 1.1,
        lastUpdated: new Date(),
        costPerRequest: 0.008
      },
      usage: {
        totalRequests: 8500,
        totalTokens: 0,
        dailyCost: 28
      }
    }
  ];

  // 模拟性能日志
  private mockLogs: PerformanceLog[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3分钟前
      level: 'INFO',
      service: 'OpenAI-GPT4',
      message: 'OpenAI GPT-4 API调用成功，响应时间: 1420ms，消耗token: 1250'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 6), // 6分钟前
      level: 'WARNING',
      service: 'Baidu-ERNIE',
      message: '百度文心一言API响应时间较长: 2100ms，建议检查网络连接'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 9), // 9分钟前
      level: 'ERROR',
      service: 'Alibaba-Tongyi',
      message: '阿里通义千问API调用失败，错误码: 429，已触发重试机制'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1000 * 60 * 13), // 13分钟前
      level: 'INFO',
      service: 'Database-Optimizer',
      message: '数据库查询优化完成，查询时间从250ms优化至85ms'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15分钟前
      level: 'INFO',
      service: 'OpenAI-GPT4',
      message: 'OpenAI API每日配额使用率: 65%，预计费用: $180'
    }
  ];

  // 模拟性能警报
  private mockAlerts: PerformanceAlert[] = [
    {
      id: '1',
      severity: 'warning',
      title: 'OpenAI API响应时间异常',
      description: 'OpenAI GPT-4 API平均响应时间超过2秒，可能影响用户体验',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15分钟前
      resolved: false,
      source: 'OpenAI Monitor'
    },
    {
      id: '2',
      severity: 'critical',
      title: '百度文心一言API配额不足',
      description: '百度文心一言API今日配额已使用95%，请及时充值或切换服务',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
      resolved: false,
      source: 'Baidu API Monitor'
    },
    {
      id: '3',
      severity: 'info',
      title: 'AI服务成本预警',
      description: '本月AI服务总成本已达到预算的80%，建议优化调用策略',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45分钟前
      resolved: false,
      source: 'Cost Monitor'
    }
  ];

  /**
   * 获取系统状态概览
   * GET /api/ai/performance/system-status
   */
  public getSystemStatus = asyncHandler(async (req: Request, res: Response) => {
    const systemMetrics = await this.systemMonitor.getSystemMetrics();
    
    // 计算系统整体状态
    const systemStatus = this.calculateSystemStatus(systemMetrics);
    
    const statusData = {
      status: systemStatus.status,
      message: systemStatus.message,
      metrics: {
        cpu: {
          usage: systemMetrics.cpu.usage,
          cores: systemMetrics.cpu.cores,
          temperature: systemMetrics.cpu.temperature
        },
        memory: {
          usage: systemMetrics.memory.usage,
          total: systemMetrics.memory.total,
          used: systemMetrics.memory.used,
          free: systemMetrics.memory.free
        },
        // 模拟GPU数据（实际环境中需要nvidia-ml-py等库）
        gpu: {
          usage: this.getGPUUsage(),
          model: 'NVIDIA RTX 4090',
          memory: {
            used: 8.2,
            total: 24.0,
            usage: 34.2
          }
        },
        network: systemMetrics.network,
        uptime: systemMetrics.system.uptime
      },
      lastUpdated: new Date()
    };

    return ApiResponse.success(res, statusData, '获取系统状态成功');
  });

  /**
   * 获取AI模型性能数据
   * GET /api/ai/performance/models
   */
  public getAIModelsPerformance = asyncHandler(async (req: Request, res: Response) => {
    const { timeRange = '24h' } = req.query;

    // 根据时间范围更新服务数据
    const servicesData = this.updateServicesWithTimeRange(this.mockAIServices, timeRange as string);

    return ApiResponse.success(res, {
      services: servicesData,
      timeRange,
      totalServices: servicesData.length,
      runningServices: servicesData.filter(s => s.status === 'running').length,
      averageSuccessRate: servicesData.reduce((sum, s) => sum + s.metrics.successRate, 0) / servicesData.length,
      totalDailyCost: servicesData.reduce((sum, s) => sum + s.usage.dailyCost, 0),
      lastUpdated: new Date()
    }, '获取第三方AI服务性能数据成功');
  });

  /**
   * 获取性能日志
   * GET /api/ai/performance/logs
   */
  public getPerformanceLogs = asyncHandler(async (req: Request, res: Response) => {
    const { level = 'all', limit = '50' } = req.query;
    
    let filteredLogs = [...this.mockLogs];
    
    // 按日志级别过滤
    if (level !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    // 限制返回数量
    const limitNum = parseInt(limit as string, 10);
    filteredLogs = filteredLogs.slice(0, limitNum);
    
    // 按时间倒序排序
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return ApiResponse.success(res, {
      logs: filteredLogs,
      total: filteredLogs.length,
      filters: { level, limit },
      lastUpdated: new Date()
    }, '获取性能日志成功');
  });

  // 私有辅助方法
  private calculateSystemStatus(metrics: any) {
    const cpuThreshold = 80;
    const memoryThreshold = 85;
    const gpuThreshold = 90;
    
    const gpuUsage = this.getGPUUsage();
    
    if (metrics.cpu.usage > cpuThreshold || metrics.memory.usage > memoryThreshold || gpuUsage > gpuThreshold) {
      return {
        status: 'warning',
        message: '系统资源使用率偏高，建议优化'
      };
    }
    
    return {
      status: 'normal',
      message: '所有服务运行正常'
    };
  }

  private getGPUUsage(): number {
    // 模拟GPU使用率，实际环境中需要调用nvidia-ml-py等库
    return Math.floor(Math.random() * 30) + 20; // 20-50%之间的随机值
  }

  private updateServicesWithTimeRange(services: AIServicePerformance[], timeRange: string) {
    // 根据时间范围调整服务数据
    return services.map(service => ({
      ...service,
      metrics: {
        ...service.metrics,
        // 模拟时间范围对数据的影响
        responseTime: service.metrics.responseTime + Math.floor(Math.random() * 200) - 100,
        requestsPerMinute: Math.max(0, service.metrics.requestsPerMinute + Math.floor(Math.random() * 10) - 5),
        errorRate: Math.max(0, service.metrics.errorRate + (Math.random() - 0.5) * 0.5),
        successRate: Math.min(100, Math.max(90, service.metrics.successRate + (Math.random() - 0.5) * 2)),
        lastUpdated: new Date()
      },
      usage: {
        ...service.usage,
        totalRequests: service.usage.totalRequests + Math.floor(Math.random() * 100),
        dailyCost: Math.max(0, service.usage.dailyCost + (Math.random() - 0.5) * 20)
      }
    }));
  }

  /**
   * 获取性能警报
   * GET /api/ai/performance/alerts
   */
  public getPerformanceAlerts = asyncHandler(async (req: Request, res: Response) => {
    const { resolved = 'false' } = req.query;

    let filteredAlerts = [...this.mockAlerts];

    // 按解决状态过滤
    if (resolved !== 'all') {
      const isResolved = resolved === 'true';
      filteredAlerts = filteredAlerts.filter(alert => alert.resolved === isResolved);
    }

    // 按时间倒序排序
    filteredAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return ApiResponse.success(res, {
      alerts: filteredAlerts,
      total: filteredAlerts.length,
      unresolved: filteredAlerts.filter(a => !a.resolved).length,
      critical: filteredAlerts.filter(a => a.severity === 'critical').length,
      lastUpdated: new Date()
    }, '获取性能警报成功');
  });

  /**
   * 刷新性能数据
   * POST /api/ai/performance/refresh
   */
  public refreshPerformanceData = asyncHandler(async (req: Request, res: Response) => {
    // 模拟数据刷新过程
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 更新服务数据
    this.updateServiceMetrics();

    // 添加新的日志条目
    this.addNewLogEntry();

    return ApiResponse.success(res, {
      refreshed: true,
      timestamp: new Date(),
      message: '性能数据已刷新'
    }, '刷新性能数据成功');
  });

  /**
   * 导出性能报告
   * GET /api/ai/performance/export
   */
  public exportPerformanceReport = asyncHandler(async (req: Request, res: Response) => {
    const { format = 'json', timeRange = '24h' } = req.query;

    const systemMetrics = await this.systemMonitor.getSystemMetrics();
    const servicesData = this.updateServicesWithTimeRange(this.mockAIServices, timeRange as string);

    const reportData = {
      reportInfo: {
        generatedAt: new Date(),
        timeRange,
        format
      },
      systemStatus: {
        cpu: systemMetrics.cpu,
        memory: systemMetrics.memory,
        gpu: { usage: this.getGPUUsage() },
        uptime: systemMetrics.system.uptime
      },
      aiServices: servicesData,
      alerts: this.mockAlerts.filter(a => !a.resolved),
      summary: {
        totalServices: servicesData.length,
        runningServices: servicesData.filter(s => s.status === 'running').length,
        avgResponseTime: servicesData.reduce((sum, s) => sum + s.metrics.responseTime, 0) / servicesData.length,
        avgSuccessRate: servicesData.reduce((sum, s) => sum + s.metrics.successRate, 0) / servicesData.length,
        totalDailyCost: servicesData.reduce((sum, s) => sum + s.usage.dailyCost, 0)
      }
    };

    if (format === 'json') {
      return ApiResponse.success(res, reportData, '导出性能报告成功');
    } else {
      // 其他格式的导出可以在这里实现
      return ApiResponse.success(res, { downloadUrl: '/api/ai/performance/download-report' }, '报告生成中，请稍后下载');
    }
  });

  private updateServiceMetrics() {
    // 模拟更新服务指标
    this.mockAIServices.forEach(service => {
      if (service.status === 'running') {
        service.metrics.responseTime += Math.floor(Math.random() * 200) - 100;
        service.metrics.requestsPerMinute = Math.max(0, service.metrics.requestsPerMinute + Math.floor(Math.random() * 6) - 3);
        service.metrics.errorRate = Math.max(0, service.metrics.errorRate + (Math.random() - 0.5) * 0.5);
        service.metrics.successRate = Math.min(100, Math.max(90, service.metrics.successRate + (Math.random() - 0.5) * 2));
        service.metrics.lastUpdated = new Date();
        service.usage.totalRequests += Math.floor(Math.random() * 10);
        service.usage.dailyCost = Math.max(0, service.usage.dailyCost + (Math.random() - 0.5) * 5);
      }
    });
  }

  private addNewLogEntry() {
    // 添加新的日志条目
    const newLog: PerformanceLog = {
      id: (this.mockLogs.length + 1).toString(),
      timestamp: new Date(),
      level: 'INFO',
      service: 'Performance-Monitor',
      message: '性能数据已刷新，所有指标正常'
    };

    this.mockLogs.unshift(newLog);

    // 保持日志数量在合理范围内
    if (this.mockLogs.length > 100) {
      this.mockLogs = this.mockLogs.slice(0, 100);
    }
  }
}
