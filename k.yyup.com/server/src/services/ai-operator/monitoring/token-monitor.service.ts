/**
 * Token使用监控服务
 * 第一阶段优化：实时监控Token使用情况，提供优化建议
 */

import { logger } from '../../../utils/logger';

export interface TokenUsage {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  userId?: string;
  conversationId?: string;
  requestType: 'single_round' | 'multi_round';
  timestamp?: number;
}

export interface TokenStats {
  currentUsage: TokenUsage;
  dailyUsage: TokenUsage[];
  weeklyAverage: number;
  optimizationSuggestions: string[];
  costEstimate: {
    daily: number;
    monthly: number;
  };
}

export interface TokenAlert {
  type: 'warning' | 'critical';
  message: string;
  currentUsage: number;
  threshold: number;
  suggestion: string;
}

export class TokenMonitorService {
  private static instance: TokenMonitorService;
  private usageHistory: TokenUsage[] = [];
  private dailyStats = new Map<string, TokenUsage[]>();
  private alerts: TokenAlert[] = [];

  // Token价格估算（每1000 tokens的价格，人民币）
  private readonly PRICING = {
    input: 0.003,  // 输入token价格
    output: 0.009  // 输出token价格
  };

  // 监控阈值
  private readonly THRESHOLDS = {
    warning: 8000,   // 警告阈值
    critical: 12000, // 危险阈值
    daily_limit: 100000 // 每日限制
  };

  private constructor() {
    // 每小时清理过期数据
    setInterval(() => this.cleanupOldData(), 60 * 60 * 1000);

    // 每日重置统计
    setInterval(() => this.resetDailyStats(), 24 * 60 * 60 * 1000);

    logger.info('🔍 [Token监控] Token监控服务已启动');
  }

  static getInstance(): TokenMonitorService {
    if (!TokenMonitorService.instance) {
      TokenMonitorService.instance = new TokenMonitorService();
    }
    return TokenMonitorService.instance;
  }

  /**
   * 记录Token使用情况
   */
  recordUsage(usage: Omit<TokenUsage, 'timestamp'>): void {
    const record: TokenUsage = {
      ...usage,
      timestamp: Date.now()
    };

    // 添加到历史记录
    this.usageHistory.push(record);

    // 添加到每日统计
    const today = new Date().toISOString().split('T')[0];
    if (!this.dailyStats.has(today)) {
      this.dailyStats.set(today, []);
    }
    this.dailyStats.get(today)!.push(record);

    // 检查是否需要告警
    this.checkThresholds(record);

    // 记录详细日志
    logger.info(`📊 [Token监控] 记录使用情况:`, {
      total: record.totalTokens,
      prompt: record.promptTokens,
      completion: record.completionTokens,
      type: record.requestType,
      userId: record.userId ? String(record.userId).substring(0, 8) + '...' : 'N/A'
    });
  }

  /**
   * 获取当前Token统计
   */
  getCurrentStats(): TokenStats {
    const currentUsage = this.usageHistory.slice(-1)[0] || {
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      timestamp: Date.now(),
      requestType: 'single_round'
    };

    const today = new Date().toISOString().split('T')[0];
    const dailyUsage = this.dailyStats.get(today) || [];

    // 计算周平均值
    const weeklyData = this.getWeeklyData();
    const weeklyAverage = weeklyData.length > 0
      ? weeklyData.reduce((sum, usage) => sum + usage.totalTokens, 0) / weeklyData.length
      : 0;

    // 生成优化建议
    const suggestions = this.generateOptimizationSuggestions(currentUsage, dailyUsage);

    // 估算成本
    const costEstimate = this.estimateCosts(dailyUsage);

    return {
      currentUsage,
      dailyUsage,
      weeklyAverage,
      optimizationSuggestions: suggestions,
      costEstimate
    };
  }

  /**
   * 获取实时告警
   */
  getAlerts(): TokenAlert[] {
    // 清理过期告警（超过1小时的告警）
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.alerts = this.alerts.filter(alert => {
      // 这里简化处理，实际应该基于告警时间过滤
      return true;
    });

    return this.alerts;
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    summary: string;
    details: any;
    recommendations: string[];
  } {
    const stats = this.getCurrentStats();
    const today = new Date().toISOString().split('T')[0];
    const dailyUsage = this.dailyStats.get(today) || [];

    const totalToday = dailyUsage.reduce((sum, usage) => sum + usage.totalTokens, 0);
    const avgPerRequest = dailyUsage.length > 0 ? totalToday / dailyUsage.length : 0;

    const summary = `今日已使用 ${totalToday.toLocaleString()} tokens，平均每次请求 ${Math.round(avgPerRequest)} tokens`;

    const details = {
      dailyTotal: totalToday,
      requestCount: dailyUsage.length,
      averagePerRequest: Math.round(avgPerRequest),
      currentHourUsage: this.getCurrentHourUsage(),
      topHourUsage: this.getTopHourUsage(),
      costEstimate: stats.costEstimate.daily
    };

    const recommendations = [
      ...stats.optimizationSuggestions,
      ...this.generatePerformanceRecommendations(stats)
    ];

    return {
      summary,
      details,
      recommendations
    };
  }

  /**
   * 检查阈值并生成告警
   */
  private checkThresholds(usage: TokenUsage): void {
    const { totalTokens } = usage;

    if (totalTokens >= this.THRESHOLDS.critical) {
      this.createAlert('critical',
        `单次请求Token使用量过高 (${totalTokens} tokens)`,
        totalTokens,
        this.THRESHOLDS.critical,
        '建议启用提示词压缩和智能缓存机制'
      );
    } else if (totalTokens >= this.THRESHOLDS.warning) {
      this.createAlert('warning',
        `单次请求Token使用量较高 (${totalTokens} tokens)`,
        totalTokens,
        this.THRESHOLDS.warning,
        '考虑优化提示词长度或启用历史裁剪'
      );
    }

    // 检查每日使用量
    const today = new Date().toISOString().split('T')[0];
    const dailyTotal = (this.dailyStats.get(today) || [])
      .reduce((sum, usage) => sum + usage.totalTokens, 0);

    if (dailyTotal >= this.THRESHOLDS.daily_limit) {
      this.createAlert('critical',
        `每日Token使用量已超限 (${dailyTotal} tokens)`,
        dailyTotal,
        this.THRESHOLDS.daily_limit,
        '建议立即启用成本控制措施'
      );
    }
  }

  /**
   * 创建告警
   */
  private createAlert(type: 'warning' | 'critical', message: string, current: number, threshold: number, suggestion: string): void {
    const alert: TokenAlert = {
      type,
      message,
      currentUsage: current,
      threshold,
      suggestion
    };

    this.alerts.push(alert);

    logger.warn(`⚠️ [Token告警] ${type.toUpperCase()}: ${message}`, {
      current,
      threshold,
      suggestion
    });
  }

  /**
   * 生成优化建议
   */
  private generateOptimizationSuggestions(current: TokenUsage, daily: TokenUsage[]): string[] {
    const suggestions: string[] = [];

    // 基于当前使用量的建议
    if (current.totalTokens > 6000) {
      suggestions.push('当前请求Token使用量较高，建议启用历史裁剪功能');
    }

    if (current.promptTokens > current.completionTokens * 3) {
      suggestions.push('输入Token过多，建议优化系统提示词长度');
    }

    // 基于每日使用模式的建议
    const avgDaily = daily.reduce((sum, usage) => sum + usage.totalTokens, 0);
    if (avgDaily > 50000) {
      suggestions.push('日均Token使用量较高，建议启用智能缓存机制');
    }

    // 检查重复模式
    const recentUsage = daily.slice(-10);
    const hasHighVariation = this.checkUsageVariation(recentUsage);
    if (hasHighVariation) {
      suggestions.push('Token使用量波动较大，建议检查提示词构建逻辑');
    }

    return suggestions;
  }

  /**
   * 估算成本
   */
  private estimateCosts(dailyUsage: TokenUsage[]): { daily: number; monthly: number } {
    const dailyInputTokens = dailyUsage.reduce((sum, usage) => sum + usage.promptTokens, 0);
    const dailyOutputTokens = dailyUsage.reduce((sum, usage) => sum + usage.completionTokens, 0);

    const dailyCost = (dailyInputTokens / 1000) * this.PRICING.input +
                     (dailyOutputTokens / 1000) * this.PRICING.output;

    return {
      daily: Math.round(dailyCost * 100) / 100,
      monthly: Math.round(dailyCost * 30 * 100) / 100
    };
  }

  /**
   * 获取一周数据
   */
  private getWeeklyData(): TokenUsage[] {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return this.usageHistory.filter(usage => usage.timestamp >= oneWeekAgo);
  }

  /**
   * 获取当前小时使用量
   */
  private getCurrentHourUsage(): number {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return this.usageHistory
      .filter(usage => usage.timestamp >= oneHourAgo)
      .reduce((sum, usage) => sum + usage.totalTokens, 0);
  }

  /**
   * 获取最高小时使用量
   */
  private getTopHourUsage(): { hour: string; usage: number } {
    const hourlyUsage = new Map<string, number>();

    this.usageHistory.forEach(usage => {
      const hour = new Date(usage.timestamp).getHours().toString().padStart(2, '0') + ':00';
      hourlyUsage.set(hour, (hourlyUsage.get(hour) || 0) + usage.totalTokens);
    });

    let maxUsage = 0;
    let topHour = '00:00';

    hourlyUsage.forEach((usage, hour) => {
      if (usage > maxUsage) {
        maxUsage = usage;
        topHour = hour;
      }
    });

    return { hour: topHour, usage: maxUsage };
  }

  /**
   * 检查使用量变化
   */
  private checkUsageVariation(recentUsage: TokenUsage[]): boolean {
    if (recentUsage.length < 5) return false;

    const usages = recentUsage.map(u => u.totalTokens);
    const avg = usages.reduce((sum, usage) => sum + usage, 0) / usages.length;
    const variance = usages.reduce((sum, usage) => sum + Math.pow(usage - avg, 2), 0) / usages.length;
    const stdDev = Math.sqrt(variance);

    // 如果标准差超过平均值的50%，认为变化较大
    return stdDev > avg * 0.5;
  }

  /**
   * 生成性能建议
   */
  private generatePerformanceRecommendations(stats: TokenStats): string[] {
    const recommendations: string[] = [];

    if (stats.weeklyAverage > 5000) {
      recommendations.push('周平均Token使用量较高，建议实施提示词优化策略');
    }

    if (stats.costEstimate.daily > 50) {
      recommendations.push('日成本较高，建议启用智能缓存和压缩机制');
    }

    return recommendations;
  }

  /**
   * 清理过期数据
   */
  private cleanupOldData(): void {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const beforeCount = this.usageHistory.length;

    this.usageHistory = this.usageHistory.filter(usage => usage.timestamp >= oneWeekAgo);

    const cleaned = beforeCount - this.usageHistory.length;
    if (cleaned > 0) {
      logger.info(`🧹 [Token监控] 清理过期数据: ${cleaned} 条记录`);
    }
  }

  /**
   * 重置每日统计
   */
  private resetDailyStats(): void {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    if (this.dailyStats.has(yesterdayKey)) {
      const yesterdayUsage = this.dailyStats.get(yesterdayKey)!;
      const totalTokens = yesterdayUsage.reduce((sum, usage) => sum + usage.totalTokens, 0);

      logger.info(`📊 [Token监控] 昨日Token使用: ${totalTokens.toLocaleString()} tokens (${yesterdayUsage.length} 次请求)`);
    }

    // 保留最近7天的数据
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    const cutoffKey = cutoffDate.toISOString().split('T')[0];

    for (const [date] of this.dailyStats) {
      if (date < cutoffKey) {
        this.dailyStats.delete(date);
      }
    }
  }
}

// 导出单例
export const tokenMonitorService = TokenMonitorService.getInstance();