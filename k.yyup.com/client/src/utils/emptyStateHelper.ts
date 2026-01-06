/**
 * 空状态管理助手
 * 提供统一的空状态配置和管理功能
 */

import type { Component } from 'vue'

// 空状态配置接口
export interface EmptyStateConfig {
  type?: 'no-data' | 'no-search' | 'error' | 'network' | 'forbidden' | 'loading' | 'custom' | 'timeout' | 'maintenance'
  title?: string
  description?: string
  icon?: Component | string
  primaryAction?: {
    text: string
    handler?: () => void
  }
  secondaryAction?: {
    text: string
    handler?: () => void
  }
  size?: 'small' | 'medium' | 'large'
  centered?: boolean
  suggestions?: string[]
}

// 空状态类型枚举
export const EMPTY_STATE_TYPES = {
  NO_DATA: 'no-data',
  NO_SEARCH: 'no-search',
  ERROR: 'error',
  NETWORK: 'network',
  FORBIDDEN: 'forbidden',
  LOADING: 'loading',
  MAINTENANCE: 'maintenance',
  TIMEOUT: 'timeout',
  CUSTOM: 'custom'
} as const

/**
 * 空状态助手类
 */
export class EmptyStateHelper {
  /**
   * 创建空状态配置
   */
  static createConfig(config: EmptyStateConfig): EmptyStateConfig {
    return {
      type: 'no-data',
      size: 'medium',
      centered: true,
      ...config
    }
  }

  /**
   * 根据数据状态获取空状态配置
   */
  static getConfigByState(
    dataState: {
      loading?: boolean
      error?: Error | string | null
      data?: any[] | null
      total?: number
      searchKeyword?: string
      hasPermission?: boolean
    },
    customConfig?: Partial<EmptyStateConfig>
  ): EmptyStateConfig | null {
    const { loading, error, data, total, searchKeyword, hasPermission } = dataState

    // 加载中
    if (loading) {
      return this.createConfig({
        type: 'loading',
        title: '加载中...',
        description: '请稍候，正在获取数据',
        ...customConfig
      })
    }

    // 权限不足
    if (hasPermission === false) {
      return this.createConfig({
        type: 'forbidden',
        title: '权限不足',
        description: '您没有权限访问此内容，请联系管理员',
        ...customConfig
      })
    }

    // 错误处理
    if (error) {
      const errorMessage = typeof error === 'string' ? error : error.message
      const isNetworkError = errorMessage.includes('网络') || 
                            errorMessage.includes('network') ||
                            errorMessage.includes('连接')
      const isTimeoutError = errorMessage.includes('timeout') ||
                            errorMessage.includes('超时')
      const isMaintenanceError = errorMessage.includes('维护') ||
                                errorMessage.includes('maintenance')

      let type: 'network' | 'timeout' | 'maintenance' | 'error' = 'error'
      let title = '加载失败'
      let description = errorMessage || '请稍后重试'
      
      if (isMaintenanceError) {
        type = 'maintenance'
        title = '系统维护中'
        description = '系统正在维护，请稍后再试'
      } else if (isTimeoutError) {
        type = 'timeout'
        title = '请求超时'
        description = '请求超时，请检查网络后重试'
      } else if (isNetworkError) {
        type = 'network'
        title = '网络连接异常'
        description = '请检查网络连接后重试'
      }

      return this.createConfig({
        type,
        title,
        description,
        primaryAction: {
          text: type === 'maintenance' ? '稍后再试' : '重试',
          handler: () => window.location.reload()
        },
        suggestions: type === 'network' ? [
          '检查网络连接是否正常',
          '尝试刷新页面',
          '检查防火墙设置'
        ] : type === 'timeout' ? [
          '检查网络连接速度',
          '稍后再试',
          '联系技术支持'
        ] : undefined,
        ...customConfig
      })
    }

    // 搜索无结果
    if (searchKeyword && (!data || data.length === 0)) {
      return this.createConfig({
        type: 'no-search',
        title: '未找到相关内容',
        description: `未找到与"${searchKeyword}"相关的结果，请尝试其他关键词`,
        primaryAction: {
          text: '清空搜索',
          handler: () => {
            // 这里应该调用清空搜索的回调
            console.log('清空搜索')
          }
        },
        ...customConfig
      })
    }

    // 无数据
    if (!data || data.length === 0 || total === 0) {
      return this.createConfig({
        type: 'no-data',
        title: '暂无数据',
        description: '当前还没有任何内容，快去添加一些吧',
        ...customConfig
      })
    }

    return null
  }

  /**
   * 获取预定义的空状态配置
   */
  static getPresetConfig(preset: keyof typeof PRESET_CONFIGS): EmptyStateConfig {
    return PRESET_CONFIGS[preset] as EmptyStateConfig
  }
}

/**
 * 预定义的空状态配置
 */
export const PRESET_CONFIGS = {
  // 用户列表
  USER_LIST: {
    type: 'no-data' as const,
    title: '暂无用户',
    description: '还没有注册用户，请添加新用户',
    primaryAction: {
      text: '添加用户'
    }
  },

  // 教师列表
  TEACHER_LIST: {
    type: 'no-data' as const,
    title: '暂无教师',
    description: '还没有添加教师，请添加新教师',
    primaryAction: {
      text: '添加教师'
    }
  },

  // 学生列表
  STUDENT_LIST: {
    type: 'no-data' as const,
    title: '暂无学生',
    description: '还没有学生信息，请添加新学生',
    primaryAction: {
      text: '添加学生'
    }
  },

  // 班级列表
  CLASS_LIST: {
    type: 'no-data' as const,
    title: '暂无班级',
    description: '还没有创建班级，请添加新班级',
    primaryAction: {
      text: '创建班级'
    }
  },

  // 申请列表
  APPLICATION_LIST: {
    type: 'no-data' as const,
    title: '暂无申请',
    description: '当前没有报名申请',
  },

  // 通知列表
  NOTIFICATION_LIST: {
    type: 'no-data' as const,
    title: '暂无通知',
    description: '您当前没有新的通知消息',
  },

  // 文件列表
  FILE_LIST: {
    type: 'no-data' as const,
    title: '暂无文件',
    description: '还没有上传任何文件',
    primaryAction: {
      text: '上传文件'
    }
  },

  // 搜索结果
  SEARCH_RESULT: {
    type: 'no-search' as const,
    title: '未找到相关内容',
    description: '请尝试使用其他关键词搜索',
    primaryAction: {
      text: '清空搜索'
    }
  },

  // 权限不足
  FORBIDDEN: {
    type: 'forbidden' as const,
    title: '权限不足',
    description: '您没有权限访问此内容，请联系管理员',
  },

  // 网络错误
  NETWORK_ERROR: {
    type: 'network' as const,
    title: '网络连接异常',
    description: '请检查网络连接后重试',
    primaryAction: {
      text: '重试'
    }
  },

  // 服务器错误
  SERVER_ERROR: {
    type: 'error' as const,
    title: '服务器异常',
    description: '服务器发生错误，请稍后再试',
    primaryAction: {
      text: '刷新页面'
    }
  },

  // 加载中
  LOADING: {
    type: 'loading' as const,
    title: '加载中...',
    description: '请稍候，正在获取数据',
  },

  // 维护中
  MAINTENANCE: {
    type: 'maintenance' as const,
    title: '系统维护中',
    description: '系统正在进行维护升级，请稍后再试',
    primaryAction: {
      text: '稍后再试'
    }
  },

  // 请求超时
  TIMEOUT: {
    type: 'timeout' as const,
    title: '请求超时',
    description: '请求处理时间过长，请稍后重试',
    primaryAction: {
      text: '重试'
    },
    suggestions: [
      '检查网络连接速度',
      '稍后再试',
      '联系技术支持'
    ] as string[],
    showSuggestions: true
  },

  // AI助手相关
  AI_ASSISTANT_EMPTY: {
    type: 'no-data' as const,
    title: 'AI助手就绪',
    description: '开始与AI助手对话，获取智能帮助',
    primaryAction: {
      text: '开始对话'
    },
    suggestions: [
      '询问招生相关问题',
      '请求生成活动策划',
      '查看数据分析'
    ] as string[],
    showSuggestions: true
  },

  // 权限相关的详细配置
  PERMISSION_DENIED_DETAILED: {
    type: 'forbidden' as const,
    title: '访问受限',
    description: '您当前的角色权限不足以访问此功能',
    primaryAction: {
      text: '联系管理员'
    },
    secondaryAction: {
      text: '返回首页'
    },
    suggestions: [
      '联系系统管理员申请权限',
      '确认您的角色配置',
      '查看权限说明文档'
    ] as string[],
    showSuggestions: true
  }
} as const

/**
 * 空状态组合式函数
 */
export function useEmptyState() {
  /**
   * 根据列表数据获取空状态配置
   */
  const getEmptyStateForList = (
    list: any[],
    options: {
      loading?: boolean
      error?: Error | string | null
      searchKeyword?: string
      entityName?: string
      addActionText?: string
      onAddAction?: () => void
      onClearSearch?: () => void
    } = {}
  ): EmptyStateConfig | null => {
    const {
      loading,
      error,
      searchKeyword,
      entityName = '数据',
      addActionText = '添加',
      onAddAction,
      onClearSearch
    } = options

    return EmptyStateHelper.getConfigByState(
      {
        loading,
        error,
        data: list,
        searchKeyword
      },
      {
        title: searchKeyword ? '未找到相关内容' : `暂无${entityName}`,
        description: searchKeyword 
          ? `未找到与"${searchKeyword}"相关的结果，请尝试其他关键词`
          : `还没有添加${entityName}，快去添加一些吧`,
        primaryAction: searchKeyword 
          ? { text: '清空搜索', handler: onClearSearch }
          : { text: addActionText, handler: onAddAction }
      }
    )
  }

  /**
   * 根据详情数据获取空状态配置
   */
  const getEmptyStateForDetail = (
    data: any,
    options: {
      loading?: boolean
      error?: Error | string | null
      entityName?: string
      onRefresh?: () => void
      onGoBack?: () => void
    } = {}
  ): EmptyStateConfig | null => {
    const {
      loading,
      error,
      entityName = '内容',
      onRefresh,
      onGoBack
    } = options

    return EmptyStateHelper.getConfigByState(
      {
        loading,
        error,
        data: data ? [data] : []
      },
      {
        title: `${entityName}不存在`,
        description: `请求的${entityName}不存在或已被删除`,
        primaryAction: onRefresh ? { text: '刷新', handler: onRefresh } : undefined,
        secondaryAction: onGoBack ? { text: '返回', handler: onGoBack } : undefined
      }
    )
  }

  /**
   * 获取预设配置
   */
  const getPresetConfig = (preset: keyof typeof PRESET_CONFIGS, overrides?: Partial<EmptyStateConfig>) => {
    return EmptyStateHelper.createConfig({
      ...PRESET_CONFIGS[preset],
      ...overrides
    })
  }

  return {
    getEmptyStateForList,
    getEmptyStateForDetail,
    getPresetConfig,
    EmptyStateHelper,
    PRESET_CONFIGS,
    EMPTY_STATE_TYPES
  }
}

/**
 * 列表空状态混入
 */
export const EmptyStateMixin = {
  methods: {
    getEmptyStateConfig(
      list: any[],
      loading: boolean = false,
      error: Error | string | null = null,
      searchKeyword: string = ''
    ) {
      return EmptyStateHelper.getConfigByState({
        loading,
        error,
        data: list,
        searchKeyword
      })
    }
  }
}

export default EmptyStateHelper