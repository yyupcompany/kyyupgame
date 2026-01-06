# 🔌 幼儿园管理系统 - API集成说明

## 📋 文档概述

本文档详细介绍幼儿园管理系统前端与后端API的集成方案，包括API架构设计、请求封装、错误处理、缓存策略和最佳实践等内容。

### 🎯 API集成目标
- ✅ 统一的API调用方式
- ✅ 完善的错误处理机制
- ✅ 高效的缓存策略
- ✅ 类型安全的接口定义
- ✅ 移动端网络优化

## 🏗️ API架构总览

### API分层设计

```
API调用层次架构:

┌─ 页面组件层 (Page Components) ─────────────────────┐
│  • 业务页面直接调用                               │
│  • 处理UI状态更新                                  │
│  • 用户交互响应                                   │
│  例：Dashboard.vue, StudentList.vue               │
└─────────────────────────────────────────────────────┘
                     ↓ 调用
┌─ API服务层 (API Services) ─────────────────────────┐
│  • 业务逻辑封装                                   │
│  • 数据转换处理                                   │
│  • 缓存策略实现                                   │
│  例：userService, studentService                  │
└─────────────────────────────────────────────────────┘
                     ↓ 使用
┌─ HTTP客户端层 (HTTP Client) ───────────────────────┐
│  • 请求拦截器                                     │
│  • 响应拦截器                                     │
│  • 错误处理                                       │
│  • 认证管理                                       │
│  例：axios实例，请求/响应拦截                     │
└─────────────────────────────────────────────────────┘
                     ↓ 发送
┌─ 后端API层 (Backend APIs) ─────────────────────────┐
│  • RESTful接口                                    │
│  • 155+个API端点                                  │
│  • JWT认证验证                                    │
│  • 业务逻辑处理                                   │
│  例：/api/users, /api/ai/chat                    │
└─────────────────────────────────────────────────────┘
```

### API端点统计

系统包含 **155+个API端点**，分布如下：

| 模块 | 端点数量 | 主要功能 | 示例接口 |
|------|---------|----------|----------|
| 认证授权 | 8个 | 登录、注销、权限验证 | `/api/auth/login` |
| 用户管理 | 15个 | 用户CRUD、角色管理 | `/api/users`, `/api/roles` |
| AI功能 | 12个 | AI对话、模型管理、记忆系统 | `/api/ai/chat`, `/api/ai/models` |
| 招生管理 | 25个 | 招生计划、申请处理 | `/api/enrollment`, `/api/applications` |
| 班级管理 | 20个 | 班级CRUD、学生分配 | `/api/classes`, `/api/class-students` |
| 教师管理 | 18个 | 教师信息、绩效管理 | `/api/teachers`, `/api/teacher-performance` |
| 家长服务 | 16个 | 家长信息、沟通记录 | `/api/parents`, `/api/parent-communications` |
| 活动管理 | 14个 | 活动创建、报名管理 | `/api/activities`, `/api/activity-registrations` |
| 数据统计 | 12个 | 报表生成、数据分析 | `/api/statistics`, `/api/reports` |
| 系统管理 | 15个 | 系统配置、日志管理 | `/api/system/config`, `/api/system/logs` |

## 🔧 API客户端配置

### 1. Axios实例配置

```typescript
// utils/request.ts
import axios, { 
  type AxiosResponse, 
  type AxiosError,
  type InternalAxiosRequestConfig 
} from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import type { ApiResponse } from '@/types/api'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000, // 移动端网络可能较慢，设置30秒超时
  withCredentials: false, // 不发送cookies，使用JWT
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

// 请求计数器，用于loading控制
let requestCount = 0
let loadingInstance: any = null

// 显示全局loading
const showLoading = (config: InternalAxiosRequestConfig) => {
  if (!config.hideLoading && requestCount === 0) {
    loadingInstance = ElLoading.service({
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.3)',
      customClass: 'api-loading'
    })
  }
  requestCount++
}

// 隐藏全局loading  
const hideLoading = () => {
  requestCount--
  if (requestCount <= 0) {
    requestCount = 0
    loadingInstance?.close()
    loadingInstance = null
  }
}

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 显示loading
    showLoading(config)
    
    // 添加认证token
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    
    // 添加请求ID用于调试
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // 移动端网络优化
    if (config.method === 'get') {
      // GET请求添加时间戳防止缓存
      config.params = {
        ...config.params,
        _t: Date.now()
      }
      
      // 移动端可能网络不稳定，降低超时时间
      if (window.navigator.onLine === false) {
        config.timeout = 10000
      }
    }
    
    // 添加设备信息
    config.headers['X-Device-Type'] = window.innerWidth <= 768 ? 'mobile' : 'desktop'
    config.headers['X-User-Agent'] = navigator.userAgent
    
    // 请求日志（开发环境）
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        config,
        timestamp: new Date().toISOString()
      })
    }
    
    return config
  },
  (error) => {
    hideLoading()
    console.error('❌ Request interceptor error:', error)
    ElMessage.error('请求配置错误')
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    hideLoading()
    
    const { config, data, status } = response
    
    // 响应日志（开发环境）
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${config.method?.toUpperCase()} ${config.url}`, {
        status,
        data,
        timestamp: new Date().toISOString()
      })
    }
    
    // 检查HTTP状态码
    if (status !== 200) {
      ElMessage.error(`请求失败：HTTP ${status}`)
      return Promise.reject(new Error(`HTTP ${status}`))
    }
    
    // 检查业务状态码
    if (data.success === false) {
      const errorMessage = data.message || '请求失败'
      
      // 特殊错误码处理
      switch (data.code) {
        case 40001: // Token过期
          ElMessage.error('登录已过期，请重新登录')
          const userStore = useUserStore()
          userStore.logoutUser()
          router.push('/login')
          break
        case 40003: // 权限不足
          ElMessage.error('权限不足，禁止访问')
          break
        case 50000: // 服务器错误
          ElMessage.error('服务器内部错误，请稍后重试')
          break
        default:
          ElMessage.error(errorMessage)
      }
      
      return Promise.reject(new Error(errorMessage))
    }
    
    return data
  },
  (error: AxiosError) => {
    hideLoading()
    
    console.error('❌ API Response Error:', error)
    
    // 网络错误处理
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        ElMessage.error('请求超时，请检查网络连接')
      } else if (error.message === 'Network Error') {
        ElMessage.error('网络连接失败，请检查网络设置')
      } else {
        ElMessage.error('网络错误，请稍后重试')
      }
      return Promise.reject(error)
    }
    
    // HTTP状态码错误处理
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        ElMessage.error(data?.message || '请求参数错误')
        break
      case 401:
        ElMessage.error('未授权访问，请重新登录')
        const userStore = useUserStore()
        userStore.logoutUser()
        router.push('/login')
        break
      case 403:
        ElMessage.error('权限不足，禁止访问')
        break
      case 404:
        ElMessage.error('请求的资源不存在')
        break
      case 422:
        ElMessage.error(data?.message || '数据验证失败')
        break
      case 429:
        ElMessage.error('请求过于频繁，请稍后再试')
        break
      case 500:
        ElMessage.error('服务器内部错误')
        break
      case 502:
        ElMessage.error('网关错误')
        break
      case 503:
        ElMessage.error('服务暂不可用')
        break
      case 504:
        ElMessage.error('网关超时')
        break
      default:
        ElMessage.error(data?.message || `请求失败：${status}`)
    }
    
    return Promise.reject(error)
  }
)

export default request

// 扩展axios配置类型
declare module 'axios' {
  interface AxiosRequestConfig {
    hideLoading?: boolean // 是否隐藏loading
    cache?: boolean       // 是否启用缓存
    cacheTime?: number    // 缓存时间（毫秒）
  }
}
```

### 2. API响应类型定义

```typescript
// types/api.ts
// 统一API响应格式
export interface ApiResponse<T = any> {
  code: number           // 业务状态码
  message: string        // 响应消息
  data: T               // 响应数据
  success: boolean      // 操作是否成功
  timestamp?: string    // 时间戳
  requestId?: string    // 请求ID
  total?: number        // 分页总数
  page?: number         // 当前页码
  pageSize?: number     // 每页大小
}

// 分页请求参数
export interface PaginationParams {
  page: number          // 页码，从1开始
  pageSize: number      // 每页大小
  sortBy?: string       // 排序字段
  sortOrder?: 'asc' | 'desc' // 排序方向
}

// 分页响应数据
export interface PaginationResponse<T> {
  list: T[]            // 数据列表
  total: number        // 总数
  page: number         // 当前页
  pageSize: number     // 每页大小
  totalPages: number   // 总页数
  hasNext: boolean     // 是否有下一页
  hasPrev: boolean     // 是否有上一页
}

// 搜索参数
export interface SearchParams {
  keyword?: string     // 关键词
  filters?: Record<string, any> // 过滤条件
  dateRange?: [string, string]  // 日期范围
}

// 批量操作参数
export interface BatchParams<T = string> {
  ids: T[]            // ID列表
  action: string      // 操作类型
  params?: Record<string, any> // 额外参数
}

// 文件上传响应
export interface UploadResponse {
  url: string         // 文件URL
  filename: string    // 文件名
  size: number        // 文件大小
  mimetype: string    // 文件类型
}

// 业务实体类型
export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatar?: string
  role: UserRole
  department?: string
  phone?: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface Student {
  id: string
  name: string
  gender: 'male' | 'female'
  birthday: string
  classId?: string
  className?: string
  parentId?: string
  parentName?: string
  phone?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  medicalInfo?: string
  enrollmentDate: string
  graduationDate?: string
  status: 'enrolled' | 'graduated' | 'transferred'
  createdAt: string
  updatedAt: string
}

export interface Teacher {
  id: string
  name: string
  gender: 'male' | 'female'
  birthday: string
  phone: string
  email: string
  address?: string
  education: string
  major: string
  experience: number
  specialties?: string[]
  classes?: string[]
  subjects?: string[]
  hireDate: string
  salary?: number
  performance?: number
  status: 'active' | 'inactive' | 'resigned'
  createdAt: string
  updatedAt: string
}

export interface Class {
  id: string
  name: string
  grade: string
  capacity: number
  currentCount: number
  teacherId?: string
  teacherName?: string
  assistantId?: string
  assistantName?: string
  room?: string
  description?: string
  schedule?: ClassSchedule[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: string
  title: string
  description: string
  type: 'education' | 'entertainment' | 'outdoor' | 'special'
  startTime: string
  endTime: string
  location?: string
  capacity?: number
  currentCount: number
  fee?: number
  organizerId: string
  organizerName: string
  targetAges?: string[]
  requirements?: string[]
  materials?: string[]
  registrations?: ActivityRegistration[]
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export type UserRole = 'admin' | 'principal' | 'teacher' | 'parent'
```

## 🎯 API服务层设计

### 1. 基础服务类

```typescript
// api/base.service.ts
import request from '@/utils/request'
import type { 
  ApiResponse, 
  PaginationParams, 
  PaginationResponse,
  SearchParams,
  BatchParams
} from '@/types/api'

// 基础服务类，所有API服务都继承此类
export abstract class BaseService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  protected baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  // 获取列表（分页）
  async getList(params?: PaginationParams & SearchParams): Promise<PaginationResponse<T>> {
    const response = await request.get<ApiResponse<PaginationResponse<T>>>(this.baseUrl, {
      params,
      cache: true,
      cacheTime: 60000 // 缓存1分钟
    })
    return response.data
  }

  // 获取所有（不分页）
  async getAll(params?: SearchParams): Promise<T[]> {
    const response = await request.get<ApiResponse<T[]>>(`${this.baseUrl}/all`, {
      params,
      cache: true,
      cacheTime: 60000
    })
    return response.data
  }

  // 根据ID获取单个
  async getById(id: string): Promise<T> {
    const response = await request.get<ApiResponse<T>>(`${this.baseUrl}/${id}`, {
      cache: true,
      cacheTime: 30000 // 缓存30秒
    })
    return response.data
  }

  // 创建
  async create(data: CreateDTO): Promise<T> {
    const response = await request.post<ApiResponse<T>>(this.baseUrl, data)
    this.clearCache() // 创建后清除缓存
    return response.data
  }

  // 更新
  async update(id: string, data: UpdateDTO): Promise<T> {
    const response = await request.put<ApiResponse<T>>(`${this.baseUrl}/${id}`, data)
    this.clearCache() // 更新后清除缓存
    return response.data
  }

  // 删除
  async delete(id: string): Promise<void> {
    await request.delete(`${this.baseUrl}/${id}`)
    this.clearCache() // 删除后清除缓存
  }

  // 批量操作
  async batchOperation(params: BatchParams): Promise<void> {
    await request.post(`${this.baseUrl}/batch`, params)
    this.clearCache()
  }

  // 搜索
  async search(params: SearchParams & PaginationParams): Promise<PaginationResponse<T>> {
    const response = await request.post<ApiResponse<PaginationResponse<T>>>(
      `${this.baseUrl}/search`, 
      params
    )
    return response.data
  }

  // 导出数据
  async export(params?: SearchParams): Promise<Blob> {
    const response = await request.post(`${this.baseUrl}/export`, params, {
      responseType: 'blob',
      hideLoading: false
    })
    return response.data
  }

  // 清除缓存（需要配合缓存管理器实现）
  protected clearCache(): void {
    // TODO: 实现缓存清除逻辑
    console.log(`Clearing cache for ${this.baseUrl}`)
  }
}
```

### 2. 具体业务服务

```typescript
// api/user.service.ts
import { BaseService } from './base.service'
import request from '@/utils/request'
import type { User, ApiResponse } from '@/types/api'

interface UserCreateDTO {
  username: string
  email: string
  password: string
  displayName: string
  role: string
  department?: string
  phone?: string
}

interface UserUpdateDTO {
  displayName?: string
  email?: string
  department?: string
  phone?: string
  isActive?: boolean
}

interface ChangePasswordDTO {
  oldPassword: string
  newPassword: string
}

class UserService extends BaseService<User, UserCreateDTO, UserUpdateDTO> {
  constructor() {
    super('/users')
  }

  // 修改密码
  async changePassword(id: string, data: ChangePasswordDTO): Promise<void> {
    await request.post(`${this.baseUrl}/${id}/change-password`, data)
  }

  // 重置密码
  async resetPassword(id: string): Promise<string> {
    const response = await request.post<ApiResponse<{ password: string }>>(
      `${this.baseUrl}/${id}/reset-password`
    )
    return response.data.password
  }

  // 切换用户状态
  async toggleStatus(id: string): Promise<User> {
    const response = await request.post<ApiResponse<User>>(`${this.baseUrl}/${id}/toggle-status`)
    this.clearCache()
    return response.data
  }

  // 获取用户权限
  async getUserPermissions(id: string): Promise<string[]> {
    const response = await request.get<ApiResponse<string[]>>(
      `${this.baseUrl}/${id}/permissions`,
      { cache: true, cacheTime: 300000 } // 缓存5分钟
    )
    return response.data
  }

  // 分配角色
  async assignRole(id: string, roleId: string): Promise<void> {
    await request.post(`${this.baseUrl}/${id}/assign-role`, { roleId })
    this.clearCache()
  }

  // 获取用户统计
  async getStatistics(): Promise<{
    totalUsers: number
    activeUsers: number
    newUsersThisMonth: number
    usersByRole: Record<string, number>
  }> {
    const response = await request.get<ApiResponse<any>>(`${this.baseUrl}/statistics`, {
      cache: true,
      cacheTime: 120000 // 缓存2分钟
    })
    return response.data
  }
}

export const userService = new UserService()
```

```typescript
// api/ai.service.ts
import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

interface ChatResponse {
  id: string
  type: 'text' | 'table' | 'chart'
  content: any
  suggestions?: string[]
  confidence?: number
}

interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  capabilities: string[]
  maxTokens: number
  isActive: boolean
}

interface MemoryItem {
  id: string
  type: 'core' | 'episodic' | 'semantic' | 'procedural' | 'resource' | 'knowledge'
  content: string
  importance: number
  timestamp: string
  tags: string[]
  associations: string[]
}

class AIService {
  private baseUrl = '/ai'

  // 发送消息到AI
  async sendMessage(
    message: string, 
    conversationId?: string,
    context?: Record<string, any>
  ): Promise<ChatResponse> {
    const response = await request.post<ApiResponse<ChatResponse>>(`${this.baseUrl}/chat`, {
      message,
      conversationId,
      context,
      timestamp: new Date().toISOString(),
      // 移动端标识，后端可能需要优化响应格式
      deviceType: window.innerWidth <= 768 ? 'mobile' : 'desktop'
    })
    return response.data
  }

  // 获取对话历史
  async getChatHistory(conversationId: string): Promise<ChatMessage[]> {
    const response = await request.get<ApiResponse<ChatMessage[]>>(
      `${this.baseUrl}/conversations/${conversationId}/history`,
      { cache: true, cacheTime: 30000 }
    )
    return response.data
  }

  // 创建新对话
  async createConversation(): Promise<string> {
    const response = await request.post<ApiResponse<{ conversationId: string }>>(
      `${this.baseUrl}/conversations`
    )
    return response.data.conversationId
  }

  // 删除对话
  async deleteConversation(conversationId: string): Promise<void> {
    await request.delete(`${this.baseUrl}/conversations/${conversationId}`)
  }

  // 获取AI模型列表
  async getModels(): Promise<AIModel[]> {
    const response = await request.get<ApiResponse<AIModel[]>>(`${this.baseUrl}/models`, {
      cache: true,
      cacheTime: 600000 // 缓存10分钟
    })
    return response.data
  }

  // 切换AI模型
  async switchModel(modelId: string): Promise<void> {
    await request.post(`${this.baseUrl}/models/${modelId}/switch`)
  }

  // 搜索记忆
  async searchMemory(
    query: string, 
    type?: string,
    limit: number = 10
  ): Promise<MemoryItem[]> {
    const response = await request.get<ApiResponse<MemoryItem[]>>(`${this.baseUrl}/memory/search`, {
      params: { query, type, limit }
    })
    return response.data
  }

  // 添加记忆
  async addMemory(memory: Omit<MemoryItem, 'id' | 'timestamp'>): Promise<MemoryItem> {
    const response = await request.post<ApiResponse<MemoryItem>>(`${this.baseUrl}/memory`, memory)
    return response.data
  }

  // 删除记忆
  async deleteMemory(memoryId: string): Promise<void> {
    await request.delete(`${this.baseUrl}/memory/${memoryId}`)
  }

  // 获取AI分析结果
  async getAnalysis(
    type: 'enrollment' | 'attendance' | 'performance' | 'financial',
    params: Record<string, any>
  ): Promise<{
    summary: string
    charts: any[]
    recommendations: string[]
    confidence: number
  }> {
    const response = await request.post<ApiResponse<any>>(`${this.baseUrl}/analysis/${type}`, params)
    return response.data
  }

  // 生成报告
  async generateReport(
    type: string,
    params: Record<string, any>,
    format: 'json' | 'pdf' | 'excel' = 'json'
  ): Promise<any> {
    const response = await request.post(`${this.baseUrl}/reports/${type}`, {
      ...params,
      format
    }, {
      responseType: format === 'json' ? 'json' : 'blob'
    })
    return response.data
  }

  // 获取AI状态
  async getStatus(): Promise<{
    status: 'online' | 'offline' | 'maintenance'
    model: string
    uptime: number
    responseTime: number
  }> {
    const response = await request.get<ApiResponse<any>>(`${this.baseUrl}/status`)
    return response.data
  }
}

export const aiService = new AIService()
```

## 📊 数据缓存策略

### 1. 多层缓存架构

```typescript
// utils/cache-manager.ts
interface CacheItem<T> {
  data: T
  timestamp: number
  expires: number
  key: string
}

interface CacheConfig {
  maxSize: number      // 最大缓存数量
  defaultTTL: number   // 默认过期时间(ms)
  cleanupInterval: number // 清理间隔(ms)
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>()
  private config: CacheConfig = {
    maxSize: 1000,
    defaultTTL: 300000, // 5分钟
    cleanupInterval: 60000 // 1分钟
  }
  private cleanupTimer?: number

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...this.config, ...config }
    this.startCleanup()
  }

  // 设置缓存
  set<T>(key: string, data: T, ttl?: number): void {
    // 检查缓存大小限制
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    const expires = Date.now() + (ttl || this.config.defaultTTL)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires,
      key
    })

    if (import.meta.env.DEV) {
      console.log(`💾 Cache SET: ${key} (TTL: ${ttl || this.config.defaultTTL}ms)`)
    }
  }

  // 获取缓存
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // 检查是否过期
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      if (import.meta.env.DEV) {
        console.log(`⏰ Cache EXPIRED: ${key}`)
      }
      return null
    }

    if (import.meta.env.DEV) {
      console.log(`✅ Cache HIT: ${key}`)
    }

    return item.data
  }

  // 删除缓存
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted && import.meta.env.DEV) {
      console.log(`🗑️ Cache DELETE: ${key}`)
    }
    return deleted
  }

  // 清除所有缓存
  clear(): void {
    this.cache.clear()
    if (import.meta.env.DEV) {
      console.log('🧹 Cache CLEAR: All items removed')
    }
  }

  // 清除匹配模式的缓存
  clearPattern(pattern: RegExp): number {
    let count = 0
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        count++
      }
    }
    
    if (import.meta.env.DEV && count > 0) {
      console.log(`🎯 Cache CLEAR PATTERN: ${count} items removed (${pattern})`)
    }
    
    return count
  }

  // 淘汰最旧的缓存
  private evictOldest(): void {
    let oldest: CacheItem<any> | null = null
    let oldestKey = ''

    for (const [key, item] of this.cache) {
      if (!oldest || item.timestamp < oldest.timestamp) {
        oldest = item
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      if (import.meta.env.DEV) {
        console.log(`📦 Cache EVICT: ${oldestKey} (size limit reached)`)
      }
    }
  }

  // 清理过期缓存
  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, item] of this.cache) {
      if (now > item.expires) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (import.meta.env.DEV && cleaned > 0) {
      console.log(`🧽 Cache CLEANUP: ${cleaned} expired items removed`)
    }
  }

  // 启动定时清理
  private startCleanup(): void {
    this.cleanupTimer = window.setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  // 停止定时清理
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }

  // 获取缓存统计信息
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    memoryUsage: string
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // TODO: 实现命中率统计
      memoryUsage: `${JSON.stringify(Array.from(this.cache.values())).length} bytes`
    }
  }
}

// 创建全局缓存管理器
export const cacheManager = new CacheManager({
  maxSize: 500,
  defaultTTL: 300000, // 5分钟
  cleanupInterval: 120000 // 2分钟清理一次
})

// 为API请求创建缓存键
export const createCacheKey = (url: string, params?: Record<string, any>): string => {
  const paramStr = params ? JSON.stringify(params) : ''
  return `api:${url}:${paramStr}`
}
```

### 2. 缓存集成到API客户端

```typescript
// utils/cached-request.ts
import request from './request'
import { cacheManager, createCacheKey } from './cache-manager'
import type { AxiosRequestConfig } from 'axios'

// 带缓存的请求函数
export const cachedRequest = {
  // GET请求（支持缓存）
  async get<T>(url: string, config?: AxiosRequestConfig & { 
    cache?: boolean; 
    cacheTime?: number 
  }): Promise<T> {
    const { cache = false, cacheTime, ...requestConfig } = config || {}
    
    // 如果启用缓存，先检查缓存
    if (cache) {
      const cacheKey = createCacheKey(url, requestConfig.params)
      const cachedData = cacheManager.get<T>(cacheKey)
      
      if (cachedData) {
        return cachedData
      }
      
      // 发起请求并缓存结果
      const response = await request.get<T>(url, requestConfig)
      cacheManager.set(cacheKey, response, cacheTime)
      return response
    }
    
    // 不使用缓存，直接请求
    return request.get<T>(url, requestConfig)
  },

  // POST请求（一般不缓存，但可以清除相关缓存）
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig & {
    clearCache?: string[] | RegExp[]
  }): Promise<T> {
    const { clearCache, ...requestConfig } = config || {}
    
    const response = await request.post<T>(url, data, requestConfig)
    
    // 清除相关缓存
    if (clearCache) {
      clearCache.forEach(pattern => {
        if (typeof pattern === 'string') {
          cacheManager.delete(pattern)
        } else if (pattern instanceof RegExp) {
          cacheManager.clearPattern(pattern)
        }
      })
    }
    
    return response
  },

  // PUT请求
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig & {
    clearCache?: string[] | RegExp[]
  }): Promise<T> {
    const { clearCache, ...requestConfig } = config || {}
    
    const response = await request.put<T>(url, data, requestConfig)
    
    // 清除相关缓存
    if (clearCache) {
      clearCache.forEach(pattern => {
        if (typeof pattern === 'string') {
          cacheManager.delete(pattern)
        } else if (pattern instanceof RegExp) {
          cacheManager.clearPattern(pattern)
        }
      })
    }
    
    return response
  },

  // DELETE请求
  async delete<T>(url: string, config?: AxiosRequestConfig & {
    clearCache?: string[] | RegExp[]
  }): Promise<T> {
    const { clearCache, ...requestConfig } = config || {}
    
    const response = await request.delete<T>(url, requestConfig)
    
    // 清除相关缓存
    if (clearCache) {
      clearCache.forEach(pattern => {
        if (typeof pattern === 'string') {
          cacheManager.delete(pattern)
        } else if (pattern instanceof RegExp) {
          cacheManager.clearPattern(pattern)
        }
      })
    }
    
    return response
  }
}
```

## 📱 移动端网络优化

### 1. 网络状态监听

```typescript
// composables/useNetworkStatus.ts
import { ref, onMounted, onUnmounted } from 'vue'

export interface NetworkInfo {
  isOnline: boolean
  connectionType: string
  effectiveType?: string
  downlink?: number
  rtt?: number
}

export const useNetworkStatus = () => {
  const networkInfo = ref<NetworkInfo>({
    isOnline: navigator.onLine,
    connectionType: 'unknown'
  })

  const updateNetworkInfo = () => {
    networkInfo.value.isOnline = navigator.onLine
    
    // 获取网络连接信息（如果支持）
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      networkInfo.value.connectionType = connection.effectiveType || connection.type || 'unknown'
      networkInfo.value.effectiveType = connection.effectiveType
      networkInfo.value.downlink = connection.downlink
      networkInfo.value.rtt = connection.rtt
    }
  }

  const handleOnline = () => {
    updateNetworkInfo()
    console.log('🌐 Network: Online')
  }

  const handleOffline = () => {
    updateNetworkInfo()
    console.log('📱 Network: Offline')
  }

  onMounted(() => {
    updateNetworkInfo()
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // 监听网络变化（如果支持）
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', updateNetworkInfo)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.removeEventListener('change', updateNetworkInfo)
    }
  })

  return {
    networkInfo: readonly(networkInfo),
    isOnline: computed(() => networkInfo.value.isOnline),
    connectionType: computed(() => networkInfo.value.connectionType),
    isSlowNetwork: computed(() => {
      return networkInfo.value.effectiveType === 'slow-2g' || 
             networkInfo.value.effectiveType === '2g'
    })
  }
}
```

### 2. 请求重试机制

```typescript
// utils/retry-request.ts
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

interface RetryConfig {
  retries: number           // 重试次数
  retryDelay: number       // 重试延迟
  retryCondition?: (error: any) => boolean // 重试条件
}

// 指数退避延迟
const exponentialDelay = (attempt: number, baseDelay: number = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000) // 最大10秒
}

// 添加随机抖动避免惊群效应
const addJitter = (delay: number): number => {
  return delay + Math.random() * 1000
}

// 默认重试条件
const defaultRetryCondition = (error: any): boolean => {
  return (
    !error.response || // 网络错误
    error.response.status >= 500 || // 服务器错误
    error.response.status === 408 || // 请求超时
    error.code === 'ECONNABORTED' || // 连接中止
    error.code === 'NETWORK_ERROR'   // 网络错误
  )
}

// 重试请求装饰器
export const withRetry = <T>(
  requestFn: (config: AxiosRequestConfig) => Promise<AxiosResponse<T>>,
  retryConfig: Partial<RetryConfig> = {}
) => {
  const config: RetryConfig = {
    retries: 3,
    retryDelay: 1000,
    retryCondition: defaultRetryCondition,
    ...retryConfig
  }

  return async (requestConfig: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    let lastError: any

    for (let attempt = 0; attempt <= config.retries; attempt++) {
      try {
        const response = await requestFn(requestConfig)
        
        // 成功，返回响应
        if (attempt > 0) {
          console.log(`✅ Request succeeded after ${attempt} retries`)
        }
        
        return response
      } catch (error) {
        lastError = error
        
        // 如果是最后一次尝试，或不满足重试条件，直接抛出错误
        if (attempt === config.retries || !config.retryCondition!(error)) {
          throw error
        }
        
        // 计算延迟时间
        const delay = addJitter(exponentialDelay(attempt, config.retryDelay))
        
        console.log(
          `🔄 Request failed (attempt ${attempt + 1}/${config.retries + 1}), ` +
          `retrying in ${delay}ms...`
        )
        
        // 等待重试
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    // 所有重试都失败了
    throw lastError
  }
}

// 使用示例：为axios请求添加重试机制
export const retryableRequest = withRetry(
  (config) => request(config),
  {
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error) => {
      // 自定义重试条件
      if (!navigator.onLine) {
        return false // 离线状态不重试
      }
      return defaultRetryCondition(error)
    }
  }
)
```

### 3. 数据压缩和优化

```typescript
// utils/data-optimization.ts
// 响应数据压缩
export const compressResponseData = <T>(data: T): T => {
  if (Array.isArray(data)) {
    return data.map(item => compressResponseData(item)) as unknown as T
  }
  
  if (data && typeof data === 'object') {
    const compressed = {} as any
    
    for (const [key, value] of Object.entries(data)) {
      // 跳过空值和未定义的值
      if (value === null || value === undefined || value === '') {
        continue
      }
      
      // 递归处理嵌套对象
      if (typeof value === 'object') {
        const compressedValue = compressResponseData(value)
        if (Array.isArray(compressedValue) ? compressedValue.length > 0 : Object.keys(compressedValue).length > 0) {
          compressed[key] = compressedValue
        }
      } else {
        compressed[key] = value
      }
    }
    
    return compressed
  }
  
  return data
}

// 图片优化
export const optimizeImageUrl = (
  url: string, 
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'jpeg' | 'png'
  } = {}
): string => {
  if (!url) return ''
  
  const { width, height, quality = 80, format = 'webp' } = options
  
  // 如果是外部URL，直接返回
  if (url.startsWith('http')) {
    return url
  }
  
  // 构建优化参数
  const params = new URLSearchParams()
  if (width) params.append('w', width.toString())
  if (height) params.append('h', height.toString())
  if (quality) params.append('q', quality.toString())
  if (format) params.append('f', format)
  
  const queryString = params.toString()
  const separator = url.includes('?') ? '&' : '?'
  
  return queryString ? `${url}${separator}${queryString}` : url
}

// 分页数据优化
export const optimizePaginationData = <T>(
  data: T[],
  page: number,
  pageSize: number
): {
  list: T[]
  hasMore: boolean
  nextCursor?: string
} => {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  
  return {
    list: data.slice(startIndex, endIndex),
    hasMore: data.length > endIndex,
    nextCursor: data.length > endIndex ? `${page + 1}` : undefined
  }
}
```

## 🧪 API测试和调试

### 1. API Mock服务

```typescript
// mock/api-mock.ts
import type { MockMethod } from 'vite-plugin-mock'
import type { User, Student, Teacher } from '@/types/api'

// 生成模拟数据
const generateUsers = (count: number): User[] => {
  const users: User[] = []
  const roles = ['admin', 'principal', 'teacher', 'parent'] as const
  
  for (let i = 1; i <= count; i++) {
    users.push({
      id: `user_${i}`,
      username: `user${i}`,
      email: `user${i}@example.com`,
      displayName: `用户${i}`,
      role: roles[Math.floor(Math.random() * roles.length)],
      department: ['开发部', '设计部', '运营部'][Math.floor(Math.random() * 3)],
      isActive: Math.random() > 0.2,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    })
  }
  
  return users
}

// Mock数据
const mockUsers = generateUsers(50)

export default [
  // 用户相关API
  {
    url: '/api/users',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 20, keyword } = query
      
      let filteredUsers = mockUsers
      
      // 关键词搜索
      if (keyword) {
        filteredUsers = mockUsers.filter(user =>
          user.displayName.includes(keyword) ||
          user.username.includes(keyword) ||
          user.email.includes(keyword)
        )
      }
      
      // 分页
      const total = filteredUsers.length
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const list = filteredUsers.slice(start, end)
      
      return {
        code: 200,
        message: '获取成功',
        data: {
          list,
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(total / pageSize),
          hasNext: end < total,
          hasPrev: page > 1
        },
        success: true
      }
    }
  },
  
  {
    url: '/api/users/:id',
    method: 'get',
    response: ({ params }: any) => {
      const user = mockUsers.find(u => u.id === params.id)
      
      if (!user) {
        return {
          code: 404,
          message: '用户不存在',
          data: null,
          success: false
        }
      }
      
      return {
        code: 200,
        message: '获取成功',
        data: user,
        success: true
      }
    }
  },

  // AI相关API
  {
    url: '/api/ai/chat',
    method: 'post',
    timeout: 2000, // 模拟网络延迟
    response: ({ body }: any) => {
      const { message } = body
      
      // 模拟AI响应
      const responses = [
        {
          type: 'text',
          content: `您问的是："${message}"，这是一个很好的问题！根据我的分析，建议您...`
        },
        {
          type: 'table',
          content: {
            columns: [
              { prop: 'name', label: '姓名' },
              { prop: 'score', label: '分数' }
            ],
            data: [
              { name: '张三', score: 95 },
              { name: '李四', score: 88 }
            ]
          }
        },
        {
          type: 'chart',
          content: {
            type: 'bar',
            data: {
              labels: ['1月', '2月', '3月'],
              datasets: [{
                label: '数据',
                data: [12, 19, 3]
              }]
            }
          }
        }
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      return {
        code: 200,
        message: '响应成功',
        data: {
          id: `msg_${Date.now()}`,
          ...randomResponse,
          timestamp: new Date().toISOString()
        },
        success: true
      }
    }
  }
] as MockMethod[]
```

### 2. API调试工具

```typescript
// utils/api-debug.ts
interface DebugConfig {
  enabled: boolean
  logRequests: boolean
  logResponses: boolean
  logErrors: boolean
  slowRequestThreshold: number // ms
}

class APIDebugger {
  private config: DebugConfig = {
    enabled: import.meta.env.DEV,
    logRequests: true,
    logResponses: true,
    logErrors: true,
    slowRequestThreshold: 1000
  }

  private requestTimes = new Map<string, number>()

  constructor(config?: Partial<DebugConfig>) {
    this.config = { ...this.config, ...config }
  }

  // 记录请求开始
  logRequestStart(requestId: string, config: any): void {
    if (!this.config.enabled || !this.config.logRequests) return

    this.requestTimes.set(requestId, Date.now())

    console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    console.log('📋 Config:', {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
      headers: config.headers
    })
    console.log('⏰ Time:', new Date().toISOString())
    console.groupEnd()
  }

  // 记录请求成功
  logRequestSuccess(requestId: string, response: any): void {
    if (!this.config.enabled || !this.config.logResponses) return

    const startTime = this.requestTimes.get(requestId)
    const duration = startTime ? Date.now() - startTime : 0
    
    const isSlowRequest = duration > this.config.slowRequestThreshold

    console.group(
      `✅ API Response: ${response.config?.method?.toUpperCase()} ${response.config?.url} ` +
      `(${duration}ms)${isSlowRequest ? ' ⚠️ SLOW' : ''}`
    )
    
    if (isSlowRequest) {
      console.warn(`🐌 Slow request detected: ${duration}ms (threshold: ${this.config.slowRequestThreshold}ms)`)
    }

    console.log('📊 Status:', response.status)
    console.log('📦 Data:', response.data)
    console.log('📏 Size:', JSON.stringify(response.data).length, 'bytes')
    console.log('⏱️ Duration:', duration, 'ms')
    console.groupEnd()

    this.requestTimes.delete(requestId)
  }

  // 记录请求错误
  logRequestError(requestId: string, error: any): void {
    if (!this.config.enabled || !this.config.logErrors) return

    const startTime = this.requestTimes.get(requestId)
    const duration = startTime ? Date.now() - startTime : 0

    console.group(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`)
    console.error('🔥 Error:', error)
    
    if (error.response) {
      console.log('📊 Status:', error.response.status)
      console.log('📦 Data:', error.response.data)
    } else if (error.request) {
      console.log('📡 Request made but no response:', error.request)
    } else {
      console.log('⚙️ Request setup error:', error.message)
    }
    
    console.log('⏱️ Duration:', duration, 'ms')
    console.groupEnd()

    this.requestTimes.delete(requestId)
  }

  // 生成API调试报告
  generateReport(): {
    totalRequests: number
    slowRequests: number
    errorCount: number
    averageResponseTime: number
  } {
    // TODO: 实现统计数据收集和报告生成
    return {
      totalRequests: 0,
      slowRequests: 0,
      errorCount: 0,
      averageResponseTime: 0
    }
  }
}

export const apiDebugger = new APIDebugger()
```

## 📋 API最佳实践

### 1. 错误处理策略

```typescript
// utils/error-handler.ts
import { ElMessage, ElNotification } from 'element-plus'

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION', 
  PERMISSION = 'PERMISSION',
  BUSINESS = 'BUSINESS',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType
  code: string
  message: string
  details?: any
  timestamp: Date
  requestId?: string
}

class ErrorHandler {
  // 处理API错误
  handleApiError(error: any): AppError {
    const appError: AppError = {
      type: ErrorType.UNKNOWN,
      code: 'UNKNOWN_ERROR',
      message: '未知错误',
      timestamp: new Date()
    }

    if (error.response) {
      // HTTP状态码错误
      const { status, data } = error.response
      appError.code = `HTTP_${status}`
      appError.requestId = error.response.headers?.['x-request-id']

      switch (status) {
        case 400:
          appError.type = ErrorType.VALIDATION
          appError.message = data?.message || '请求参数错误'
          break
        case 401:
          appError.type = ErrorType.PERMISSION
          appError.message = '未授权访问'
          break
        case 403:
          appError.type = ErrorType.PERMISSION
          appError.message = '权限不足'
          break
        case 422:
          appError.type = ErrorType.VALIDATION
          appError.message = data?.message || '数据验证失败'
          appError.details = data?.errors
          break
        case 500:
          appError.type = ErrorType.BUSINESS
          appError.message = '服务器内部错误'
          break
        default:
          appError.message = data?.message || `HTTP ${status} 错误`
      }
    } else if (error.request) {
      // 网络错误
      appError.type = ErrorType.NETWORK
      appError.code = 'NETWORK_ERROR'
      appError.message = '网络连接失败'
    } else {
      // 其他错误
      appError.message = error.message || '未知错误'
    }

    return appError
  }

  // 显示错误消息
  showError(error: AppError, options: {
    showNotification?: boolean
    autoClose?: boolean
    duration?: number
  } = {}): void {
    const { showNotification = false, autoClose = true, duration = 3000 } = options

    if (showNotification) {
      ElNotification.error({
        title: '错误',
        message: error.message,
        duration: autoClose ? duration : 0
      })
    } else {
      ElMessage.error({
        message: error.message,
        duration: autoClose ? duration : 0
      })
    }
  }

  // 记录错误日志
  logError(error: AppError): void {
    console.error('🔥 Application Error:', {
      type: error.type,
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp,
      requestId: error.requestId,
      stack: new Error().stack
    })

    // 在生产环境中可以发送到错误监控服务
    if (import.meta.env.PROD) {
      // TODO: 发送到错误监控服务（如Sentry）
      this.reportError(error)
    }
  }

  // 上报错误到监控服务
  private reportError(error: AppError): void {
    // TODO: 集成错误监控服务
    console.log('📡 Reporting error to monitoring service:', error)
  }
}

export const errorHandler = new ErrorHandler()

// 全局错误处理组合式函数
export const useErrorHandler = () => {
  const handleError = (error: any, showUI = true) => {
    const appError = errorHandler.handleApiError(error)
    
    if (showUI) {
      errorHandler.showError(appError)
    }
    
    errorHandler.logError(appError)
    
    return appError
  }

  return {
    handleError
  }
}
```

### 2. 性能监控

```typescript
// utils/performance-monitor.ts
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private apiMetrics = {
    totalRequests: 0,
    failedRequests: 0,
    totalResponseTime: 0,
    slowRequestCount: 0
  }

  // 记录API性能指标
  recordApiMetric(
    url: string,
    method: string,
    duration: number,
    success: boolean
  ): void {
    this.apiMetrics.totalRequests++
    this.apiMetrics.totalResponseTime += duration

    if (!success) {
      this.apiMetrics.failedRequests++
    }

    if (duration > 1000) { // 超过1秒算慢请求
      this.apiMetrics.slowRequestCount++
    }

    this.metrics.push({
      name: 'api_request_duration',
      value: duration,
      timestamp: Date.now(),
      tags: {
        url,
        method: method.toUpperCase(),
        status: success ? 'success' : 'error'
      }
    })

    // 保持最近1000条记录
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  // 获取API性能统计
  getApiStats(): {
    totalRequests: number
    successRate: number
    averageResponseTime: number
    slowRequestRate: number
  } {
    const { totalRequests, failedRequests, totalResponseTime, slowRequestCount } = this.apiMetrics

    return {
      totalRequests,
      successRate: totalRequests > 0 ? ((totalRequests - failedRequests) / totalRequests) * 100 : 0,
      averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
      slowRequestRate: totalRequests > 0 ? (slowRequestCount / totalRequests) * 100 : 0
    }
  }

  // 获取最慢的API
  getSlowestApis(limit = 10): Array<{
    url: string
    method: string
    duration: number
    timestamp: number
  }> {
    return this.metrics
      .filter(metric => metric.name === 'api_request_duration')
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
      .map(metric => ({
        url: metric.tags?.url || '',
        method: metric.tags?.method || '',
        duration: metric.value,
        timestamp: metric.timestamp
      }))
  }

  // 重置统计数据
  reset(): void {
    this.metrics = []
    this.apiMetrics = {
      totalRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      slowRequestCount: 0
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()
```

---

## 📝 总结

本文档详细介绍了幼儿园管理系统的API集成方案：

### ✅ 核心特性
1. **统一的HTTP客户端** - 基于Axios的请求封装和拦截器
2. **完善的错误处理** - 网络错误、业务错误的统一处理
3. **智能缓存策略** - 多层缓存，提升用户体验
4. **类型安全** - 完整的TypeScript类型定义
5. **移动端优化** - 网络状态监听、请求重试、数据压缩

### 🎯 最佳实践
1. **API服务分层** - BaseService基类，业务服务继承
2. **缓存管理** - 合理的缓存策略和失效机制
3. **性能监控** - 请求性能统计和慢查询检测
4. **调试支持** - 开发环境完整的调试信息
5. **错误监控** - 错误收集和上报机制

**下一步**: 查看 [最佳实践](./06-最佳实践.md) 了解开发和部署的最佳实践。

*文档版本: v1.0.0*  
*更新时间: 2025-08-10*  
*基于实际API架构整理*