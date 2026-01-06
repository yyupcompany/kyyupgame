import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

// 深度OSS调试工具
router.get('/oss-debug', (req, res) => {
  try {
    const { OSSService } = require('../services/oss.service');
    const ossService = new OSSService();

    console.log('[OSS深度调试] 开始分析...');

    // 1. 检查OSS服务状态
    const isAvailable = ossService.isAvailable();
    console.log('[OSS深度调试] OSS服务可用性:', isAvailable);

    if (!isAvailable) {
      return res.json({
        success: false,
        message: 'OSS服务不可用'
      });
    }

    // 2. 获取客户端配置（通过反射获取私有属性）
    const clientConfig = {
      bucket: process.env.OSS_BUCKET,
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID?.substring(0, 10) + '...',
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET?.substring(0, 10) + '...',
    };
    console.log('[OSS深度调试] 客户端配置:', clientConfig);

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
      console.log('[OSS深度调试] 直接客户端调用失败:', error);
    }

    // 方法3：不使用HTTPS替换
    let url3 = '';
    try {
      const client = (ossService as any).client;
      if (client) {
        url3 = client.signatureUrl(testPath, { expires: 3600 });
      }
    } catch (error) {
      console.log('[OSS深度调试] HTTP协议测试失败:', error);
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

    console.log('[OSS深度调试] URL分析完成');

    // 5. 检查文件是否存在（尝试list操作）
    let fileExists = false;
    try {
      const client = (ossService as any).client;
      if (client) {
        // 尝试获取文件信息
        const result = client.head(testPath);
        fileExists = true;
        console.log('[OSS深度调试] 文件存在');
      }
    } catch (error) {
      console.log('[OSS深度调试] 文件不存在或无权限:', error);
    }

    // 6. 检查bucket权限
    let bucketInfo = null;
    try {
      const client = (ossService as any).client;
      if (client) {
        bucketInfo = {
          bucket: process.env.OSS_BUCKET,
          region: process.env.OSS_REGION
        };
        console.log('[OSS深度调试] Bucket信息获取成功');
      }
    } catch (error) {
      console.log('[OSS深度调试] Bucket信息获取失败:', error);
    }

    res.json({
      success: true,
      data: {
        clientConfig,
        testPath,
        urlAnalysis,
        fileExists,
        bucketInfo,
        timestamp: new Date().toISOString(),
        serverTime: new Date().getTime()
      }
    });

  } catch (error: any) {
    console.error('[OSS深度调试] 错误:', error);
    res.status(500).json({
      success: false,
      message: 'OSS调试失败',
      error: error.message,
      stack: error.stack
    });
  }
});

// 测试简单路径的签名URL
router.get('/oss-simple-test', (req, res) => {
  try {
    const { OSSService } = require('../services/oss.service');
    const ossService = new OSSService();

    // 使用更简单的路径进行测试
    const simplePaths = [
      'kindergarten/test.txt',
      'test.txt',
      'kindergarten/photos/test.jpg'
    ];

    const results = [];

    for (const path of simplePaths) {
      const url = ossService.getTemporaryUrl(path, 60);
      results.push({
        path,
        url,
        hasAccessKey: url.includes('OSSAccessKeyId='),
        hasExpires: url.includes('Expires='),
        hasSignature: url.includes('Signature=')
      });
    }

    res.json({
      success: true,
      data: {
        results,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: '简单测试失败',
      error: error.message
    });
  }
});

export default router;