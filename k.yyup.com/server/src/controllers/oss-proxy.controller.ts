import { Request, Response } from 'express';
import { systemOSSService } from '../services/system-oss.service';
import { tenantOSS } from '../services/tenant-oss-router.service';

/**
 * OSS文件代理控制器
 * 由于OSS文件无法设置为公共读权限，通过后端代理提供文件访问
 */
export class OSSProxyController {
  /**
   * 代理访问OSS文件
   * GET /api/oss-proxy/*
   */
  static async proxyFile(req: Request, res: Response): Promise<void> {
    try {
      // 从URL中提取文件路径
      const filePath = req.path.replace('/api/oss-proxy/', '');
      const ossPath = `kindergarten/${filePath}`;

      console.log(`[OSS代理] 请求文件: ${ossPath}`);

      // 判断是租户文件还是系统文件，并生成对应的URL
      let signedUrl: string | null = null;

      if (ossPath.includes('/rent/')) {
        // 租户文件，使用tenantOSS
        signedUrl = tenantOSS.getTenantFileUrl(req, ossPath, 60);
      } else if (ossPath.includes('/system/')) {
        // 系统文件，使用systemOSSService
        signedUrl = systemOSSService.getTemporaryUrl(ossPath, 60);
      } else {
        // 旧版文件，默认使用systemOSSService
        signedUrl = systemOSSService.getTemporaryUrl(ossPath, 60);
      }

      if (!signedUrl) {
        res.status(503).json({
          success: false,
          message: 'OSS服务不可用或文件不存在'
        });
        return;
      }

      // 重定向到OSS的签名URL
      res.redirect(302, signedUrl);

    } catch (error) {
      console.error('[OSS代理] 代理文件失败:', error);
      res.status(500).json({
        success: false,
        message: '获取文件失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取OSS文件信息
   * GET /api/oss-proxy/info/*
   */
  static async getFileInfo(req: Request, res: Response): Promise<void> {
    try {
      const filePath = req.path.replace('/api/oss-proxy/info/', '');
      const ossPath = `kindergarten/${filePath}`;

      console.log(`[OSS代理] 获取文件信息: ${ossPath}`);

      // 判断是租户文件还是系统文件，并生成对应的URL
      let signedUrl: string | null = null;

      if (ossPath.includes('/rent/')) {
        // 租户文件，使用tenantOSS
        signedUrl = tenantOSS.getTenantFileUrl(req, ossPath, 60);
      } else if (ossPath.includes('/system/')) {
        // 系统文件，使用systemOSSService
        signedUrl = systemOSSService.getTemporaryUrl(ossPath, 60);
      } else {
        // 旧版文件，默认使用systemOSSService
        signedUrl = systemOSSService.getTemporaryUrl(ossPath, 60);
      }

      if (!signedUrl) {
        res.status(404).json({
          success: false,
          message: '文件不存在'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          filePath,
          ossPath,
          signedUrl,
          expiresIn: 3600 // 1小时
        }
      });

    } catch (error) {
      console.error('[OSS代理] 获取文件信息失败:', error);
      res.status(500).json({
        success: false,
        message: '获取文件信息失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取游戏资源URL (已更新为新的system目录结构)
   * GET /api/oss-proxy/games/:type/:subType/:filename
   */
  static async getGameAsset(req: Request, res: Response): Promise<void> {
    try {
      const { type, subType, filename } = req.params;
      // 更新为新的system目录结构
      const ossPath = `kindergarten/system/games/${type}/${subType}/${filename}`;

      console.log(`[OSS代理] 获取游戏资源: ${ossPath}`);

      if (!systemOSSService.isAvailable()) {
        res.status(503).json({
          success: false,
          message: 'OSS服务不可用'
        });
        return;
      }

      const signedUrl = systemOSSService.getTemporaryUrl(ossPath, 60);

      if (!signedUrl) {
        res.status(404).json({
          success: false,
          message: '游戏资源不存在'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          type,
          subType,
          filename,
          ossPath,
          signedUrl,
          directUrl: signedUrl
        }
      });

    } catch (error) {
      console.error('[OSS代理] 获取游戏资源失败:', error);
      res.status(500).json({
        success: false,
        message: '获取游戏资源失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取教育资源URL (已更新为新的system目录结构)
   * GET /api/oss-proxy/education/:category/:subType/:filename
   */
  static async getEducationAsset(req: Request, res: Response): Promise<void> {
    try {
      const { category, subType, filename } = req.params;
      // 更新为新的system目录结构
      const ossPath = `kindergarten/system/education/${category}/${subType}/${filename}`;

      console.log(`[OSS代理] 获取教育资源: ${ossPath}`);

      if (!systemOSSService.isAvailable()) {
        res.status(503).json({
          success: false,
          message: 'OSS服务不可用'
        });
        return;
      }

      const signedUrl = systemOSSService.getTemporaryUrl(ossPath, 60);

      if (!signedUrl) {
        res.status(404).json({
          success: false,
          message: '教育资源不存在'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          category,
          subType,
          filename,
          ossPath,
          signedUrl,
          directUrl: signedUrl
        }
      });

    } catch (error) {
      console.error('[OSS代理] 获取教育资源失败:', error);
      res.status(500).json({
        success: false,
        message: '获取教育资源失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 批量获取资源URL
   * POST /api/oss-proxy/batch
   */
  static async batchGetAssets(req: Request, res: Response): Promise<void> {
    try {
      const { files } = req.body; // Array of { path, type? }

      if (!Array.isArray(files) || files.length === 0) {
        res.status(400).json({
          success: false,
          message: '无效的请求参数'
        });
        return;
      }

      if (!systemOSSService.isAvailable()) {
        res.status(503).json({
          success: false,
          message: 'OSS服务不可用'
        });
        return;
      }

      const results = await Promise.allSettled(
        files.map(async (file: { path: string; type?: string }) => {
          const ossPath = file.path.startsWith('kindergarten/')
            ? file.path
            : `kindergarten/${file.path}`;

          const signedUrl = systemOSSService.getTemporaryUrl(ossPath, 60);

          return {
            path: file.path,
            type: file.type || 'unknown',
            ossPath,
            signedUrl,
            exists: !!signedUrl
          };
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').map(r => (r as any).value);
      const failed = results.filter(r => r.status === 'rejected');

      res.json({
        success: true,
        data: {
          total: files.length,
          successful: successful.length,
          failed: failed.length,
          files: successful
        }
      });

    } catch (error) {
      console.error('[OSS代理] 批量获取资源失败:', error);
      res.status(500).json({
        success: false,
        message: '批量获取资源失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取租户文件URL (新增多租户支持)
   * GET /api/oss-proxy/tenant/:fileType/:filename
   */
  static async getTenantFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileType, filename } = req.params;
      const tenant = (req as any).tenant;
      const tenantKey = tenant?.ossNamespace || tenant?.code;

      if (!tenant || !tenantKey) {
        res.status(401).json({
          success: false,
          message: '未找到租户信息'
        });
        return;
      }

      // 验证文件类型
      const allowedFileTypes = ['images', 'documents', 'videos', 'audio'];
      if (!allowedFileTypes.includes(fileType)) {
        res.status(400).json({
          success: false,
          message: '不支持的文件类型'
        });
        return;
      }

      // 构建租户文件路径 - 使用租户标识
      const ossPath = `kindergarten/rent/${tenantKey}/user-uploads/${fileType}/${filename}`;

      console.log(`[OSS代理] 获取租户文件: ${ossPath}`);

      if (!systemOSSService.isAvailable()) {
        res.status(503).json({
          success: false,
          message: 'OSS服务不可用'
        });
        return;
      }

      const signedUrl = systemOSSService.getTemporaryUrl(ossPath, 60);

      if (!signedUrl) {
        res.status(404).json({
          success: false,
          message: '租户文件不存在'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          tenantKey,
          fileType,
          filename,
          ossPath,
          signedUrl,
          directUrl: signedUrl
        }
      });

    } catch (error) {
      console.error('[OSS代理] 获取租户文件失败:', error);
      res.status(500).json({
        success: false,
        message: '获取租户文件失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取系统文件URL (新增多租户支持)
   * GET /api/oss-proxy/system/:category/:subType/:filename
   */
  static async getSystemFile(req: Request, res: Response): Promise<void> {
    try {
      const { category, subType, filename } = req.params;

      // 验证系统分类
      const allowedCategories = ['games', 'education', 'development'];
      if (!allowedCategories.includes(category)) {
        res.status(400).json({
          success: false,
          message: '不支持的系统分类'
        });
        return;
      }

      // 构建系统文件路径
      const ossPath = `kindergarten/system/${category}/${subType}/${filename}`;

      console.log(`[OSS代理] 获取系统文件: ${ossPath}`);

      if (!systemOSSService.isAvailable()) {
        res.status(503).json({
          success: false,
          message: 'OSS服务不可用'
        });
        return;
      }

      const signedUrl = systemOSSService.getTemporaryUrl(ossPath, 60);

      if (!signedUrl) {
        res.status(404).json({
          success: false,
          message: '系统文件不存在'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          category,
          subType,
          filename,
          ossPath,
          signedUrl,
          directUrl: signedUrl
        }
      });

    } catch (error) {
      console.error('[OSS代理] 获取系统文件失败:', error);
      res.status(500).json({
        success: false,
        message: '获取系统文件失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 开发资源代理 (新增支持)
   * GET /api/oss-proxy/development/:subType/:filename
   */
  static async getDevelopmentAsset(req: Request, res: Response): Promise<void> {
    try {
      const { subType, filename } = req.params;
      // 更新为新的system目录结构
      const ossPath = `kindergarten/system/development/${subType}/${filename}`;

      console.log(`[OSS代理] 获取开发资源: ${ossPath}`);

      if (!systemOSSService.isAvailable()) {
        res.status(503).json({
          success: false,
          message: 'OSS服务不可用'
        });
        return;
      }

      const signedUrl = systemOSSService.getTemporaryUrl(ossPath, 60);

      if (!signedUrl) {
        res.status(404).json({
          success: false,
          message: '开发资源不存在'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          subType,
          filename,
          ossPath,
          signedUrl,
          directUrl: signedUrl
        }
      });

    } catch (error) {
      console.error('[OSS代理] 获取开发资源失败:', error);
      res.status(500).json({
        success: false,
        message: '获取开发资源失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}