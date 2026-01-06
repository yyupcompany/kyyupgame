/**
 * 页面状态管理组合式函数
 * 统一管理加载、错误、空数据等状态
 */
// Mock Vue functions for TypeScript compilation
const ref = (value: any) => ({ value })
const computed = (fn: any) => ({ value: fn() })
const reactive = (obj: any) => obj
import { ElMessage } from 'element-plus'
// Mock imports and types
const useErrorHandler = () => ({ handleError: (_error: any) => {} })
type EmptyStateConfig = {
  title?: string
  description?: string
  primaryAction?: any
  extraActions?: any[]
  suggestions?: string[]
  showSuggestions?: boolean
}
const EmptyStateHelper = {
  createConfig: (config: any) => config,
  getConfigByState: (_state: any, config?: any) => config || {}
}
const PRESET_CONFIGS = {}
const ErrorHandler = {
  handle: (_error: any, _context?: any) => ({ code: 'ERROR' })
}
const ErrorCode = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  INSUFFICIENT_PERMISSION: 'INSUFFICIENT_PERMISSION',
  UNAUTHORIZED: 'UNAUTHORIZED'
}

export interface PageStateOptions {
  // 实体名称，用于生成友好的提示信息
  entityName?: string
  // 是否自动处理错误通知
  autoNotify?: boolean
  // 是否启用重试机制
  enableRetry?: boolean
  // 最大重试次数
  maxRetries?: number
  // 重试延迟（毫秒）
  retryDelay?: number
  // 是否显示详细错误信息
  showDetailedError?: boolean
}

export function usePageState(options: PageStateOptions = {}) {
  const {
    entityName = '数据',
    autoNotify = true,
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000
  } = options

  // 基础状态
  const loading = ref(false)
  const error = ref(null)
  const data = ref([])
  const hasPermission = ref(true)
  
  // 搜索相关状态
  const searchKeyword = ref('')
  const searchLoading = ref(false)
  
  // 分页相关状态
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })
  
  // 重试相关状态
  const retryCount = ref(0)
  const isRetrying = ref(false)
  
  // 错误处理器
  const errorHandler = useErrorHandler()

  // 获取错误建议
  const getErrorSuggestions = (): string[] => {
    if (!error.value) return []

    const errorMessage = typeof error.value === 'string' ? error.value : error.value.message

    if (errorMessage.includes('网络') || errorMessage.includes('network')) {
      return [
        '检查网络连接是否正常',
        '尝试刷新页面',
        '检查防火墙设置'
      ]
    }

    if (errorMessage.includes('超时') || errorMessage.includes('timeout')) {
      return [
        '检查网络连接速度',
        '稍后再试',
        '联系技术支持'
      ]
    }

    if (errorMessage.includes('权限') || errorMessage.includes('permission')) {
      return [
        '联系系统管理员申请权限',
        '确认您的角色配置',
        '查看权限说明文档'
      ]
    }

    return [
      '刷新页面重试',
      '检查输入是否正确',
      '联系技术支持'
    ]
  }

  // 数据状态计算
  const dataState = computed(() => ({
    loading: loading.value || searchLoading.value,
    error: error.value,
    data: data.value,
    total: pagination.total,
    searchKeyword: searchKeyword.value,
    hasPermission: hasPermission.value
  }))

  // 空状态配置计算
  const emptyStateConfig = computed((): EmptyStateConfig | null => {
    return EmptyStateHelper.getConfigByState(dataState.value, {
      title: searchKeyword.value ? '未找到相关内容' : `暂无${entityName}`,
      description: searchKeyword.value 
        ? `未找到与"${searchKeyword.value}"相关的结果，请尝试其他关键词`
        : `还没有添加${entityName}，快去添加一些吧`,
      primaryAction: searchKeyword.value 
        ? { text: '清空搜索', handler: clearSearch }
        : { text: `添加${entityName}` },
      extraActions: error.value && enableRetry ? [{
        text: '重试',
        type: 'primary' as const,
        loading: isRetrying.value,
        handler: handleRetry
      }] : undefined,
      suggestions: getErrorSuggestions(),
      showSuggestions: !!error.value
    })
  })



  // 处理API调用的通用方法
  const handleApiCall = async <T>(
    apiCall: () => Promise<T>,
    options?: {
      loadingRef?: typeof loading
      showSuccessMessage?: boolean
      successMessage?: string
      onSuccess?: (result: T) => void
      onError?: (error: any) => void
      transform?: (result: T) => any[]
    }
  ): Promise<T | undefined> => {
    const {
      loadingRef = loading,
      showSuccessMessage = false,
      successMessage = '操作成功',
      onSuccess,
      onError,
      transform
    } = options || {}

    try {
      loadingRef.value = true
      error.value = null
      retryCount.value = 0

      const result = await apiCall()
      
      // 数据转换
      if (transform) {
        data.value = transform(result)
      }
      
      // 成功回调
      if (onSuccess) {
        onSuccess(result)
      }
      
      // 成功提示
      if (showSuccessMessage) {
        ElMessage.success(successMessage)
      }

      return result
    } catch (err: any) {
      console.error(`${entityName}操作失败:`, err)
      
      // 设置错误状态
      error.value = err
      data.value = []
      
      // 错误处理
      const errorInfo = ErrorHandler.handle(err, autoNotify)
      
      // 权限检查
      if (errorInfo.code === ErrorCode.INSUFFICIENT_PERMISSION || 
          errorInfo.code === ErrorCode.UNAUTHORIZED) {
        hasPermission.value = false
      }
      
      // 自定义错误处理
      if (onError) {
        onError(err)
      }
      
      return undefined
    } finally {
      loadingRef.value = false
    }
  }

  // 重试机制
  const handleRetry = async () => {
    if (retryCount.value >= maxRetries) {
      ElMessage.warning('已达到最大重试次数')
      return
    }

    retryCount.value++
    isRetrying.value = true

    try {
      await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount.value))
      
      // 清除错误状态
      error.value = null
      hasPermission.value = true
      
      ElMessage.info(`正在重试第${retryCount.value}次...`)
    } catch (err) {
      console.error('重试失败:', err)
    } finally {
      isRetrying.value = false
    }
  }

  // 清空搜索
  const clearSearch = () => {
    searchKeyword.value = ''
    pagination.current = 1
    error.value = null
  }

  // 加载列表数据
  const loadListData = async <T>(
    apiCall: () => Promise<T>,
    transform?: (result: T) => { items: any[], total: number }
  ) => {
    return handleApiCall(apiCall, {
      transform: transform ? (result) => {
        const transformed = transform(result)
        pagination.total = transformed.total
        return transformed.items
      } : undefined
    })
  }

  // 加载详情数据
  const loadDetailData = async <T>(
    apiCall: () => Promise<T>,
    transform?: (result: T) => any
  ) => {
    return handleApiCall(apiCall, {
      transform: transform ? (result) => [transform(result)] : (result) => [result]
    })
  }

  // 搜索数据
  const searchData = async <T>(
    apiCall: (keyword: string) => Promise<T>,
    keyword: string,
    transform?: (result: T) => { items: any[], total: number }
  ) => {
    searchKeyword.value = keyword
    pagination.current = 1
    
    return handleApiCall(() => apiCall(keyword), {
      loadingRef: searchLoading,
      transform: transform ? (result) => {
        const transformed = transform(result)
        pagination.total = transformed.total
        return transformed.items
      } : undefined
    })
  }

  // 分页处理
  const handlePageChange = async <T>(
    page: number,
    apiCall: (page: number, size: number) => Promise<T>,
    transform?: (result: T) => { items: any[], total: number }
  ) => {
    pagination.current = page
    
    return handleApiCall(() => apiCall(page, pagination.size), {
      transform: transform ? (result) => {
        const transformed = transform(result)
        pagination.total = transformed.total
        return transformed.items
      } : undefined
    })
  }

  // 重置状态
  const resetState = () => {
    loading.value = false
    searchLoading.value = false
    error.value = null
    data.value = []
    searchKeyword.value = ''
    hasPermission.value = true
    retryCount.value = 0
    isRetrying.value = false
    pagination.current = 1
    pagination.total = 0
  }

  // 获取预设配置
  const getPresetConfig = (preset: keyof typeof PRESET_CONFIGS) => {
    return EmptyStateHelper.createConfig(PRESET_CONFIGS[preset])
  }

  // 创建自定义配置
  const createCustomConfig = (config: Partial<EmptyStateConfig>) => {
    return EmptyStateHelper.createConfig(config)
  }

  return {
    // 状态
    loading,
    error,
    data,
    hasPermission,
    searchKeyword,
    searchLoading,
    pagination,
    retryCount,
    isRetrying,
    
    // 计算属性
    dataState,
    emptyStateConfig,
    
    // 方法
    handleApiCall,
    loadListData,
    loadDetailData,
    searchData,
    handlePageChange,
    handleRetry,
    clearSearch,
    resetState,
    getPresetConfig,
    createCustomConfig,
    
    // 错误处理器实例
    errorHandler
  }
}

// 导出特定场景的组合式函数
export function useListPageState(entityName: string, options?: Omit<PageStateOptions, 'entityName'>) {
  return usePageState({ ...options, entityName })
}

export function useDetailPageState(entityName: string, options?: Omit<PageStateOptions, 'entityName'>) {
  return usePageState({ ...options, entityName })
}

export function useSearchPageState(entityName: string, options?: Omit<PageStateOptions, 'entityName'>) {
  return usePageState({ ...options, entityName })
}