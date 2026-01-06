/**
 * 静态文件服务安全配置
 *
 * 防止路径遍历攻击和敏感文件泄露
 */

import path from 'path';
import fs from 'fs';

/**
 * 允许的静态文件扩展名白名单
 */
export const ALLOWED_EXTENSIONS = new Set([
  // 图片
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico',
  // 视频
  '.mp4', '.webm', '.ogg',
  // 音频
  '.mp3', '.wav', '.ogg',
  // 文档
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  // 文本
  '.txt', '.md', '.json', '.xml',
  // 字体
  '.woff', '.woff2', '.ttf', '.eot',
  // 前端资源
  '.js', '.css', '.html', '.map'
]);

/**
 * 危险文件扩展名黑名单
 */
export const DANGEROUS_EXTENSIONS = new Set([
  '.env', '.key', '.pem', '.p12', '.pfx',
  '.sql', '.db', '.sqlite',
  '.log', '.bak', '.backup',
  '.sh', '.bash', '.bat', '.cmd',
  '.ps1', '.vbs'
]);

/**
 * 安全的路径解析
 *
 * @param root 根目录
 * @param requestedPath 请求的路径
 * @returns 安全的完整路径，如果路径不安全则返回null
 */
export function safePathResolve(root: string, requestedPath: string): string | null {
  // 1. 规范化路径
  const normalizedPath = path.normalize(requestedPath);

  // 2. 检查是否包含路径遍历
  if (normalizedPath.includes('..')) {
    console.warn('🚫 路径遍历尝试:', requestedPath);
    return null;
  }

  // 3. 解析完整路径
  const fullPath = path.resolve(root, normalizedPath);

  // 4. 确保路径在root目录内
  const relativePath = path.relative(root, fullPath);
  if (relativePath.startsWith('..')) {
    console.warn('🚫 路径超出根目录:', requestedPath);
    return null;
  }

  return fullPath;
}

/**
 * 验证文件扩展名
 *
 * @param filePath 文件路径
 * @returns 是否为允许的扩展名
 */
export function validateFileExtension(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();

  // 检查是否为危险扩展名
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    console.warn('🚫 危险文件扩展名:', ext);
    return false;
  }

  // 检查是否在白名单中
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    console.warn('🚫 不允许的文件扩展名:', ext);
    return false;
  }

  return true;
}

/**
 * 验证文件是否存在
 *
 * @param filePath 文件路径
 * @returns 文件是否存在
 */
export function validateFileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

/**
 * 安全的静态文件中间件配置
 */
export const staticFilesConfig = {
  // 禁止目录浏览
  index: false,

  // 设置响应头
  setHeaders: (res: any, filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();

    // 安全相关的响应头
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // 下载文件而不是执行
    if (['.html', '.js', '.json'].includes(ext)) {
      res.setHeader('Content-Disposition', 'attachment');
    }

    // 缓存控制
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.woff', '.woff2'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1小时
    }
  }
};

/**
 * 自定义静态文件服务中间件（带验证）
 *
 * @param root 静态文件根目录
 * @param urlPath URL路径前缀
 * @returns Express中间件
 */
export function createSafeStaticMiddleware(root: string, urlPath: string) {
  return (req: any, res: any, next: any) => {
    // 1. 只处理GET和HEAD请求
    if (!['GET', 'HEAD'].includes(req.method)) {
      return next();
    }

    // 2. 移除URL前缀，获取文件路径
    const requestPath = req.path.substring(urlPath.length);

    // 3. 安全解析路径
    const safePath = safePathResolve(root, requestPath);
    if (!safePath) {
      return res.status(403).json({
        success: false,
        error: {
          message: '访问被拒绝',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // 4. 验证文件扩展名
    if (!validateFileExtension(safePath)) {
      return res.status(403).json({
        success: false,
        error: {
          message: '不允许的文件类型',
          code: 'INVALID_FILE_TYPE'
        }
      });
    }

    // 5. 验证文件存在
    if (!validateFileExists(safePath)) {
      return res.status(404).json({
        success: false,
        error: {
          message: '文件不存在',
          code: 'FILE_NOT_FOUND'
        }
      });
    }

    // 6. 发送文件
    res.sendFile(safePath, {
      root: '/',
      headers: {
        'X-Content-Type-Options': 'nosniff'
      }
    }, (err: any) => {
      if (err) {
        console.error('发送文件错误:', err);
        return res.status(500).json({
          success: false,
          error: {
            message: '文件发送失败',
            code: 'FILE_SEND_ERROR'
          }
        });
      }
    });
  };
}

/**
 * 导出配置
 */
export default {
  ALLOWED_EXTENSIONS,
  DANGEROUS_EXTENSIONS,
  safePathResolve,
  validateFileExtension,
  validateFileExists,
  staticFilesConfig,
  createSafeStaticMiddleware
};
