// import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from './request-config';

/**
 * 扩展window类型，支持axios属性
 */
declare global {
  interface Window {
    axios?: AxiosInstance;
  }
}

/**
 * API规则检查器
 */
class ApiRulesChecker {
  private static instance: ApiRulesChecker;
  private isEnabled: boolean = true;

  private constructor() {
    // 由于使用了自动导入，不再需要拦截全局axios
    // 但仍保留检查功能
  }

  public static getInstance(): ApiRulesChecker {
    if (!ApiRulesChecker.instance) {
      ApiRulesChecker.instance = new ApiRulesChecker();
    }
    return ApiRulesChecker.instance;
  }

  /**
   * 检查URL是否包含硬编码的端口号
   */
  public checkHardcodedPorts(url: string): void {
    if (!this.isEnabled) return;

    const portRegex = /:([0-9]{4,5})/;
    const match = url.match(portRegex);
    
    if (match && match[1] !== API_CONFIG.devServerPort.toString()) {
      console.error(`[API规则违反] URL中包含硬编码的端口号 ${match[1]}！请使用配置文件中的端口。`);
      throw new Error('API规则违反：禁止硬编码端口号');
    }
  }

  /**
   * 检查API响应类型
   */
  public checkApiResponseType(response: any): void {
    if (!this.isEnabled) return;

    if (!response || typeof response !== 'object') {
      console.error('[API规则违反] API响应必须是一个对象！');
      return;
    }

    if (!('success' in response)) {
      console.warn('[API规则警告] API响应缺少success字段');
    }

    if (!('data' in response) && !('message' in response)) {
      console.warn('[API规则警告] API响应缺少data或message字段');
    }
  }

  /**
   * 检查API请求配置
   */
  public checkRequestConfig(config: AxiosRequestConfig): void {
    if (!this.isEnabled) return;

    // 检查URL
    if (config.url) {
      this.checkHardcodedPorts(config.url);
    }

    // 检查认证头
    if (config.headers && typeof config.headers === 'object' && 'Authorization' in config.headers) {
      const auth = config.headers['Authorization'];
      if (typeof auth === 'string' && !auth.startsWith('Bearer ')) {
        console.warn('[API规则警告] Authorization头应使用Bearer token格式');
      }
    }
  }

  /**
   * 启用规则检查
   */
  public enable(): void {
    this.isEnabled = true;
    console.log('[API规则检查器] 已启用');
  }

  /**
   * 禁用规则检查
   */
  public disable(): void {
    this.isEnabled = false;
    console.log('[API规则检查器] 已禁用');
  }
}

// 导出单例实例
export const apiRulesChecker = ApiRulesChecker.getInstance();

// 在开发环境下自动启用规则检查
if (process.env.NODE_ENV === 'development') {
  apiRulesChecker.enable();
}

export default apiRulesChecker; 