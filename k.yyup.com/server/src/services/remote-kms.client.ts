/**
 * 远程 KMS 客户端服务
 *
 * 通过 HTTP API 调用 admin.yyup.cc 的 KMS 服务
 * 符合等保3级密钥隔离要求
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import crypto from 'crypto';

/**
 * KMS API 配置
 */
interface KMSApiConfig {
  baseUrl: string;
  apiToken: string;
  tenantId: string;
  timeout: number;
}

/**
 * 加密结果
 */
interface EncryptResult {
  ciphertext: string;
  keyVersionId: string;
  keyId: string;
}

/**
 * 解密结果
 */
interface DecryptResult {
  plaintext: string;
  keyId: string;
  keyVersionId: string;
}

/**
 * 数据密钥结果
 */
interface DataKeyResult {
  ciphertext: string;
  keyVersionId: string;
  keyId: string;
  plaintextLength: number;
}

/**
 * 签名结果
 */
interface SignResult {
  signature: string;
  keyId: string;
  keyVersionId: string;
}

/**
 * API 响应
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 远程 KMS 客户端
 */
export class RemoteKmsClient {
  private axios: AxiosInstance;
  private config: KMSApiConfig;
  private cache: Map<string, { data: any; expireAt: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

  constructor(config?: Partial<KMSApiConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || process.env.KMS_API_URL || 'https://admin.yyup.cc/api/kms',
      apiToken: config?.apiToken || process.env.KMS_API_TOKEN || '',
      tenantId: config?.tenantId || process.env.KMS_API_TENANT_ID || 'k_tenant',
      timeout: config?.timeout || parseInt(process.env.KMS_API_TIMEOUT || '30000')
    };

    // 创建 axios 实例
    this.axios = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiToken}`
      }
    });

    // 请求拦截器
    this.axios.interceptors.request.use(
      (config) => {
        console.log(`[KMS API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[KMS API] 请求错误:', error.message);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          console.error('[KMS API] 响应错误:', {
            status: error.response.status,
            data: error.response.data
          });
        } else if (error.request) {
          console.error('[KMS API] 无响应:', error.message);
        } else {
          console.error('[KMS API] 请求失败:', error.message);
        }
        return Promise.reject(error);
      }
    );

    console.log('✅ 远程 KMS 客户端已初始化');
    console.log(`   服务地址: ${this.config.baseUrl}`);
    console.log(`   租户ID: ${this.config.tenantId}`);
  }

  /**
   * 调用 API 的通用方法
   */
  private async callApi<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.axios.post<ApiResponse<T>>(endpoint, data);

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'API调用失败');
      }

      return response.data.data as T;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message);
      }
      throw error;
    }
  }

  /**
   * 加密数据
   */
  async encrypt(keyAlias: string, plaintext: string): Promise<EncryptResult> {
    try {
      const result = await this.callApi<EncryptResult>('/encrypt', {
        keyAlias,
        plaintext
      });

      // 记录审计日志
      console.log(`[KMS Audit] 加密操作 - 租户: ${this.config.tenantId}, 密钥: ${keyAlias}`);

      return result;
    } catch (error: any) {
      console.error(`[KMS] 加密失败: ${error.message}`);
      throw new Error(`加密失败: ${error.message}`);
    }
  }

  /**
   * 解密数据
   */
  async decrypt(ciphertext: string): Promise<DecryptResult> {
    try {
      const result = await this.callApi<DecryptResult>('/decrypt', {
        ciphertext
      });

      // 记录审计日志
      console.log(`[KMS Audit] 解密操作 - 租户: ${this.config.tenantId}`);

      return result;
    } catch (error: any) {
      console.error(`[KMS] 解密失败: ${error.message}`);
      throw new Error(`解密失败: ${error.message}`);
    }
  }

  /**
   * 生成数据密钥
   */
  async generateDataKey(keyAlias: string): Promise<{ ciphertext: string; keyVersionId: string }> {
    try {
      const result = await this.callApi<DataKeyResult>('/generate-datakey', {
        keyAlias
      });

      // 记录审计日志
      console.log(`[KMS Audit] 生成数据密钥 - 租户: ${this.config.tenantId}, 密钥: ${keyAlias}`);

      return {
        ciphertext: result.ciphertext,
        keyVersionId: result.keyVersionId
      };
    } catch (error: any) {
      console.error(`[KMS] 生成数据密钥失败: ${error.message}`);
      throw new Error(`生成数据密钥失败: ${error.message}`);
    }
  }

  /**
   * 签名
   */
  async sign(keyAlias: string, message: string): Promise<string> {
    try {
      const result = await this.callApi<SignResult>('/sign', {
        keyAlias,
        message
      });

      // 记录审计日志
      console.log(`[KMS Audit] 签名操作 - 租户: ${this.config.tenantId}, 密钥: ${keyAlias}`);

      return result.signature;
    } catch (error: any) {
      console.error(`[KMS] 签名失败: ${error.message}`);
      throw new Error(`签名失败: ${error.message}`);
    }
  }

  /**
   * 验证签名
   */
  async verify(keyAlias: string, message: string, signature: string): Promise<boolean> {
    try {
      const result = await this.callApi<{ valid: boolean }>('/verify', {
        keyAlias,
        message,
        signature
      });

      // 记录审计日志
      console.log(`[KMS Audit] 验签操作 - 租户: ${this.config.tenantId}, 密钥: ${keyAlias}, 结果: ${result.valid}`);

      return result.valid;
    } catch (error: any) {
      console.error(`[KMS] 验签失败: ${error.message}`);
      throw new Error(`验签失败: ${error.message}`);
    }
  }

  /**
   * 获取服务状态
   */
  async getStatus(): Promise<{ available: boolean; cache: any }> {
    try {
      const result = await this.axios.get<ApiResponse<{ available: boolean; cache: any }>>('/status');

      if (!result.data.success) {
        return { available: false, cache: null };
      }

      return result.data.data;
    } catch (error: any) {
      console.error(`[KMS] 获取状态失败: ${error.message}`);
      return { available: false, cache: null };
    }
  }

  /**
   * 检查服务是否可用
   */
  async isAvailable(): Promise<boolean> {
    const status = await this.getStatus();
    return status.available;
  }

  /**
   * 清除缓存
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * 获取缓存状态
   */
  getCacheStatus(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 导出单例
let remoteKmsInstance: RemoteKmsClient | null = null;

export function getRemoteKmsClient(): RemoteKmsClient {
  if (!remoteKmsInstance) {
    remoteKmsInstance = new RemoteKmsClient();
  }
  return remoteKmsInstance;
}

export default RemoteKmsClient;
