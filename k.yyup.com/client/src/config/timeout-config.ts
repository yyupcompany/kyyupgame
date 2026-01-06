/**
 * 超时配置系统
 * 用于统一管理系统中的各种请求超时时间
 */

export interface TimeoutConfig {
  // 通用API超时时间
  DEFAULT: number;        // 10秒 - 适用于大部分普通API
  QUICK: number;          // 5秒 - 适用于快速响应的API
  UPLOAD: number;         // 5分钟 - 文件上传超时时间
  DOWNLOAD: number;       // 10分钟 - 文件下载超时时间

  // AI相关超时时间
  AI_CHAT: number;        // 2分钟 - AI对话响应
  AI_ANALYSIS: number;    // 10分钟 - AI分析任务
  AI_CREATION: number;    // 15分钟 - AI创作任务
  AI_BATCH: number;       // 20分钟 - AI批量处理

  // 特定业务超时时间
  VIDEO_CREATION: number; // 3分钟 - 视频创作
  DATA_EXPORT: number;    // 5分钟 - 数据导出
  DATA_IMPORT: number;    // 10分钟 - 数据导入
  REPORT_GENERATION: number; // 2分钟 - 报表生成

  // 开发环境特殊配置
  DEVELOPMENT: {
    DEFAULT: number;      // 开发环境默认超时时间（更长，便于调试）
    AI_DEBUG: number;     // AI调试超时时间
  };
}

// 默认超时配置
export const defaultTimeoutConfig: TimeoutConfig = {
  // 通用API超时时间 (毫秒)
  DEFAULT: 10000,        // 10秒
  QUICK: 5000,           // 5秒
  UPLOAD: 300000,        // 5分钟 (300秒)
  DOWNLOAD: 600000,      // 10分钟 (600秒)

  // AI相关超时时间 (毫秒)
  AI_CHAT: 120000,       // 2分钟 (120秒)
  AI_ANALYSIS: 600000,   // 10分钟 (600秒)
  AI_CREATION: 900000,   // 15分钟 (900秒)
  AI_BATCH: 1200000,     // 20分钟 (1200秒)

  // 特定业务超时时间 (毫秒)
  VIDEO_CREATION: 180000, // 3分钟 (180秒)
  DATA_EXPORT: 300000,   // 5分钟 (300秒)
  DATA_IMPORT: 600000,   // 10分钟 (600秒)
  REPORT_GENERATION: 120000, // 2分钟 (120秒)

  // 开发环境特殊配置
  DEVELOPMENT: {
    DEFAULT: 30000,      // 30秒
    AI_DEBUG: 900000     // 15分钟
  }
};

// 超时配置管理器
export class TimeoutConfigManager {
  private static config: TimeoutConfig = defaultTimeoutConfig;

  /**
   * 获取超时配置
   */
  static getConfig(): TimeoutConfig {
    return this.config;
  }

  /**
   * 更新超时配置
   */
  static updateConfig(newConfig: Partial<TimeoutConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 重置为默认配置
   */
  static resetToDefault(): void {
    this.config = defaultTimeoutConfig;
  }

  /**
   * 根据API类型获取超时时间
   */
  static getTimeoutByType(apiType: keyof Omit<TimeoutConfig, 'DEVELOPMENT'>): number {
    // 开发环境下使用特殊的超时时间
    if (process.env.NODE_ENV === 'development') {
      const devConfig = this.config.DEVELOPMENT;
      if (apiType === 'DEFAULT') return devConfig.DEFAULT;
      if (apiType.toString().startsWith('AI_')) return devConfig.AI_DEBUG;
    }

    return this.config[apiType] || this.config.DEFAULT;
  }

  /**
   * 根据URL模式获取超时时间
   */
  static getTimeoutByUrl(url: string): number {
    // AI相关API
    if (url.includes('/ai/') || url.includes('/ai-')) {
      return this.getTimeoutByType('AI_ANALYSIS');
    }

    // 文件上传API
    if (url.includes('/upload') || url.includes('/file')) {
      return this.getTimeoutByType('UPLOAD');
    }

    // 文件下载API
    if (url.includes('/download') || url.includes('/export')) {
      return this.getTimeoutByType('DOWNLOAD');
    }

    // 视频创作API
    if (url.includes('/video') || url.includes('/creation')) {
      return this.getTimeoutByType('VIDEO_CREATION');
    }

    // 数据导入导出API
    if (url.includes('/import') || url.includes('/export')) {
      return this.getTimeoutByType('DATA_EXPORT');
    }

    // 报表生成API
    if (url.includes('/report') || url.includes('/statistics')) {
      return this.getTimeoutByType('REPORT_GENERATION');
    }

    // 默认超时时间
    return this.getTimeoutByType('DEFAULT');
  }

  /**
   * 获取格式化的超时时间字符串
   */
  static formatTimeout(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = Math.floor((milliseconds % 60000) / 1000);
      return `${minutes}m${seconds}s`;
    }
  }

  /**
   * 验证超时时间是否合理
   */
  static validateTimeout(timeout: number): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let isValid = true;

    if (timeout < 1000) {
      warnings.push('超时时间过短，可能导致正常请求失败');
    } else if (timeout > 1800000) {
      warnings.push('超时时间过长，可能影响用户体验');
      isValid = false;
    }

    if (timeout % 1000 !== 0) {
      warnings.push('建议使用秒为单位的超时时间');
    }

    return { isValid, warnings };
  }

  /**
   * 获取推荐的超时时间
   */
  static getRecommendedTimeout(operationType: string): number {
    const recommendations: Record<string, number> = {
      'read': this.getTimeoutByType('QUICK'),
      'write': this.getTimeoutByType('DEFAULT'),
      'upload': this.getTimeoutByType('UPLOAD'),
      'download': this.getTimeoutByType('DOWNLOAD'),
      'ai_chat': this.getTimeoutByType('AI_CHAT'),
      'ai_analysis': this.getTimeoutByType('AI_ANALYSIS'),
      'ai_creation': this.getTimeoutByType('AI_CREATION'),
      'video_creation': this.getTimeoutByType('VIDEO_CREATION'),
      'data_export': this.getTimeoutByType('DATA_EXPORT'),
      'data_import': this.getTimeoutByType('DATA_IMPORT'),
      'report_generation': this.getTimeoutByType('REPORT_GENERATION')
    };

    return recommendations[operationType] || this.getTimeoutByType('DEFAULT');
  }
}

export default TimeoutConfigManager;