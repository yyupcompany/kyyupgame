/**
 * 文件上传API
 * 提供统一的文件上传接口
 */

import request from '@/utils/request'
import type { ApiResponse } from '@/utils/request'

// 文件信息接口
export interface FileInfo {
  id: string
  fileName: string
  originalName: string
  filePath: string
  fileSize: number
  fileType: string
  storageType: string
  accessUrl: string
  isPublic: boolean
  uploaderId?: number
  uploaderType?: string
  module?: string
  referenceId?: string
  referenceType?: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

// 上传参数接口
export interface UploadParams {
  module?: string
  isPublic?: boolean
  referenceId?: string
  referenceType?: string
  metadata?: any
}

// 文件列表查询参数
export interface FileListParams {
  module?: string
  uploaderType?: string
  uploaderId?: number
  fileType?: string
  status?: string
  keyword?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

// 文件统计信息
export interface FileStatistics {
  totalFiles: number
  totalSize: number
  fileTypes: Record<string, number>
}

// 存储空间信息
export interface StorageInfo {
  totalSpace: number
  usedSpace: number
  freeSpace: number
}

/**
 * 上传单个文件
 */
export function uploadFile(file: File, params: UploadParams = {}): Promise<ApiResponse<FileInfo>> {
  const formData = new FormData()
  formData.append('file', file)
  
  // 添加额外参数
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value.toString())
    }
  })
  
  return request.post('/api/files/upload', formData)
}

/**
 * 批量上传文件
 */
export function uploadMultipleFiles(files: File[], params: UploadParams = {}): Promise<ApiResponse<{
  files: FileInfo[]
  count: number
}>> {
  const formData = new FormData()
  
  files.forEach(file => {
    formData.append('files', file)
  })
  
  // 添加额外参数
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value.toString())
    }
  })
  
  return request.post('/api/files/upload-multiple', formData)
}

/**
 * 上传图片
 */
export function uploadImage(file: File, params: UploadParams = {}): Promise<ApiResponse<FileInfo>> {
  return uploadFile(file, {
    ...params,
    module: params.module || 'image'
  })
}

/**
 * 上传头像
 */
export function uploadAvatar(file: File, userId?: number): Promise<ApiResponse<FileInfo>> {
  return uploadFile(file, {
    module: 'avatar',
    referenceType: 'user',
    referenceId: userId?.toString(),
    isPublic: true
  })
}

/**
 * 上传文档
 */
export function uploadDocument(file: File, params: UploadParams = {}): Promise<ApiResponse<FileInfo>> {
  return uploadFile(file, {
    ...params,
    module: params.module || 'document'
  })
}

/**
 * 获取文件列表
 */
export function getFileList(params: FileListParams = {}): Promise<ApiResponse<{
  items: FileInfo[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}>> {
  return request.get('/api/files', { params })
}

/**
 * 获取文件详情
 */
export function getFileById(id: string): Promise<ApiResponse<FileInfo>> {
  return request.get(`/api/files/${id}`)
}

/**
 * 更新文件信息
 */
export function updateFile(id: string, data: Partial<FileInfo>): Promise<ApiResponse<FileInfo>> {
  return request.put(`/api/files/${id}`, data)
}

/**
 * 删除文件
 */
export function deleteFile(id: string, physicalDelete: boolean = false): Promise<ApiResponse<null>> {
  return request.del(`/api/files/${id}`, {
    params: { physical: physicalDelete }
  })
}

/**
 * 获取文件下载链接
 */
export function getDownloadUrl(id: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  return `${baseUrl}/api/files/download/${id}`
}

/**
 * 下载文件
 */
export function downloadFile(id: string, filename?: string): void {
  const url = getDownloadUrl(id)
  const link = document.createElement('a')
  link.href = url
  if (filename) {
    link.download = filename
  }
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 获取文件统计信息
 */
export function getFileStatistics(): Promise<ApiResponse<FileStatistics>> {
  return request.get('/api/files/statistics')
}

/**
 * 获取存储空间信息
 */
export function getStorageInfo(): Promise<ApiResponse<StorageInfo>> {
  return request.get('/api/files/storage-info')
}

/**
 * 清理临时文件
 */
export function cleanupTempFiles(olderThanHours: number = 24): Promise<ApiResponse<{
  deletedCount: number
  freedSpace: number
}>> {
  return request.post('/api/files/cleanup-temp', null, {
    params: { hours: olderThanHours }
  })
}

/**
 * 生成文件预览URL
 */
export function getPreviewUrl(fileInfo: FileInfo): string {
  // 如果是图片文件，直接返回访问URL
  if (fileInfo.fileType.startsWith('image/')) {
    return fileInfo.accessUrl
  }
  
  // 对于其他文件类型，可以返回下载链接或特殊的预览链接
  return getDownloadUrl(fileInfo.id)
}

/**
 * 检查文件是否可以预览
 */
export function canPreview(fileInfo: FileInfo): boolean {
  const previewableTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain'
  ]
  
  return previewableTypes.includes(fileInfo.fileType)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 获取文件类型图标
 */
export function getFileTypeIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return 'picture'
  if (fileType.startsWith('video/')) return 'video-play'
  if (fileType.startsWith('audio/')) return 'headphones'
  if (fileType.includes('pdf')) return 'document'
  if (fileType.includes('word')) return 'document'
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'document'
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'document'
  if (fileType.startsWith('text/')) return 'document'
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return 'folder-zip'
  
  return 'document'
}

/**
 * 验证文件类型
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

/**
 * 验证文件大小
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  return file.size <= maxSizeMB * 1024 * 1024
}