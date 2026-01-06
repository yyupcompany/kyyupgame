/**
 * 分页数据格式标准化工具
 * 确保所有分页API返回统一的格式
 */

export interface StandardPaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface StandardPaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface StandardAPIPaginationResponse<T = any> {
  success: boolean;
  data: StandardPaginationResult<T>;
  message?: string;
}

export class PaginationHelper {
  /**
   * 解析和验证分页参数
   */
  static parsePaginationParams(query: any): StandardPaginationOptions {
    let page = parseInt(query.page) || 1;
    let pageSize = parseInt(query.pageSize) || 10;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = (query.sortOrder || 'DESC').toUpperCase() as 'ASC' | 'DESC';

    // 限制页面大小
    pageSize = Math.min(Math.max(pageSize, 1), 100);
    page = Math.max(page, 1);

    return {
      page,
      pageSize,
      sortBy,
      sortOrder
    };
  }

  /**
   * 创建标准分页响应
   */
  static createPaginationResponse<T>(
    items: T[],
    total: number,
    options: StandardPaginationOptions,
    message = '获取数据成功'
  ): StandardAPIPaginationResponse<T> {
    const totalPages = Math.ceil(total / options.pageSize);
    const hasNext = options.page < totalPages;
    const hasPrev = options.page > 1;

    return {
      success: true,
      data: {
        items,
        total,
        page: options.page,
        pageSize: options.pageSize,
        totalPages,
        hasNext,
        hasPrev
      },
      message
    };
  }

  /**
   * 计算分页偏移量
   */
  static calculateOffset(page: number, pageSize: number): number {
    return (page - 1) * pageSize;
  }

  /**
   * 构建数据库查询选项
   */
  static buildQueryOptions(options: StandardPaginationOptions): {
    offset: number;
    limit: number;
    order: string[][];
  } {
    return {
      offset: this.calculateOffset(options.page, options.pageSize),
      limit: options.pageSize,
      order: [[options.sortBy || 'createdAt', options.sortOrder || 'DESC']]
    };
  }

  /**
   * 转换非标准分页响应为标准格式
   */
  static normalizePaginationResponse(data: any): StandardAPIPaginationResponse {
    // 如果已经是标准格式，直接返回
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      const responseData = data.data;
      if (responseData && 'items' in responseData && 'total' in responseData) {
        return data as StandardAPIPaginationResponse;
      }
    }

    // 转换常见的非标准格式
    let items = [];
    let total = 0;
    let page = 1;
    let pageSize = 10;

    if (Array.isArray(data)) {
      // 直接是数组
      items = data;
      total = data.length;
    } else if (data && typeof data === 'object') {
      // 对象格式，尝试提取数据
      items = data.items || data.list || data.data || data.results || [];
      total = data.total || data.count || data.totalCount || items.length;
      page = data.page || data.currentPage || data.pageNum || 1;
      pageSize = data.pageSize || data.limit || data.perPage || 10;
    }

    return this.createPaginationResponse(items, total, { page, pageSize });
  }

  /**
   * 验证分页响应格式
   */
  static validatePaginationResponse(response: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!response || typeof response !== 'object') {
      errors.push('分页响应必须是对象类型');
      return { valid: false, errors };
    }

    // 检查基本API格式
    if (typeof response.success !== 'boolean') {
      errors.push('success字段必须是布尔类型');
    }

    if (!response.data || typeof response.data !== 'object') {
      errors.push('data字段必须是对象类型');
      return { valid: false, errors };
    }

    // 检查分页必需字段
    const requiredFields = ['items', 'total', 'page', 'pageSize', 'totalPages'];
    const fieldTypes = {
      'items': 'array',
      'total': 'number',
      'page': 'number',
      'pageSize': 'number',
      'totalPages': 'number',
      'hasNext': 'boolean',
      'hasPrev': 'boolean'
    };

    requiredFields.forEach(field => {
      if (!(field in response.data)) {
        errors.push(`缺少必需字段: data.${field}`);
      }
    });

    Object.entries(fieldTypes).forEach(([field, expectedType]) => {
      if (field in response.data) {
        const actualType = Array.isArray(response.data[field]) ? 'array' : typeof response.data[field];
        if (actualType !== expectedType) {
          errors.push(`data.${field}: 期望类型 ${expectedType}, 实际类型 ${actualType}`);
        }
      }
    });

    // 检查分页逻辑
    if (response.data.total >= 0 && response.data.pageSize > 0) {
      const expectedTotalPages = Math.ceil(response.data.total / response.data.pageSize);
      if (response.data.totalPages !== expectedTotalPages) {
        errors.push(`totalPages计算错误: 期望 ${expectedTotalPages}, 实际 ${response.data.totalPages}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 生成分页元数据
   */
  static generatePaginationMeta(
    total: number,
    page: number,
    pageSize: number
  ): {
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    startIndex: number;
    endIndex: number;
  } {
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);

    return {
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      startIndex,
      endIndex
    };
  }
}