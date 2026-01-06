import { Request } from 'express';
import { ossService } from './oss.service';           // 上海 OSS
import { systemOSSService } from './system-oss.service'; // 广东 OSS

/**
 * 租户 OSS 配置接口
 */
interface TenantOSSConfig {
  phone: string;
  tenantCode: string;
  region: 'shanghai' | 'guangdong';
  // 照片 OSS 配置
  photoOSS: {
    service: 'shanghai';
    bucket: string;
    basePath: string;
  };
  // 文件 OSS 配置
  fileOSS: {
    service: 'guangdong';
    bucket: string;
    basePath: string;
  };
}

/**
 * 租户 OSS 路由服务
 * 类似数据库的 ${tenantDb} 模式，自动为每个租户路由到正确的 OSS
 */
export class TenantOSSRouterService {
  /**
   * 从请求中获取租户 OSS 配置
   * @param req Express 请求对象
   */
  getTenantOSSConfig(req: Request): TenantOSSConfig {
    const tenant = (req as any).tenant;

    if (!tenant || !tenant.phone) {
      throw new Error('租户信息未找到，请确保已通过租户识别中间件');
    }

    return {
      phone: tenant.phone,
      tenantCode: tenant.code || tenant.databaseName?.replace('tenant_', '') || 'dev',
      region: tenant.region || 'guangdong',

      // 照片/相册 → 上海 OSS（带人脸识别）
      photoOSS: {
        service: 'shanghai',
        bucket: process.env.OSS_BUCKET || 'faceshanghaikarden',
        basePath: `kindergarten/rent/${tenant.phone}/photos/`
      },

      // 其他文件 → 广东 OSS
      fileOSS: {
        service: 'guangdong',
        bucket: process.env.SYSTEM_OSS_BUCKET || 'systemkarder',
        basePath: `kindergarten/rent/${tenant.phone}/files/`
      }
    };
  }

  /**
   * 上传租户照片（自动路由到上海 OSS）
   * @param req Express 请求对象
   * @param buffer 图片 Buffer
   * @param options 上传选项
   */
  async uploadPhoto(
    req: Request,
    buffer: Buffer,
    options: {
      filename?: string;
      fileType?: 'photos' | 'students' | 'albums';
      subPath?: string;
      maxWidth?: number;
      quality?: number;
      generateThumbnail?: boolean;
    } = {}
  ): Promise<{
    url: string;
    thumbnailUrl?: string;
    filename: string;
    size: number;
    ossPath: string;
    bucket: string;
    region: string;
  }> {
    const config = this.getTenantOSSConfig(req);

    // 使用上海 OSS 的租户上传方法
    const result = await ossService.uploadTenantImage(
      buffer,
      config.phone,
      options
    );

    return {
      ...result,
      bucket: config.photoOSS.bucket,
      region: 'oss-cn-shanghai'
    };
  }

  /**
   * 上传租户文件（自动路由到广东 OSS）
   * @param req Express 请求对象
   * @param buffer 文件 Buffer
   * @param options 上传选项
   */
  async uploadFile(
    req: Request,
    buffer: Buffer,
    options: {
      filename?: string;
      directory?: 'logos' | 'documents' | 'user-uploads';
      contentType?: string;
    } = {}
  ): Promise<{
    url: string;
    filename: string;
    size: number;
    ossPath: string;
    bucket: string;
    region: string;
  }> {
    const config = this.getTenantOSSConfig(req);

    const {
      filename = 'file.bin',
      directory = 'user-uploads',
      contentType = 'application/octet-stream'
    } = options;

    // 使用广东 OSS
    const result = await systemOSSService.uploadFile(buffer, {
      filename,
      directory: `rent/${config.phone}/${directory}`,
      contentType
    });

    return {
      ...result,
      bucket: config.fileOSS.bucket,
      region: 'oss-cn-guangzhou'
    };
  }

  /**
   * 获取租户文件的临时访问 URL
   * @param req Express 请求对象
   * @param ossPath OSS 路径
   * @param expiresInMinutes 有效期（分钟）
   */
  getTenantFileUrl(
    req: Request,
    ossPath: string,
    expiresInMinutes: number = 60
  ): string | null {
    const config = this.getTenantOSSConfig(req);

    // 判断是照片还是文件
    if (ossPath.includes('/photos/') || ossPath.includes('/students/') || ossPath.includes('/albums/')) {
      // 上海 OSS - 验证权限
      return ossService.getSecureTenantUrl(ossPath, config.phone, expiresInMinutes);
    } else {
      // 广东 OSS
      return systemOSSService.getTemporaryUrl(ossPath, expiresInMinutes);
    }
  }

  /**
   * 删除租户文件
   * @param req Express 请求对象
   * @param ossPath OSS 路径
   */
  async deleteTenantFile(req: Request, ossPath: string): Promise<void> {
    const config = this.getTenantOSSConfig(req);

    // 验证路径是否属于当前租户
    if (!ossPath.includes(`rent/${config.phone}/`)) {
      throw new Error('无权删除其他租户的文件');
    }

    // 判断使用哪个 OSS
    if (ossPath.includes('/photos/') || ossPath.includes('/students/') || ossPath.includes('/albums/')) {
      await ossService.deleteFile(ossPath);
    } else {
      await systemOSSService.deleteFile(ossPath);
    }
  }

  /**
   * 批量删除租户文件
   */
  async deleteTenantFiles(req: Request, ossPaths: string[]): Promise<void> {
    const config = this.getTenantOSSConfig(req);

    // 验证所有路径
    for (const path of ossPaths) {
      if (!path.includes(`rent/${config.phone}/`)) {
        throw new Error(`无权删除其他租户的文件: ${path}`);
      }
    }

    // 按 OSS 分组
    const shanghaiFaces: string[] = [];
    const guangdongPaths: string[] = [];

    for (const path of ossPaths) {
      if (path.includes('/photos/') || path.includes('/students/') || path.includes('/albums/')) {
        shanghaiFaces.push(path);
      } else {
        guangdongPaths.push(path);
      }
    }

    // 批量删除
    if (shanghaiFaces.length > 0) {
      await ossService.deleteFiles(shanghaiFaces);
    }
    if (guangdongPaths.length > 0) {
      await systemOSSService.deleteFiles(guangdongPaths);
    }
  }
}

// 导出单例
export const tenantOSS = new TenantOSSRouterService();