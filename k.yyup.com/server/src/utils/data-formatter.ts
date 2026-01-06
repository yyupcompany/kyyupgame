/**
 * 数据格式化工具函数
 * 提供一组函数用于格式化API响应数据
 */

/**
 * 确保数据为数组
 * @param data 原始数据，可能是数组、对象或null
 * @returns 保证返回数组的数据
 */
export function ensureArray<T>(data: T | T[] | null | undefined): T[] {
  if (data === null || data === undefined) {
    return [];
  }
  return Array.isArray(data) ? data : [data];
}

/**
 * 安全地从查询结果获取数组
 * 解决Sequelize查询返回单个对象而非数组的问题
 * @param queryResult 查询结果
 * @returns 数组格式的查询结果
 */
export function safelyGetArrayFromQuery<T = any>(queryResult: any): T[] {
  return ensureArray<T>(queryResult);
}

/**
 * 格式化分页响应
 * @param total 总记录数
 * @param page 当前页码
 * @param pageSize 每页大小
 * @param list 数据列表
 * @returns 标准格式的分页响应
 */
export function formatPaginationResponse<T>(
  total: number,
  page: number,
  pageSize: number,
  list: T[]
): {
  total: number;
  page: number;
  pageSize: number;
  list: T[];
} {
  return {
    total,
    page,
    pageSize,
    list: ensureArray(list) // 确保list始终是数组
  };
}

/**
 * 处理空值
 * @param value 原始值
 * @param defaultValue 默认值
 * @returns 处理后的值
 */
export function handleNull<T>(value: T | null | undefined, defaultValue: T): T {
  return value === null || value === undefined ? defaultValue : value;
}

/**
 * 移除对象中的空值
 * @param obj 原始对象
 * @returns 移除空值后的对象
 */
export function removeNullValues<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== null && obj[key] !== undefined) {
      result[key as keyof T] = obj[key];
    }
  });
  
  return result;
}

/**
 * 将下划线命名转换为驼峰命名
 * @param str 下划线命名的字符串
 * @returns 驼峰命名的字符串
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (match, group) => group.toUpperCase());
}

/**
 * 将对象的键从下划线命名转换为驼峰命名
 * @param obj 原始对象
 * @returns 转换后的对象
 */
export function convertKeysToCamelCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamelCase(item));
  }
  
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const camelKey = snakeToCamel(key);
    const value = obj[key];
    
    if (typeof value === 'object' && value !== null) {
      result[camelKey] = convertKeysToCamelCase(value);
    } else {
      result[camelKey] = value;
    }
  });
  
  return result;
}

/**
 * 从数据库查询结果创建分页响应
 * 一步完成查询结果到分页响应的转换
 * @param queryResult Sequelize查询结果
 * @param total 总记录数
 * @param page 当前页码
 * @param pageSize 每页记录数
 * @returns 格式化后的分页响应
 */
export function createPaginationResponseFromQuery<T>(
  queryResult: any,
  total: number,
  page: number,
  pageSize: number
): { total: number; page: number; pageSize: number; list: T[] } {
  const list = safelyGetArrayFromQuery<T>(queryResult);
  
  return formatPaginationResponse(
    total,
    page,
    pageSize,
    list
  );
} 