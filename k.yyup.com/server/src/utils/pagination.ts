/**
 * 分页工具
 * 提供分页查询功能
 */
import { Model, FindOptions, ModelStatic } from 'sequelize';

/**
 * 分页选项
 */
export interface PaginationOptions extends FindOptions {
  page?: number;
  limit?: number;
}

/**
 * 分页结果
 */
export interface PaginationResult<T> {
  totalItems: number;
  items: T[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 分页查询
 * @param model 模型类
 * @param options 查询选项
 * @returns 分页结果
 */
export async function paginate<T extends Model>(
  model: ModelStatic<T>,
  options: PaginationOptions
): Promise<PaginationResult<T>> {
  // 获取分页参数
  const page = Math.max(1, options.page || 1);
  // 处理limit: 如果为0或undefined，使用默认值10，然后限制在1-100之间
  const rawLimit = options.limit === undefined ? 10 : options.limit;
  const limit = Math.max(1, Math.min(100, rawLimit));
  const offset = (page - 1) * limit;

  // 准备查询选项
  const findOptions: FindOptions = {
    ...options,
    limit,
    offset
  };

  // 执行查询
  const { count, rows } = await model.findAndCountAll(findOptions);

  // 计算分页信息
  const totalPages = Math.ceil(count / limit);
  const hasNext = page < totalPages;
  const hasPrevious = page > 1;

  return {
    totalItems: count,
    items: rows,
    totalPages,
    currentPage: page,
    pageSize: limit,
    hasNext,
    hasPrevious
  };
} 