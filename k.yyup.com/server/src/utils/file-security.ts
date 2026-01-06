import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

/**
 * 文件安全检测工具类
 */
export class FileSecurityChecker {
  // 危险的文件扩展名黑名单
  private static readonly DANGEROUS_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.msi', '.app', '.deb', '.rpm', '.dmg', '.pkg', '.sh', '.bash', '.zsh',
    '.ps1', '.psm1', '.dll', '.so', '.dylib', '.sys', '.drv'
  ];

  // 允许的MIME类型白名单
  private static readonly ALLOWED_MIME_TYPES = [
    // 图片
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
    // 文档
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    // 视频
    'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv'
  ];

  // 危险的文件签名（魔数）
  private static readonly DANGEROUS_SIGNATURES = [
    { signature: Buffer.from([0x4D, 0x5A]), description: 'PE/EXE' }, // MZ (Windows executable)
    { signature: Buffer.from([0x7F, 0x45, 0x4C, 0x46]), description: 'ELF' }, // ELF (Linux executable)
    { signature: Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]), description: 'Mach-O' }, // Mach-O (macOS executable)
    { signature: Buffer.from([0x23, 0x21]), description: 'Script' }, // #! (Shell script)
  ];

  /**
   * 检查文件名是否安全
   */
  public static isFileNameSafe(filename: string): { safe: boolean; reason?: string } {
    // 检查路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return { safe: false, reason: '文件名包含非法路径字符' };
    }

    // 检查空字节注入
    if (filename.includes('\0')) {
      return { safe: false, reason: '文件名包含空字节' };
    }

    // 检查文件名长度
    if (filename.length > 255) {
      return { safe: false, reason: '文件名过长' };
    }

    // 检查是否包含特殊字符
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(filename)) {
      return { safe: false, reason: '文件名包含非法字符' };
    }

    // 检查双重扩展名
    const parts = filename.split('.');
    if (parts.length > 2) {
      const secondExt = '.' + parts[parts.length - 2].toLowerCase();
      if (this.DANGEROUS_EXTENSIONS.includes(secondExt)) {
        return { safe: false, reason: '检测到双重扩展名攻击' };
      }
    }

    // 检查危险扩展名
    const ext = path.extname(filename).toLowerCase();
    if (this.DANGEROUS_EXTENSIONS.includes(ext)) {
      return { safe: false, reason: `不允许上传 ${ext} 类型的文件` };
    }

    return { safe: true };
  }

  /**
   * 检查MIME类型是否允许
   */
  public static isMimeTypeAllowed(mimeType: string): { allowed: boolean; reason?: string } {
    if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
      return { allowed: false, reason: `不允许的文件类型: ${mimeType}` };
    }
    return { allowed: true };
  }

  /**
   * 检查文件内容是否安全（通过文件签名）
   */
  public static async isFileContentSafe(filePath: string): Promise<{ safe: boolean; reason?: string }> {
    try {
      // 读取文件的前8个字节（足够检测大多数文件签名）
      const buffer = Buffer.alloc(8);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);

      // 检查危险的文件签名
      for (const { signature, description } of this.DANGEROUS_SIGNATURES) {
        if (buffer.slice(0, signature.length).equals(signature)) {
          return { safe: false, reason: `检测到可执行文件签名: ${description}` };
        }
      }

      return { safe: true };
    } catch (error) {
      return { safe: false, reason: '无法读取文件内容' };
    }
  }

  /**
   * 检查文件大小是否在允许范围内
   */
  public static isFileSizeValid(
    fileSize: number,
    mimeType: string
  ): { valid: boolean; reason?: string } {
    const maxSizes: { [key: string]: number } = {
      'image': 10 * 1024 * 1024,      // 10MB
      'application': 20 * 1024 * 1024, // 20MB
      'text': 20 * 1024 * 1024,        // 20MB
      'video': 100 * 1024 * 1024       // 100MB
    };

    const category = mimeType.split('/')[0];
    const maxSize = maxSizes[category] || 20 * 1024 * 1024;

    if (fileSize > maxSize) {
      return {
        valid: false,
        reason: `文件大小超过限制 (最大 ${Math.round(maxSize / 1024 / 1024)}MB)`
      };
    }

    return { valid: true };
  }

  /**
   * 扫描文件内容中的恶意代码模式
   */
  public static async scanForMaliciousContent(filePath: string): Promise<{ safe: boolean; reason?: string }> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // 检查常见的恶意代码模式
      const maliciousPatterns = [
        /<script[^>]*>[\s\S]*?<\/script>/gi,  // JavaScript标签
        /javascript:/gi,                       // JavaScript协议
        /on\w+\s*=\s*["'][^"']*["']/gi,       // 事件处理器
        /eval\s*\(/gi,                         // eval函数
        /exec\s*\(/gi,                         // exec函数
        /system\s*\(/gi,                       // system调用
        /<iframe[^>]*>/gi,                     // iframe标签
        /<embed[^>]*>/gi,                      // embed标签
        /<object[^>]*>/gi,                     // object标签
      ];

      for (const pattern of maliciousPatterns) {
        if (pattern.test(content)) {
          return { safe: false, reason: '检测到潜在的恶意代码' };
        }
      }

      return { safe: true };
    } catch (error) {
      // 如果文件不是文本文件，会抛出错误，这是正常的
      return { safe: true };
    }
  }

  /**
   * 计算文件的SHA256哈希值
   */
  public static calculateFileHash(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }

  /**
   * 综合安全检查
   */
  public static async performSecurityCheck(
    filename: string,
    filePath: string,
    mimeType: string,
    fileSize: number
  ): Promise<{ safe: boolean; reason?: string }> {
    // 1. 检查文件名
    const filenameCheck = this.isFileNameSafe(filename);
    if (!filenameCheck.safe) {
      return filenameCheck;
    }

    // 2. 检查MIME类型
    const mimeCheck = this.isMimeTypeAllowed(mimeType);
    if (!mimeCheck.allowed) {
      return { safe: false, reason: mimeCheck.reason };
    }

    // 3. 检查文件大小
    const sizeCheck = this.isFileSizeValid(fileSize, mimeType);
    if (!sizeCheck.valid) {
      return { safe: false, reason: sizeCheck.reason };
    }

    // 4. 检查文件内容签名
    const contentCheck = await this.isFileContentSafe(filePath);
    if (!contentCheck.safe) {
      return contentCheck;
    }

    // 5. 扫描恶意代码（仅对文本文件）
    if (mimeType.startsWith('text/') || mimeType.includes('html')) {
      const maliciousCheck = await this.scanForMaliciousContent(filePath);
      if (!maliciousCheck.safe) {
        return maliciousCheck;
      }
    }

    return { safe: true };
  }

  /**
   * 生成安全的文件名
   */
  public static generateSafeFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    return `task-${timestamp}-${random}${ext}`;
  }

  /**
   * 清理文件名（移除危险字符）
   */
  public static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')  // 替换非法字符
      .replace(/\.{2,}/g, '.')            // 移除连续的点
      .replace(/^\.+/, '')                // 移除开头的点
      .substring(0, 255);                 // 限制长度
  }
}

export default FileSecurityChecker;

