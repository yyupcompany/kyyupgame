/**
 * 统一的API数据获取Composable
 * 用于替换组件中的硬编码数据，实现真实API调用
 */

import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { Ref, UnwrapRef } from 'vue'
import api from '@/utils/request'

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  total?: number
  page?: number
  pageSize?: number
}

// 分页响应接口
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 请求配置接口
export interface UseApiDataConfig<T = any> {
  immediate?: boolean // 是否立即发起请求
  refreshOnWindowFocus?: boolean // 窗口聚焦时是否刷新
  pollingInterval?: number // 轮询间隔（毫秒）
  defaultData?: T // 默认数据
  onSuccess?: (data: T) => void // 成功回调
  onError?: (error: Error) => void // 错误回调
  transform?: (data: any) => T // 数据转换函数
  retryCount?: number // 重试次数
  retryDelay?: number // 重试延迟
}

// 加载状态
export interface LoadingState {
  isLoading: boolean
  isRefreshing: boolean
  isError: boolean
  isSuccess: boolean
}

// 分页状态
export interface PaginationState {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * 基础API数据获取Hook
 */
export function useRealApiData<T = any>(
  url: string,
  config: UseApiDataConfig<T> = {}
) {
  // 响应式状态
  const data = ref<T | undefined>(config.defaultData) as Ref<T | undefined>
  const error = ref<Error | null>(null)
  const loading = reactive<LoadingState>({
    isLoading: false,
    isRefreshing: false,
    isError: false,
    isSuccess: false
  })

  // 请求配置
  const {
    immediate = true,
    refreshOnWindowFocus = false,
    pollingInterval = 0,
    defaultData,
    onSuccess,
    onError,
    transform,
    retryCount = 0,
    retryDelay = 1000
  } = config

  // 内部状态
  let retryAttempts = 0
  let pollingTimer: NodeJS.Timeout | null = null

  // 发起请求
  const execute = async (isRefresh = false): Promise<T | undefined> => {
    // 设置加载状态
    if (isRefresh) {
      loading.isRefreshing = true
    } else {
      loading.isLoading = true
    }

    loading.isError = false
    error.value = null

    try {
      const response = await api.get<ApiResponse<T>>(url)

      // 检查响应格式
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'API请求失败')
      }

      // 转换数据
      const responseData = transform ? transform(response.data.data) : response.data.data
      data.value = responseData as T

      // 设置成功状态
      loading.isSuccess = true
      loading.isError = false

      // 重置重试次数
      retryAttempts = 0

      // 调用成功回调
      if (onSuccess) {
        onSuccess(data.value)
      }

      return data.value
    } catch (err) {
      const errorObj = err as Error

      // 重试逻辑
      if (retryAttempts < retryCount) {
        retryAttempts++
        console.warn(`API请求失败，正在进行第${retryAttempts}次重试...`, errorObj.message)

        // 延迟重试
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return execute(isRefresh)
      }

      // 设置错误状态
      loading.isError = true
      loading.isSuccess = false
      error.value = errorObj

      // 调用错误回调
      if (onError) {
        onError(errorObj)
      }

      // 显示错误消息（只在首次加载时显示）
      if (!isRefresh) {
        ElMessage.error(`加载数据失败: ${errorObj.message}`)
      }

      console.error('API请求失败:', errorObj)
      throw errorObj
    } finally {
      loading.isLoading = false
      loading.isRefreshing = false
    }
  }

  // 手动刷新
  const refresh = () => execute(true)

  // 重置状态
  const reset = () => {
    data.value = defaultData
    error.value = null
    loading.isLoading = false
    loading.isRefreshing = false
    loading.isError = false
    loading.isSuccess = false
    retryAttempts = 0
  }

  // 清理定时器
  const cleanup = () => {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  // 轮询逻辑
  const startPolling = () => {
    if (pollingInterval > 0) {
      cleanup()
      pollingTimer = setInterval(refresh, pollingInterval)
    }
  }

  // 窗口聚焦刷新
  const handleWindowFocus = () => {
    if (refreshOnWindowFocus && !loading.isLoading) {
      refresh()
    }
  }

  // 生命周期
  onMounted(() => {
    // 立即执行请求
    if (immediate) {
      execute()
    }

    // 开始轮询
    startPolling()

    // 监听窗口聚焦
    if (refreshOnWindowFocus) {
      window.addEventListener('focus', handleWindowFocus)
    }
  })

  onUnmounted(() => {
    cleanup()
    if (refreshOnWindowFocus) {
      window.removeEventListener('focus', handleWindowFocus)
    }
  })

  return {
    data: data as Ref<T | undefined>,
    error: error as Ref<Error | null>,
    loading,
    execute,
    refresh,
    reset,
    startPolling,
    cleanup
  }
}

/**
 * 分页数据获取Hook
 */
export function usePaginatedApiData<T = any>(
  url: string,
  config: UseApiDataConfig<PaginatedResponse<T>> = {}
) {
  // 分页状态
  const pagination = reactive<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })

  // 构建查询参数
  const buildQueryParams = () => {
    return {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
  }

  // 修改URL以包含分页参数
  const getUrlWithParams = () => {
    const params = new URLSearchParams(buildQueryParams() as any)
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}${params.toString()}`
  }

  // 使用基础Hook
  const { data, error, loading, execute, refresh, reset } = useRealApiData<PaginatedResponse<T>>(
    getUrlWithParams(),
    {
      ...config,
      transform: (response: any) => {
        // 转换API响应为标准分页格式
        const items = response.data?.items || response.data || []
        const total = response.data?.total || response.total || 0
        const page = response.data?.page || pagination.page
        const pageSize = response.data?.pageSize || pagination.pageSize
        const totalPages = Math.ceil(total / pageSize)

        // 更新分页状态
        Object.assign(pagination, {
          total,
          page,
          pageSize,
          totalPages
        })

        return {
          items,
          total,
          page,
          pageSize,
          totalPages
        }
      }
    }
  )

  // 分页操作
  const setPage = (page: number) => {
    pagination.page = page
    return refresh()
  }

  const setPageSize = (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1 // 重置到第一页
    return refresh()
  }

  const nextPage = () => {
    if (pagination.page < pagination.totalPages) {
      return setPage(pagination.page + 1)
    }
  }

  const prevPage = () => {
    if (pagination.page > 1) {
      return setPage(pagination.page - 1)
    }
  }

  // 计算属性
  const items = computed(() => data.value?.items || [])
  const isFirstPage = computed(() => pagination.page <= 1)
  const isLastPage = computed(() => pagination.page >= pagination.totalPages)

  return {
    data,
    items,
    pagination,
    error,
    loading,
    execute,
    refresh,
    reset,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    isFirstPage,
    isLastPage
  }
}

/**
 * 选项数据获取Hook（用于下拉框、单选框等）
 */
export function useOptionsData<T = any>(
  url: string,
  config: UseApiDataConfig<T[]> & {
    labelField?: string // 标签字段名
    valueField?: string // 值字段名
    mapFunction?: (item: any) => { label: string; value: any } // 自定义映射函数
  } = {}
) {
  const {
    labelField = 'label',
    valueField = 'value',
    mapFunction,
    ...restConfig
  } = config

  const { data, error, loading, execute, refresh, reset } = useRealApiData<T[]>(
    url,
    {
      ...restConfig,
      transform: (response: any) => {
        let items = Array.isArray(response) ? response : (response.data || [])

        // 映射为选项格式
        if (mapFunction) {
          items = items.map(mapFunction)
        } else if (items.length > 0 && typeof items[0] === 'object') {
          items = items.map((item: any) => ({
            label: item[labelField] || item.name || item.title,
            value: item[valueField] || item.id || item._id
          }))
        }

        return items as T[]
      }
    }
  )

  return {
    options: data as Ref<T[] | undefined>,
    error,
    loading,
    execute,
    refresh,
    reset
  }
}

/**
 * 统计数据获取Hook
 */
export function useStatisticsData<T = any>(
  url: string,
  config: UseApiDataConfig<T> = {}
) {
  return useRealApiData<T>(
    url,
    {
      ...config,
      retryCount: 2, // 统计数据通常比较重要，增加重试次数
      retryDelay: 2000,
      onError: (error) => {
        console.warn('统计数据加载失败:', error.message)
        // 统计数据失败时不显示错误消息，避免干扰用户
        if (config.onError) {
          config.onError(error)
        }
      }
    }
  )
}

/**
 * 批量数据获取Hook
 */
export function useBatchApiData<T = any>(
  requests: Array<{ url: string; key: string; config?: UseApiDataConfig }>
) {
  const data = ref<Record<string, any>>({})
  const loading = reactive<Record<string, boolean>>({})
  const errors = reactive<Record<string, Error | null>>({})

  const executeBatch = async () => {
    const promises = requests.map(async ({ url, key, config = {} }) => {
      loading[key] = true
      errors[key] = null

      try {
        const response = await api.get(url)
        data.value[key] = config.transform ? config.transform(response.data) : response.data
      } catch (err) {
        errors[key] = err as Error
        console.error(`批量请求失败 [${key}]:`, err)
      } finally {
        loading[key] = false
      }
    })

    await Promise.all(promises)
  }

  onMounted(() => {
    executeBatch()
  })

  return {
    data,
    loading,
    errors,
    executeBatch
  }
}

export default useRealApiData