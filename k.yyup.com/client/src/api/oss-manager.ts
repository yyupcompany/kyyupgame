import { request } from '@/utils/request';

export interface OSSFile {
  name: string;
  url: string;
  size: number;
  lastModified: Date;
}

export interface OSSStats {
  totalFiles: number;
  totalSize: number;
  byType: Record<string, number>;
  byDirectory: Record<string, number>;
}

/**
 * 列出 OSS 中的所有文件
 */
export async function listOSSFiles(prefix?: string, marker?: string) {
  return request.get('/api/oss-manager/files', {
    params: { prefix, marker }
  });
}

/**
 * 获取 OSS 目录结构
 */
export async function getOSSStructure() {
  return request.get('/api/oss-manager/structure');
}

/**
 * 获取 OSS 统计信息
 */
export async function getOSSStats() {
  return request.get('/api/oss-manager/stats');
}

/**
 * 删除 OSS 中的文件
 */
export async function deleteOSSFile(key: string) {
  return request.post('/api/oss-manager/delete', { key });
}

