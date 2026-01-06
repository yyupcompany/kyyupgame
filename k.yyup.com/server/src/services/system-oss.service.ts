import OSS from 'ali-oss';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ossConfig } from '../config/oss.config';

/**
 * 系统OSS服务类 - 支持多租户架构和环境配置
 *
 * 目录结构:
 * kindergarten/
 * ├── system/           # 系统文件
 * │   ├── games/       # 游戏资源
 * │   ├── education/   # 教育资源
 * │   └── development/ # 开发资源
 * └── rent/            # 租户目录
 *     └── {phone}/     # 手机号租户目录
 *       └── user-uploads/
 */
export class SystemOSSService {
  private client: OSS;
  private config: any;

  constructor() {
    // 使用配置管理器获取OSS配置
    this.config = ossConfig.getConfig();

    if (!this.config || !ossConfig.isAvailable()) {
      const envInfo = ossConfig.getEnvironmentInfo();
      console.warn(`⚠️ 系统OSS配置未完成 (${envInfo.environment}环境)，将使用本地存储降级`);
      return;
    }

    // 初始化OSS客户端
    this.client = new OSS({
      region: this.config.region,
      accessKeyId: this.config.accessKeyId,
      accessKeySecret: this.config.accessKeySecret,
      bucket: this.config.bucket,
    });

    console.log(`✅ 系统OSS服务已初始化 (${this.config.environment}环境):`);
    console.log(`   Bucket: ${this.config.bucket}`);
    console.log(`   Region: ${this.config.region}`);
    console.log(`   CDN: ${this.config.cdnDomain || '未配置'}`);
  }

  /**
   * 检查OSS是否可用
   */
  isAvailable(): boolean {
    return !!this.client;
  }

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
      throw new Error('系统OSS未配置，无法上传文件');
    }

    const {
      filename = `${uuidv4()}.bin`,
      directory = 'general',
      contentType = 'application/octet-stream',
      isPublic = false,
    } = options;

    // 构建OSS存储路径
    const ext = path.extname(filename);
    const uniqueName = `${uuidv4()}${ext}`;
    const ossPath = `${this.config.basePath}${directory}/${uniqueName}`;

    try {
      // 上传到OSS
      const result = await this.client.put(ossPath, file, {
        headers: {
          'Content-Type': contentType,
        },
      });

      console.log(`✅ 系统文件上传成功: ${ossPath}`);

      // 获取文件大小
      const size = Buffer.isBuffer(file) ? file.length : 0;

      // 返回访问URL
      const url = this.getFileUrl(ossPath);

      return {
        url,
        filename: uniqueName,
        size,
        ossPath,
      };
    } catch (error) {
      console.error('❌ 系统OSS上传失败:', error);
      throw new Error(`系统文件上传失败: ${(error as Error).message}`);
    }
  }

  /**
   * 上传游戏资源文件
   * @param file 文件Buffer
   * @param type 资源类型（audio, images, assets等）
   * @param subType 子类型（bgm, voices, characters等）
   * @param filename 文件名
   */
  async uploadGameAsset(
    file: Buffer,
    type: 'audio' | 'images' | 'assets',
    subType: string,
    filename: string
  ): Promise<{
    url: string;
    filename: string;
    size: number;
    ossPath: string;
  }> {
    return this.uploadFile(file, {
      filename,
      directory: `games/${type}/${subType}`,
      contentType: this.getContentType(filename),
    });
  }

  /**
   * 上传教育资源文件
   * @param file 文件Buffer
   * @param type 资源类型（assessment, activities, materials等）
   * @param subType 子类型（audio, images等）
   * @param filename 文件名
   */
  async uploadEducationAsset(
    file: Buffer,
    type: string,
    subType: string,
    filename: string
  ): Promise<{
    url: string;
    filename: string;
    size: number;
    ossPath: string;
  }> {
    return this.uploadFile(file, {
      filename,
      directory: `education/${type}/${subType}`,
      contentType: this.getContentType(filename),
    });
  }

  /**
   * 根据文件名获取Content-Type
   */
  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.pdf': 'application/pdf',
      '.json': 'application/json',
      '.txt': 'text/plain',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.html': 'text/html',
    };

    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * 获取文件访问URL
   * @param ossPath OSS存储路径
   * @param expiresInSeconds 签名有效期（秒）
   */
  getFileUrl(ossPath: string, expiresInSeconds?: number): string {
    if (!this.isAvailable()) {
      return '';
    }

    // 如果配置了CDN域名，使用CDN
    if (this.config.cdnDomain) {
      return `${this.config.cdnDomain}/${ossPath}`;
    }

    // 如果需要签名URL（私有文件）
    if (expiresInSeconds) {
      const signedUrl = this.client.signatureUrl(ossPath, {
        expires: expiresInSeconds,
      });
      return signedUrl.replace('http://', 'https://');
    }

    // 返回公共访问URL
    return `https://${this.config.bucket}.${this.config.region}.aliyuncs.com/${ossPath}`;
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
   * 删除文件
   */
  async deleteFile(ossPath: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('系统OSS未配置');
    }

    try {
      await this.client.delete(ossPath);
      console.log(`✅ 系统文件删除成功: ${ossPath}`);
    } catch (error) {
      console.error('❌ 系统OSS删除失败:', error);
      throw new Error(`系统文件删除失败: ${(error as Error).message}`);
    }
  }

  /**
   * 批量删除文件
   * @param ossPaths OSS存储路径数组
   */
  async deleteFiles(ossPaths: string[]): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('系统OSS未配置');
    }

    if (!ossPaths || ossPaths.length === 0) {
      console.warn('⚠️ 批量删除文件列表为空，跳过删除操作');
      return;
    }

    try {
      await this.client.deleteMulti(ossPaths, { quiet: true });
      console.log(`✅ 系统批量删除成功: ${ossPaths.length}个文件`);
    } catch (error) {
      console.error('❌ 系统OSS批量删除失败:', error);
      throw new Error(`系统批量删除失败: ${(error as Error).message}`);
    }
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
      throw new Error('系统OSS未配置');
    }

    const { maxKeys = 100, marker } = options;
    const prefix = `${this.config.basePath}${directory}/`;

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
      console.error('❌ 系统OSS列表查询失败:', error);
      throw new Error(`系统文件列表查询失败: ${(error as Error).message}`);
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
      throw new Error('系统OSS未配置');
    }

    try {
      const result = await this.client.list({
        prefix: this.config.basePath,
        'max-keys': 1000,
      });

      const fileCount = result.objects?.length || 0;
      const totalSize =
        result.objects?.reduce((sum: number, obj: any) => sum + obj.size, 0) || 0;

      return {
        bucket: this.config.bucket,
        region: this.config.region,
        fileCount,
        totalSize,
      };
    } catch (error) {
      console.error('❌ 系统OSS统计查询失败:', error);
      throw new Error(`系统存储统计查询失败: ${(error as Error).message}`);
    }
  }

  // ========================================
  // 多租户支持方法
  // ========================================

  /**
   * 上传系统文件
   * @param file 文件Buffer或路径
   * @param category 系统分类 (games/education/development)
   * @param subType 子分类 (audio/images/assessment等)
   * @param filename 文件名
   * @param options 其他选项
   */
  async uploadSystemFile(
    file: Buffer | string,
    category: 'games' | 'education' | 'development',
    subType: string,
    filename: string,
    options: {
      contentType?: string;
      isPublic?: boolean;
    } = {}
  ): Promise<{
    url: string;
    filename: string;
    size: number;
    ossPath: string;
  }> {
    const directory = `system/${category}/${subType}`;
    return this.uploadFile(file, {
      filename,
      directory,
      contentType: options.contentType,
      isPublic: options.isPublic
    });
  }

  /**
   * 上传租户用户文件
   * @param file 文件Buffer或路径
   * @param phoneNumber 手机号（租户标识）
   * @param fileType 文件类型 (images/documents/videos/audio)
   * @param filename 文件名
   * @param options 其他选项
   */
  async uploadTenantFile(
    file: Buffer | string,
    phoneNumber: string,
    fileType: 'images' | 'documents' | 'videos' | 'audio',
    filename: string,
    options: {
      contentType?: string;
      isPublic?: boolean;
    } = {}
  ): Promise<{
    url: string;
    filename: string;
    size: number;
    ossPath: string;
  }> {
    const directory = `rent/${phoneNumber}/user-uploads/${fileType}`;
    return this.uploadFile(file, {
      filename,
      directory,
      contentType: options.contentType,
      isPublic: options.isPublic
    });
  }

  /**
   * 获取系统文件URL
   * @param category 系统分类
   * @param subType 子分类
   * @param filename 文件名
   * @param expiresIn 过期时间（秒）
   */
  getSystemFileUrl(
    category: 'games' | 'education' | 'development',
    subType: string,
    filename: string,
    expiresIn: number = 3600
  ): string | null {
    const ossPath = `${this.config.basePath}system/${category}/${subType}/${filename}`;
    return this.getTemporaryUrl(ossPath, expiresIn);
  }

  /**
   * 获取租户文件URL
   * @param phoneNumber 手机号
   * @param fileType 文件类型
   * @param filename 文件名
   * @param expiresIn 过期时间（秒）
   */
  getTenantFileUrl(
    phoneNumber: string,
    fileType: 'images' | 'documents' | 'videos' | 'audio',
    filename: string,
    expiresIn: number = 3600
  ): string | null {
    const ossPath = `${this.config.basePath}rent/${phoneNumber}/user-uploads/${fileType}/${filename}`;
    return this.getTemporaryUrl(ossPath, expiresIn);
  }

  /**
   * 检查租户目录是否存在
   * @param phoneNumber 手机号
   */
  async checkTenantExists(phoneNumber: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const prefix = `${this.config.basePath}rent/${phoneNumber}/`;
      const result = await this.client.list({
        prefix,
        'max-keys': 1,
      });
      return (result.objects?.length || 0) > 0;
    } catch (error) {
      console.error(`❌ 检查租户目录失败 (${phoneNumber}):`, error);
      return false;
    }
  }

  /**
   * 创建租户目录结构
   * @param phoneNumber 手机号
   */
  async createTenantDirectories(phoneNumber: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('系统OSS未配置');
    }

    const directories = [
      'user-uploads/images',
      'user-uploads/documents',
      'user-uploads/videos',
      'user-uploads/audio',
      'tenant-data/logos',
      'tenant-data/attachments'
    ];

    for (const dir of directories) {
      const ossPath = `${this.config.basePath}rent/${phoneNumber}/${dir}/.gitkeep`;
      try {
        await this.client.put(ossPath, Buffer.from(''), {
          headers: {
            'Content-Type': 'text/plain',
          },
        });
        console.log(`✅ 创建租户目录: rent/${phoneNumber}/${dir}`);
      } catch (error) {
        console.error(`❌ 创建租户目录失败 (${dir}):`, error);
      }
    }
  }

  /**
   * 列出租户文件
   * @param phoneNumber 手机号
   * @param fileType 文件类型
   * @param options 选项
   */
  async listTenantFiles(
    phoneNumber: string,
    fileType?: 'images' | 'documents' | 'videos' | 'audio',
    options: {
      maxKeys?: number;
      marker?: string;
    } = {}
  ): Promise<{
    files: Array<{ name: string; url: string; size: number; lastModified: Date }>;
    nextMarker?: string;
  }> {
    if (!this.isAvailable()) {
      throw new Error('系统OSS未配置');
    }

    const { maxKeys = 100, marker } = options;
    const directory = fileType
      ? `rent/${phoneNumber}/user-uploads/${fileType}`
      : `rent/${phoneNumber}/`;
    const prefix = `${this.config.basePath}${directory}/`;

    try {
      const result = await this.client.list({
        prefix,
        'max-keys': maxKeys,
        marker,
      });

      const files = (result.objects || [])
        .filter((obj: any) => !obj.name.endsWith('.gitkeep')) // 过滤掉.gitkeep文件
        .map((obj: any) => ({
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
      console.error('❌ 租户文件列表查询失败:', error);
      throw new Error(`租户文件列表查询失败: ${(error as Error).message}`);
    }
  }

  /**
   * 列出 OSS 中的所有文件（静态方法）
   */
  static async listFiles(prefix: string = '', marker: string = ''): Promise<any> {
    const service = new SystemOSSService();
    if (!service.isAvailable()) {
      throw new Error('系统OSS未配置');
    }

    try {
      const result = await service.client.list({
        prefix: prefix ? `${service.config.basePath}${prefix}` : service.config.basePath,
        'max-keys': 1000,
        marker,
      });

      const files = (result.objects || [])
        .filter((obj: any) => !obj.name.endsWith('/'))
        .map((obj: any) => ({
          name: obj.name,
          url: service.getFileUrl(obj.name),
          size: obj.size,
          lastModified: new Date(obj.lastModified),
        }));

      return {
        files,
        nextMarker: result.nextMarker,
      };
    } catch (error) {
      console.error('❌ 文件列表查询失败:', error);
      throw new Error(`文件列表查询失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取 OSS 目录结构（静态方法）
   */
  static async getDirectoryStructure(): Promise<any> {
    const service = new SystemOSSService();
    if (!service.isAvailable()) {
      throw new Error('系统OSS未配置');
    }

    try {
      let marker = '';
      let allObjects: any[] = [];
      let allDirs = new Set<string>();

      do {
        const result = await service.client.list({
          prefix: service.config.basePath,
          'max-keys': 1000,
          marker,
        });

        allObjects = allObjects.concat(result.objects || []);
        marker = result.nextMarker;

        if (!marker) break;
      } while (marker);

      // 提取目录结构
      allObjects.forEach((obj: any) => {
        const parts = obj.name.split('/');
        for (let i = 1; i < parts.length; i++) {
          allDirs.add(parts.slice(0, i).join('/'));
        }
      });

      return {
        directories: Array.from(allDirs).sort(),
        totalFiles: allObjects.length,
      };
    } catch (error) {
      console.error('❌ 目录结构查询失败:', error);
      throw new Error(`目录结构查询失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取 OSS 统计信息（静态方法）
   */
  static async getStatistics(): Promise<any> {
    const service = new SystemOSSService();
    if (!service.isAvailable()) {
      throw new Error('系统OSS未配置');
    }

    try {
      let marker = '';
      let allObjects: any[] = [];

      do {
        const result = await service.client.list({
          prefix: service.config.basePath,
          'max-keys': 1000,
          marker,
        });

        allObjects = allObjects.concat(result.objects || []);
        marker = result.nextMarker;

        if (!marker) break;
      } while (marker);

      const stats = {
        totalFiles: allObjects.length,
        totalSize: 0,
        byType: {} as Record<string, number>,
        byDirectory: {} as Record<string, number>,
      };

      allObjects.forEach((obj: any) => {
        stats.totalSize += obj.size;

        const ext = obj.name.split('.').pop()?.toLowerCase() || 'unknown';
        stats.byType[ext] = (stats.byType[ext] || 0) + 1;

        const dir = obj.name.split('/')[0] || 'root';
        stats.byDirectory[dir] = (stats.byDirectory[dir] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('❌ 统计信息查询失败:', error);
      throw new Error(`统计信息查询失败: ${(error as Error).message}`);
    }
  }

  /**
   * 删除 OSS 中的文件（静态方法）
   */
  static async deleteFile(key: string): Promise<void> {
    const service = new SystemOSSService();
    if (!service.isAvailable()) {
      throw new Error('系统OSS未配置');
    }

    try {
      await service.client.delete(key);
      console.log(`✅ 文件已删除: ${key}`);
    } catch (error) {
      console.error('❌ 文件删除失败:', error);
      throw new Error(`文件删除失败: ${(error as Error).message}`);
    }
  }

  // ========================================
  // OSS租户安全验证方法
  // ========================================

  /**
   * 验证OSS路径是否属于指定租户
   */
  validateTenantAccess(
    ossPath: string,
    userPhone: string
  ): { isValid: boolean; accessType: 'public' | 'tenant'; error?: string } {
    let normalizedPath = ossPath;
    if (normalizedPath.startsWith(this.config.basePath)) {
      normalizedPath = normalizedPath.substring(this.config.basePath.length);
    }

    const publicPrefixes = ['system/', 'games/', 'education/', 'development/'];
    if (publicPrefixes.some(prefix => normalizedPath.startsWith(prefix))) {
      return { isValid: true, accessType: 'public' };
    }

    if (normalizedPath.startsWith('rent/')) {
      const match = normalizedPath.match(/^rent\/(\d{11})\//);
      if (!match) {
        return { isValid: false, accessType: 'tenant', error: '无效的租户路径格式' };
      }
      const pathPhone = match[1];
      if (pathPhone !== userPhone) {
        console.warn(`⚠️ OSS租户越权访问: 用户${userPhone.substring(0, 3)}****尝试访问${pathPhone.substring(0, 3)}****的资源`);
        return { isValid: false, accessType: 'tenant', error: 'OSS资源访问越权' };
      }
      return { isValid: true, accessType: 'tenant' };
    }

    return { isValid: false, accessType: 'tenant', error: '未知的OSS路径类型' };
  }

  /**
   * 安全获取租户文件URL（带权限验证）
   */
  getSecureTenantFileUrl(
    phoneNumber: string,
    targetPhone: string,
    fileType: 'images' | 'documents' | 'videos' | 'audio',
    filename: string,
    expiresIn: number = 3600
  ): string | null {
    if (phoneNumber !== targetPhone) {
      console.warn(`⚠️ OSS访问拒绝: ${phoneNumber.substring(0, 3)}****不能访问${targetPhone.substring(0, 3)}****的文件`);
      return null;
    }

    const ossPath = `${this.config.basePath}rent/${targetPhone}/user-uploads/${fileType}/${filename}`;
    return this.getTemporaryUrl(ossPath, expiresIn);
  }
}

// 导出单例（延迟初始化，在环境变量加载后创建）
let systemOSSServiceInstance: SystemOSSService | null = null;

export function getSystemOSSService(): SystemOSSService {
  if (!systemOSSServiceInstance) {
    systemOSSServiceInstance = new SystemOSSService();
  }
  return systemOSSServiceInstance;
}

// 为了向后兼容，导出一个 getter
export const systemOSSService = new Proxy({} as SystemOSSService, {
  get(target, prop) {
    return getSystemOSSService()[prop as keyof SystemOSSService];
  }
});