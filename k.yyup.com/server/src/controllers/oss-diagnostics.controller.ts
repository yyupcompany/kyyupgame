import { Request, Response } from 'express';
import OSS from 'ali-oss';

export class OSSdiagnosticsController {
  /**
   * 诊断 OSS 连接
   */
  static async diagnoseConnection(req: Request, res: Response) {
    try {
      const diagnostics = {
        timestamp: new Date().toISOString(),
        environment: {
          bucket: process.env.SYSTEM_OSS_BUCKET,
          region: process.env.SYSTEM_OSS_REGION,
          hasAccessKeyId: !!process.env.SYSTEM_OSS_ACCESS_KEY_ID,
          hasAccessKeySecret: !!process.env.SYSTEM_OSS_ACCESS_KEY_SECRET,
          accessKeyIdLength: process.env.SYSTEM_OSS_ACCESS_KEY_ID?.length || 0,
          accessKeySecretLength: process.env.SYSTEM_OSS_ACCESS_KEY_SECRET?.length || 0,
        },
        connection: {
          status: 'testing',
          error: null
        }
      };

      // 测试连接
      try {
        const client = new OSS({
          region: process.env.SYSTEM_OSS_REGION,
          accessKeyId: process.env.SYSTEM_OSS_ACCESS_KEY_ID,
          accessKeySecret: process.env.SYSTEM_OSS_ACCESS_KEY_SECRET,
          bucket: process.env.SYSTEM_OSS_BUCKET,
        });

        const result = await client.list({ 'max-keys': 1 });
        diagnostics.connection.status = 'success';
        (diagnostics.connection as any).message = '✅ OSS 连接成功';
      } catch (error: any) {
        diagnostics.connection.status = 'failed';
        diagnostics.connection.error = {
          message: error.message,
          code: error.code,
          status: error.status,
          ecCode: error.ecCode
        };
      }

      res.json({
        success: true,
        data: diagnostics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message || '诊断OSS连接时发生未知错误'
      });
    }
  }

  /**
   * 获取 OSS 配置建议
   */
  static async getConfigurationGuide(req: Request, res: Response) {
    try {
      const guide = {
        title: 'OSS 配置指南',
        steps: [
          {
            step: 1,
            title: '登录阿里云控制台',
            url: 'https://console.aliyun.com',
            description: '访问阿里云控制台'
          },
          {
            step: 2,
            title: '获取 Access Key',
            url: 'https://ram.console.aliyun.com/manage/ak',
            description: '在 RAM 访问控制中创建或查看 Access Key'
          },
          {
            step: 3,
            title: '复制 Access Key ID 和 Secret',
            description: '复制新创建的 Access Key ID 和 Access Key Secret'
          },
          {
            step: 4,
            title: '更新 .env 文件',
            description: '将以下内容添加到 server/.env 文件:',
            config: {
              'SYSTEM_OSS_ACCESS_KEY_ID': 'your-access-key-id',
              'SYSTEM_OSS_ACCESS_KEY_SECRET': 'your-access-key-secret',
              'SYSTEM_OSS_BUCKET': 'systemkarder',
              'SYSTEM_OSS_REGION': 'oss-cn-guangzhou'
            }
          },
          {
            step: 5,
            title: '重启服务',
            description: '重启后端服务以应用新的配置'
          }
        ],
        troubleshooting: [
          {
            issue: 'InvalidAccessKeyId 错误',
            solutions: [
              '确认 Access Key ID 和 Secret 是否正确复制',
              '检查 Access Key 是否已被禁用或删除',
              '确认 Access Key 属于正确的阿里云账户',
              '尝试创建新的 Access Key'
            ]
          },
          {
            issue: '连接超时',
            solutions: [
              '检查网络连接',
              '确认 Region 配置是否正确',
              '检查防火墙设置'
            ]
          }
        ]
      };

      res.json({
        success: true,
        data: guide
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message || '诊断OSS连接时发生未知错误'
      });
    }
  }
}

