/**
 * 安全的分页工具函数
 * 防止SQL注入和类型错误
 */

export interface SafePaginationParams {
  page?: string | number;
  pageSize?: string | number;
  maxPageSize?: number;
}

export interface SafePaginationResult {
  page: number;
  pageSize: number;
  offset: number;
  limit: number;
}

/**
 * 安全地处理分页参数
 * @param params 分页参数
 * @returns 安全的分页结果
 */
export function safePagination(params: SafePaginationParams): SafePaginationResult {
  const { page = 1, pageSize = 10, maxPageSize = 100 } = params;
  
  // 确保页码是正整数
  const safePage = Math.max(1, parseInt(String(page), 10) || 1);
  
  // 确保页面大小在合理范围内
  const safePageSize = Math.max(1, Math.min(maxPageSize, parseInt(String(pageSize), 10) || 10));
  
  // 计算偏移量
  const offset = (safePage - 1) * safePageSize;
  
  return {
    page: safePage,
    pageSize: safePageSize,
    offset,
    limit: safePageSize
  };
}

/**
 * 构建安全的LIMIT OFFSET SQL子句
 * @param params 分页参数
 * @returns SQL字符串
 */
export function buildSafeLimitOffset(params: SafePaginationParams): string {
  const { limit, offset } = safePagination(params);
  return `LIMIT ${limit} OFFSET ${offset}`;
}

/**
 * 为Sequelize提供安全的分页选项
 * @param params 分页参数
 * @returns Sequelize分页选项
 */
export function getSequelizePagination(params: SafePaginationParams) {
  const { limit, offset } = safePagination(params);
  return { limit, offset };
}
