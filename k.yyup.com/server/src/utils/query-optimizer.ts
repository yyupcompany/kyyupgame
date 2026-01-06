/**
 * 查询优化工具
 * 用于优化Sequelize查询性能，包括关联查询优化、批量查询优化和分页查询优化
 */

import { Model, FindOptions, Includeable, Op, Transaction, WhereOptions, ModelStatic, CountOptions, Sequelize } from 'sequelize';
import { queryOptimizationConfig } from '../config/database-optimization';
import dbMonitor from './db-monitor';
import { QueryTypes } from 'sequelize';

/**
 * 优化的查询选项
 */
export interface OptimizedQueryOptions {
  // 是否启用查询缓存
  useCache?: boolean;
  
  // 缓存过期时间(秒)
  cacheTTL?: number;
  
  // 是否使用计数估算
  useCountEstimation?: boolean;
  
  // 是否跳过关联计数
  skipAssociationCount?: boolean;
  
  // 是否记录查询性能
  trackPerformance?: boolean;
  
  // 查询优先级（用于日志和监控）
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  
  // 自定义查询描述（用于日志和监控）
  queryDescription?: string;
}

/**
 * 分页查询结果
 */
export interface PaginatedResult<T> {
  rows: T[];
  count: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * 查询分析结果
 */
export interface QueryAnalysisResult {
  explainResults: any[];
  recommendations: {
    issue: string;
    recommendation: string;
    optimizedQuery?: string;
  }[];
}

/**
 * 优化基本查询
 * @param modelClass 模型类
 * @param options 查询选项
 * @param optimizedOptions 优化选项
 * @returns 查询结果
 */
export async function optimizedFindAll<T extends Model>(
  modelClass: ModelStatic<T>,
  options: FindOptions,
  optimizedOptions: OptimizedQueryOptions = {}
): Promise<T[]> {
  const startTime = Date.now();
  const queryDescription = optimizedOptions.queryDescription || `${modelClass.name}.findAll`;
  let result: T[] = [];
  let error: Error | undefined;
  
  try {
    // 应用查询优化
    const optimizedFindOptions = optimizeQueryOptions(options);
    
    // 执行查询
    result = await modelClass.findAll(optimizedFindOptions) as T[];
    
    return result;
  } catch (err) {
    error = err as Error;
    throw err;
  } finally {
    // 记录查询性能
    if (optimizedOptions.trackPerformance !== false) {
      const executionTime = Date.now() - startTime;
      dbMonitor.recordQueryPerformance(queryDescription, executionTime, error);
    }
  }
}

/**
 * 优化分页查询
 * @param sequelize Sequelize 实例
 * @param modelClass 模型类
 * @param options 查询选项
 * @param page 页码（从1开始）
 * @param pageSize 每页大小
 * @param optimizedOptions 优化选项
 * @returns 分页查询结果
 */
export async function optimizedPaginate<T extends Model>(
  sequelize: Sequelize,
  modelClass: ModelStatic<T>,
  options: FindOptions,
  page = 1,
  pageSize = 10,
  optimizedOptions: OptimizedQueryOptions = {}
): Promise<PaginatedResult<T>> {
  const startTime = Date.now();
  const queryDescription = optimizedOptions.queryDescription || `${modelClass.name}.paginate`;
  let error: Error | undefined;
  
  try {
    // 验证分页参数
    page = Math.max(1, page);
    pageSize = Math.min(100, Math.max(1, pageSize)); // 限制最大页面大小为100
    
    // 计算偏移量
    const offset = (page - 1) * pageSize;
    
    // 准备查询选项
    const findOptions: FindOptions = {
      ...options,
      limit: pageSize,
      offset
    };
    
    // 优化查询选项
    const optimizedFindOptions = optimizeQueryOptions(findOptions);
    
    // 并行执行查询和计数
    const [rows, count] = await Promise.all([
      modelClass.findAll(optimizedFindOptions) as Promise<T[]>,
      getRowCount(sequelize, modelClass, options, optimizedOptions)
    ]);
    
    // 计算分页信息
    const totalPages = Math.ceil(count / pageSize);
    const hasMore = page < totalPages;
    
    return {
      rows,
      count,
      totalPages,
      currentPage: page,
      pageSize,
      hasMore
    };
  } catch (err) {
    error = err as Error;
    throw err;
  } finally {
    // 记录查询性能
    if (optimizedOptions.trackPerformance !== false) {
      const executionTime = Date.now() - startTime;
      dbMonitor.recordQueryPerformance(queryDescription, executionTime, error);
    }
  }
}

/**
 * 优化批量创建
 * @param sequelize Sequelize 实例
 * @param modelClass 模型类
 * @param records 要创建的记录
 * @param optimizedOptions 优化选项
 * @returns 创建的记录
 */
export async function optimizedBulkCreate<T extends Model>(
  sequelize: Sequelize,
  modelClass: ModelStatic<T>,
  records: object[],
  optimizedOptions: OptimizedQueryOptions = {}
): Promise<T[]> {
  const startTime = Date.now();
  const queryDescription = optimizedOptions.queryDescription || `${modelClass.name}.bulkCreate`;
  let error: Error | undefined;
  
  try {
    // 检查记录数量，如果超过限制，则分批处理
    const bulkLimit = queryOptimizationConfig.bulkOperationLimit;
    
    if (records.length <= bulkLimit) {
      // 直接创建
      return await modelClass.bulkCreate(records as any) as T[];
    } else {
      // 分批处理
      const result: T[] = [];
      
      // 开启事务
      await sequelize.transaction(async (transaction: Transaction) => {
        // 分批处理
        for (let i = 0; i < records.length; i += bulkLimit) {
          const batch = records.slice(i, i + bulkLimit);
          const batchResult = await modelClass.bulkCreate(batch as any, { transaction }) as T[];
          result.push(...batchResult);
        }
      });
      
      return result;
    }
  } catch (err) {
    error = err as Error;
    throw err;
  } finally {
    // 记录查询性能
    if (optimizedOptions.trackPerformance !== false) {
      const executionTime = Date.now() - startTime;
      dbMonitor.recordQueryPerformance(queryDescription, executionTime, error);
    }
  }
}

/**
 * 优化批量更新
 * @param sequelize Sequelize 实例
 * @param modelClass 模型类
 * @param values 要更新的值
 * @param options 查询选项
 * @param optimizedOptions 优化选项
 * @returns 更新的行数
 */
export async function optimizedBulkUpdate<T extends Model>(
  sequelize: Sequelize,
  modelClass: ModelStatic<T>,
  values: object,
  options: { where: WhereOptions },
  optimizedOptions: OptimizedQueryOptions = {}
): Promise<[affectedCount: number]> {
  const startTime = Date.now();
  const queryDescription = optimizedOptions.queryDescription || `${modelClass.name}.update`;
  let error: Error | undefined;
  
  try {
    // 检查是否会影响大量记录
    const count = await getRowCount(sequelize, modelClass, options, optimizedOptions);
    
    // 如果影响的记录数量过大，考虑分批更新
    if (count > queryOptimizationConfig.bulkOperationLimit) {
      // 实现分批更新的逻辑取决于具体的WHERE条件
      // 对于简单的条件，可以按ID范围分批
      // 这里只是一个示例，实际实现可能更复杂
      console.warn(`大批量更新操作: ${queryDescription}, 影响 ${count} 行`);
    }
    
    // 执行更新
    const [affectedCount] = await modelClass.update(values as any, options as any);
    return [affectedCount];
  } catch (err) {
    error = err as Error;
    throw err;
  } finally {
    // 记录查询性能
    if (optimizedOptions.trackPerformance !== false) {
      const executionTime = Date.now() - startTime;
      dbMonitor.recordQueryPerformance(queryDescription, executionTime, error);
    }
  }
}

/**
 * 优化关联查询
 * @param modelClass 模型类
 * @param options 查询选项
 * @param associations 要包含的关联
 * @param optimizedOptions 优化选项
 * @returns 查询结果
 */
export async function optimizedFindWithAssociations<T extends Model>(
  modelClass: ModelStatic<T>,
  options: FindOptions,
  associations: string[],
  optimizedOptions: OptimizedQueryOptions = {}
): Promise<T[]> {
  const startTime = Date.now();
  const queryDescription = optimizedOptions.queryDescription || `${modelClass.name}.findWithAssociations`;
  let error: Error | undefined;
  
  try {
    // 准备查询选项
    const findOptions: FindOptions = {
      ...options,
      include: prepareAssociationIncludes(modelClass, associations)
    };
    
    // 优化查询选项
    const optimizedFindOptions = optimizeQueryOptions(findOptions);
    
    // 执行查询
    return await modelClass.findAll(optimizedFindOptions) as T[];
  } catch (err) {
    error = err as Error;
    throw err;
  } finally {
    // 记录查询性能
    if (optimizedOptions.trackPerformance !== false) {
      const executionTime = Date.now() - startTime;
      dbMonitor.recordQueryPerformance(queryDescription, executionTime, error);
    }
  }
}

/**
 * 准备关联包含选项
 * @param modelClass 模型类
 * @param associations 关联名称数组
 * @returns 包含选项
 */
function prepareAssociationIncludes(
  modelClass: typeof Model,
  associations: string[]
): Includeable[] {
  // 获取模型的所有关联
  const modelAssociations = Object.keys(modelClass.associations || {});
  
  // 验证并过滤关联
  const validAssociations = associations.filter(assoc => {
    // 检查是否是有效的关联
    const isValid = modelAssociations.includes(assoc);
    if (!isValid) {
      console.warn(`无效的关联: ${assoc} 不是 ${modelClass.name} 的关联`);
    }
    return isValid;
  });
  
  // 构建include选项
  return validAssociations.map(assoc => ({
    association: assoc,
    // 可以添加其他优化选项，如limit, attributes等
  }));
}

/**
 * 优化查询选项
 * @param options 原始查询选项
 * @returns 优化后的查询选项
 */
function optimizeQueryOptions(options: FindOptions): FindOptions {
  // 创建新的选项对象，避免修改原始对象
  const optimizedOptions: FindOptions = { ...options };
  
  // 优化嵌套查询
  if (optimizedOptions.include) {
    // 处理嵌套查询，减少不必要的关联加载
    optimizeIncludes(optimizedOptions.include as Includeable[]);
  }
  
  // 如果没有指定属性，且有关联查询，考虑只选择主要字段
  if (!optimizedOptions.attributes && optimizedOptions.include) {
    // 这需要了解模型的主要字段，这里只是一个示例
    // optimizedOptions.attributes = ['id', 'name', 'createdAt', 'updatedAt'];
  }
  
  return optimizedOptions;
}

/**
 * 优化包含选项
 * @param includes 包含选项数组
 */
function optimizeIncludes(includes: Includeable[]): void {
  // 遍历所有包含选项
  for (let i = 0; i < includes.length; i++) {
    const include = includes[i] as any;
    
    // 如果include是对象且有嵌套包含
    if (include && typeof include === 'object' && include.include) {
      // 递归优化嵌套包含
      optimizeIncludes(Array.isArray(include.include) ? include.include : [include.include]);
    }
    
    // 如果没有指定属性，考虑只选择主要字段
    if (include && !include.attributes) {
      // 这需要了解模型的主要字段，这里只是一个示例
      // include.attributes = ['id', 'name', 'createdAt', 'updatedAt'];
    }
    
    // 如果是多对多关系，考虑不加载中间表数据
    if (include && include.through) {
      include.through = { attributes: [] };
    }
  }
}

/**
 * 获取行数
 * @param sequelize Sequelize 实例
 * @param modelClass 模型类
 * @param options 查询选项
 * @param optimizedOptions 优化选项
 * @returns 行数
 */
async function getRowCount<T extends Model>(
  sequelize: Sequelize,
  modelClass: ModelStatic<T>,
  options: FindOptions,
  optimizedOptions: OptimizedQueryOptions = {}
): Promise<number> {
  // 如果使用计数估算且表很大，可以使用EXPLAIN来估算
  if (optimizedOptions.useCountEstimation) {
    try {
      // 使用EXPLAIN获取估计行数
      const tableName = modelClass.getTableName();
      const [results] = await sequelize.query(`EXPLAIN SELECT * FROM \`${tableName}\``);
      
      const estimatedRows = (results[0] as { rows: number | null })?.rows;
      if (estimatedRows && typeof estimatedRows === 'number') {
        return estimatedRows;
      }
    } catch (error) {
      console.warn('计数估算失败，回退到标准计数', error);
    }
  }
  
  // 如果跳过关联计数，移除include选项
  const countOptions = { ...options };
  if (optimizedOptions.skipAssociationCount && countOptions.include) {
    delete countOptions.include;
  }
  
  // 执行计数查询
  const result = await modelClass.count(countOptions as any);
  // 处理结果可能是数组的情况
  return typeof result === 'number' ? result : 0;
}

/**
 * 分析SQL查询
 * @param sequelize Sequelize 实例
 * @param query SQL查询语句
 * @returns 查询分析结果
 */
export async function analyzeQuery(sequelize: Sequelize, query: string): Promise<QueryAnalysisResult> {
  try {
    // 执行EXPLAIN查询
    const explainResults = await sequelize.query(`EXPLAIN ${query}`, {
      type: QueryTypes.SELECT
    });
    
    // 基于查询计划生成优化建议
    const recommendations = analyzeQueryPlan(explainResults, query);
    
    return {
      explainResults,
      recommendations
    };
  } catch (error) {
    console.error('分析查询失败:', error);
    return {
      explainResults: [],
      recommendations: [{
        issue: '查询分析失败',
        recommendation: '检查SQL语法是否正确',
        optimizedQuery: undefined
      }]
    };
  }
}

/**
 * 分析查询计划并生成优化建议
 * @param queryPlan 查询计划
 * @param originalQuery 原始查询
 * @returns 优化建议
 */
function analyzeQueryPlan(queryPlan: any[], originalQuery: string): { issue: string; recommendation: string; optimizedQuery?: string }[] {
  const recommendations: { issue: string; recommendation: string; optimizedQuery?: string }[] = [];
  
  // 检查是否存在全表扫描
  const hasTableScan = queryPlan.some(row => 
    row.type === 'ALL' || 
    (row.key === null && row.possible_keys === null)
  );
  
  if (hasTableScan) {
    recommendations.push({
      issue: '查询执行了全表扫描',
      recommendation: '考虑添加索引或修改WHERE条件以使用现有索引',
      optimizedQuery: undefined
    });
  }
  
  // 检查是否使用了索引但进行了大量行扫描
  const highRowsScanned = queryPlan.some(row => 
    row.rows && parseInt(row.rows, 10) > 1000 && row.key
  );
  
  if (highRowsScanned) {
    recommendations.push({
      issue: '查询使用了索引但扫描了大量行',
      recommendation: '考虑优化索引或添加更多筛选条件',
      optimizedQuery: undefined
    });
  }
  
  // 检查是否有可能的JOIN优化
  const hasJoin = originalQuery.toLowerCase().includes('join');
  const hasMultipleTables = queryPlan.filter(row => row.table).length > 1;
  
  if (hasJoin || hasMultipleTables) {
    // 复杂JOIN查询可能需要优化
    const joinOptimization = checkJoinOptimization(queryPlan, originalQuery);
    if (joinOptimization) {
      recommendations.push(joinOptimization);
    }
  }
  
  return recommendations;
}

/**
 * 检查JOIN优化可能性
 * @param queryPlan 查询计划
 * @param originalQuery 原始查询
 * @returns 优化建议
 */
function checkJoinOptimization(queryPlan: any[], originalQuery: string): { issue: string; recommendation: string; optimizedQuery?: string } | null {
  // 检查JOIN顺序是否可能不优
  const joinTables = queryPlan.filter(row => row.table && row.type.includes('JOIN'));
  
  if (joinTables.length > 1) {
    const largeTableFirst = joinTables.some(row => parseInt(row.rows, 10) > 1000 && row.id === 1);
    
    if (largeTableFirst) {
      return {
        issue: 'JOIN顺序可能不优',
        recommendation: '考虑调整JOIN顺序，将小表放在前面',
        optimizedQuery: undefined
      };
    }
  }
  
  // 检查是否缺少JOIN条件的索引
  const missingJoinIndex = queryPlan.some(row => 
    row.type.includes('JOIN') && 
    row.key === null && 
    row.possible_keys === null
  );
  
  if (missingJoinIndex) {
    return {
      issue: 'JOIN条件缺少索引',
      recommendation: '在JOIN条件中使用的列上添加索引',
      optimizedQuery: undefined
    };
  }
  
  return null;
}

export default {
  optimizedFindAll,
  optimizedPaginate,
  optimizedBulkCreate,
  optimizedBulkUpdate,
  optimizedFindWithAssociations,
  analyzeQuery
}; 