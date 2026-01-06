/**
 * 前端搜索工具类
 * 提供统一的搜索参数处理和查询构建
 */

// 搜索参数接口
export interface SearchParams {
  keyword?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  [key: string]: any // 其他过滤条件
}

// 搜索配置接口
export interface SearchConfig {
  // 默认排序
  defaultSort?: { field: string; order: 'ASC' | 'DESC' }
  // 默认分页大小
  defaultPageSize?: number
  // 参数验证器
  validators?: Record<string, (value: any) => boolean>
  // 参数转换器
  transformers?: Record<string, (value: any) => any>
}

// 分页响应接口
export interface PaginationResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * 前端搜索助手类
 */
export class SearchHelper {
  /**
   * 构建查询参数
   * @param params 搜索参数
   * @param config 搜索配置
   * @returns 处理后的查询参数
   */
  static buildQueryParams(params: SearchParams, config: SearchConfig = {}): Record<string, any> {
    const queryParams: Record<string, any> = {}

    // 处理基础分页参数
    queryParams.page = Math.max(1, parseInt(params.page?.toString() || '1'))
    queryParams.pageSize = Math.min(100, Math.max(1, parseInt(params.pageSize?.toString() || config.defaultPageSize?.toString() || '10')))

    // 处理关键词搜索
    if (params.keyword && params.keyword.trim()) {
      queryParams.keyword = params.keyword.trim()
    }

    // 处理排序参数
    if (params.sortBy) {
      queryParams.sortBy = params.sortBy
      queryParams.sortOrder = params.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
    } else if (config.defaultSort) {
      queryParams.sortBy = config.defaultSort.field
      queryParams.sortOrder = config.defaultSort.order
    }

    // 处理其他过滤参数
    Object.keys(params).forEach(key => {
      if (['keyword', 'page', 'pageSize', 'sortBy', 'sortOrder'].includes(key)) {
        return // 跳过已处理的参数
      }

      const value = params[key]
      if (value !== undefined && value !== null && value !== '') {
        // 参数验证
        if (config.validators?.[key] && !config.validators[key](value)) {
          return // 跳过验证失败的参数
        }

        // 参数转换
        let processedValue = value
        if (config.transformers?.[key]) {
          processedValue = config.transformers[key](value)
        }

        queryParams[key] = processedValue
      }
    })

    return queryParams
  }

  /**
   * 重置搜索参数
   * @param keepPage 是否保留页码
   * @returns 重置后的参数
   */
  static resetParams(keepPage: boolean = false): SearchParams {
    return {
      keyword: '',
      page: keepPage ? undefined : 1,
      pageSize: undefined,
      sortBy: undefined,
      sortOrder: undefined
    }
  }

  /**
   * 合并搜索参数
   * @param currentParams 当前参数
   * @param newParams 新参数
   * @param resetPage 是否重置页码
   * @returns 合并后的参数
   */
  static mergeParams(
    currentParams: SearchParams, 
    newParams: SearchParams, 
    resetPage: boolean = true
  ): SearchParams {
    const merged = { ...currentParams, ...newParams }
    if (resetPage) {
      merged.page = 1
    }
    return merged
  }

  /**
   * 清理空参数
   * @param params 参数对象
   * @returns 清理后的参数
   */
  static cleanParams(params: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {}
    
    Object.keys(params).forEach(key => {
      const value = params[key]
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value
      }
    })
    
    return cleaned
  }

  /**
   * 构建URL查询字符串
   * @param params 参数对象
   * @returns 查询字符串
   */
  static buildQueryString(params: Record<string, any>): string {
    const cleanedParams = this.cleanParams(params)
    const searchParams = new URLSearchParams()
    
    Object.keys(cleanedParams).forEach(key => {
      const value = cleanedParams[key]
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v.toString()))
      } else {
        searchParams.append(key, value.toString())
      }
    })
    
    return searchParams.toString()
  }

  /**
   * 预定义的搜索配置
   */
  static configs = {
    // 教师搜索配置
    teacher: {
      defaultSort: { field: 'createdAt', order: 'DESC' as const },
      defaultPageSize: 10,
      validators: {
        status: (value: any) => ['0', '1', '2', 0, 1, 2].includes(value),
        kindergartenId: (value: any) => !isNaN(Number(value))
      },
      transformers: {
        status: (value: any) => Number(value),
        kindergartenId: (value: any) => Number(value)
      }
    },
    
    // 用户搜索配置
    user: {
      defaultSort: { field: 'createdAt', order: 'DESC' as const },
      defaultPageSize: 10,
      validators: {
        status: (value: any) => ['0', '1', '2', 0, 1, 2].includes(value),
        role: (value: any) => typeof value === 'string' && value.length > 0
      },
      transformers: {
        status: (value: any) => Number(value)
      }
    },
    
    // 学生搜索配置
    student: {
      defaultSort: { field: 'createdAt', order: 'DESC' as const },
      defaultPageSize: 10,
      validators: {
        status: (value: any) => ['0', '1', '2', 0, 1, 2].includes(value),
        classId: (value: any) => value === null || !isNaN(Number(value)),
        grade: (value: any) => typeof value === 'string' && value.length > 0
      },
      transformers: {
        status: (value: any) => Number(value),
        classId: (value: any) => value === null ? null : Number(value)
      }
    },
    
    // 班级搜索配置
    class: {
      defaultSort: { field: 'createdAt', order: 'DESC' as const },
      defaultPageSize: 10,
      validators: {
        status: (value: any) => ['0', '1', '2', 0, 1, 2].includes(value),
        grade: (value: any) => typeof value === 'string' && value.length > 0
      },
      transformers: {
        status: (value: any) => Number(value)
      }
    },
    
    // 申请搜索配置
    application: {
      defaultSort: { field: 'createdAt', order: 'DESC' as const },
      defaultPageSize: 10,
      validators: {
        status: (value: any) => ['0', '1', '2', '3', 0, 1, 2, 3].includes(value),
        planId: (value: any) => !isNaN(Number(value))
      },
      transformers: {
        status: (value: any) => Number(value),
        planId: (value: any) => Number(value),
        dateRange: (value: any) => {
          if (Array.isArray(value) && value.length === 2) {
            return { startDate: value[0], endDate: value[1] }
          }
          return value
        }
      }
    }
  }
}

/**
 * 分页助手类
 */
export class PaginationHelper {
  /**
   * 计算分页信息
   * @param total 总记录数
   * @param page 当前页
   * @param pageSize 每页大小
   * @returns 分页信息
   */
  static calculatePagination(total: number, page: number, pageSize: number) {
    const totalPages = Math.ceil(total / pageSize)
    
    return {
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      startIndex: (page - 1) * pageSize + 1,
      endIndex: Math.min(page * pageSize, total)
    }
  }

  /**
   * 构建分页响应
   * @param items 数据列表
   * @param total 总记录数
   * @param page 当前页
   * @param pageSize 每页大小
   * @returns 分页响应
   */
  static buildResponse<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number
  ): PaginationResponse<T> {
    const pagination = this.calculatePagination(total, page, pageSize)
    
    return {
      items,
      ...pagination
    }
  }

  /**
   * 获取分页显示文本
   * @param total 总记录数
   * @param page 当前页
   * @param pageSize 每页大小
   * @returns 显示文本
   */
  static getPaginationText(total: number, page: number, pageSize: number): string {
    if (total === 0) {
      return '暂无数据'
    }
    
    const { startIndex, endIndex } = this.calculatePagination(total, page, pageSize)
    return `显示第 ${startIndex} 至 ${endIndex} 项，共 ${total} 项`
  }
}

/**
 * 搜索状态管理组合式函数
 */
export function useSearch<T = any>(config: SearchConfig = {}) {
  const searchParams = ref<SearchParams>({
    keyword: '',
    page: 1,
    pageSize: config.defaultPageSize || 10,
    sortBy: config.defaultSort?.field,
    sortOrder: config.defaultSort?.order
  })

  const loading = ref(false)
  const data = ref<PaginationResponse<T>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // 执行搜索
  const executeSearch = async (
    searchFn: (params: Record<string, any>) => Promise<any>,
    resetPage: boolean = false
  ) => {
    try {
      loading.value = true
      
      if (resetPage) {
        searchParams.value.page = 1
      }
      
      const queryParams = SearchHelper.buildQueryParams(searchParams.value, config)
      const response = await searchFn(queryParams)
      
      // 适配不同的响应格式
      if (response.data?.items) {
        data.value = response.data
      } else if (response.data?.list) {
        // 兼容旧的list格式
        data.value = {
          items: response.data.list,
          total: response.data.total,
          page: response.data.page,
          pageSize: response.data.pageSize,
          totalPages: Math.ceil(response.data.total / response.data.pageSize),
          hasNext: response.data.page < Math.ceil(response.data.total / response.data.pageSize),
          hasPrev: response.data.page > 1
        }
      } else {
        data.value = response.data
      }
    } catch (error) {
      console.error('搜索失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 重置搜索
  const resetSearch = () => {
    searchParams.value = {
      ...SearchHelper.resetParams(),
      pageSize: config.defaultPageSize || 10,
      sortBy: config.defaultSort?.field,
      sortOrder: config.defaultSort?.order
    }
  }

  // 更新搜索参数
  const updateParams = (newParams: Partial<SearchParams>, resetPage: boolean = true) => {
    searchParams.value = SearchHelper.mergeParams(searchParams.value, newParams, resetPage)
  }

  return {
    searchParams,
    loading,
    data,
    executeSearch,
    resetSearch,
    updateParams
  }
}