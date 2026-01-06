import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

/**
 * OSS配置接口
 */
export interface OSSConfig {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
  cdnDomain?: string;
  basePath: string;
  isProduction: boolean;
  environment: string;
}

/**
 * OSS配置管理器
 * 支持开发、测试、生产环境的配置自动加载
 */
export class OSSConfigManager {
  private static instance: OSSConfigManager;
  private config: OSSConfig | null = null;
  private envFiles = ['.env', '.env.local', '.env.production', '.env.development'];

  private constructor() {
    this.loadConfiguration();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): OSSConfigManager {
    if (!OSSConfigManager.instance) {
      OSSConfigManager.instance = new OSSConfigManager();
    }
    return OSSConfigManager.instance;
  }

  /**
   * 加载配置
   */
  private loadConfiguration(): void {
    try {
      // 按优先级加载环境变量文件
      this.loadEnvironmentFiles();

      // 检测当前环境
      const environment = this.detectEnvironment();
      const isProduction = environment === 'production';

      console.log(`🌍 当前环境: ${environment} (${isProduction ? '生产' : '开发'}环境)`);

      // 根据环境加载对应的OSS配置
      const config = this.loadOSSConfigByEnvironment(environment, isProduction);

      // 验证配置完整性
      this.validateConfig(config);

      this.config = config;

      console.log(`✅ OSS配置加载成功:`);
      console.log(`   Bucket: ${config.bucket}`);
      console.log(`   Region: ${config.region}`);
      console.log(`   CDN: ${config.cdnDomain || '未配置'}`);
      console.log(`   路径前缀: ${config.basePath}`);

    } catch (error) {
      console.error('❌ OSS配置加载失败:', error.message);
      console.log('💡 将使用本地存储降级模式');
      this.config = null;
    }
  }

  /**
   * 加载环境变量文件
   */
  private loadEnvironmentFiles(): void {
    const configDir = path.join(__dirname, '../../..');

    for (const envFile of this.envFiles) {
      const envPath = path.join(configDir, envFile);
      if (fs.existsSync(envPath)) {
        console.log(`📁 加载环境文件: ${envFile}`);
        dotenv.config({ path: envPath });
      }
    }
  }

  /**
   * 检测当前运行环境
   */
  private detectEnvironment(): string {
    // 优先级：NODE_ENV > 环境变量 > 默认开发环境
    const nodeEnv = process.env.NODE_ENV;
    const customEnv = process.env.ENVIRONMENT || process.env.APP_ENV;

    if (nodeEnv) return nodeEnv;
    if (customEnv) return customEnv;

    // 根据域名或其他特征判断
    const hostname = process.env.HOSTNAME || '';
    const port = process.env.PORT || '';

    // 如果端口是443或80，或者域名包含生产标识，认为是生产环境
    if (port === '443' || port === '80' || hostname.includes('prod') || hostname.includes('yyup.cc')) {
      return 'production';
    }

    return 'development';
  }

  /**
   * 根据环境加载OSS配置
   */
  private loadOSSConfigByEnvironment(environment: string, isProduction: boolean): OSSConfig {
    const prefix = isProduction ? 'PRODUCTION_' : 'DEVELOPMENT_';

    // 优先使用环境特定配置，然后使用通用配置
    const config: OSSConfig = {
      accessKeyId: process.env[`${prefix}SYSTEM_OSS_ACCESS_KEY_ID`] ||
                   process.env.SYSTEM_OSS_ACCESS_KEY_ID || '',
      accessKeySecret: process.env[`${prefix}SYSTEM_OSS_ACCESS_KEY_SECRET`] ||
                       process.env.SYSTEM_OSS_ACCESS_KEY_SECRET || '',
      bucket: process.env[`${prefix}SYSTEM_OSS_BUCKET`] ||
              process.env.SYSTEM_OSS_BUCKET || 'systemkarder',
      region: process.env[`${prefix}SYSTEM_OSS_REGION`] ||
              process.env.SYSTEM_OSS_REGION || 'oss-cn-guangzhou',
      cdnDomain: process.env[`${prefix}SYSTEM_OSS_CDN_DOMAIN`] ||
                 process.env.SYSTEM_OSS_CDN_DOMAIN || '',
      basePath: process.env[`${prefix}SYSTEM_OSS_PATH_PREFIX`] ||
               process.env.SYSTEM_OSS_PATH_PREFIX || 'kindergarten/',
      isProduction,
      environment
    };

    return config;
  }

  /**
   * 验证配置完整性
   */
  private validateConfig(config: OSSConfig): void {
    if (!config.accessKeyId || !config.accessKeySecret) {
      throw new Error('OSS Access Key ID 或 Access Key Secret 未配置');
    }

    if (!config.bucket) {
      throw new Error('OSS Bucket 未配置');
    }

    if (!config.region) {
      throw new Error('OSS Region 未配置');
    }

    // 验证region格式
    if (!config.region.startsWith('oss-')) {
      throw new Error(`OSS Region 格式错误: ${config.region}`);
    }

    // 验证bucket命名规范
    if (config.bucket.length < 3 || config.bucket.length > 63) {
      throw new Error(`OSS Bucket 名称长度应在3-63个字符之间: ${config.bucket}`);
    }
  }

  /**
   * 获取OSS配置
   */
  public getConfig(): OSSConfig | null {
    return this.config;
  }

  /**
   * 检查OSS是否可用
   */
  public isAvailable(): boolean {
    return this.config !== null;
  }

  /**
   * 获取环境信息
   */
  public getEnvironmentInfo(): {
    environment: string;
    isProduction: boolean;
    nodeVersion: string;
    platform: string;
  } {
    return {
      environment: this.config?.environment || 'unknown',
      isProduction: this.config?.isProduction || false,
      nodeVersion: process.version,
      platform: process.platform
    };
  }

  /**
   * 重新加载配置
   */
  public reloadConfig(): void {
    this.config = null;
    this.loadConfiguration();
  }

  /**
   * 获取游戏图片的OSS路径
   */
  public getGameImagePath(fileName: string): string {
    if (!this.config) {
      throw new Error('OSS配置未加载');
    }
    return `${this.config.basePath}system/games/images/${fileName}`;
  }

  /**
   * 获取教育资源的OSS路径
   */
  public getEducationResourcePath(type: string, subType: string, fileName: string): string {
    if (!this.config) {
      throw new Error('OSS配置未加载');
    }
    return `${this.config.basePath}education/${type}/${subType}/${fileName}`;
  }

  /**
   * 获取租户文件的OSS路径
   */
  public getTenantFilePath(phone: string, fileName: string): string {
    if (!this.config) {
      throw new Error('OSS配置未加载');
    }
    return `${this.config.basePath}rent/${phone}/files/${fileName}`;
  }
}

// 导出单例实例
export const ossConfig = OSSConfigManager.getInstance();