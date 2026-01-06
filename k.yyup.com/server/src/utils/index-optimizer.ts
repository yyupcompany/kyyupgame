/**
 * 索引优化工具
 * 用于分析和推荐表索引、检测未使用的索引和维护索引
 */

import {  QueryTypes, Sequelize } from 'sequelize';
import { getIndexUsageStats, getTableStats } from './db-monitor';

/**
 * 索引推荐
 */
interface IndexRecommendation {
  tableName: string;
  columnName: string;
  recommendationType: 'CREATE' | 'DROP' | 'MODIFY';
  reason: string;
  suggestedSQL?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * 索引状态报告
 */
interface IndexReport {
  totalIndexes: number;
  unusedIndexes: number;
  duplicateIndexes: number;
  missingIndexes: number;
  recommendations: IndexRecommendation[];
}

// 添加接口定义
interface ForeignKey {
  tableName: string;
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
  tableRows: number;
}

interface Index {
  tableName: string;
  columnName: string;
  indexName: string;
  isUnique: boolean;
}

/**
 * 获取所有表的索引信息
 * @param sequelize Sequelize 实例
 * @returns 索引信息数组
 */
async function getAllIndexes(sequelize: Sequelize): Promise<Index[]> {
  try {
    const dbName = sequelize.getDatabaseName();
    
    const indexes = await sequelize.query(
      `SELECT 
        t.table_name AS tableName, 
        s.index_name AS indexName, 
        s.column_name AS columnName,
        s.seq_in_index AS seqInIndex,
        s.non_unique AS nonUnique,
        s.index_type AS indexType
      FROM 
        information_schema.statistics s
      JOIN 
        information_schema.tables t ON s.table_schema = t.table_schema AND s.table_name = t.table_name
      WHERE 
        s.table_schema = :dbName
      ORDER BY 
        s.table_name, s.index_name, s.seq_in_index`,
      {
        replacements: { dbName },
        type: QueryTypes.SELECT
      }
    );
    
    return indexes.map((idx: any) => ({
      tableName: idx.tableName,
      columnName: idx.columnName,
      indexName: idx.indexName,
      isUnique: idx.nonUnique === 0
    }));
  } catch (error) {
    console.error('获取索引信息失败:', error);
    return [];
  }
}

/**
 * 获取所有外键关系
 * @param sequelize Sequelize 实例
 * @returns 外键关系数组
 */
async function findForeignKeys(sequelize: Sequelize): Promise<ForeignKey[]> {
  try {
    const dbName = sequelize.getDatabaseName();
    const foreignKeys = await sequelize.query(
      `SELECT
        k.table_name AS tableName,
        k.column_name AS columnName,
        k.referenced_table_name AS referencedTable,
        k.referenced_column_name AS referencedColumn,
        t.table_rows AS tableRows
      FROM
        information_schema.key_column_usage k
      JOIN
        information_schema.tables t ON k.table_schema = t.table_schema AND k.table_name = t.table_name
      WHERE
        k.referenced_table_schema = :dbName
        AND k.referenced_table_name IS NOT NULL
      ORDER BY
        k.table_name, k.column_name`,
      {
        replacements: { dbName },
        type: QueryTypes.SELECT
      }
    );
    
    return foreignKeys as ForeignKey[];
  } catch (error) {
    console.error('获取外键关系失败:', error);
    return [];
  }
}

/**
 * 查找外键的对应索引
 * @param sequelize Sequelize 实例
 * @param fk 外键
 * @returns 对应的索引
 */
async function findIndexesForForeignKey(sequelize: Sequelize, fk: ForeignKey): Promise<Index[]> {
  const indexes = await getAllIndexes(sequelize);
  return indexes.filter(idx => 
    idx.tableName === fk.tableName &&
    idx.columnName === fk.columnName
  );
}

/**
 * 分析表索引使用情况并生成优化建议
 * @param sequelize Sequelize 实例
 * @param tableName 可选的表名，如果提供则只分析指定表
 * @returns 索引优化报告
 */
export async function analyzeIndexes(sequelize: Sequelize, tableName?: string): Promise<IndexReport> {
  try {
    // 1. 获取所有表的索引信息
    const allIndexes = await getAllIndexes(sequelize);
    
    // 过滤特定表的索引（如果提供了表名）
    const filteredIndexes = tableName 
      ? allIndexes.filter(idx => idx.tableName === tableName)
      : allIndexes;
    
    // 2. 获取索引使用情况
    const indexUsage = await getIndexUsageStats(sequelize);
    
    // 3. 获取表统计信息
    const tableStats = await getTableStats(sequelize);
    
    // 4. 分析未使用的索引
    const unusedIndexes = findUnusedIndexes(filteredIndexes, indexUsage);
    
    // 5. 分析重复索引
    const duplicateIndexes = findDuplicateIndexes(filteredIndexes);
    
    // 6. 分析缺失索引
    const missingIndexes = await findMissingIndexes(sequelize, tableName);
    
    // 7. 生成推荐
    const recommendations: IndexRecommendation[] = [
      ...generateDropRecommendations(unusedIndexes),
      ...generateDropRecommendations(duplicateIndexes),
      ...generateCreateRecommendations(missingIndexes)
    ];
    
    // 8. 返回报告
    return {
      totalIndexes: filteredIndexes.length,
      unusedIndexes: unusedIndexes.length,
      duplicateIndexes: duplicateIndexes.length,
      missingIndexes: missingIndexes.length,
      recommendations
    };
  } catch (error) {
    console.error('分析索引失败:', error);
    return {
      totalIndexes: 0,
      unusedIndexes: 0,
      duplicateIndexes: 0,
      missingIndexes: 0,
      recommendations: []
    };
  }
}

/**
 * 查找未使用的索引
 * @param allIndexes 所有索引
 * @param indexUsage 索引使用情况
 * @returns 未使用的索引
 */
function findUnusedIndexes(allIndexes: Index[], indexUsage: any[]): Index[] {
  // 在MySQL中，我们没有详细的索引使用统计，所以这里主要是排除主键索引和唯一索引
  const unusedIndexes = allIndexes.filter(index => {
    // 跳过主键索引
    if (index.indexName === 'PRIMARY') {
      return false;
    }
    
    // 跳过唯一索引
    if (index.isUnique) {
      return false;
    }
    
    // 在实际环境中，这里应该通过索引使用情况数据来判断
    // 但在MySQL中获取这些数据较为困难，需要性能模式(performance_schema)支持
    return false; // 默认不推荐删除任何索引，除非有明确证据表明它未被使用
  });
  
  return unusedIndexes;
}

/**
 * 查找重复索引
 * @param allIndexes 所有索引
 * @returns 重复索引
 */
function findDuplicateIndexes(allIndexes: Index[]): Index[] {
  // 按表名分组
  const indexesByTable: Record<string, Index[]> = {};
  allIndexes.forEach(index => {
    if (!indexesByTable[index.tableName]) {
      indexesByTable[index.tableName] = [];
    }
    indexesByTable[index.tableName].push(index);
  });
  
  const duplicates: Index[] = [];
  
  // 检查每个表的索引
  Object.keys(indexesByTable).forEach(tableName => {
    const tableIndexes = indexesByTable[tableName];
    
    // 按列名分组
    const columnToIndexes: Record<string, Index[]> = {};
    tableIndexes.forEach(index => {
      if (!columnToIndexes[index.columnName]) {
        columnToIndexes[index.columnName] = [];
      }
      columnToIndexes[index.columnName].push(index);
    });
    
    // 查找同一列有多个索引的情况
    Object.keys(columnToIndexes).forEach(columnName => {
      const columnIndexes = columnToIndexes[columnName];
      if (columnIndexes.length > 1) {
        // 排除主键索引
        const nonPrimaryIndexes = columnIndexes.filter(idx => idx.indexName !== 'PRIMARY');
        if (nonPrimaryIndexes.length > 1) {
          // 保留第一个，其余标记为重复
          for (let i = 1; i < nonPrimaryIndexes.length; i++) {
            duplicates.push(nonPrimaryIndexes[i]);
          }
        }
      }
    });
  });
  
  return duplicates;
}

/**
 * 查找可能缺失的索引
 * @param sequelize Sequelize 实例
 * @param tableName 可选的表名，如果提供则只分析指定表
 * @returns 缺失索引建议
 */
async function findMissingIndexes(sequelize: Sequelize, tableName?: string): Promise<Array<{
  tableName: string;
  columnName: string;
  reason: string;
  tableRows: number;
}>> {
  const missingIndexes: Array<{
    tableName: string;
    columnName: string;
    reason: string;
    tableRows: number;
  }> = [];

  // 获取所有外键
  const foreignKeys = await findForeignKeys(sequelize);
  
  // 如果提供了表名，过滤外键
  const filteredForeignKeys = tableName 
    ? foreignKeys.filter(fk => fk.tableName === tableName) 
    : foreignKeys;
  
  // 检查每个外键是否有对应的索引
  for (const fk of filteredForeignKeys) {
    const indexes = await findIndexesForForeignKey(sequelize, fk);
    
    if (indexes.length === 0) {
      missingIndexes.push({
        tableName: fk.tableName,
        columnName: fk.columnName,
        reason: `外键关系到 ${fk.referencedTable}.${fk.referencedColumn}`,
        tableRows: fk.tableRows
      });
    }
  }

  return missingIndexes;
}

/**
 * 生成删除索引建议
 * @param indexes 要删除的索引
 * @returns 索引删除建议
 */
function generateDropRecommendations(indexes: any[]): IndexRecommendation[] {
  return indexes.map(index => ({
    tableName: index.tableName,
    columnName: index.columnName,
    recommendationType: 'DROP',
    reason: `索引 ${index.indexName} 未被使用或与其他索引重复`,
    suggestedSQL: `DROP INDEX \`${index.indexName}\` ON \`${index.tableName}\`;`,
    priority: 'LOW'
  }));
}

/**
 * 生成创建索引建议
 * @param indexes 要创建的索引
 * @returns 索引创建建议
 */
function generateCreateRecommendations(indexes: any[]): IndexRecommendation[] {
  return indexes.map(index => ({
    tableName: index.tableName,
    columnName: index.columnName,
    recommendationType: 'CREATE',
    reason: `外键列 ${index.columnName} 缺少索引，可能导致连接性能问题`,
    suggestedSQL: `CREATE INDEX \`idx_${index.tableName}_${index.columnName}\` ON \`${index.tableName}\` (\`${index.columnName}\`);`,
    priority: index.tableRows > 10000 ? 'HIGH' : 'MEDIUM'
  }));
}

/**
 * 执行索引优化
 * @param sequelize Sequelize 实例
 * @param recommendation 索引推荐
 * @returns 是否成功
 */
export async function executeIndexOptimization(sequelize: Sequelize, recommendation: IndexRecommendation): Promise<boolean> {
  if (!recommendation.suggestedSQL) {
    return false;
  }
  
  try {
    await sequelize.query(recommendation.suggestedSQL);
    console.log(`成功执行: ${recommendation.suggestedSQL}`);
    return true;
  } catch (error) {
    console.error(`执行失败: ${recommendation.suggestedSQL}`, error);
    return false;
  }
}

/**
 * 获取表的索引优化建议
 * @param sequelize Sequelize 实例
 * @param tableName 表名
 * @returns 索引优化建议
 */
export async function getTableIndexRecommendations(sequelize: Sequelize, tableName: string): Promise<IndexRecommendation[]> {
  const report = await analyzeIndexes(sequelize, tableName);
  return report.recommendations;
}

export default {
  analyzeIndexes,
  executeIndexOptimization,
  getTableIndexRecommendations
}; 