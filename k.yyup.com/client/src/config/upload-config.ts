/**
 * 文件上传配置系统
 * 用于统一管理系统中的文件上传限制和配置
 */

export interface FileUploadConfig {
  // 文件大小限制（字节）
  maxFileSize: {
    default: number;      // 默认限制
    image: number;        // 图片文件限制
    video: number;        // 视频文件限制
    audio: number;        // 音频文件限制
    document: number;     // 文档文件限制
    archive: number;       // 压缩文件限制
  };

  // 支持的文件类型
  allowedTypes: {
    image: string[];      // 图片类型
    video: string[];      // 视频类型
    audio: string[];      // 音频类型
    document: string[];   // 文档类型
    archive: string[];    // 压缩文件类型
  };

  // 上传配置
  upload: {
    maxFiles: number;     // 最大文件数量
    chunkSize: number;    // 分片上传大小
    timeout: number;      // 上传超时时间
    retryAttempts: number; // 重试次数
    retryDelay: number;   // 重试延迟
  };

  // 预览配置
  preview: {
    imageMaxSize: number;  // 图片预览最大尺寸
    videoMaxSize: number;  // 视频预览最大大小
    audioMaxDuration: number; // 音频预览最大时长（秒）
  };

  // 安全配置
  security: {
    scanVirus: boolean;    // 病毒扫描
    checkFileType: boolean; // 文件类型检查
    maxFileNameLength: number; // 最大文件名长度
    allowedExtensions: string[]; // 允许的扩展名
  };

  // 不同场景的配置
  scenarios: {
    avatar: {
      maxSize: number;
      allowedTypes: string[];
      maxFiles: number;
    };
    document: {
      maxSize: number;
      allowedTypes: string[];
      maxFiles: number;
    };
    media: {
      maxSize: number;
      allowedTypes: string[];
      maxFiles: number;
    };
    gallery: {
      maxSize: number;
      allowedTypes: string[];
      maxFiles: number;
    };
    backup: {
      maxSize: number;
      allowedTypes: string[];
      maxFiles: number;
    };
  };
}

// 默认文件上传配置
export const defaultFileUploadConfig: FileUploadConfig = {
  maxFileSize: {
    default: 10 * 1024 * 1024,    // 10MB
    image: 5 * 1024 * 1024,       // 5MB
    video: 500 * 1024 * 1024,     // 500MB
    audio: 50 * 1024 * 1024,      // 50MB
    document: 20 * 1024 * 1024,   // 20MB
    archive: 100 * 1024 * 1024    // 100MB
  },

  allowedTypes: {
    image: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'image/svg+xml', 'image/bmp', 'image/tiff'
    ],
    video: [
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
      'video/x-msvideo', 'video/x-matroska'
    ],
    audio: [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
      'audio/webm', 'audio/aac', 'audio/flac'
    ],
    document: [
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv', 'text/rtf'
    ],
    archive: [
      'application/zip', 'application/x-rar-compressed',
      'application/x-7z-compressed', 'application/gzip',
      'application/x-tar', 'application/x-compress'
    ]
  },

  upload: {
    maxFiles: 10,
    chunkSize: 1024 * 1024,    // 1MB
    timeout: 300000,           // 5分钟
    retryAttempts: 3,
    retryDelay: 1000           // 1秒
  },

  preview: {
    imageMaxSize: 10 * 1024 * 1024,  // 10MB
    videoMaxSize: 50 * 1024 * 1024,  // 50MB
    audioMaxDuration: 300          // 5分钟
  },

  security: {
    scanVirus: false,
    checkFileType: true,
    maxFileNameLength: 255,
    allowedExtensions: [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff',
      'mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv',
      'mp3', 'wav', 'ogg', 'webm', 'aac', 'flac',
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
      'txt', 'csv', 'rtf', 'zip', 'rar', '7z', 'gz', 'tar'
    ]
  },

  scenarios: {
    avatar: {
      maxSize: 2 * 1024 * 1024,     // 2MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      maxFiles: 1
    },
    document: {
      maxSize: 20 * 1024 * 1024,   // 20MB
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      maxFiles: 5
    },
    media: {
      maxSize: 100 * 1024 * 1024,  // 100MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'audio/mp3'],
      maxFiles: 20
    },
    gallery: {
      maxSize: 50 * 1024 * 1024,   // 50MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      maxFiles: 50
    },
    backup: {
      maxSize: 200 * 1024 * 1024,  // 200MB
      allowedTypes: ['application/zip', 'application/x-rar-compressed'],
      maxFiles: 1
    }
  }
};

// 文件上传配置管理器
export class FileUploadConfigManager {
  private static config: FileUploadConfig = defaultFileUploadConfig;

  /**
   * 获取文件上传配置
   */
  static getConfig(): FileUploadConfig {
    return this.config;
  }

  /**
   * 更新文件上传配置
   */
  static updateConfig(newConfig: Partial<FileUploadConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 重置为默认配置
   */
  static resetToDefault(): void {
    this.config = defaultFileUploadConfig;
  }

  /**
   * 根据场景获取配置
   */
  static getScenarioConfig(scenario: keyof FileUploadConfig['scenarios']): FileUploadConfig['scenarios'][keyof FileUploadConfig['scenarios']] {
    return this.config.scenarios[scenario];
  }

  /**
   * 获取文件大小限制
   */
  static getMaxFileSize(fileType: string): number {
    // 先检查场景配置
    if (fileType === 'avatar' || fileType === 'document' ||
        fileType === 'media' || fileType === 'gallery' || fileType === 'backup') {
      const scenario = fileType as keyof FileUploadConfig['scenarios'];
      return this.getScenarioConfig(scenario).maxSize;
    }

    // 检查文件类型配置
    if (fileType in this.config.maxFileSize) {
      return this.config.maxFileSize[fileType as keyof FileUploadConfig['maxFileSize']];
    }

    // 返回默认限制
    return this.config.maxFileSize.default;
  }

  /**
   * 获取允许的文件类型
   */
  static getAllowedTypes(fileType: string): string[] {
    // 先检查场景配置
    if (fileType === 'avatar' || fileType === 'document' ||
        fileType === 'media' || fileType === 'gallery' || fileType === 'backup') {
      const scenario = fileType as keyof FileUploadConfig['scenarios'];
      return this.getScenarioConfig(scenario).allowedTypes;
    }

    // 检查文件类型配置
    if (fileType in this.config.allowedTypes) {
      return this.config.allowedTypes[fileType as keyof FileUploadConfig['allowedTypes']];
    }

    // 返回默认类型
    return this.config.allowedTypes.image;
  }

  /**
   * 获取最大文件数量
   */
  static getMaxFiles(fileType: string): number {
    // 先检查场景配置
    if (fileType === 'avatar' || fileType === 'document' ||
        fileType === 'media' || fileType === 'gallery' || fileType === 'backup') {
      const scenario = fileType as keyof FileUploadConfig['scenarios'];
      return this.getScenarioConfig(scenario).maxFiles;
    }

    // 返回默认配置
    return this.config.upload.maxFiles;
  }

  /**
   * 验证文件
   */
  static validateFile(file: File, fileType: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    let isValid = true;

    // 检查文件大小
    const maxSize = this.getMaxFileSize(fileType);
    if (file.size > maxSize) {
      errors.push(`文件大小超过限制 (${this.formatFileSize(maxSize)})`);
      isValid = false;
    }

    // 检查文件类型
    const allowedTypes = this.getAllowedTypes(fileType);
    if (!allowedTypes.includes(file.type)) {
      errors.push(`不支持的文件类型: ${file.type}`);
      isValid = false;
    }

    // 检查文件名长度
    if (file.name.length > this.config.security.maxFileNameLength) {
      errors.push(`文件名过长 (最大${this.config.security.maxFileNameLength}字符)`);
      isValid = false;
    }

    // 检查文件扩展名
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && !this.config.security.allowedExtensions.includes(extension)) {
      errors.push(`不支持的文件扩展名: .${extension}`);
      isValid = false;
    }

    return { isValid, errors };
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 获取上传进度信息
   */
  static getProgressInfo(loaded: number, total: number): {
    percentage: number;
    loadedFormatted: string;
    totalFormatted: string;
    speed: string;
    remaining: string;
  } {
    const percentage = Math.round((loaded / total) * 100);
    const loadedFormatted = this.formatFileSize(loaded);
    const totalFormatted = this.formatFileSize(total);

    // 简单的速度计算（实际应用中应该有更精确的计算）
    const speed = this.formatFileSize(loaded / (Date.now() / 1000));
    const remaining = this.formatFileSize(total - loaded);

    return {
      percentage,
      loadedFormatted,
      totalFormatted,
      speed,
      remaining
    };
  }

  /**
   * 创建分片上传配置
   */
  static createChunkConfig(file: File): {
    chunks: Array<{
      start: number;
      end: number;
      index: number;
      size: number;
      data: Blob;
    }>;
    totalChunks: number;
    chunkSize: number;
  } {
    const chunkSize = this.config.upload.chunkSize;
    const totalChunks = Math.ceil(file.size / chunkSize);
    const chunks = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const size = end - start;

      chunks.push({
        start,
        end,
        index: i,
        size,
        data: file.slice(start, end)
      });
    }

    return {
      chunks,
      totalChunks,
      chunkSize
    };
  }

  /**
   * 检查文件是否需要分片上传
   */
  static shouldUseChunkUpload(fileSize: number): boolean {
    return fileSize > this.config.upload.chunkSize;
  }

  /**
   * 获取上传建议
   */
  static getUploadRecommendation(file: File): {
    recommendedScenario: string;
    reason: string;
    alternatives: string[];
  } {
    const extension = file.name.split('.').pop()?.toLowerCase();

    // 根据文件类型推荐场景
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      if (file.size <= 2 * 1024 * 1024) {
        return {
          recommendedScenario: 'avatar',
          reason: '适合作为头像或个人资料图片',
          alternatives: ['gallery', 'media']
        };
      } else {
        return {
          recommendedScenario: 'gallery',
          reason: '图片较大，建议使用图库场景',
          alternatives: ['media']
        };
      }
    }

    if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(extension || '')) {
      return {
        recommendedScenario: 'document',
        reason: '文档文件，建议使用文档场景',
        alternatives: []
      };
    }

    if (['mp4', 'webm', 'avi', 'mov'].includes(extension || '')) {
      return {
        recommendedScenario: 'media',
        reason: '媒体文件，建议使用媒体场景',
        alternatives: ['gallery']
      };
    }

    return {
      recommendedScenario: 'default',
      reason: '使用默认上传配置',
      alternatives: []
    };
  }
}

export default FileUploadConfigManager;