/**
 * API版本控制配置
 *
 * 支持多个API版本的并行运行
 */

import { Router, Request, Response, NextFunction } from 'express';

/**
 * API版本类型
 */
export type ApiVersion = 'v1' | 'v2' | 'v3' | 'latest';

/**
 * 版本路由映射
 */
interface VersionRoute {
  version: ApiVersion;
  deprecated: boolean;
  deprecationDate?: Date;
  router: Router;
}

/**
 * API版本管理器
 */
export class ApiVersionManager {
  private versions: Map<ApiVersion, VersionRoute> = new Map();

  /**
   * 注册版本路由
   */
  registerVersion(config: VersionRoute): void {
    this.versions.set(config.version, config);

    if (config.deprecated) {
      console.warn(`⚠️ API版本 ${config.version} 已废弃`);
      if (config.deprecationDate) {
        console.warn(`   废弃日期: ${config.deprecationDate.toISOString()}`);
      }
    }
  }

  /**
   * 获取版本信息
   */
  getVersion(version: ApiVersion): VersionRoute | undefined {
    return this.versions.get(version);
  }

  /**
   * 获取所有版本
   */
  getAllVersions(): VersionRoute[] {
    return Array.from(this.versions.values()).sort((a, b) =>
      a.version.localeCompare(b.version)
    );
  }

  /**
   * 获取最新版本
   */
  getLatestVersion(): VersionRoute | undefined {
    const versions = Array.from(this.versions.values());
    return versions
      .filter(v => !v.deprecated)
      .sort((a, b) => b.version.localeCompare(a.version))[0];
  }

  /**
   * 检查版本是否废弃
   */
  isDeprecated(version: ApiVersion): boolean {
    const route = this.versions.get(version);
    return route?.deprecated || false;
  }
}

/**
 * 创建版本管理器实例
 */
export const apiVersionManager = new ApiVersionManager();

/**
 * 从请求头或参数中提取版本
 */
export function extractApiVersion(req: Request): ApiVersion {
  // 1. 从查询参数获取
  const queryVersion = req.query.version as ApiVersion;
  if (queryVersion && apiVersionManager.getVersion(queryVersion)) {
    return queryVersion;
  }

  // 2. 从请求头获取
  const headerVersion = req.headers['x-api-version'] as ApiVersion;
  if (headerVersion && apiVersionManager.getVersion(headerVersion)) {
    return headerVersion;
  }

  // 3. 从URL路径获取
  const urlVersion = req.path.split('/')[1] as ApiVersion;
  if (urlVersion && apiVersionManager.getVersion(urlVersion)) {
    return urlVersion;
  }

  // 4. 返回最新版本
  const latest = apiVersionManager.getLatestVersion();
  return latest?.version || 'v1';
}

/**
 * API版本中间件
 */
export function apiVersionMiddleware(req: Request, res: Response, next: NextFunction) {
  const version = extractApiVersion(req);

  // 检查版本是否废弃
  if (apiVersionManager.isDeprecated(version)) {
    const versionInfo = apiVersionManager.getVersion(version);
    res.setHeader('X-API-Deprecation', 'true');
    res.setHeader('X-API-Deprecation-Date', versionInfo?.deprecationDate?.toISOString() || '');
    res.setHeader('X-API-Latest-Version', apiVersionManager.getLatestVersion()?.version || 'v1');
  }

  // 将版本信息添加到请求对象
  (req as any).apiVersion = version;

  next();
}

/**
 * 创建版本化路由
 */
export function createVersionedRouter(version: ApiVersion, deprecated: boolean = false): Router {
  const router = Router();

  apiVersionManager.registerVersion({
    version,
    deprecated,
    deprecationDate: deprecated ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) : undefined, // 6个月后
    router
  });

  return router;
}

/**
 * 版本响应头中间件
 */
export function addVersionHeadersMiddleware(version: ApiVersion) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-API-Version', version);

    const latest = apiVersionManager.getLatestVersion();
    if (latest && version !== latest.version) {
      res.setHeader('X-API-Latest-Version', latest.version);
    }

    next();
  };
}

/**
 * 获取版本信息端点
 */
export function getVersionInfoEndpoint() {
  return (req: Request, res: Response) => {
    const versions = apiVersionManager.getAllVersions();

    res.json({
      success: true,
      data: {
        current: (req as any).apiVersion || 'v1',
        versions: versions.map(v => ({
          version: v.version,
          deprecated: v.deprecated,
          deprecationDate: v.deprecationDate
        })),
        latest: apiVersionManager.getLatestVersion()?.version || 'v1'
      }
    });
  };
}

/**
 * 版本化路由装饰器工厂
 */
export function Versioned(version: ApiVersion) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 在控制器上添加版本信息
      const req = args[0]; // 假设第一个参数是请求
      if (req && req.req) {
        req.req.apiVersion = version;
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * 导出配置
 */
export default {
  ApiVersionManager,
  apiVersionManager,
  extractApiVersion,
  apiVersionMiddleware,
  createVersionedRouter,
  addVersionHeadersMiddleware,
  getVersionInfoEndpoint,
  Versioned
};
