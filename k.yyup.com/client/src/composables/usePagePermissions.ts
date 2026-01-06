/**
 * 页面权限管理 Composable - Level 3 & 4
 * Page Permissions Management Composable - Level 3 & 4
 * 
 * 功能：
 * 1. Level 3: 获取页面操作权限（按钮权限）
 * 2. Level 4: 单个操作权限验证
 * 3. 权限缓存管理
 * 4. 批量权限验证
 */

import { ref, computed } from 'vue'
import { get, post } from '../utils/request'
import { usePermissionsStore } from '../stores/permissions'

interface PagePermission {
  id: number
  name: string
  code: string
  type: string
  parent_id: number | null
  path: string
  component: string | null
  permission: string | null
  icon: string | null
  sort: number
  status: number
}

interface PagePermissionsResponse {
  permissions: PagePermission[]
  grouped: {
    actions: PagePermission[]
    navigation: PagePermission[]
    operations: PagePermission[]
  }
  summary: {
    total: number
    actions: number
    navigation: number
    operations: number
  }
}



export function usePagePermissions(pageId?: string, pagePath?: string) {
  const permissionsStore = usePermissionsStore()
  
  // 状态管理
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagePermissions = ref<PagePermissionsResponse | null>(null)
  
  // 缓存管理
  const permissionCache = ref<Map<string, { result: boolean; timestamp: number }>>(new Map())
  const pagePermissionCache = ref<Map<string, { data: PagePermissionsResponse; timestamp: number }>>(new Map())
  const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

  // 计算属性
  const hasPagePermissions = computed(() => 
    pagePermissions.value && pagePermissions.value.permissions.length > 0
  )
  
  const actionPermissions = computed(() => 
    pagePermissions.value?.grouped.actions || []
  )
  
  const navigationPermissions = computed(() => 
    pagePermissions.value?.grouped.navigation || []
  )
  
  const operationPermissions = computed(() => 
    pagePermissions.value?.grouped.operations || []
  )

  /**
   * Level 3: 加载页面操作权限
   */
  const loadPagePermissions = async (forceRefresh = false) => {
    if (!pageId && !pagePath) {
      console.warn('⚠️ Level 3: 未提供页面ID或路径，无法加载页面权限')
      return
    }

    const cacheKey = `page:${pageId || pagePath}`
    
    // 检查缓存
    if (!forceRefresh) {
      const cached = pagePermissionCache.value.get(cacheKey)
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log(`✅ Level 3: 使用缓存的页面权限: ${cacheKey}`)
        pagePermissions.value = cached.data
        return cached.data
      }
    }

    try {
      loading.value = true
      error.value = null

      console.log(`🔍 Level 3: 加载页面权限 - ${pageId ? `ID: ${pageId}` : `路径: ${pagePath}`}`)
      const startTime = Date.now()

      const params = new URLSearchParams()
      if (pageId) params.append('pageId', pageId)
      if (pagePath) params.append('pagePath', pagePath)

      const response = await get(`/permissions/page-actions?${params.toString()}`)
      
      if (response.success) {
        pagePermissions.value = response.data
        
        // 缓存结果
        pagePermissionCache.value.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        })

        const responseTime = Date.now() - startTime
        console.log(`✅ Level 3: 页面权限加载成功 (${responseTime}ms)`)
        console.log(`📊 权限统计: 总计${response.data.summary.total}个 (操作${response.data.summary.actions}个, 导航${response.data.summary.navigation}个, 其他${response.data.summary.operations}个)`)
        
        return response.data
      } else {
        throw new Error(response.message || '获取页面权限失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取页面权限失败'
      console.error(`❌ Level 3: 页面权限加载失败:`, err)
      pagePermissions.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Level 4: 检查单个操作权限
   */
  const hasPermission = (permission: string): boolean => {
    if (!pagePermissions.value) {
      console.warn(`⚠️ Level 4: 页面权限未加载，无法验证权限: ${permission}`)
      return false
    }

    const hasPermissionInPage = pagePermissions.value.permissions.some(p => 
      p.code === permission || p.permission === permission
    )

    console.log(`🔍 Level 4: 权限验证 ${permission} -> ${hasPermissionInPage}`)
    return hasPermissionInPage
  }

  /**
   * Level 4: 异步权限验证（实时API验证）
   */
  const checkPermission = async (permission: string): Promise<boolean> => {
    // 检查缓存
    const cached = permissionCache.value.get(permission)
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log(`✅ Level 4: 使用缓存的权限验证结果: ${permission} -> ${cached.result}`)
      return cached.result
    }

    try {
      console.log(`🔍 Level 4: 实时权限验证: ${permission}`)
      const result = await permissionsStore.checkPagePermission(pagePath || '', permission)
      
      // 缓存结果
      permissionCache.value.set(permission, {
        result,
        timestamp: Date.now()
      })

      return result
    } catch (err) {
      console.error(`❌ Level 4: 权限验证失败: ${permission}`, err)
      return false
    }
  }

  /**
   * Level 3: 批量权限验证
   */
  const batchCheckPermissions = async (permissions: string[]): Promise<{ [key: string]: boolean }> => {
    if (!permissions || permissions.length === 0) {
      return {}
    }

    try {
      console.log(`🔍 Level 3: 批量权限验证 - ${permissions.length} 个权限`)
      const startTime = Date.now()

      const response = await post('/permissions/batch-check', {
        permissions
      })

      if (response.success) {
        const results = response.data.results
        const responseTime = Date.now() - startTime
        
        // 缓存结果
        Object.entries(results).forEach(([permission, hasPermission]) => {
          permissionCache.value.set(permission, {
            result: hasPermission as boolean,
            timestamp: Date.now()
          })
        })

        console.log(`✅ Level 3: 批量权限验证完成 (${responseTime}ms)`)
        console.log(`📊 验证结果: ${response.data.summary.granted}/${response.data.summary.total} 个权限通过`)
        
        return results
      } else {
        throw new Error(response.message || '批量权限验证失败')
      }
    } catch (err) {
      console.error(`❌ Level 3: 批量权限验证失败:`, err)
      return {}
    }
  }

  /**
   * 权限指令帮助函数
   */
  const getPermissionStyle = (permission: string) => {
    const hasPermissionResult = hasPermission(permission)
    return {
      display: hasPermissionResult ? 'block' : 'none',
      opacity: hasPermissionResult ? 1 : 0.3,
      pointerEvents: hasPermissionResult ? 'auto' : 'none'
    }
  }

  /**
   * 清除缓存
   */
  const clearCache = () => {
    permissionCache.value.clear()
    pagePermissionCache.value.clear()
    console.log('🗑️ Level 3&4: 页面权限缓存已清除')
  }

  /**
   * 预加载权限（性能优化）
   */
  const preloadPermissions = async (permissionCodes: string[]) => {
    const uncachedPermissions = permissionCodes.filter(code => {
      const cached = permissionCache.value.get(code)
      return !cached || (Date.now() - cached.timestamp) >= CACHE_DURATION
    })

    if (uncachedPermissions.length > 0) {
      console.log(`🔥 预加载权限: ${uncachedPermissions.length} 个`)
      await batchCheckPermissions(uncachedPermissions)
    }
  }

  return {
    // 状态
    loading,
    error,
    pagePermissions,
    
    // 计算属性
    hasPagePermissions,
    actionPermissions,
    navigationPermissions,
    operationPermissions,
    
    // Level 3: 页面权限方法
    loadPagePermissions,
    batchCheckPermissions,
    
    // Level 4: 操作权限方法
    hasPermission,
    checkPermission,
    
    // 工具方法
    getPermissionStyle,
    clearCache,
    preloadPermissions
  }
}