import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

router.get('/', (req, res) => {
  // 详细调试所有相关的环境变量
  const allEnvVars = {
    // OSS相关变量
    OSS_ACCESS_KEY_ID: process.env.OSS_ACCESS_KEY_ID,
    OSS_ACCESS_KEY_SECRET: process.env.OSS_ACCESS_KEY_SECRET,
    OSS_BUCKET: process.env.OSS_BUCKET,
    OSS_REGION: process.env.OSS_REGION,
    OSS_PATH_PREFIX: process.env.OSS_PATH_PREFIX,

    // 系统OSS相关变量
    SYSTEM_OSS_ACCESS_KEY_ID: process.env.SYSTEM_OSS_ACCESS_KEY_ID,
    SYSTEM_OSS_ACCESS_KEY_SECRET: process.env.SYSTEM_OSS_ACCESS_KEY_SECRET,
    SYSTEM_OSS_BUCKET: process.env.SYSTEM_OSS_BUCKET,
    SYSTEM_OSS_REGION: process.env.SYSTEM_OSS_REGION,
    SYSTEM_OSS_PATH_PREFIX: process.env.SYSTEM_OSS_PATH_PREFIX,

    // 其他相关变量
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET ? '已设置' : '未设置',
    DB_HOST: process.env.DB_HOST,
  };

  // 检查所有包含OSS的环境变量
  const ossRelatedKeys = Object.keys(process.env).filter(key => key.includes('OSS'));
  const ossEnvVars = {};
  ossRelatedKeys.forEach(key => {
    const value = process.env[key];
    if (key.includes('SECRET') || key.includes('KEY')) {
      // 隐藏敏感信息
      ossEnvVars[key] = value ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}` : '未设置';
    } else {
      ossEnvVars[key] = value || '未设置';
    }
  });

  res.json({
    success: true,
    data: {
      summary: {
        oss: {
          OSS_ACCESS_KEY_ID: process.env.OSS_ACCESS_KEY_ID ? '✅ 已配置' : '❌ 未配置',
          OSS_ACCESS_KEY_SECRET: process.env.OSS_ACCESS_KEY_SECRET ? '✅ 已配置' : '❌ 未配置',
          OSS_BUCKET: process.env.OSS_BUCKET,
          OSS_REGION: process.env.OSS_REGION,
          OSS_PATH_PREFIX: process.env.OSS_PATH_PREFIX
        },
        system_oss: {
          SYSTEM_OSS_ACCESS_KEY_ID: process.env.SYSTEM_OSS_ACCESS_KEY_ID ? '✅ 已配置' : '❌ 未配置',
          SYSTEM_OSS_ACCESS_KEY_SECRET: process.env.SYSTEM_OSS_ACCESS_KEY_SECRET ? '✅ 已配置' : '❌ 未配置',
          SYSTEM_OSS_BUCKET: process.env.SYSTEM_OSS_BUCKET,
          SYSTEM_OSS_REGION: process.env.SYSTEM_OSS_REGION,
          SYSTEM_OSS_PATH_PREFIX: process.env.SYSTEM_OSS_PATH_PREFIX
        }
      },
      detailed: allEnvVars,
      oss_related: ossEnvVars,
      env_keys_count: Object.keys(process.env).length,
      oss_keys_found: ossRelatedKeys.length
    }
  });
});

// 测试OSS签名URL生成
router.get('/test-oss-url', (req, res) => {
  try {
    const { OSSService } = require('../services/oss.service');
    const ossService = new OSSService();

    if (!ossService.isAvailable()) {
      return res.json({
        success: false,
        message: 'OSS服务不可用'
      });
    }

    // 测试路径
    const testPath = 'kindergarten/photos/2025-11/afd34c31-4c6a-4dcb-8887-91118eede098.jpg';

    // 生成不同有效期的签名URL
    const url1min = ossService.getTemporaryUrl(testPath, 1); // 1分钟
    const url1hour = ossService.getTemporaryUrl(testPath, 60); // 1小时
    const url1day = ossService.getTemporaryUrl(testPath, 1440); // 1天

    // 检查客户端信息
    const clientInfo = {
      bucket: process.env.OSS_BUCKET,
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID ? process.env.OSS_ACCESS_KEY_ID.substring(0, 8) + '...' : '未设置',
      pathPrefix: process.env.OSS_PATH_PREFIX
    };

    res.json({
      success: true,
      data: {
        testPath,
        clientInfo,
        generatedUrls: {
          '1min': url1min,
          '1hour': url1hour,
          '1day': url1day
        },
        urlAnalysis: {
          hasAccessKey: url1min.includes('OSSAccessKeyId='),
          hasExpires: url1min.includes('Expires='),
          hasSignature: url1min.includes('Signature='),
          isHttps: url1min.startsWith('https://')
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'OSS URL测试失败',
      error: error.message
    });
  }
});

// 深度OSS签名调试
router.get('/deep-oss-debug', async (req, res) => {
  try {
    const { OSSService } = require('../services/oss.service');
    const ossService = new OSSService();

    console.log('[深度OSS调试] 开始分析...');

    // 1. 检查OSS服务状态
    const isAvailable = ossService.isAvailable();
    console.log('[深度OSS调试] OSS服务可用性:', isAvailable);

    if (!isAvailable) {
      return res.json({
        success: false,
        message: 'OSS服务不可用'
      });
    }

    // 2. 获取客户端配置
    const clientConfig = {
      bucket: process.env.OSS_BUCKET,
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID?.substring(0, 10) + '...',
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET?.substring(0, 10) + '...',
    };
    console.log('[深度OSS调试] 客户端配置:', clientConfig);

    // 3. 测试不同的签名URL生成方式
    const testPath = 'kindergarten/photos/2025-11/afd34c31-4c6a-4dcb-8887-91118eede098.jpg';

    // 方法1：使用getTemporaryUrl（当前使用的方法）
    const url1 = ossService.getTemporaryUrl(testPath, 60);

    // 方法2：直接使用OSS客户端生成签名URL
    let url2 = '';
    try {
      // 获取OSS客户端实例（通过反射）
      const client = (ossService as any).client;
      if (client) {
        url2 = client.signatureUrl(testPath, { expires: 3600 });
        url2 = url2.replace('http://', 'https://');
      }
    } catch (error) {
      console.log('[深度OSS调试] 直接客户端调用失败:', error);
    }

    // 方法3：不使用HTTPS替换
    let url3 = '';
    try {
      const client = (ossService as any).client;
      if (client) {
        url3 = client.signatureUrl(testPath, { expires: 3600 });
      }
    } catch (error) {
      console.log('[深度OSS调试] HTTP协议测试失败:', error);
    }

    // 4. 分析URL结构
    const urlAnalysis = {
      url1: {
        full: url1,
        hasAccessKey: url1.includes('OSSAccessKeyId='),
        hasExpires: url1.includes('Expires='),
        hasSignature: url1.includes('Signature='),
        isHttps: url1.startsWith('https://'),
        domain: url1.split('?')[0],
        params: url1.split('?')[1] ? url1.split('?')[1].split('&') : []
      },
      url2: url2 ? {
        full: url2,
        hasAccessKey: url2.includes('OSSAccessKeyId='),
        hasExpires: url2.includes('Expires='),
        hasSignature: url2.includes('Signature='),
        isHttps: url2.startsWith('https://'),
        domain: url2.split('?')[0],
        params: url2.split('?')[1] ? url2.split('?')[1].split('&') : []
      } : null,
      url3: url3 ? {
        full: url3,
        hasAccessKey: url3.includes('OSSAccessKeyId='),
        hasExpires: url3.includes('Expires='),
        hasSignature: url3.includes('Signature='),
        isHttps: url3.startsWith('https://'),
        domain: url3.split('?')[0],
        params: url3.split('?')[1] ? url3.split('?')[1].split('&') : []
      } : null
    };

    console.log('[深度OSS调试] URL分析完成');

    // 5. 检查文件是否存在
    let fileExists = false;
    let fileError = null;
    try {
      const client = (ossService as any).client;
      if (client) {
        // 尝试获取文件信息
        try {
          await client.head(testPath);
          fileExists = true;
          console.log('[深度OSS调试] 文件存在');
        } catch (headError: any) {
          console.log('[深度OSS调试] 文件不存在或无权限:', headError.message);
          fileError = headError.message;
        }
      }
    } catch (error: any) {
      console.log('[深度OSS调试] 客户端初始化错误:', error.message);
      fileError = error.message;
    }

    res.json({
      success: true,
      data: {
        clientConfig,
        testPath,
        urlAnalysis,
        fileExists,
        fileError,
        timestamp: new Date().toISOString(),
        serverTime: new Date().getTime()
      }
    });

  } catch (error: any) {
    console.error('[深度OSS调试] 错误:', error);
    res.status(500).json({
      success: false,
      message: 'OSS调试失败',
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;