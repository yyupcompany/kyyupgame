import OSS from 'ali-oss';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import crypto from 'crypto';

/**
 * OSS安全配置 - 上海OSS（人脸识别/相册）租户隔离
 */
const SHANGHAI_OSS_SECURITY = {
  // 令牌有效期：60分钟
  EXPIRES_IN: 60 * 60 * 1000,
  // 时间戳精度：60分钟
  TIMESTAMP_UNIT: 60 * 60,
  // MD5盐值
  SALT: process.env.SHANGHAI_OSS_SECURITY_SALT || 'shanghai-oss-tenant-2024',
  // 令牌前缀
  TOKEN_PREFIX: 'SH_OSS_',
  // 公共目录前缀（所有租户可访问）
  PUBLIC_PREFIXES: ['test-faces/'],
  // 租户隔离目录前缀
  TENANT_PREFIX: 'rent/',
  // OSS基础路径
  BASE_PATH: 'kindergarten/',
};

/**
 * OSS服务类 - 阿里云对象存储（上海OSS - 人脸识别/相册）
 * 支持多租户隔离
 */
export class OSSService {
  private client: OSS;
  private bucket: string;
  private region: string;
  private cdnDomain?: string;
  private pathPrefix: string;

  constructor() {
    // 从环境变量读取配置
    const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
    const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET;
    this.bucket = process.env.OSS_BUCKET || 'kyyup-photos';
    this.region = process.env.OSS_REGION || 'oss-cn-guangzhou';
    this.cdnDomain = process.env.OSS_CDN_DOMAIN;
    this.pathPrefix = process.env.OSS_PATH_PREFIX || 'kindergarten/';

    if (!accessKeyId || !accessKeySecret) {
      console.warn('⚠️ OSS配置未完成，将使用本地存储');
      // 不抛出错误，允许降级到本地存储
      return;
    }

    // 初始化OSS客户端，强制使用HTTPS协议
    this.client = new OSS({
      region: this.region,
      accessKeyId,
      accessKeySecret,
      bucket: this.bucket,
      secure: true, // 强制使用HTTPS
    });

    console.log(`✅ OSS服务已初始化: ${this.bucket} (${this.region}) [HTTPS]`);
  }

  // ==================== 租户隔离路径生成 ====================

  /**
   * 生成租户隔离的OSS路径
   * @param phoneNumber 租户手机号
   * @param fileType 文件类型 (photos, students, albums)
   * @param subPath 子路径
   * @returns 租户隔离的完整路径
   */
  getTenantPath(phoneNumber: string, fileType: string, subPath: string = ''): string {
    if (!phoneNumber) {
      throw new Error('手机号不能为空');
    }
    // 路径格式: kindergarten/rent/{phone}/{fileType}/{subPath}
    const basePath = `${this.pathPrefix}${SHANGHAI_OSS_SECURITY.TENANT_PREFIX}${phoneNumber}/${fileType}/`;
    return subPath ? `${basePath}${subPath}` : basePath;
  }

  /**
   * 生成MD5租户令牌用于OSS路径验证
   */
  generateOssToken(userPhone: string, tenantCode: string, ossPath: string): string {
    const timestamp = Math.floor(Date.now() / (SHANGHAI_OSS_SECURITY.TIMESTAMP_UNIT * 1000));
    const data = `${userPhone}:${tenantCode}:${ossPath}:${this.bucket}:${timestamp}:${SHANGHAI_OSS_SECURITY.SALT}`;
    const hash = crypto.createHash('md5').update(data).digest('hex');
    return `${SHANGHAI_OSS_SECURITY.TOKEN_PREFIX}${hash}`;
  }

  /**
   * 验证MD5租户令牌
   */
  validateOssToken(token: string, userPhone: string, tenantCode: string, ossPath: string): boolean {
    if (!token || !token.startsWith(SHANGHAI_OSS_SECURITY.TOKEN_PREFIX)) {
      return false;
    }

    const currentTimestamp = Math.floor(Date.now() / (SHANGHAI_OSS_SECURITY.TIMESTAMP_UNIT * 1000));

    // 检查当前时间和前一个时间单位
    for (let i = 0; i <= 1; i++) {
      const timestamp = currentTimestamp - i;
      const data = `${userPhone}:${tenantCode}:${ossPath}:${this.bucket}:${timestamp}:${SHANGHAI_OSS_SECURITY.SALT}`;
      const hash = crypto.createHash('md5').update(data).digest('hex');
      const expectedToken = `${SHANGHAI_OSS_SECURITY.TOKEN_PREFIX}${hash}`;

      if (token === expectedToken) {
        return true;
      }
    }

    return false;
  }

  /**
   * 验证OSS路径访问权限
   * @param userPhone 用户手机号
   * @param ossPath OSS路径
   * @returns 验证结果
   */
  validatePathAccess(userPhone: string, ossPath: string): { isValid: boolean; error?: string; accessType?: 'public' | 'tenant' } {
    if (!ossPath) {
      return { isValid: false, error: 'OSS路径不能为空' };
    }

    // 移除基础路径前缀
    let relativePath = ossPath;
    if (ossPath.startsWith(this.pathPrefix)) {
      relativePath = ossPath.substring(this.pathPrefix.length);
    }

    // 检查是否是公共目录
    const isPublicPath = SHANGHAI_OSS_SECURITY.PUBLIC_PREFIXES.some(prefix =>
      relativePath.startsWith(prefix)
    );
    if (isPublicPath) {
      return { isValid: true, accessType: 'public' };
    }

    // 检查是否是租户隔离目录
    if (relativePath.startsWith(SHANGHAI_OSS_SECURITY.TENANT_PREFIX)) {
      // 提取路径中的手机号
      const pathParts = relativePath.substring(SHANGHAI_OSS_SECURITY.TENANT_PREFIX.length).split('/');
      const pathPhone = pathParts[0];

      if (!userPhone) {
        return { isValid: false, error: '访问租户资源需要提供手机号' };
      }

      if (pathPhone !== userPhone) {
        return { isValid: false, error: `无权访问其他租户(${pathPhone})的资源` };
      }

      return { isValid: true, accessType: 'tenant' };
    }

    // 旧的photos/students目录（向后兼容，但标记为需要迁移）
    if (relativePath.startsWith('photos/') || relativePath.startsWith('students/')) {
      console.warn(`⚠️ 访问旧版非隔离目录: ${ossPath}，建议迁移到租户隔离目录`);
      return { isValid: true, accessType: 'public' };
    }

    return { isValid: false, error: `未知的OSS路径: ${ossPath}` };
  }

  /**
   * 检查OSS是否可用
   */
  isAvailable(): boolean {
    return !!this.client;
  }

  // ==================== 租户隔离上传方法 ====================

  /**
   * 上传租户隔离的图片（班级照片/学生照片）
   * @param imageBuffer 图片Buffer
   * @param phoneNumber 租户手机号
   * @param options 上传选项
   */
  async uploadTenantImage(
    imageBuffer: Buffer,
    phoneNumber: string,
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
  }> {
    if (!phoneNumber) {
      throw new Error('租户手机号不能为空');
    }

    const {
      filename = `${uuidv4()}.jpg`,
      fileType = 'photos',
      subPath = new Date().toISOString().slice(0, 7), // 默认按月份分目录
      maxWidth = 1920,
      quality = 80,
      generateThumbnail = true,
    } = options;

    try {
      // 1. 图片压缩优化
      let processedBuffer = await sharp(imageBuffer)
        .resize(maxWidth, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .jpeg({ quality })
        .toBuffer();

      // 2. 生成租户隔离路径
      const ext = path.extname(filename);
      const uniqueName = `${uuidv4()}${ext}`;
      const tenantDir = this.getTenantPath(phoneNumber, fileType, subPath);
      const ossPath = `${tenantDir}${uniqueName}`;

      // 3. 上传主图
      await this.client.put(ossPath, processedBuffer, {
        headers: { 'Content-Type': 'image/jpeg' },
      });

      console.log(`✅ 租户图片上传成功: ${ossPath}`);

      const url = this.getFileUrl(ossPath);
      const size = processedBuffer.length;

      // 4. 生成并上传缩略图（可选）
      let thumbnailUrl: string | undefined;
      if (generateThumbnail) {
        const thumbnailBuffer = await sharp(imageBuffer)
          .resize(400, 400, { fit: 'cover', position: 'center' })
          .jpeg({ quality: 70 })
          .toBuffer();

        const thumbName = uniqueName.replace(/(\.\w+)$/, '_thumb$1');
        const thumbPath = `${tenantDir}thumbnails/${thumbName}`;

        await this.client.put(thumbPath, thumbnailBuffer, {
          headers: { 'Content-Type': 'image/jpeg' },
        });

        thumbnailUrl = this.getFileUrl(thumbPath);
      }

      return {
        url,
        thumbnailUrl,
        filename: uniqueName,
        size,
        ossPath,
      };
    } catch (error) {
      console.error('❌ 租户图片上传失败:', error);
      throw new Error(`租户图片上传失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取租户安全的临时URL（验证权限后）
   * @param ossPath OSS路径
   * @param userPhone 用户手机号
   * @param expiresInMinutes 有效期（分钟）
   */
  getSecureTenantUrl(ossPath: string, userPhone: string, expiresInMinutes: number = 60): string | null {
    const validation = this.validatePathAccess(userPhone, ossPath);
    if (!validation.isValid) {
      console.warn(`⚠️ OSS访问被拒绝: ${validation.error}`);
      return null;
    }
    return this.getTemporaryUrl(ossPath, expiresInMinutes);
  }

  // ==================== 原有方法 ====================

  /**
   * 上传文件（通用方法）
   * @param file 文件Buffer或本地路径
   * @param options 上传选项
   */
  async uploadFile(
    file: Buffer | string,
    options: {
      filename?: string;
      directory?: string;
      contentType?: string;
      isPublic?: boolean;
    } = {}
  ): Promise<{
    url: string;
    filename: string;
    size: number;
    ossPath: string;
  }> {
    if (!this.isAvailable()) {
      throw new Error('OSS未配置，无法上传文件');
    }

    const {
      filename = `${uuidv4()}.jpg`,
      directory = 'photos',
      contentType = 'image/jpeg',
      isPublic = false,
    } = options;

    // 构建OSS存储路径
    const ext = path.extname(filename);
    const uniqueName = `${uuidv4()}${ext}`;
    const ossPath = `${this.pathPrefix}${directory}/${uniqueName}`;

    try {
      // 上传到OSS（不设置ACL header，避免权限错误）
      const result = await this.client.put(ossPath, file, {
        headers: {
          'Content-Type': contentType,
          // 不设置x-oss-object-acl，使用bucket默认权限
        },
      });

      console.log(`✅ 文件上传成功: ${ossPath}`);

      // 获取文件大小
      const size = Buffer.isBuffer(file) ? file.length : 0;

      // 返回访问URL（优先使用CDN域名）
      const url = this.getFileUrl(ossPath);

      return {
        url,
        filename: uniqueName,
        size,
        ossPath,
      };
    } catch (error) {
      console.error('❌ OSS上传失败:', error);
      throw new Error(`文件上传失败: ${(error as Error).message}`);
    }
  }

  /**
   * 上传图片（自动压缩优化）
   * @param imageBuffer 图片Buffer
   * @param options 上传选项
   */
  async uploadImage(
    imageBuffer: Buffer,
    options: {
      filename?: string;
      directory?: string;
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
  }> {
    const {
      filename = `${uuidv4()}.jpg`,
      directory = 'photos',
      maxWidth = 1920,
      quality = 80,
      generateThumbnail = true,
    } = options;

    try {
      // 1. 图片压缩优化
      let processedBuffer = await sharp(imageBuffer)
        .resize(maxWidth, null, {
          withoutEnlargement: true, // 不放大小图
          fit: 'inside',
        })
        .jpeg({ quality })
        .toBuffer();

      // 2. 上传主图
      const mainResult = await this.uploadFile(processedBuffer, {
        filename,
        directory,
        contentType: 'image/jpeg',
        isPublic: false, // 保持私有（账号不允许public-read）
      });

      // 3. 生成并上传缩略图（可选）
      let thumbnailUrl: string | undefined;
      if (generateThumbnail) {
        const thumbnailBuffer = await sharp(imageBuffer)
          .resize(400, 400, {
            fit: 'cover',
            position: 'center',
          })
          .jpeg({ quality: 70 })
          .toBuffer();

        const thumbnailResult = await this.uploadFile(thumbnailBuffer, {
          filename: filename.replace(/(\.\w+)$/, '_thumb$1'),
          directory: `${directory}/thumbnails`,
          contentType: 'image/jpeg',
          isPublic: false, // 保持私有
        });

        thumbnailUrl = thumbnailResult.url;
      }

      console.log(`✅ 图片上传成功（含缩略图）: ${mainResult.ossPath}`);

      return {
        ...mainResult,
        thumbnailUrl,
      };
    } catch (error) {
      console.error('❌ 图片上传失败:', error);
      throw new Error(`图片上传失败: ${(error as Error).message}`);
    }
  }

  /**
   * 批量上传图片
   */
  async uploadImages(
    images: Array<{ buffer: Buffer; filename?: string }>,
    directory: string = 'photos'
  ): Promise<
    Array<{
      url: string;
      thumbnailUrl?: string;
      filename: string;
      ossPath: string;
    }>
  > {
    const uploadPromises = images.map((img) =>
      this.uploadImage(img.buffer, {
        filename: img.filename,
        directory,
      })
    );

    return Promise.all(uploadPromises);
  }

  /**
   * 删除文件
   */
  async deleteFile(ossPath: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('OSS未配置');
    }

    try {
      await this.client.delete(ossPath);
      console.log(`✅ 文件删除成功: ${ossPath}`);
    } catch (error) {
      console.error('❌ OSS删除失败:', error);
      throw new Error(`文件删除失败: ${(error as Error).message}`);
    }
  }

  /**
   * 批量删除文件
   */
  async deleteFiles(ossPaths: string[]): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('OSS未配置');
    }

    try {
      const result = await this.client.deleteMulti(ossPaths, {
        quiet: true,
      });
      console.log(`✅ 批量删除成功: ${ossPaths.length}个文件`);
    } catch (error) {
      console.error('❌ OSS批量删除失败:', error);
      throw new Error(`批量删除失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取文件访问URL
   * @param ossPath OSS存储路径
   * @param expiresInSeconds 签名有效期（秒），不传则返回永久URL（公共读）
   */
  getFileUrl(ossPath: string, expiresInSeconds?: number): string {
    if (!this.isAvailable()) {
      return '';
    }

    // 如果配置了CDN域名，使用CDN
    if (this.cdnDomain) {
      return `${this.cdnDomain}/${ossPath}`;
    }

    // 如果需要签名URL（私有文件）
    if (expiresInSeconds) {
      const signedUrl = this.client.signatureUrl(ossPath, {
        expires: expiresInSeconds,
      });
      // 由于客户端已配置secure: true，生成的URL应该是HTTPS
      return signedUrl;
    }

    // 返回公共访问URL
    return `https://${this.bucket}.${this.region}.aliyuncs.com/${ossPath}`;
  }

  /**
   * 获取临时访问URL（用于私有文件）
   * @param ossPath OSS存储路径
   * @param expiresInMinutes 有效期（分钟）
   */
  getTemporaryUrl(ossPath: string, expiresInMinutes: number = 60): string {
    return this.getFileUrl(ossPath, expiresInMinutes * 60);
  }

  /**
   * 列出目录下的文件
   */
  async listFiles(
    directory: string,
    options: {
      maxKeys?: number;
      marker?: string;
    } = {}
  ): Promise<{
    files: Array<{ name: string; url: string; size: number; lastModified: Date }>;
    nextMarker?: string;
  }> {
    if (!this.isAvailable()) {
      throw new Error('OSS未配置');
    }

    const { maxKeys = 100, marker } = options;
    const prefix = `${this.pathPrefix}${directory}/`;

    try {
      const result = await this.client.list({
        prefix,
        'max-keys': maxKeys,
        marker,
      });

      const files = (result.objects || []).map((obj: any) => ({
        name: obj.name,
        url: this.getFileUrl(obj.name),
        size: obj.size,
        lastModified: new Date(obj.lastModified),
      }));

      return {
        files,
        nextMarker: result.nextMarker,
      };
    } catch (error) {
      console.error('❌ OSS列表查询失败:', error);
      throw new Error(`文件列表查询失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取存储统计信息
   */
  async getStorageInfo(): Promise<{
    bucket: string;
    region: string;
    fileCount: number;
    totalSize: number;
  }> {
    if (!this.isAvailable()) {
      throw new Error('OSS未配置');
    }

    try {
      const result = await this.client.list({
        prefix: this.pathPrefix,
        'max-keys': 1000,
      });

      const fileCount = result.objects?.length || 0;
      const totalSize =
        result.objects?.reduce((sum: number, obj: any) => sum + obj.size, 0) || 0;

      return {
        bucket: this.bucket,
        region: this.region,
        fileCount,
        totalSize,
      };
    } catch (error) {
      console.error('❌ OSS统计查询失败:', error);
      throw new Error(`存储统计查询失败: ${(error as Error).message}`);
    }
  }
}

// 导出单例
export const ossService = new OSSService();

