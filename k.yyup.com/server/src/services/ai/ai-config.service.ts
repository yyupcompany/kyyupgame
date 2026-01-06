/**
 * AI配置服务
 * 统一管理所有AI服务的配置参数
 */

export interface AINetworkConfig {
  timeout: number;
  proxy: false | { host: string; port: number };
  maxRedirects: number;
  maxRetries: number;
  retryDelay: number;
}

export interface AIModelParams {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface AIProxyConfig {
  enabled: boolean;
  host?: string;
  port?: number;
}

/**
 * AI配置服务类
 */
export class AIConfigService {
  
  /**
   * 获取网络配置
   */
  static getNetworkConfig(): AINetworkConfig {
    const useProxy = process.env.AI_USE_PROXY === 'true';
    const proxyHost = process.env.AI_PROXY_HOST || '127.0.0.1';
    const proxyPort = parseInt(process.env.AI_PROXY_PORT || '8080');
    
    return {
      timeout: parseInt(process.env.AI_TIMEOUT || '60000'),
      proxy: useProxy ? { host: proxyHost, port: proxyPort } : false,
      maxRedirects: parseInt(process.env.AI_MAX_REDIRECTS || '5'),
      maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3'),
      retryDelay: 1000 // 1秒基础延迟
    };
  }
  
  /**
   * 获取默认AI模型参数
   */
  static getDefaultModelParams(): AIModelParams {
    return {
      temperature: parseFloat(process.env.AI_DEFAULT_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.AI_DEFAULT_MAX_TOKENS || '16000'),  // 🔧 提升默认值到16000，支持HTML代码生成
      topP: parseFloat(process.env.AI_DEFAULT_TOP_P || '0.9'),
      frequencyPenalty: parseFloat(process.env.AI_DEFAULT_FREQUENCY_PENALTY || '0'),
      presencePenalty: parseFloat(process.env.AI_DEFAULT_PRESENCE_PENALTY || '0')
    };
  }
  
  /**
   * 获取代理配置
   */
  static getProxyConfig(): AIProxyConfig {
    const enabled = process.env.AI_USE_PROXY === 'true';
    
    if (!enabled) {
      return { enabled: false };
    }
    
    return {
      enabled: true,
      host: process.env.AI_PROXY_HOST || '127.0.0.1',
      port: parseInt(process.env.AI_PROXY_PORT || '8080')
    };
  }
  
  /**
   * 获取axios配置对象
   */
  static getAxiosConfig(customTimeout?: number) {
    const networkConfig = this.getNetworkConfig();

    return {
      timeout: customTimeout || networkConfig.timeout,
      proxy: false as any, // 🚀 强制禁用代理，避免503错误
      maxRedirects: networkConfig.maxRedirects,
      // 验证状态码
      validateStatus: (status: number) => status < 500
    };
  }
  
  /**
   * 获取标准请求头
   */
  static getStandardHeaders(apiKey: string) {
    return {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept-Charset': 'utf-8',
      'Authorization': `Bearer ${apiKey}`,
      'User-Agent': 'KindergartenAI/1.0'
    };
  }
  
  /**
   * 合并模型参数（数据库配置优先）
   */
  static mergeModelParams(dbParams?: any, customParams?: Partial<AIModelParams>): AIModelParams {
    const defaultParams = this.getDefaultModelParams();
    
    return {
      temperature: dbParams?.temperature ?? customParams?.temperature ?? defaultParams.temperature,
      maxTokens: dbParams?.maxTokens ?? dbParams?.max_tokens ?? customParams?.maxTokens ?? defaultParams.maxTokens,
      topP: dbParams?.topP ?? dbParams?.top_p ?? customParams?.topP ?? defaultParams.topP,
      frequencyPenalty: dbParams?.frequencyPenalty ?? dbParams?.frequency_penalty ?? customParams?.frequencyPenalty ?? defaultParams.frequencyPenalty,
      presencePenalty: dbParams?.presencePenalty ?? dbParams?.presence_penalty ?? customParams?.presencePenalty ?? defaultParams.presencePenalty
    };
  }
  
  /**
   * 验证配置完整性
   */
  static validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 检查必要的环境变量
    if (process.env.AI_USE_PROXY === 'true') {
      if (!process.env.AI_PROXY_HOST) {
        errors.push('AI_PROXY_HOST is required when AI_USE_PROXY is true');
      }
      if (!process.env.AI_PROXY_PORT) {
        errors.push('AI_PROXY_PORT is required when AI_USE_PROXY is true');
      }
    }
    
    // 检查数值配置
    const timeout = parseInt(process.env.AI_TIMEOUT || '60000');
    if (isNaN(timeout) || timeout <= 0) {
      errors.push('AI_TIMEOUT must be a positive number');
    }
    
    const maxRetries = parseInt(process.env.AI_MAX_RETRIES || '3');
    if (isNaN(maxRetries) || maxRetries < 0) {
      errors.push('AI_MAX_RETRIES must be a non-negative number');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 获取默认模型
   */
  static getDefaultModel(): string {
    return process.env.AI_DEFAULT_MODEL || 'gpt-3.5-turbo';
  }

  /**
   * 打印配置信息（用于调试）
   */
  static logConfig(): void {
    const networkConfig = this.getNetworkConfig();
    const modelParams = this.getDefaultModelParams();
    const proxyConfig = this.getProxyConfig();
    
    console.log('🔧 [AI配置] 网络配置:', {
      timeout: networkConfig.timeout,
      proxy: networkConfig.proxy,
      maxRetries: networkConfig.maxRetries
    });
    
    console.log('🤖 [AI配置] 模型参数:', modelParams);
    console.log('🌐 [AI配置] 代理配置:', proxyConfig);
  }
}

export default AIConfigService;
