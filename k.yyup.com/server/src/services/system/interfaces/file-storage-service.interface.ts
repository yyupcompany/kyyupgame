/**
 * 文件存储服务接口定义
 */

export interface FileStorageOptions {
  bucketName?: string;
  acl?: string;
  contentType?: string;
  maxSize?: number;
}

export interface FileInfo {
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  path: string;
  createdAt: Date;
}

export interface IFileStorageService {
  /**
   * 上传文件
   * @param file 文件数据
   * @param path 存储路径
   * @param options 选项
   */
  uploadFile(file: Buffer | string, path: string, options?: FileStorageOptions): Promise<FileInfo>;
  
  /**
   * 删除文件
   * @param path 文件路径
   */
  deleteFile(path: string): Promise<boolean>;
  
  /**
   * 获取文件信息
   * @param path 文件路径
   */
  getFileInfo(path: string): Promise<FileInfo>;
  
  /**
   * 获取文件访问URL
   * @param path 文件路径
   * @param expiresIn URL过期时间（秒）
   */
  getFileUrl(path: string, expiresIn?: number): Promise<string>;
} 