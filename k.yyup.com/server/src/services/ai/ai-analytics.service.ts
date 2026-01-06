/**
 * AI分析服务
 * 提供AI使用统计和分析功能
 */

export interface UsageStats {
  totalCalls: number;
  totalTokens: number;
  successRate: number;
  averageResponseTime: number;
}

export interface ModelStats {
  modelName: string;
  callCount: number;
  tokenCount: number;
  errorCount: number;
}

class AIAnalyticsService {
  private usageData: any[] = [];

  /**
   * 记录使用情况
   */
  recordUsage(data: any): void {
    this.usageData.push({
      ...data,
      timestamp: new Date()
    });
  }

  /**
   * 获取使用统计
   */
  getUsageStats(startDate?: Date, endDate?: Date): UsageStats {
    const filteredData = this.filterByDate(startDate, endDate);
    
    return {
      totalCalls: filteredData.length,
      totalTokens: filteredData.reduce((sum, d) => sum + (d.tokens || 0), 0),
      successRate: this.calculateSuccessRate(filteredData),
      averageResponseTime: this.calculateAverageResponseTime(filteredData)
    };
  }

  /**
   * 获取模型统计
   */
  getModelStats(): ModelStats[] {
    const modelMap = new Map<string, ModelStats>();
    
    for (const data of this.usageData) {
      const modelName = data.model || 'unknown';
      if (!modelMap.has(modelName)) {
        modelMap.set(modelName, {
          modelName,
          callCount: 0,
          tokenCount: 0,
          errorCount: 0
        });
      }
      const stats = modelMap.get(modelName)!;
      stats.callCount++;
      stats.tokenCount += data.tokens || 0;
      if (data.error) stats.errorCount++;
    }
    
    return Array.from(modelMap.values());
  }

  /**
   * 获取趋势数据
   */
  getTrends(days: number = 7): any[] {
    const trends = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = this.usageData.filter(d => 
        d.timestamp?.toISOString().startsWith(dateStr)
      );
      
      trends.push({
        date: dateStr,
        calls: dayData.length,
        tokens: dayData.reduce((sum, d) => sum + (d.tokens || 0), 0)
      });
    }
    
    return trends.reverse();
  }

  private filterByDate(startDate?: Date, endDate?: Date): any[] {
    return this.usageData.filter(d => {
      const timestamp = d.timestamp;
      if (!timestamp) return true;
      if (startDate && timestamp < startDate) return false;
      if (endDate && timestamp > endDate) return false;
      return true;
    });
  }

  private calculateSuccessRate(data: any[]): number {
    if (data.length === 0) return 0;
    const successCount = data.filter(d => !d.error).length;
    return successCount / data.length;
  }

  private calculateAverageResponseTime(data: any[]): number {
    if (data.length === 0) return 0;
    const totalTime = data.reduce((sum, d) => sum + (d.responseTime || 0), 0);
    return totalTime / data.length;
  }

  /**
   * 获取用户活动趋势
   * @param timeRangeOrUserId - 时间范围或用户ID
   * @param limitOrDays - 限制数量或天数
   */
  getUserActivityTrend(timeRangeOrUserId: string | number, limitOrDays: number = 7): any[] {
    const trends = [];
    const now = new Date();
    const days = typeof limitOrDays === 'number' ? limitOrDays : 7;

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      let dayData: any[];
      if (typeof timeRangeOrUserId === 'number') {
        dayData = this.usageData.filter(d =>
          d.userId === timeRangeOrUserId && d.timestamp?.toISOString().startsWith(dateStr)
        );
      } else {
        dayData = this.usageData.filter(d =>
          d.timestamp?.toISOString().startsWith(dateStr)
        );
      }

      trends.push({
        date: dateStr,
        calls: dayData.length,
        tokens: dayData.reduce((sum, d) => sum + (d.tokens || 0), 0)
      });
    }

    return trends.reverse();
  }

  /**
   * 获取使用概览
   */
  getUsageOverview(startDate?: Date, endDate?: Date): any {
    const stats = this.getUsageStats(startDate, endDate);
    const modelStats = this.getModelStats();

    return {
      ...stats,
      topModels: modelStats.slice(0, 5),
      period: {
        start: startDate?.toISOString() || 'all',
        end: endDate?.toISOString() || 'now'
      }
    };
  }

  /**
   * 获取模型使用分布
   */
  getModelUsageDistribution(startDate?: Date, endDate?: Date): any[] {
    const filteredData = this.filterByDate(startDate, endDate);
    const modelMap = new Map<string, { callCount: number; tokenCount: number }>();

    for (const data of filteredData) {
      const modelName = data.model || 'unknown';
      if (!modelMap.has(modelName)) {
        modelMap.set(modelName, { callCount: 0, tokenCount: 0 });
      }
      const stats = modelMap.get(modelName)!;
      stats.callCount++;
      stats.tokenCount += data.tokens || 0;
    }

    const totalCalls = filteredData.length;
    return Array.from(modelMap.entries()).map(([model, stats]) => ({
      model,
      calls: stats.callCount,
      percentage: totalCalls > 0 ? (stats.callCount / totalCalls * 100).toFixed(2) : 0,
      tokens: stats.tokenCount
    }));
  }

  /**
   * 获取内容分析
   */
  getContentAnalytics(startDate?: Date, endDate?: Date): any {
    const filteredData = this.filterByDate(startDate, endDate);
    const totalCalls = filteredData.length;
    const totalTokens = filteredData.reduce((sum, d) => sum + (d.tokens || 0), 0);

    return {
      totalCalls,
      totalTokens,
      averageTokensPerCall: totalCalls > 0 ? Math.round(totalTokens / totalCalls) : 0,
      contentTypes: {
        text: filteredData.filter(d => d.type === 'text').length,
        chat: filteredData.filter(d => d.type === 'chat').length,
        other: filteredData.filter(d => !d.type || !['text', 'chat'].includes(d.type)).length
      }
    };
  }

  /**
   * 获取用户分析
   */
  async getUserAnalytics(userId: number): Promise<any> {
    const userData = this.usageData.filter(d => d.userId === userId);
    return {
      userId,
      totalCalls: userData.length,
      totalTokens: userData.reduce((sum, d) => sum + (d.tokens || 0), 0),
      lastActivity: userData.length > 0 ? userData[userData.length - 1].timestamp : null
    };
  }

  /**
   * 生成分析报告
   */
  async generateAnalyticsReport(_options?: any): Promise<any> {
    return {
      generatedAt: new Date().toISOString(),
      summary: {
        totalCalls: this.usageData.length,
        totalTokens: this.usageData.reduce((sum, d) => sum + (d.tokens || 0), 0)
      },
      modelDistribution: this.getModelUsageDistribution(),
      contentAnalytics: this.getContentAnalytics()
    };
  }

  /**
   * 获取预测分析
   */
  async getPredictiveAnalytics(): Promise<any> {
    return {
      predictedUsage: 0,
      trend: 'stable',
      recommendations: []
    };
  }

  /**
   * 刷新预测分析
   */
  async refreshPredictiveAnalytics(): Promise<any> {
    return this.getPredictiveAnalytics();
  }

  /**
   * 导出预测报告
   */
  async exportPredictiveReport(format?: string): Promise<any> {
    const analytics = await this.getPredictiveAnalytics();
    return {
      format: format || 'json',
      data: analytics,
      exportedAt: new Date().toISOString()
    };
  }
}

export const aiAnalyticsService = new AIAnalyticsService();
export default aiAnalyticsService;

