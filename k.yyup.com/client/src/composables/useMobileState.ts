import { ref, computed } from 'vue'

// 状态类型定义
export type StateType = 'loading' | 'error' | 'empty' | 'success'

export interface StateConfig {
  // 基础状态
  loading?: boolean
  error?: boolean
  empty?: boolean
  success?: boolean

  // 加载状态配置
  loadingText?: string
  showProgress?: boolean
  progress?: number

  // 错误状态配置
  errorType?: 'network' | 'permission' | 'not-found' | 'server' | 'validation' | 'custom'
  errorTitle?: string
  errorDescription?: string
  errorDetails?: string
  retryable?: boolean

  // 空状态配置
  emptyText?: string
  emptyImage?: string

  // 通用配置
  fullscreen?: boolean
}

// 网络错误处理
export interface NetworkError {
  code?: string | number
  message: string
  details?: any
  retryable?: boolean
}

/**
 * 移动端状态管理 Composable
 * 提供统一的加载、错误、空状态管理
 */
export function useMobileState(initialConfig: StateConfig = {}) {
  // 响应式状态
  const loading = ref(initialConfig.loading ?? false)
  const error = ref(initialConfig.error ?? false)
  const empty = ref(initialConfig.empty ?? false)
  const success = ref(initialConfig.success ?? false)

  // 状态详情
  const loadingText = ref(initialConfig.loadingText ?? '加载中...')
  const showProgress = ref(initialConfig.showProgress ?? false)
  const progress = ref(initialConfig.progress ?? 0)

  const errorType = ref(initialConfig.errorType ?? 'custom')
  const errorTitle = ref(initialConfig.errorTitle ?? '')
  const errorDescription = ref(initialConfig.errorDescription ?? '')
  const errorDetails = ref(initialConfig.errorDetails ?? '')
  const retryable = ref(initialConfig.retryable ?? true)

  const emptyText = ref(initialConfig.emptyText ?? '暂无数据')
  const emptyImage = ref(initialConfig.emptyImage ?? 'default')

  const fullscreen = ref(initialConfig.fullscreen ?? false)

  // 计算当前状态类型
  const currentType = computed((): StateType => {
    if (loading.value) return 'loading'
    if (error.value) return 'error'
    if (empty.value) return 'empty'
    if (success.value) return 'success'
    return 'loading' // 默认状态
  })

  // 重置所有状态
  const reset = () => {
    loading.value = false
    error.value = false
    empty.value = false
    success.value = false

    loadingText.value = '加载中...'
    showProgress.value = false
    progress.value = 0

    errorTitle.value = ''
    errorDescription.value = ''
    errorDetails.value = ''
    retryable.value = true

    emptyText.value = '暂无数据'
  }

  // 设置加载状态
  const setLoading = (config: Partial<StateConfig> = {}) => {
    reset()
    loading.value = true

    if (config.loadingText) loadingText.value = config.loadingText
    if (config.showProgress !== undefined) showProgress.value = config.showProgress
    if (config.progress !== undefined) progress.value = config.progress
    if (config.fullscreen !== undefined) fullscreen.value = config.fullscreen
  }

  // 设置成功状态
  const setSuccess = () => {
    loading.value = false
    error.value = false
    empty.value = false
    success.value = true
  }

  // 设置错误状态
  const setError = (errorInfo: {
    title?: string
    description?: string
    details?: string
    type?: 'network' | 'permission' | 'not-found' | 'server' | 'validation' | 'custom'
    retryable?: boolean
  } = {}) => {
    reset()
    error.value = true

    if (errorInfo.title) errorTitle.value = errorInfo.title
    if (errorInfo.description) errorDescription.value = errorInfo.description
    if (errorInfo.details) errorDetails.value = errorInfo.details
    if (errorInfo.type) errorType.value = errorInfo.type
    if (errorInfo.retryable !== undefined) retryable.value = errorInfo.retryable
    if (errorInfo.fullscreen !== undefined) fullscreen.value = errorInfo.fullscreen
  }

  // 设置空状态
  const setEmpty = (config: { text?: string; image?: string } = {}) => {
    reset()
    empty.value = true

    if (config.text) emptyText.value = config.text
    if (config.image) emptyImage.value = config.image
  }

  // 处理网络错误
  const handleNetworkError = (err: NetworkError) => {
    let errorType: StateConfig['errorType'] = 'custom'
    let errorTitle = '操作失败'
    let errorDescription = err.message

    // 根据错误类型设置不同的显示
    switch (err.code) {
      case 'NETWORK_ERROR':
      case 0:
        errorType = 'network'
        errorTitle = '网络连接失败'
        errorDescription = '请检查网络连接后重试'
        break
      case 'PERMISSION_DENIED':
      case 403:
        errorType = 'permission'
        errorTitle = '权限不足'
        errorDescription = '您没有权限执行此操作'
        break
      case 'NOT_FOUND':
      case 404:
        errorType = 'not-found'
        errorTitle = '页面不存在'
        errorDescription = '您访问的内容不存在或已被移除'
        break
      case 'SERVER_ERROR':
      case 500:
        errorType = 'server'
        errorTitle = '服务器错误'
        errorDescription = '服务器暂时无法响应，请稍后重试'
        break
      case 'VALIDATION_ERROR':
      case 422:
        errorType = 'validation'
        errorTitle = '数据验证失败'
        errorDescription = '请检查输入信息是否正确'
        break
    }

    setError({
      title: errorTitle,
      description: errorDescription,
      details: err.details,
      type: errorType,
      retryable: err.retryable ?? true
    })
  }

  // 更新进度
  const updateProgress = (value: number) => {
    progress.value = Math.max(0, Math.min(100, value))
  }

  // 为 MobileStateHandler 组件提供的 props
  const stateHandlerProps = computed(() => ({
    loading: loading.value,
    error: error.value,
    empty: empty.value,

    // 加载配置
    loadingText: loadingText.value,
    showProgress: showProgress.value,
    progress: progress.value,

    // 错误配置
    errorType: errorType.value,
    errorTitle: errorTitle.value,
    errorDescription: errorDescription.value,
    errorDetails: errorDetails.value,
    showErrorDetails: !!errorDetails.value,
    showRetry: retryable.value,

    // 空状态配置
    emptyText: emptyText.value,
    emptyImage: emptyImage.value,

    // 通用配置
    fullscreen: fullscreen.value
  }))

  return {
    // 状态
    loading,
    error,
    empty,
    success,
    currentType,

    // 配置
    loadingText,
    showProgress,
    progress,
    errorType,
    errorTitle,
    errorDescription,
    errorDetails,
    retryable,
    emptyText,
    emptyImage,
    fullscreen,

    // 方法
    reset,
    setLoading,
    setSuccess,
    setError,
    setEmpty,
    handleNetworkError,
    updateProgress,

    // 计算属性
    stateHandlerProps
  }
}

/**
 * 异步操作助手
 * 自动处理加载状态、错误状态和空状态
 */
export async function useAsyncOperation<T>(
  asyncFn: () => Promise<T>,
  options: {
    loadingText?: string
    showProgress?: boolean
    onProgress?: (progress: number) => void
    onError?: (error: any) => void
    onSuccess?: (result: T) => void
    emptyChecker?: (result: T) => boolean
    emptyText?: string
  } = {}
): Promise<{ result: T | null; error: any }> {
  const state = useMobileState({
    loadingText: options.loadingText,
    showProgress: options.showProgress
  })

  try {
    state.setLoading()

    // 执行异步操作
    const result = await asyncFn()

    // 检查是否为空结果
    if (options.emptyChecker && options.emptyChecker(result)) {
      state.setEmpty({ text: options.emptyText })
      return { result: null, error: null }
    }

    state.setSuccess()
    options.onSuccess?.(result)

    return { result, error: null }
  } catch (err) {
    state.handleNetworkError({
      message: err?.message || '操作失败',
      details: err,
      retryable: true
    })

    options.onError?.(err)
    return { result: null, error: err }
  }
}

/**
 * 列表数据管理
 * 专门用于处理列表数据的加载状态
 */
export function useMobileListState<T>(
  fetchData: (params: any) => Promise<{ data: T[]; total: number; hasMore: boolean }>,
  initialParams: any = {}
) {
  const state = useMobileState()
  const data = ref<T[]>([] as T[])
  const total = ref(0)
  const hasMore = ref(true)
  const params = ref(initialParams)
  const refreshing = ref(false)

  // 加载第一页数据
  const loadFirst = async () => {
    try {
      state.setLoading({ loadingText: '正在加载数据...' })
      const result = await fetchData(params.value)

      data.value = result.data
      total.value = result.total
      hasMore.value = result.hasMore

      if (result.data.length === 0) {
        state.setEmpty()
      } else {
        state.setSuccess()
      }
    } catch (err) {
      state.handleNetworkError({
        message: '加载数据失败',
        details: err,
        retryable: true
      })
    }
  }

  // 加载更多数据
  const loadMore = async () => {
    if (!hasMore.value || state.loading.value) return

    try {
      state.setLoading({ loadingText: '加载更多...' })
      const result = await fetchData({
        ...params.value,
        page: (params.value.page || 1) + 1
      })

      data.value.push(...result.data)
      hasMore.value = result.hasMore
      state.setSuccess()
    } catch (err) {
      state.handleNetworkError({
        message: '加载更多失败',
        details: err,
        retryable: true
      })
    }
  }

  // 刷新数据
  const refresh = async () => {
    try {
      refreshing.value = true
      params.value.page = 1
      await loadFirst()
    } finally {
      refreshing.value = false
    }
  }

  return {
    // 状态
    state,
    data,
    total,
    hasMore,
    refreshing,
    params,

    // 方法
    loadFirst,
    loadMore,
    refresh,

    // 计算属性
    isEmpty: computed(() => data.value.length === 0 && !state.loading.value),
    canLoadMore: computed(() => hasMore.value && !state.loading.value && !state.error.value)
  }
}