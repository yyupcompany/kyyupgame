/**
 * 查询增强中间件
 * 提供高级查询、过滤、排序、分页功能
 */

import { Request, Response, NextFunction } from 'express';
import { Op, WhereOptions, FindOptions, OrderItem } from 'sequelize';

// 查询操作符映射
export const QUERY_OPERATORS = {
  eq: Op.eq,           // 等于
  ne: Op.ne,           // 不等于
  gt: Op.gt,           // 大于
  gte: Op.gte,         // 大于等于
  lt: Op.lt,           // 小于
  lte: Op.lte,         // 小于等于
  like: Op.like,       // 模糊匹配
  ilike: Op.iLike,     // 忽略大小写模糊匹配
  in: Op.in,           // 在列表中
  notIn: Op.notIn,     // 不在列表中
  between: Op.between, // 区间
  startsWith: Op.startsWith, // 以...开头
  endsWith: Op.endsWith,     // 以...结尾
  substring: Op.substring,   // 包含子字符串
  regexp: Op.regexp,         // 正则表达式
  is: Op.is,           // IS (NULL/NOT NULL)
  not: Op.not          // NOT
};

// 查询参数接口
export interface EnhancedQueryParams {
  // 分页
  page?: number;
  limit?: number;
  offset?: number;
  
  // 排序
  sort?: string | string[];
  order?: 'ASC' | 'DESC' | ('ASC' | 'DESC')[];
  
  // 搜索
  search?: string;
  searchFields?: string[];
  
  // 过滤器
  filters?: Record<string, any>;
  
  // 高级过滤
  where?: Record<string, any>;
  
  // 关联查询
  include?: string | string[];
  includeAll?: boolean;
  
  // 字段选择
  attributes?: string[];
  exclude?: string[];
  
  // 聚合
  group?: string[];
  having?: Record<string, any>;
  
  // 其他选项
  distinct?: boolean;
  raw?: boolean;
  paranoid?: boolean;
}

/**
 * 查询增强器类
 */
export class QueryEnhancer {
  
  /**
   * 解析请求中的查询参数
   */
  static parseQueryParams(req: Request): EnhancedQueryParams {
    const query = req.query as any;
    
    return {
      // 分页参数
      page: this.parseNumber(query.page, 1),
      limit: this.parseNumber(query.limit, 20, 1, 100),
      offset: this.parseNumber(query.offset),
      
      // 排序参数
      sort: this.parseStringArray(query.sort),
      order: this.parseOrder(query.order),
      
      // 搜索参数
      search: query.search as string,
      searchFields: this.parseStringArray(query.searchFields),
      
      // 过滤参数
      filters: this.parseFilters(query.filters),
      where: this.parseWhere(query.where),
      
      // 关联参数
      include: this.parseStringArray(query.include),
      includeAll: this.parseBoolean(query.includeAll),
      
      // 字段参数
      attributes: this.parseStringArray(query.attributes),
      exclude: this.parseStringArray(query.exclude),
      
      // 聚合参数
      group: this.parseStringArray(query.group),
      having: this.parseObject(query.having),
      
      // 其他参数
      distinct: this.parseBoolean(query.distinct),
      raw: this.parseBoolean(query.raw),
      paranoid: this.parseBoolean(query.paranoid, true)
    };
  }

  /**
   * 构建 Sequelize 查询选项
   */
  static buildFindOptions(params: EnhancedQueryParams, defaultOptions: any = {}): FindOptions {
    const options: FindOptions = { ...defaultOptions };

    // 分页
    if (params.limit) {
      options.limit = params.limit;
      if (params.page) {
        options.offset = (params.page - 1) * params.limit;
      } else if (params.offset) {
        options.offset = params.offset;
      }
    }

    // 排序
    if (params.sort) {
      options.order = this.buildOrderOptions(params.sort, params.order);
    }

    // 查询条件
    options.where = this.buildWhereOptions(params);

    // 字段选择
    if (params.attributes) {
      options.attributes = params.attributes;
    } else if (params.exclude) {
      options.attributes = { exclude: params.exclude };
    }

    // 关联查询
    if (params.include || params.includeAll) {
      options.include = this.buildIncludeOptions(params, defaultOptions.include);
    }

    // 分组
    if (params.group) {
      options.group = params.group;
    }

    // HAVING 条件
    if (params.having) {
      options.having = this.parseWhereConditions(params.having);
    }

    // 其他选项
    if (params.distinct !== undefined) {
      (options as any).distinct = params.distinct;
    }
    if (params.raw !== undefined) {
      options.raw = params.raw;
    }
    if (params.paranoid !== undefined) {
      options.paranoid = params.paranoid;
    }

    return options;
  }

  /**
   * 构建排序选项
   */
  private static buildOrderOptions(sort: string | string[], order?: 'ASC' | 'DESC' | ('ASC' | 'DESC')[]): OrderItem[] {
    const sortFields = Array.isArray(sort) ? sort : [sort];
    const orderDirections = Array.isArray(order) ? order : [order || 'ASC'];

    return sortFields.map((field, index) => {
      const direction = orderDirections[index] || orderDirections[0] || 'ASC';
      
      // 支持关联字段排序，如 'user.name'
      if (field.includes('.')) {
        const parts = field.split('.');
        return [...parts, direction] as OrderItem;
      }
      
      return [field, direction] as OrderItem;
    });
  }

  /**
   * 构建查询条件
   */
  private static buildWhereOptions(params: EnhancedQueryParams): WhereOptions {
    const where: WhereOptions = {};

    // 基础过滤器
    if (params.filters) {
      Object.assign(where, this.parseWhereConditions(params.filters));
    }

    // 高级 WHERE 条件
    if (params.where) {
      Object.assign(where, this.parseWhereConditions(params.where));
    }

    // 搜索条件
    if (params.search && params.searchFields && params.searchFields.length > 0) {
      const searchConditions = params.searchFields.map(field => ({
        [field]: { [Op.iLike]: `%${params.search}%` }
      }));
      
      if (searchConditions.length > 0) {
        (where as any)[Op.or] = searchConditions;
      }
    }

    return where;
  }

  /**
   * 构建关联查询选项
   */
  private static buildIncludeOptions(params: EnhancedQueryParams, defaultInclude?: any[]): any[] {
    if (params.includeAll) {
      return { all: true } as any;
    }

    const includes: any[] = [];

    // 添加默认关联
    if (defaultInclude) {
      includes.push(...defaultInclude);
    }

    // 添加请求的关联
    if (params.include) {
      const includeFields = Array.isArray(params.include) ? params.include : [params.include];
      
      includeFields.forEach(field => {
        // 支持简单字符串和复杂对象
        if (typeof field === 'string') {
          includes.push({ association: field });
        } else {
          includes.push(field);
        }
      });
    }

    return includes;
  }

  /**
   * 解析 WHERE 条件
   */
  private static parseWhereConditions(conditions: Record<string, any>): WhereOptions {
    const where: WhereOptions = {};

    Object.entries(conditions).forEach(([key, value]) => {
      // 处理操作符
      if (key.includes('__')) {
        const [field, operator] = key.split('__');
        const op = QUERY_OPERATORS[operator as keyof typeof QUERY_OPERATORS];
        
        if (op) {
          where[field] = { [op]: this.parseValue(value, operator) };
        } else {
          where[key] = value;
        }
      }
      // 处理数组值 (IN 操作)
      else if (Array.isArray(value)) {
        where[key] = { [Op.in]: value };
      }
      // 处理对象值 (复杂条件)
      else if (typeof value === 'object' && value !== null) {
        where[key] = this.parseWhereConditions(value);
      }
      // 处理简单值
      else {
        where[key] = value;
      }
    });

    return where;
  }

  /**
   * 解析值
   */
  private static parseValue(value: any, operator?: string): any {
    // 处理特殊操作符的值
    switch (operator) {
      case 'in':
      case 'notIn':
        return Array.isArray(value) ? value : value.split(',');
      
      case 'between':
        if (Array.isArray(value) && value.length === 2) {
          return value;
        }
        if (typeof value === 'string') {
          return value.split(',').map(v => v.trim());
        }
        return value;
      
      case 'like':
      case 'ilike':
        return value.includes('%') ? value : `%${value}%`;
      
      default:
        return value;
    }
  }

  /**
   * 解析数字
   */
  private static parseNumber(value: any, defaultValue?: number, min?: number, max?: number): number | undefined {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }
    
    const num = parseInt(value);
    if (isNaN(num)) {
      return defaultValue;
    }
    
    if (min !== undefined && num < min) {
      return min;
    }
    if (max !== undefined && num > max) {
      return max;
    }
    
    return num;
  }

  /**
   * 解析字符串数组
   */
  private static parseStringArray(value: any): string[] | undefined {
    if (!value) return undefined;
    
    if (Array.isArray(value)) {
      return value.map(v => String(v));
    }
    
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim()).filter(v => v);
    }
    
    return undefined;
  }

  /**
   * 解析排序方向
   */
  private static parseOrder(value: any): 'ASC' | 'DESC' | ('ASC' | 'DESC')[] | undefined {
    if (!value) return undefined;
    
    if (Array.isArray(value)) {
      return value.map(v => String(v).toUpperCase() === 'DESC' ? 'DESC' : 'ASC');
    }
    
    return String(value).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  }

  /**
   * 解析布尔值
   */
  private static parseBoolean(value: any, defaultValue?: boolean): boolean | undefined {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }
    
    if (typeof value === 'boolean') {
      return value;
    }
    
    const str = String(value).toLowerCase();
    return ['true', '1', 'yes', 'on'].includes(str);
  }

  /**
   * 解析对象
   */
  private static parseObject(value: any): Record<string, any> | undefined {
    if (!value) return undefined;
    
    if (typeof value === 'object') {
      return value;
    }
    
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  /**
   * 解析过滤器
   */
  private static parseFilters(value: any): Record<string, any> | undefined {
    return this.parseObject(value);
  }

  /**
   * 解析 WHERE 条件
   */
  private static parseWhere(value: any): Record<string, any> | undefined {
    return this.parseObject(value);
  }
}

/**
 * Express 中间件：查询增强
 */
export function queryEnhancer(req: Request, res: Response, next: NextFunction) {
  try {
    // 解析查询参数
    req.queryParams = QueryEnhancer.parseQueryParams(req);
    
    // 构建 Sequelize 查询选项
    req.findOptions = QueryEnhancer.buildFindOptions(req.queryParams);
    
    next();
  } catch (error) {
    console.error('查询参数解析失败:', error);
    res.status(400).json({
      success: false,
      message: '查询参数格式错误',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}

// 扩展 Request 接口
declare global {
  namespace Express {
    interface Request {
      queryParams?: EnhancedQueryParams;
      findOptions?: FindOptions;
    }
  }
}

export default QueryEnhancer;