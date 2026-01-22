/**
 * OSS租户安全服务
 * 实现OSS路径的租户隔离验证和MD5安全校验
 *
 * 目录结构：
 *
 * 【广州OSS - systemkarder】系统级存储
 * - system/: 公共系统资源（所有租户可访问）
 * - games/: 游戏资源（所有租户可访问）
 * - education/: 教育资源（所有租户可访问）
 * - rent/{tenant}/: 租户隔离目录（仅对应租户可访问）
 *
 * 【上海OSS - faceshanghaikarden】人脸识别/相册
 * - test-faces/: 测试人脸数据（公共）
 * - rent/{tenant}/photos/: 租户班级照片（隔离）
 * - rent/{tenant}/students/: 租户学生照片（隔离）
 * - rent/{tenant}/albums/: 租户相册（隔离）
 */

import crypto from 'crypto';
import { logger } from '../utils/logger';

/**
 * OSS访问令牌信息
 */
export interface OSSAccessTokenInfo {
  tenantKey: string;
  tenantCode: string;
  ossPath: string;
  bucket: 'shanghai' | 'guangzhou';
  timestamp: number;
  token: string;
  expiresAt: Date;
}

/**
 * 广州OSS安全配置（系统级存储）
 */
const GUANGZHOU_OSS_CONFIG = {
  BUCKET: 'systemkarder',
  REGION: 'oss-cn-guangzhou',
  PUBLIC_PREFIXES: ['system/', 'games/', 'education/', 'development/'],
  TENANT_PREFIX: 'rent/',
  BASE_PATH: 'kindergarten/',
};

/**
 * 上海OSS安全配置（人脸识别/相册）
 */
const SHANGHAI_OSS_CONFIG = {
  BUCKET: 'faceshanghaikarden',
  REGION: 'oss-cn-shanghai',
  PUBLIC_PREFIXES: ['test-faces/'],
  TENANT_PREFIX: 'rent/',
  BASE_PATH: 'kindergarten/',
  // 租户隔离子目录
  TENANT_SUBDIRS: ['photos', 'students', 'albums'],
};

/**
 * 通用OSS安全配置
 */
const OSS_SECURITY_CONFIG = {
  // 令牌有效期：60分钟
  EXPIRES_IN: 60 * 60 * 1000,
  // 时间戳精度：60分钟
  TIMESTAMP_UNIT: 60 * 60,
  // MD5盐值
  SALT: process.env.OSS_SECURITY_SALT || 'oss-tenant-security-2024',
  // 令牌前缀
  TOKEN_PREFIX: 'OSS_',
  // 公共目录前缀（所有租户可访问）- 广州OSS
  PUBLIC_PREFIXES: GUANGZHOU_OSS_CONFIG.PUBLIC_PREFIXES,
  // 租户隔离目录前缀
  TENANT_PREFIX: 'rent/',
  // OSS基础路径
  BASE_PATH: 'kindergarten/',
};

/**
 * OSS租户安全服务类
 */
export class OssTenantSecurityService {
  private static instance: OssTenantSecurityService;

  constructor() {
    logger.info('OSS租户安全服务初始化完成');
  }

  /**
   * 获取单例实例
   */
  static getInstance(): OssTenantSecurityService {
    if (!OssTenantSecurityService.instance) {
      OssTenantSecurityService.instance = new OssTenantSecurityService();
    }
    return OssTenantSecurityService.instance;
  }

  /**
   * 生成OSS访问令牌
   */
  generateOSSAccessToken(
    tenantKey: string,
    tenantCode: string,
    ossPath: string,
    bucket: 'shanghai' | 'guangzhou' = 'guangzhou'
  ): OSSAccessTokenInfo {
    try {
      this.validateInputs(tenantKey, tenantCode, ossPath);

      const timestamp = Math.floor(Date.now() / (OSS_SECURITY_CONFIG.TIMESTAMP_UNIT * 1000));
      const tokenData = `${tenantKey}:${tenantCode}:${ossPath}:${bucket}:${timestamp}:${OSS_SECURITY_CONFIG.SALT}`;
      const md5Hash = crypto.createHash('md5').update(tokenData, 'utf8').digest('hex');
      const token = `${OSS_SECURITY_CONFIG.TOKEN_PREFIX}${md5Hash}`;
      const expiresAt = new Date(timestamp * OSS_SECURITY_CONFIG.TIMESTAMP_UNIT * 1000 + OSS_SECURITY_CONFIG.EXPIRES_IN);

      logger.info('OSS访问令牌生成成功', {
        tenantKey: this.maskTenantKey(tenantKey),
        tenantCode,
        ossPath: this.truncatePath(ossPath),
        bucket
      });

      return { tenantKey, tenantCode, ossPath, bucket, timestamp, token, expiresAt };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('生成OSS访问令牌失败', { error: errorMessage });
      throw new Error(`生成OSS访问令牌失败: ${errorMessage}`);
    }
  }

  /**
   * 验证OSS路径访问权限
   */
  validateOSSPathAccess(
    tenantKey: string,
    tenantCode: string,
    ossPath: string
  ): { isValid: boolean; error?: string; accessType?: 'public' | 'tenant' } {
    try {
      // 1. 标准化路径
      const normalizedPath = this.normalizePath(ossPath);

      // 2. 检查是否为公共资源
      if (this.isPublicResource(normalizedPath)) {
        return { isValid: true, accessType: 'public' };
      }

      // 3. 检查租户隔离目录权限
      if (this.isTenantResource(normalizedPath)) {
        const pathTenantKey = this.extractTenantKeyFromPath(normalizedPath);
        if (!pathTenantKey) {
          return { isValid: false, error: '无效的租户路径格式' };
        }
        if (pathTenantKey !== tenantKey) {
          logger.warn('OSS租户越权访问尝试', {
            tenantKey: this.maskTenantKey(tenantKey),
            pathTenantKey: this.maskTenantKey(pathTenantKey),
            ossPath: this.truncatePath(ossPath)
          });
          return { isValid: false, error: 'OSS资源访问越权' };
        }
        return { isValid: true, accessType: 'tenant' };
      }

      // 4. 其他路径默认拒绝
      return { isValid: false, error: '未知的OSS路径类型' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('验证OSS路径访问权限失败', { error: errorMessage });
      return { isValid: false, error: '路径验证异常' };
    }
  }

  /**
   * 生成租户隔离的OSS路径（广州OSS）
   */
  generateTenantOSSPath(tenantKey: string, subPath: string): string {
    if (!tenantKey) {
      throw new Error('租户标识无效');
    }
    return `${GUANGZHOU_OSS_CONFIG.BASE_PATH}${GUANGZHOU_OSS_CONFIG.TENANT_PREFIX}${tenantKey}/${subPath}`;
  }

  /**
   * 生成上海OSS租户隔离路径（人脸识别/相册）
   */
  generateShanghaiTenantPath(
    tenantKey: string,
    fileType: 'photos' | 'students' | 'albums',
    subPath: string = ''
  ): string {
    if (!tenantKey) {
      throw new Error('租户标识无效');
    }
    const basePath = `${SHANGHAI_OSS_CONFIG.BASE_PATH}${SHANGHAI_OSS_CONFIG.TENANT_PREFIX}${tenantKey}/${fileType}/`;
    return subPath ? `${basePath}${subPath}` : basePath;
  }

  /**
   * 验证上海OSS路径访问权限
   */
  validateShanghaiOSSPath(
    tenantKey: string,
    ossPath: string
  ): { isValid: boolean; error?: string; accessType?: 'public' | 'tenant' } {
    try {
      const normalizedPath = this.normalizeShanghaiPath(ossPath);

      // 检查公共资源
      if (SHANGHAI_OSS_CONFIG.PUBLIC_PREFIXES.some(prefix => normalizedPath.startsWith(prefix))) {
        return { isValid: true, accessType: 'public' };
      }

      // 检查租户隔离目录
      if (normalizedPath.startsWith(SHANGHAI_OSS_CONFIG.TENANT_PREFIX)) {
        const pathTenantKey = this.extractTenantKeyFromPath(normalizedPath);
        if (!pathTenantKey) {
          return { isValid: false, error: '无效的上海OSS租户路径格式' };
        }
        if (pathTenantKey !== tenantKey) {
          logger.warn('上海OSS租户越权访问尝试', {
            tenantKey: this.maskTenantKey(tenantKey),
            pathTenantKey: this.maskTenantKey(pathTenantKey),
            ossPath: this.truncatePath(ossPath)
          });
          return { isValid: false, error: '上海OSS资源访问越权' };
        }
        return { isValid: true, accessType: 'tenant' };
      }

      // 旧版photos/students目录（向后兼容）
      if (normalizedPath.startsWith('photos/') || normalizedPath.startsWith('students/')) {
        logger.warn(`访问旧版非隔离上海OSS目录: ${ossPath}，建议迁移到租户隔离目录`);
        return { isValid: true, accessType: 'public' };
      }

      return { isValid: false, error: '未知的上海OSS路径类型' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('验证上海OSS路径访问权限失败', { error: errorMessage });
      return { isValid: false, error: '路径验证异常' };
    }
  }

  /**
   * 根据OSS URL判断bucket类型
   */
  getBucketFromUrl(ossUrl: string): 'shanghai' | 'guangzhou' | null {
    if (ossUrl.includes(SHANGHAI_OSS_CONFIG.BUCKET) || ossUrl.includes('oss-cn-shanghai')) {
      return 'shanghai';
    }
    if (ossUrl.includes(GUANGZHOU_OSS_CONFIG.BUCKET) || ossUrl.includes('oss-cn-guangzhou')) {
      return 'guangzhou';
    }
    return null;
  }

  /**
   * 统一验证OSS路径（自动识别bucket）
   */
  validateOSSPathUnified(
    tenantKey: string,
    ossPath: string
  ): { isValid: boolean; error?: string; accessType?: 'public' | 'tenant'; bucket?: string } {
    const bucket = this.getBucketFromUrl(ossPath);

    if (bucket === 'shanghai') {
      const result = this.validateShanghaiOSSPath(tenantKey, ossPath);
      return { ...result, bucket: 'shanghai' };
    }

    // 默认使用广州OSS验证
    const result = this.validateOSSPathAccess(tenantKey, 'default', ossPath);
    return { ...result, bucket: 'guangzhou' };
  }

  // 辅助方法
  private validateInputs(tenantKey: string, tenantCode: string, ossPath: string): void {
    if (!tenantKey) throw new Error('租户标识无效');
    if (!tenantCode || !/^[a-zA-Z0-9_]+$/.test(tenantCode)) throw new Error('租户代码格式无效');
    if (!ossPath) throw new Error('OSS路径不能为空');
  }

  private normalizePath(ossPath: string): string {
    let path = ossPath.replace(/^https?:\/\/[^/]+\//, '');
    if (path.startsWith(GUANGZHOU_OSS_CONFIG.BASE_PATH)) {
      path = path.substring(GUANGZHOU_OSS_CONFIG.BASE_PATH.length);
    }
    return path;
  }

  private normalizeShanghaiPath(ossPath: string): string {
    let path = ossPath.replace(/^https?:\/\/[^/]+\//, '');
    if (path.startsWith(SHANGHAI_OSS_CONFIG.BASE_PATH)) {
      path = path.substring(SHANGHAI_OSS_CONFIG.BASE_PATH.length);
    }
    return path;
  }

  private isPublicResource(path: string): boolean {
    return GUANGZHOU_OSS_CONFIG.PUBLIC_PREFIXES.some(prefix => path.startsWith(prefix));
  }

  private isTenantResource(path: string): boolean {
    return path.startsWith(OSS_SECURITY_CONFIG.TENANT_PREFIX);
  }

  private extractTenantKeyFromPath(path: string): string | null {
    const match = path.match(/^rent\/([^/]+)\//);
    return match ? match[1] : null;
  }

  private maskTenantKey(tenantKey: string): string {
    if (!tenantKey) return '';
    if (tenantKey.length <= 4) return tenantKey;
    return tenantKey.substring(0, 2) + '****' + tenantKey.substring(tenantKey.length - 2);
  }

  private truncatePath(path: string): string {
    return path?.length > 50 ? path.substring(0, 50) + '...' : path;
  }
}

export const ossTenantSecurityService = OssTenantSecurityService.getInstance();
export default ossTenantSecurityService;

