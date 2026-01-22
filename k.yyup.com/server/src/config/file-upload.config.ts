/**
 * 文件上传安全配置
 *
 * 防止大文件攻击和恶意文件上传
 */

import multer from 'multer';
import path from 'path';

/**
 * 文件大小限制（字节）
 */
export const FILE_SIZE_LIMITS = {
  // 图片文件
  IMAGE: 5 * 1024 * 1024, // 5MB
  // 视频文件
  VIDEO: 100 * 1024 * 1024, // 100MB
  // 文档文件
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  // 音频文件
  AUDIO: 20 * 1024 * 1024, // 20MB
  // 默认限制
  DEFAULT: 10 * 1024 * 1024 // 10MB
} as const;

/**
 * 允许的MIME类型
 */
export const ALLOWED_MIME_TYPES = {
  IMAGES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  VIDEOS: [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime'
  ],
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ],
  AUDIO: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/webm'
  ]
} as const;

/**
 * 危险文件扩展名黑名单
 */
export const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr',
  '.vbs', '.js', '.jar', '.app', '.deb',
  '.sh', '.bash', '.ps1', '.vb'
];

/**
 * 检查文件扩展名是否安全
 */
export function isFileExtensionSafe(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return !DANGEROUS_EXTENSIONS.includes(ext);
}

/**
 * 检查MIME类型是否允许
 */
export function isMimeTypeAllowed(mimeType: string, category: keyof typeof ALLOWED_MIME_TYPES = 'IMAGES'): boolean {
  const allowedTypes = ALLOWED_MIME_TYPES[category] as readonly string[];
  return allowedTypes.includes(mimeType);
}

/**
 * Multer配置工厂
 */
export function createMulterConfig(options: {
  maxSize?: number;
  allowedTypes?: readonly string[];
  destination?: string;
}) {
  const {
    maxSize = FILE_SIZE_LIMITS.DEFAULT,
    allowedTypes = [...ALLOWED_MIME_TYPES.IMAGES, ...ALLOWED_MIME_TYPES.DOCUMENTS],
    destination = '/tmp/uploads'
  } = options;

  // 存储配置
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      // 生成安全的文件名
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      cb(null, safeName + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  // 文件过滤器
  const fileFilter = (req: any, file: any, cb: any) => {
    // 检查文件扩展名
    if (!isFileExtensionSafe(file.originalname)) {
      return cb(new Error('不允许的文件类型'), false);
    }

    // 检查MIME类型
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('不允许的文件格式'), false);
    }

    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
      files: 10 // 最多10个文件
    }
  });
}

/**
 * 导出预设配置
 */
export const multerConfigs = {
  // 图片上传
  image: createMulterConfig({
    maxSize: FILE_SIZE_LIMITS.IMAGE,
    allowedTypes: ALLOWED_MIME_TYPES.IMAGES
  }),

  // 视频上传
  video: createMulterConfig({
    maxSize: FILE_SIZE_LIMITS.VIDEO,
    allowedTypes: ALLOWED_MIME_TYPES.VIDEOS
  }),

  // 文档上传
  document: createMulterConfig({
    maxSize: FILE_SIZE_LIMITS.DOCUMENT,
    allowedTypes: ALLOWED_MIME_TYPES.DOCUMENTS
  }),

  // 音频上传
  audio: createMulterConfig({
    maxSize: FILE_SIZE_LIMITS.AUDIO,
    allowedTypes: ALLOWED_MIME_TYPES.AUDIO
  })
} as const;

/**
 * 文件大小格式化
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 验证文件大小的错误消息
 */
export function getFileSizeErrorMessage(maxSize: number): string {
  return `文件大小不能超过 ${formatFileSize(maxSize)}`;
}

/**
 * 导出默认配置
 */
export default {
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
  DANGEROUS_EXTENSIONS,
  isFileExtensionSafe,
  isMimeTypeAllowed,
  createMulterConfig,
  multerConfigs,
  formatFileSize,
  getFileSizeErrorMessage
};
