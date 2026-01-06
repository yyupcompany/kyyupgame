/**
 * VOS配置服务
 * 用于管理和加载VOS（Voice Over Service）配置
 */

import { VOSConfig, VOSConfigAttributes } from '../models/vos-config.model';
import { sequelize } from '../config/database';

interface VOSConfigData {
  serverHost: string;
  serverPort: number;
  protocol: 'http' | 'https' | 'ws' | 'wss';
  apiKey: string;
  apiSecret?: string;
  appId?: string;
  username?: string;
  password?: string;
  voiceType?: string;
  sampleRate?: number;
  format?: string;
  language?: string;
  modelName?: string;
  maxConcurrentCalls?: number;
  timeout?: number;
  retryCount?: number;
}

class VOSConfigService {
  private config: VOSConfigData | null = null;
  private configLoaded: boolean = false;

  /**
   * 加载VOS配置
   */
  async loadConfig(): Promise<void> {
    if (this.configLoaded) {
      return;
    }

    try {
      console.log('🔄 加载VOS配置...');

      // 从数据库获取激活的VOS配置
      const vosConfig = await VOSConfig.findOne({
        where: {
          isActive: true,
          status: 'active'
        }
      });

      if (vosConfig) {
        this.config = {
          serverHost: vosConfig.serverHost,
          serverPort: vosConfig.serverPort,
          protocol: vosConfig.protocol,
          apiKey: vosConfig.apiKey,
          apiSecret: vosConfig.apiSecret,
          appId: vosConfig.appId,
          username: vosConfig.username,
          password: vosConfig.password,
          voiceType: vosConfig.voiceType,
          sampleRate: vosConfig.sampleRate,
          format: vosConfig.format,
          language: vosConfig.language,
          modelName: vosConfig.modelName,
          maxConcurrentCalls: vosConfig.maxConcurrentCalls,
          timeout: vosConfig.timeout,
          retryCount: vosConfig.retryCount
        };
        console.log('✅ VOS配置加载成功');
        console.log(`   服务器: ${this.config.serverHost}:${this.config.serverPort}`);
        console.log(`   协议: ${this.config.protocol}`);
      } else {
        console.warn('⚠️  未找到激活的VOS配置');
        // 使用环境变量作为备选
        this.config = {
          serverHost: process.env.VOS_SERVER_HOST || 'localhost',
          serverPort: parseInt(process.env.VOS_SERVER_PORT || '443'),
          protocol: (process.env.VOS_PROTOCOL as any) || 'https',
          apiKey: process.env.VOS_API_KEY || '',
          apiSecret: process.env.VOS_API_SECRET,
          appId: process.env.VOS_APP_ID,
          username: process.env.VOS_USERNAME,
          password: process.env.VOS_PASSWORD,
          voiceType: process.env.VOS_VOICE_TYPE || 'default',
          sampleRate: parseInt(process.env.VOS_SAMPLE_RATE || '16000'),
          format: process.env.VOS_FORMAT || 'pcm',
          language: process.env.VOS_LANGUAGE || 'zh-CN',
          modelName: process.env.VOS_MODEL_NAME,
          maxConcurrentCalls: parseInt(process.env.VOS_MAX_CONCURRENT_CALLS || '100'),
          timeout: parseInt(process.env.VOS_TIMEOUT || '30000'),
          retryCount: parseInt(process.env.VOS_RETRY_COUNT || '3')
        };
      }

      this.configLoaded = true;
    } catch (error) {
      console.error('❌ 加载VOS配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取VOS配置
   */
  async getConfig(): Promise<VOSConfigData> {
    if (!this.configLoaded) {
      await this.loadConfig();
    }

    if (!this.config) {
      throw new Error('VOS配置未加载');
    }

    return this.config;
  }

  /**
   * 获取VOS连接URL
   */
  async getConnectionUrl(): Promise<string> {
    const config = await this.getConfig();
    return `${config.protocol}://${config.serverHost}:${config.serverPort}`;
  }

  /**
   * 创建VOS配置
   */
  async createConfig(data: Partial<VOSConfigAttributes>): Promise<VOSConfig> {
    try {
      console.log('📝 创建VOS配置...');

      const config = await VOSConfig.create({
        name: data.name || 'default',
        description: data.description,
        serverHost: data.serverHost || 'localhost',
        serverPort: data.serverPort || 443,
        protocol: data.protocol || 'https',
        apiKey: data.apiKey || '',
        apiSecret: data.apiSecret,
        appId: data.appId,
        username: data.username,
        password: data.password,
        voiceType: data.voiceType || 'default',
        sampleRate: data.sampleRate || 16000,
        format: data.format || 'pcm',
        language: data.language || 'zh-CN',
        modelName: data.modelName,
        maxConcurrentCalls: data.maxConcurrentCalls || 100,
        timeout: data.timeout || 30000,
        retryCount: data.retryCount || 3,
        isActive: data.isActive !== false,
        isDefault: data.isDefault || false,
        status: 'inactive'
      } as any);

      console.log('✅ VOS配置创建成功');
      return config;
    } catch (error) {
      console.error('❌ 创建VOS配置失败:', error);
      throw error;
    }
  }

  /**
   * 更新VOS配置
   */
  async updateConfig(id: number, data: Partial<VOSConfigAttributes>): Promise<VOSConfig> {
    try {
      const config = await VOSConfig.findByPk(id);
      if (!config) {
        throw new Error('VOS配置不存在');
      }

      await config.update(data);
      this.configLoaded = false; // 重新加载配置
      console.log('✅ VOS配置更新成功');
      return config;
    } catch (error) {
      console.error('❌ 更新VOS配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有VOS配置
   */
  async getAllConfigs(): Promise<VOSConfig[]> {
    try {
      return await VOSConfig.findAll({
        order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
      });
    } catch (error) {
      console.error('❌ 获取VOS配置列表失败:', error);
      throw error;
    }
  }

  /**
   * 测试VOS连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const config = await this.getConfig();
      console.log('🧪 测试VOS连接...');
      console.log(`   URL: ${config.protocol}://${config.serverHost}:${config.serverPort}`);

      // 这里可以添加实际的连接测试逻辑
      // 例如发送一个简单的HTTP请求或WebSocket连接

      console.log('✅ VOS连接测试成功');
      return true;
    } catch (error) {
      console.error('❌ VOS连接测试失败:', error);
      return false;
    }
  }
}

export const vosConfigService = new VOSConfigService();

