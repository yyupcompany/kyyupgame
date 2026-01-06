/**
 * 搜索工具类
 * 提供统一的搜索功能和查询构建
 */

import { Op, WhereOptions } from 'sequelize';

// 搜索配置接口
export interface SearchConfig {
  // 搜索字段映射
  searchFields: string[];
  // 过滤字段配置
  filterFields?: FilterFieldConfig[];
  // 排序配置
  sortFields?: string[];
  // 默认排序
  defaultSort?: { field: string; order: 'ASC' | 'DESC' };
}

// 过滤字段配置
export interface FilterFieldConfig {
  field: string;
  type: 'exact' | 'range' | 'in' | 'like' | 'date_range';
  sqlField?: string; // 实际的SQL字段名（支持表别名）
  validator?: (value: any) => boolean;
  transformer?: (value: any) => any;
}

// 搜索参数接口
export interface SearchParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: any; // 其他过滤条件
}

// 查询构建结果
export interface QueryBuildResult {
  whereClause: string;
  replacements: Record<string, any>;
  orderBy: string;
  limit: number;
  offset: number;
}

/**
 * 搜索工具类
 */
export class SearchHelper {
  /**
   * 构建搜索查询条件
   * @param params 搜索参数
   * @param config 搜索配置
   * @param tableAlias 表别名
   * @returns 查询构建结果
   */
  static buildSearchQuery(
    params: SearchParams,
    config: SearchConfig,
    tableAlias: string = 't'
  ): QueryBuildResult {
    const whereConditions: string[] = [];
    const replacements: Record<string, any> = {};
    
    // 处理关键词搜索
    if (params.keyword && config.searchFields.length > 0) {
      const keywordConditions = config.searchFields.map(field => {
        const sqlField = field.includes('.') ? field : `${tableAlias}.${field}`;
        return `${sqlField} LIKE :keyword`;
      });
      
      whereConditions.push(`(${keywordConditions.join(' OR ')})`);
      replacements.keyword = `%${params.keyword}%`;
    }
    
    // 处理过滤条件
    if (config.filterFields) {
      for (const filterConfig of config.filterFields) {
        const paramValue = params[filterConfig.field];
        
        if (paramValue !== undefined && paramValue !== null && paramValue !== '') {
          // 验证参数
          if (filterConfig.validator && !filterConfig.validator(paramValue)) {
            continue;
          }
          
          // 转换参数值
          let value = filterConfig.transformer 
            ? filterConfig.transformer(paramValue) 
            : paramValue;
          
          const sqlField = filterConfig.sqlField || `${tableAlias}.${filterConfig.field}`;
          const paramKey = filterConfig.field;
          
          switch (filterConfig.type) {
            case 'exact':
              whereConditions.push(`${sqlField} = :${paramKey}`);
              replacements[paramKey] = value;
              break;
              
            case 'like':
              whereConditions.push(`${sqlField} LIKE :${paramKey}`);
              replacements[paramKey] = `%${value}%`;
              break;
              
            case 'in':
              if (Array.isArray(value) && value.length > 0) {
                whereConditions.push(`${sqlField} IN (:${paramKey})`);
                replacements[paramKey] = value;
              }
              break;
              
            case 'range':
              if (typeof value === 'object' && value.min !== undefined) {
                whereConditions.push(`${sqlField} >= :${paramKey}_min`);
                replacements[`${paramKey}_min`] = value.min;
              }
              if (typeof value === 'object' && value.max !== undefined) {
                whereConditions.push(`${sqlField} <= :${paramKey}_max`);
                replacements[`${paramKey}_max`] = value.max;
              }
              break;
              
            case 'date_range':
              if (typeof value === 'object') {
                if (value.startDate) {
                  whereConditions.push(`${sqlField} >= :${paramKey}_start`);
                  replacements[`${paramKey}_start`] = value.startDate;
                }
                if (value.endDate) {
                  whereConditions.push(`${sqlField} <= :${paramKey}_end`);
                  replacements[`${paramKey}_end`] = value.endDate;
                }
              }
              break;
          }
        }
      }
    }
    
    // 构建WHERE子句
    const whereClause = whereConditions.length > 0 ? whereConditions.join(' AND ') : '1=1';
    
    // 调试日志
    console.log('SearchHelper调试:', {
      whereConditions: whereConditions,
      whereClause: whereClause,
      replacements: replacements
    });
    
    // 构建ORDER BY子句
    let orderBy = '';
    if (params.sortBy && config.sortFields?.includes(params.sortBy)) {
      const sortField = params.sortBy.includes('.') ? params.sortBy : `${tableAlias}.${params.sortBy}`;
      const sortOrder = params.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      orderBy = `ORDER BY ${sortField} ${sortOrder}`;
    } else if (config.defaultSort) {
      const defaultField = config.defaultSort.field.includes('.') 
        ? config.defaultSort.field 
        : `${tableAlias}.${config.defaultSort.field}`;
      orderBy = `ORDER BY ${defaultField} ${config.defaultSort.order}`;
    }
    
    // 更多调试日志
    console.log('SearchHelper ORDER BY调试:', {
      orderBy: orderBy,
      configDefaultSort: config.defaultSort,
      sortFields: config.sortFields
    });
    
    // 计算分页
    const page = Math.max(1, parseInt(params.page?.toString() || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(params.pageSize?.toString() || '10')));
    const offset = (page - 1) * pageSize;
    
    return {
      whereClause,
      replacements,
      orderBy,
      limit: pageSize,
      offset
    };
  }
  
  /**
   * 构建Sequelize WHERE条件
   * @param params 搜索参数
   * @param config 搜索配置
   * @returns Sequelize WHERE条件对象
   */
  static buildSequelizeWhere(
    params: SearchParams,
    config: SearchConfig
  ): WhereOptions {
    const whereConditions: any = {};
    
    // 处理关键词搜索
    if (params.keyword && config.searchFields.length > 0) {
      const keywordConditions = config.searchFields.map(field => ({
        [field]: { [Op.like]: `%${params.keyword}%` }
      }));
      
      whereConditions[Op.or] = keywordConditions;
    }
    
    // 处理过滤条件
    if (config.filterFields) {
      for (const filterConfig of config.filterFields) {
        const paramValue = params[filterConfig.field];
        
        if (paramValue !== undefined && paramValue !== null && paramValue !== '') {
          // 验证参数
          if (filterConfig.validator && !filterConfig.validator(paramValue)) {
            continue;
          }
          
          // 转换参数值
          let value = filterConfig.transformer 
            ? filterConfig.transformer(paramValue) 
            : paramValue;
          
          const fieldName = filterConfig.sqlField || filterConfig.field;
          
          switch (filterConfig.type) {
            case 'exact':
              whereConditions[fieldName] = value;
              break;
              
            case 'like':
              whereConditions[fieldName] = { [Op.like]: `%${value}%` };
              break;
              
            case 'in':
              if (Array.isArray(value) && value.length > 0) {
                whereConditions[fieldName] = { [Op.in]: value };
              }
              break;
              
            case 'range':
              if (typeof value === 'object') {
                const rangeCondition: any = {};
                if (value.min !== undefined) rangeCondition[Op.gte] = value.min;
                if (value.max !== undefined) rangeCondition[Op.lte] = value.max;
                if (Object.keys(rangeCondition).length > 0) {
                  whereConditions[fieldName] = rangeCondition;
                }
              }
              break;
              
            case 'date_range':
              if (typeof value === 'object') {
                const dateCondition: any = {};
                if (value.startDate) dateCondition[Op.gte] = value.startDate;
                if (value.endDate) dateCondition[Op.lte] = value.endDate;
                if (Object.keys(dateCondition).length > 0) {
                  whereConditions[fieldName] = dateCondition;
                }
              }
              break;
          }
        }
      }
    }
    
    return whereConditions;
  }
  
  /**
   * 创建通用的搜索配置
   * @param searchFields 搜索字段
   * @param filterFields 过滤字段配置
   * @returns 搜索配置
   */
  static createConfig(
    searchFields: string[],
    filterFields: FilterFieldConfig[] = []
  ): SearchConfig {
    return {
      searchFields,
      filterFields,
      sortFields: ['created_at', 'updated_at', 'id'],
      defaultSort: { field: 'created_at', order: 'DESC' }
    };
  }
  
  /**
   * 预定义的搜索配置
   */
  static configs = {
    // 用户搜索配置
    user: SearchHelper.createConfig(
      ['u.real_name', 'u.username', 'u.phone', 'u.email'],
      [
        { field: 'status', type: 'exact' as const },
        { field: 'role', type: 'exact' as const },
        { field: 'kindergartenId', type: 'exact' as const, sqlField: 'u.kindergarten_id' }
      ]
    ),
    
    // 教师搜索配置
    teacher: SearchHelper.createConfig(
      ['u.real_name', 'u.phone', 'u.email', 't.teacher_no'],
      [
        { field: 'status', type: 'exact' as const, sqlField: 't.status' },
        { field: 'kindergartenId', type: 'exact' as const, sqlField: 't.kindergarten_id' },
        { field: 'position', type: 'exact' as const, sqlField: 't.position' }
      ]
    ),
    
    // 学生搜索配置
    student: SearchHelper.createConfig(
      ['s.name', 's.student_no', 'p.phone'],
      [
        { field: 'status', type: 'exact' as const, sqlField: 's.status' },
        { field: 'classId', type: 'exact' as const, sqlField: 's.class_id' },
        { field: 'grade', type: 'exact' as const, sqlField: 's.grade' }
      ]
    ),
    
    // 班级搜索配置
    class: SearchHelper.createConfig(
      ['c.name', 'c.description'],
      [
        { field: 'status', type: 'exact' as const, sqlField: 'c.status' },
        { field: 'grade', type: 'exact' as const, sqlField: 'c.grade' },
        { field: 'kindergartenId', type: 'exact' as const, sqlField: 'c.kindergarten_id' }
      ]
    ),
    
    // 申请搜索配置
    application: SearchHelper.createConfig(
      ['ea.student_name', 'u.real_name', 'u.phone'],
      [
        { field: 'status', type: 'exact' as const, sqlField: 'ea.status' },
        { field: 'planId', type: 'exact' as const, sqlField: 'ea.plan_id' },
        { 
          field: 'dateRange', 
          type: 'date_range' as const, 
          sqlField: 'ea.apply_date',
          transformer: (value: any) => {
            if (Array.isArray(value) && value.length === 2) {
              return { startDate: value[0], endDate: value[1] };
            }
            return value;
          }
        }
      ]
    )
  };
}

/**
 * 分页辅助函数
 */
export class PaginationHelper {
  /**
   * 获取分页参数
   */
  static getParams(page?: number, pageSize?: number) {
    const validPage = Math.max(1, parseInt(page?.toString() || '1'));
    const validPageSize = Math.min(100, Math.max(1, parseInt(pageSize?.toString() || '10')));
    const offset = (validPage - 1) * validPageSize;
    
    return {
      page: validPage,
      pageSize: validPageSize,
      offset,
      limit: validPageSize
    };
  }
  
  /**
   * 构建分页响应
   */
  static buildResponse<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number
  ) {
    const totalPages = Math.ceil(total / pageSize);
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }
}