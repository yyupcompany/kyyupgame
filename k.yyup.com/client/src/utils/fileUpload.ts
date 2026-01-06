/**
 * 统一文件上传工具
 * 提供前端文件上传的统一接口和配置
 */

import { ElMessage } from 'element-plus'
import type { UploadRawFile } from 'element-plus'
import request from './request'

// 文件上传配置接口
export interface FileUploadConfig {
  action?: string
  headers?: Record<string, string>
  data?: Record<string, any>
  maxSize?: number
  allowedTypes?: string[]
  maxCount?: number
  module?: string
  isPublic?: boolean
  referenceId?: string
  referenceType?: string
}

// 上传响应接口
export interface UploadResponse {
  success: boolean
  data: {
    id: string
    fileName: string
    originalName: string
    accessUrl: string
    fileSize: number
    fileType: string
  }
  message: string
}

// 默认上传配置
export const DEFAULT_UPLOAD_CONFIG: FileUploadConfig = {
  action: '/files/upload',
  maxSize: 10, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ],
  maxCount: 5,
  module: 'general',
  isPublic: false
}

// 文件类型配置预设
export const FILE_TYPE_PRESETS = {
  // 图片文件
  image: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5,
    accept: 'image/*',
    tips: '支持 JPG、PNG、GIF、WebP 格式，大小不超过 5MB'
  },
  
  // 文档文件
  document: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
    maxSize: 20,
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt',
    tips: '支持 PDF、Word、Excel、TXT 格式，大小不超过 20MB'
  },
  
  // 头像图片
  avatar: {
    allowedTypes: ['image/jpeg', 'image/png'],
    maxSize: 2,
    accept: 'image/jpeg,image/png',
    tips: '支持 JPG、PNG 格式，大小不超过 2MB'
  },
  
  // 通用文件
  general: {
    allowedTypes: DEFAULT_UPLOAD_CONFIG.allowedTypes,
    maxSize: 10,
    accept: '*',
    tips: '支持常见文件格式，大小不超过 10MB'
  }
}

/**
 * 文件上传工具类
 */
export class FileUploadManager {
  private config: FileUploadConfig
  
  constructor(config: Partial<FileUploadConfig> = {}) {
    this.config = { ...DEFAULT_UPLOAD_CONFIG, ...config }
  }
  
  /**
   * 更新配置
   */
  updateConfig(config: Partial<FileUploadConfig>) {
    this.config = { ...this.config, ...config }
  }
  
  /**
   * 获取上传配置
   */
  getConfig(): FileUploadConfig {
    return { ...this.config }
  }
  
  /**
   * 验证文件
   */
  validateFile(file: UploadRawFile): boolean {
    // 检查文件类型
    if (this.config.allowedTypes && !this.config.allowedTypes.includes(file.type)) {
      ElMessage.error('不支持的文件类型')
      return false
    }
    
    // 检查文件大小
    if (this.config.maxSize && file.size > this.config.maxSize * 1024 * 1024) {
      ElMessage.error(`文件大小不能超过 ${this.config.maxSize}MB`)
      return false
    }
    
    return true
  }
  
  /**
   * 上传单个文件
   */
  async uploadFile(file: File, options: Partial<FileUploadConfig> = {}, onProgress?: (percent: number, loaded: number, total?: number) => void): Promise<UploadResponse> {
    const config = { ...this.config, ...options }
    const formData = new FormData()
    formData.append('file', file)
    if (config.module) formData.append('module', config.module)
    if (config.isPublic !== undefined) formData.append('isPublic', config.isPublic.toString())
    if (config.referenceId) formData.append('referenceId', config.referenceId)
    if (config.referenceType) formData.append('referenceType', config.referenceType)
    if (config.data) {
      Object.entries(config.data).forEach(([key, value]) => { formData.append(key, value.toString()) })
    }
    let attempt = 0
    const maxAttempts = 3
    let lastError: any
    while (attempt < maxAttempts) {
      try {
        const response = await request.post<any>(
          config.action || '/files/upload',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data', ...(config.headers || {}) } as any,
            onUploadProgress: (e: any) => {
              if (onProgress && e && typeof e.loaded === 'number') {
                const percent = e.total ? Math.round((e.loaded / e.total) * 100) : 0
                onProgress(percent, e.loaded, e.total)
              }
            }
          }
        )
        const raw = response as any
        const payload = raw?.data || raw
        const data = payload?.data || payload
        const normalized: UploadResponse = {
          success: payload?.success ?? true,
          data: {
            id: data?.id || data?.fileId || '',
            fileName: data?.fileName || data?.originalName || file.name,
            originalName: data?.originalName || file.name,
            accessUrl: data?.accessUrl || data?.access_url || data?.url || '',
            fileSize: data?.fileSize || file.size,
            fileType: data?.fileType || file.type
          },
          message: payload?.message || '上传成功'
        }
        return normalized
      } catch (error) {
        lastError = error
        attempt++
        if (attempt >= maxAttempts) break
        await new Promise(r => setTimeout(r, Math.min(2000 * attempt, 4000)))
      }
    }
    throw lastError || new Error('文件上传失败')
  }
  
  /**
   * 上传多个文件
   */
  async uploadMultipleFiles(files: File[], options: Partial<FileUploadConfig> = {}, onProgress?: (index: number, percent: number) => void): Promise<UploadResponse[]> {
    const config = { ...this.config, ...options }
    if (config.maxCount && files.length > config.maxCount) {
      throw new Error(`最多只能上传 ${config.maxCount} 个文件`)
    }
    const results: UploadResponse[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const res = await this.uploadFile(file, config, (p) => onProgress && onProgress(i, p))
      results.push(res)
    }
    return results
  }
  
  /**
   * 获取文件下载URL
   */
  getDownloadUrl(fileId: string): string {
    return `/files/download/${fileId}`
  }
  
  /**
   * 删除文件
   */
  async deleteFile(fileId: string, physicalDelete: boolean = false): Promise<void> {
    try {
      await request.del(`/files/${fileId}`, {
        params: { physical: physicalDelete }
      })
    } catch (error) {
      console.error('删除文件失败:', error)
      throw new Error('删除文件失败')
    }
  }
}

/**
 * 获取文件类型配置
 */
export function getFileTypeConfig(type: keyof typeof FILE_TYPE_PRESETS): FileUploadConfig {
  const preset = FILE_TYPE_PRESETS[type]
  return {
    ...DEFAULT_UPLOAD_CONFIG,
    ...preset
  }
}

/**
 * 创建文件上传管理器
 */
export function createFileUploadManager(config: Partial<FileUploadConfig> = {}): FileUploadManager {
  return new FileUploadManager(config)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  if (parts.length <= 1) return ''
  return parts.pop()?.toLowerCase() || ''
}

/**
 * 检查是否为图片文件
 */
export function isImageFile(file: File | string): boolean {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  if (typeof file === 'string') {
    const ext = getFileExtension(file)
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  }
  
  return imageTypes.includes(file.type)
}

/**
 * 检查是否为文档文件
 */
export function isDocumentFile(file: File | string): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
  
  if (typeof file === 'string') {
    const ext = getFileExtension(file)
    return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'].includes(ext)
  }
  
  return documentTypes.includes(file.type)
}

// 创建默认的文件上传管理器实例
export const fileUploadManager = createFileUploadManager()