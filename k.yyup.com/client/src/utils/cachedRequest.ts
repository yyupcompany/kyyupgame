/**
 * 带缓存功能的请求工具
 * 集成缓存管理器，优化API调用性能
 */

import request from './request'
import type { ApiResponse } from './request'
import type { AxiosRequestConfig } from 'axios'
import { cacheManager, CACHE_CONFIGS, type CacheConfig } from './cacheManager'

// 缓存请求配置
interface CachedRequestConfig extends AxiosRequestConfig {
  cache?: CacheConfig | boolean | 'short' | 'medium' | 'long' | 'user' | 'dictionary' | 'list'
  cacheKey?: string
  namespace?: string
  skipCache?: boolean
  forceRefresh?: boolean
}

/**
 * 生成缓存键
 */
function generateCacheKey(
  method: string = 'GET',
  url: string,
  params?: any,
  data?: any,
  customKey?: string
): string {
  if (customKey) {
    return customKey
  }
  
  const paramStr = params ? JSON.stringify(params) : ''
  const dataStr = data ? JSON.stringify(data) : ''
  return `${method.toUpperCase()}:${url}:${paramStr}:${dataStr}`
}

/**
 * 获取缓存配置
 */
function getCacheConfig(cache: CachedRequestConfig['cache']): CacheConfig | null {
  if (cache === false || cache === undefined) {
    return null
  }
  
  if (cache === true) {
    return CACHE_CONFIGS.MEDIUM
  }
  
  if (typeof cache === 'string') {
    switch (cache) {
      case 'short':
        return CACHE_CONFIGS.SHORT
      case 'medium':
        return CACHE_CONFIGS.MEDIUM
      case 'long':
        return CACHE_CONFIGS.LONG
      case 'user':
        return CACHE_CONFIGS.USER_DATA
      case 'dictionary':
        return CACHE_CONFIGS.DICTIONARY
      case 'list':
        return CACHE_CONFIGS.LIST_DATA
      default:
        return CACHE_CONFIGS.MEDIUM
    }
  }
  
  return cache as CacheConfig
}

/**
 * 带缓存的请求方法
 */
async function cachedRequest<T = any>(config: CachedRequestConfig): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    url = '',
    params,
    data,
    cache,
    cacheKey,
    namespace = 'api',
    skipCache = false,
    forceRefresh = false,
    ...axiosConfig
  } = config

  // 如果跳过缓存或不是GET请求，直接请求
  if (skipCache || method.toUpperCase() !== 'GET') {
    return request.request<T>({ method, url, params, data, ...axiosConfig } as any)
  }

  const cacheConfig = getCacheConfig(cache)
  if (!cacheConfig) {
    return request.request<T>({ method, url, params, data, ...axiosConfig } as any)
  }

  const key = generateCacheKey(method, url, params, data, cacheKey)

  // 如果不是强制刷新，尝试从缓存获取
  if (!forceRefresh) {
    const cached = cacheManager.get<ApiResponse<T>>(namespace, key)
    if (cached) {
      console.debug(`缓存命中: ${namespace}:${key}`)
      return cached
    }
  }

  // 执行请求
  try {
    console.debug(`请求API: ${method} ${url}`)
    const response = await request.request<T>({ method, url, params, data, ...axiosConfig } as any)
    
    // 只缓存成功的响应
    if (response.success) {
      cacheManager.set(namespace, key, response, cacheConfig)
      console.debug(`缓存保存: ${namespace}:${key}`)
    }
    
    return response
  } catch (error) {
    console.error(`请求失败: ${method} ${url}`, error)
    throw error
  }
}

/**
 * 带缓存的GET请求
 */
export function cachedGet<T = any>(
  url: string,
  params?: any,
  config: Omit<CachedRequestConfig, 'method' | 'url' | 'params'> = {}
): Promise<ApiResponse<T>> {
  return cachedRequest<T>({
    ...config,
    method: 'GET',
    url,
    params,
    cache: config.cache !== undefined ? config.cache : 'medium'
  })
}

/**
 * 带缓存的POST请求（通常不缓存，但支持配置）
 */
export function cachedPost<T = any>(
  url: string,
  data?: any,
  config: Omit<CachedRequestConfig, 'method' | 'url' | 'data'> = {}
): Promise<ApiResponse<T>> {
  return cachedRequest<T>({
    ...config,
    method: 'POST',
    url,
    data,
    cache: config.cache !== undefined ? config.cache : false
  })
}

/**
 * 带缓存的PUT请求（通常不缓存，但支持配置）
 */
export function cachedPut<T = any>(
  url: string,
  data?: any,
  config: Omit<CachedRequestConfig, 'method' | 'url' | 'data'> = {}
): Promise<ApiResponse<T>> {
  return cachedRequest<T>({
    ...config,
    method: 'PUT',
    url,
    data,
    cache: config.cache !== undefined ? config.cache : false
  })
}

/**
 * 带缓存的DELETE请求（通常不缓存）
 */
export function cachedDelete<T = any>(
  url: string,
  config: Omit<CachedRequestConfig, 'method' | 'url'> = {}
): Promise<ApiResponse<T>> {
  return cachedRequest<T>({
    ...config,
    method: 'DELETE',
    url,
    cache: false
  })
}

/**
 * 失效相关缓存
 */
export function invalidateCache(
  namespace: string,
  pattern?: string | RegExp
): void {
  if (!pattern) {
    cacheManager.clearNamespace(namespace)
    return
  }

  const keys = cacheManager.getKeys(namespace)
  const toDelete = keys.filter(key => {
    if (typeof pattern === 'string') {
      return key.includes(pattern)
    } else {
      return pattern.test(key)
    }
  })

  toDelete.forEach(key => {
    const [ns, k] = key.split(':', 2)
    cacheManager.delete(ns, k.substring(ns.length + 1))
  })
}

/**
 * 预加载数据到缓存
 */
export async function preloadData<T = any>(
  requests: Array<{
    url: string
    params?: any
    namespace?: string
    cache?: CachedRequestConfig['cache']
    cacheKey?: string
  }>
): Promise<void> {
  const promises = requests.map(({ url, params, namespace = 'api', cache = 'medium', cacheKey }) => {
    const key = generateCacheKey('GET', url, params, undefined, cacheKey)
    
    // 如果缓存中已有数据，跳过
    if (cacheManager.has(namespace, key)) {
      return Promise.resolve()
    }
    
    return cachedGet<T>(url, params, { namespace, cache, cacheKey }).catch(error => {
      console.warn(`预加载失败: ${url}`, error)
    })
  })
  
  await Promise.allSettled(promises)
}

/**
 * 批量失效缓存
 */
export function batchInvalidateCache(operations: Array<{
  namespace: string
  pattern?: string | RegExp
}>): void {
  operations.forEach(({ namespace, pattern }) => {
    invalidateCache(namespace, pattern)
  })
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats() {
  return cacheManager.getStats()
}

/**
 * 清空所有缓存
 */
export function clearAllCache(): void {
  cacheManager.clearAll()
}

// API缓存命名空间常量
export const CACHE_NAMESPACES = {
  USER: 'user',
  TEACHER: 'teacher',
  STUDENT: 'student',
  CLASS: 'class',
  ENROLLMENT: 'enrollment',
  APPLICATION: 'application',
  SYSTEM: 'system',
  DICTIONARY: 'dictionary'
} as const

// 常用的缓存化API方法
export class CachedAPI {
  /**
   * 获取用户列表（带缓存）
   */
  static getUserList(params?: any) {
    return cachedGet('/api/users', params, {
      namespace: CACHE_NAMESPACES.USER,
      cache: 'list'
    })
  }

  /**
   * 获取教师列表（带缓存）
   */
  static getTeacherList(params?: any) {
    return cachedGet('/teachers', params, {
      namespace: CACHE_NAMESPACES.TEACHER,
      cache: 'list'
    })
  }

  /**
   * 获取学生列表（带缓存）
   */
  static getStudentList(params?: any) {
    return cachedGet('/students', params, {
      namespace: CACHE_NAMESPACES.STUDENT,
      cache: 'list'
    })
  }

  /**
   * 获取班级列表（带缓存）
   */
  static getClassList(params?: any) {
    return cachedGet('/api/classes', params, {
      namespace: CACHE_NAMESPACES.CLASS,
      cache: 'list'
    })
  }

  /**
   * 获取用户详情（带缓存）
   */
  static getUserDetail(id: string | number) {
    return cachedGet(`/api/users/${id}`, undefined, {
      namespace: CACHE_NAMESPACES.USER,
      cache: 'user',
      cacheKey: `detail:${id}`
    })
  }

  /**
   * 获取教师详情（带缓存）
   */
  static getTeacherDetail(id: string | number) {
    // 更严格的参数验证
    if (!id || id === 'undefined' || id === undefined || id === null || String(id).trim() === '') {
      console.error('❌ getTeacherDetail: 教师ID无效', { id, type: typeof id })
      throw new Error('教师ID不能为空或无效')
    }
    
    // 确保ID是有效的字符串或数字
    const validId = String(id).trim()
    if (validId === 'undefined' || validId === 'null' || validId === '') {
      console.error('❌ getTeacherDetail: 教师ID转换后无效', { id, validId })
      throw new Error('教师ID不能为空或无效')
    }
    
    console.log('✅ getTeacherDetail: 调用API', { id: validId })
    return cachedGet(`/teachers/${validId}`, undefined, {
      namespace: CACHE_NAMESPACES.TEACHER,
      cache: 'user',
      cacheKey: `detail:${validId}`
    })
  }

  /**
   * 获取字典数据（长期缓存）
   */
  static getDictionaryData(type: string) {
    return cachedGet('/system/dictionary', { type }, {
      namespace: CACHE_NAMESPACES.DICTIONARY,
      cache: 'dictionary',
      cacheKey: `dict:${type}`
    })
  }

  /**
   * 获取系统配置（长期缓存）
   */
  static getSystemConfig() {
    return cachedGet('/system/config', undefined, {
      namespace: CACHE_NAMESPACES.SYSTEM,
      cache: 'long'
    })
  }

  /**
   * 失效用户相关缓存
   */
  static invalidateUserCache(userId?: string | number) {
    if (userId) {
      invalidateCache(CACHE_NAMESPACES.USER, `detail:${userId}`)
    } else {
      invalidateCache(CACHE_NAMESPACES.USER)
    }
  }

  /**
   * 失效教师相关缓存
   */
  static invalidateTeacherCache(teacherId?: string | number) {
    if (teacherId) {
      invalidateCache(CACHE_NAMESPACES.TEACHER, `detail:${teacherId}`)
    } else {
      invalidateCache(CACHE_NAMESPACES.TEACHER)
    }
  }

  /**
   * 失效学生相关缓存
   */
  static invalidateStudentCache(studentId?: string | number) {
    if (studentId) {
      invalidateCache(CACHE_NAMESPACES.STUDENT, `detail:${studentId}`)
    } else {
      invalidateCache(CACHE_NAMESPACES.STUDENT)
    }
  }
}

// 默认导出
export default {
  cachedGet,
  cachedPost,
  cachedPut,
  cachedDelete,
  invalidateCache,
  preloadData,
  batchInvalidateCache,
  getCacheStats,
  clearAllCache,
  CachedAPI,
  CACHE_NAMESPACES
}