/**
 * OSS上传服务
 * 提供统一的文件上传到OSS的接口
 */

import { ossService } from '../oss.service';
import crypto from 'crypto';

/**
 * 保存文件到OSS
 * @param file 文件Buffer
 * @param filename 文件名（相对路径）
 * @param contentType 文件MIME类型
 * @returns OSS访问URL
 */
export async function saveToOSS(
  file: Buffer,
  filename: string,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  try {
    // 提取目录路径
    const directory = filename.substring(0, filename.lastIndexOf('/'));
    const name = filename.substring(filename.lastIndexOf('/') + 1);

    const result = await ossService.uploadFile(file, {
      filename: name,
      directory: directory,
      contentType: contentType,
      isPublic: true // 课程音频需要公开访问
    });

    console.log(`✅ [OSS上传] 文件已上传: ${result.url}`);
    return result.url;

  } catch (error) {
    console.error(`❌ [OSS上传] 上传失败:`, error);
    throw error;
  }
}

/**
 * 生成带hash的文件名，避免重复上传
 * @param content 文件内容
 * @param extension 文件扩展名
 * @returns hash文件名
 */
export function generateHashFilename(content: string | Buffer, extension: string): string {
  const hash = crypto.createHash('md5').update(content).digest('hex');
  // 使用hash前两位作为子目录，避免单目录文件过多
  return `${hash.substring(0, 2)}/${hash}.${extension}`;
}

/**
 * 批量保存文件到OSS
 * @param files 文件数组
 * @returns OSS URL数组
 */
export async function batchSaveToOSS(
  files: Array<{ buffer: Buffer; filename: string; contentType: string }>
): Promise<string[]> {
  const uploadPromises = files.map(file =>
    saveToOSS(file.buffer, file.filename, file.contentType)
  );

  return Promise.all(uploadPromises);
}

// 导出单例
export const ossUploadService = {
  saveToOSS,
  generateHashFilename,
  batchSaveToOSS
};
