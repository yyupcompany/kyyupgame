/**
 * 阿里云KMS密钥管理服务（重构版）
 *
 * 符合等保3级密钥隔离要求：
 * - 通过远程 API 调用 admin.yyup.cc 的 KMS 服务
 * - 不直接持有阿里云 AccessKey
 * - Fallback 模式：服务不可用时使用本地加密
 */

import { getRemoteKmsClient } from './remote-kms.client';
import crypto from 'crypto';

/**
 * KMS配置接口
 */
interface KMSConfig {
  remoteEnabled: boolean;
  fallbackEnabled: boolean;
}

/**
 * 密钥缓存项
 */
interface KeyCacheItem {
  key: Buffer;
  expireAt: number;
  versionId: string;
}

/**
 * 阿里云KMS服务（通过远程API）
 */
export class AliyunKMSService {
  private remoteClient = getRemoteKmsClient();
  private config: KMSConfig;
  private cache: Map<string, KeyCacheItem> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

  constructor(config?: Partial<KMSConfig>) {
    this.config = {
      remoteEnabled: config?.remoteEnabled ?? process.env.KMS_REMOTE_ENABLED !== 'false',
      fallbackEnabled: config?.fallbackEnabled ?? process.env.KMS_FALLBACK_ENABLED !== 'false'
    };

    console.log('✅ KMS 服务已初始化（远程API模式）');
    console.log(`   远程API: ${this.config.remoteEnabled ? '启用' : '禁用'}`);
    console.log(`   Fallback: ${this.config.fallbackEnabled ? '启用' : '禁用'}`);
  }

  /**
   * 检查KMS是否可用
   */
  async isAvailable(): Promise<boolean> {
    if (this.config.remoteEnabled) {
      return await this.remoteClient.isAvailable();
    }
    return false;
  }

  /**
   * 生成数据密钥（用于数据加密）
   */
  async generateDataKey(keyAlias: string): Promise<{ plaintext: Buffer; ciphertext: string }> {
    if (this.config.remoteEnabled) {
      try {
        const result = await this.remoteClient.generateDataKey(keyAlias);

        // 生成本地密钥（用于服务端缓存）
        const plaintext = crypto.randomBytes(32);

        // 缓存明文密钥（5分钟TTL）
        this.cache.set(keyAlias, {
          key: plaintext,
          expireAt: Date.now() + this.CACHE_TTL,
          versionId: result.keyVersionId
        });

        return { plaintext, ciphertext: result.ciphertext };
      } catch (error: any) {
        console.error(`远程KMS生成数据密钥失败: ${error.message}`);
        if (this.config.fallbackEnabled) {
          return this.fallbackGenerateDataKey(keyAlias);
        }
        throw error;
      }
    }

    if (this.config.fallbackEnabled) {
      return this.fallbackGenerateDataKey(keyAlias);
    }

    throw new Error('KMS服务不可用');
  }

  /**
   * 加密数据
   */
  async encrypt(keyAlias: string, plaintext: string): Promise<string> {
    if (this.config.remoteEnabled) {
      try {
        const result = await this.remoteClient.encrypt(keyAlias, plaintext);
        return result.ciphertext;
      } catch (error: any) {
        console.error(`远程KMS加密失败: ${error.message}`);
        if (this.config.fallbackEnabled) {
          return this.fallbackEncrypt(keyAlias, plaintext);
        }
        throw error;
      }
    }

    if (this.config.fallbackEnabled) {
      return this.fallbackEncrypt(keyAlias, plaintext);
    }

    throw new Error('KMS服务不可用');
  }

  /**
   * 解密数据
   */
  async decrypt(ciphertext: string): Promise<string> {
    if (this.config.remoteEnabled) {
      try {
        const result = await this.remoteClient.decrypt(ciphertext);
        return result.plaintext;
      } catch (error: any) {
        console.error(`远程KMS解密失败: ${error.message}`);
        if (this.config.fallbackEnabled) {
          return this.fallbackDecrypt(ciphertext);
        }
        throw error;
      }
    }

    if (this.config.fallbackEnabled) {
      return this.fallbackDecrypt(ciphertext);
    }

    throw new Error('KMS服务不可用');
  }

  /**
   * 签名（用于JWT）
   */
  async sign(keyAlias: string, data: string): Promise<string> {
    if (this.config.remoteEnabled) {
      try {
        return await this.remoteClient.sign(keyAlias, data);
      } catch (error: any) {
        console.error(`远程KMS签名失败: ${error.message}`);
        throw new Error(`签名失败: ${error.message}`);
      }
    }

    throw new Error('KMS服务不可用，无法签名');
  }

  /**
   * 验证签名
   */
  async verify(keyAlias: string, message: string, signature: string): Promise<boolean> {
    if (this.config.remoteEnabled) {
      try {
        return await this.remoteClient.verify(keyAlias, message, signature);
      } catch (error: any) {
        console.error(`远程KMS验签失败: ${error.message}`);
        throw new Error(`验签失败: ${error.message}`);
      }
    }

    throw new Error('KMS服务不可用，无法验签');
  }

  /**
   * Fallback: 生成本地密钥
   */
  private fallbackGenerateDataKey(keyAlias: string): { plaintext: Buffer; ciphertext: string } {
    console.warn(`⚠️ 使用fallback模式生成密钥: ${keyAlias}`);

    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // 使用环境变量中的密钥（如果存在）
    const masterKey = process.env.DB_ENCRYPTION_KEY || 'fallback-master-key';
    const masterKeyBuffer = crypto.scryptSync(masterKey, 'salt', 32);

    // 加密数据密钥
    const cipher = crypto.createCipheriv('aes-256-gcm', masterKeyBuffer, iv);
    let encrypted = cipher.update(key, null, 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    const ciphertext = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;

    return { plaintext: key, ciphertext };
  }

  /**
   * Fallback: 本地加密
   */
  private fallbackEncrypt(keyAlias: string, plaintext: string): string {
    console.warn(`⚠️ 使用fallback模式加密: ${keyAlias}`);

    // 使用和fallbackDecrypt相同的密钥
    const masterKey = process.env.DB_ENCRYPTION_KEY || 'fallback-master-key';
    const key = crypto.scryptSync(masterKey, 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Fallback: 本地解密
   */
  private fallbackDecrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('密文格式错误');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    // 使用主密钥解密
    const masterKey = process.env.DB_ENCRYPTION_KEY || 'fallback-master-key';
    const key = crypto.scryptSync(masterKey, 'salt', 32);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * 清除缓存
   */
  clearCache(keyAlias?: string): void {
    if (keyAlias) {
      this.cache.delete(keyAlias);
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
let kmsInstance: AliyunKMSService | null = null;

export function getKmsService(): AliyunKMSService {
  if (!kmsInstance) {
    kmsInstance = new AliyunKMSService();
  }
  return kmsInstance;
}

export default AliyunKMSService;
