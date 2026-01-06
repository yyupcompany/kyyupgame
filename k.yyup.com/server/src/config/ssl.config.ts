import fs from 'fs';
import path from 'path';
import https from 'https';

export interface SSLConfig {
  key: string;
  cert: string;
  ca?: string;
}

/**
 * SSL配置管理
 */
export class SSLManager {
  private static instance: SSLManager;
  private sslConfig: SSLConfig | null = null;

  private constructor() {}

  public static getInstance(): SSLManager {
    if (!SSLManager.instance) {
      SSLManager.instance = new SSLManager();
    }
    return SSLManager.instance;
  }

  /**
   * 加载SSL证书文件
   */
  public loadSSLConfig(): SSLConfig | null {
    try {
      const sslDir = path.join(__dirname, '../../ssl');
      const keyPath = path.join(sslDir, 'private.key');
      const certPath = path.join(sslDir, 'certificate.crt');
      const caPath = path.join(sslDir, 'ca_bundle.crt');

      // 检查必需的文件是否存在
      if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
        console.log('SSL证书文件不存在，使用HTTP模式');
        return null;
      }

      const config: SSLConfig = {
        key: fs.readFileSync(keyPath, 'utf8'),
        cert: fs.readFileSync(certPath, 'utf8')
      };

      // 如果CA bundle存在，则添加
      if (fs.existsSync(caPath)) {
        config.ca = fs.readFileSync(caPath, 'utf8');
      }

      this.sslConfig = config;
      console.log('✅ SSL证书加载成功');
      return config;
    } catch (error) {
      console.error('❌ 加载SSL证书失败:', error);
      return null;
    }
  }

  /**
   * 创建HTTPS服务器选项
   */
  public getHTTPSOptions(): https.ServerOptions | null {
    const config = this.loadSSLConfig();
    if (!config) {
      return null;
    }

    return {
      key: config.key,
      cert: config.cert,
      ca: config.ca
    };
  }

  /**
   * 检查SSL证书是否可用
   */
  public isSSLAvailable(): boolean {
    return this.sslConfig !== null;
  }
}

export default SSLManager;