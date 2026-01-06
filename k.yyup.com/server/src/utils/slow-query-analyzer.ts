/**
 * 慢查询分析工具
 * 用于识别、分析和优化慢查询
 */

import {  Sequelize, QueryTypes } from 'sequelize';
import { queryOptimizationConfig } from '../config/database-optimization';
import fs from 'fs';
import path from 'path';

/**
 * 慢查询信息接口
 */
interface SlowQuery {
  id: number;
  startTime: Date;
  queryTime: number; // 单位：秒
  user: string;
  host: string;
  query: string;
  lockTime: number;
  rowsExamined: number;
  rowsSent: number;
  schema: string;
}

/**
 * 慢查询模式枚举
 */
enum SlowQueryPattern {
  FULL_TABLE_SCAN = 'FULL_TABLE_SCAN',
  MISSING_INDEX = 'MISSING_INDEX',
  INEFFICIENT_JOIN = 'INEFFICIENT_JOIN',
  LARGE_RESULT_SET = 'LARGE_RESULT_SET',
  COMPLEX_SUBQUERY = 'COMPLEX_SUBQUERY',
  TEMPORARY_TABLE = 'TEMPORARY_TABLE',
  FILESORT = 'FILESORT',
  REDUNDANT_INDEX = 'REDUNDANT_INDEX',
  LOCK_WAIT = 'LOCK_WAIT'
}

/**
 * 慢查询优化建议接口
 */
interface SlowQueryRecommendation {
  queryId: number;
  originalQuery: string;
  pattern: SlowQueryPattern;
  recommendation: string;
  suggestedQuery?: string;
  suggestedIndex?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * 获取MySQL慢查询日志记录
 * @param sequelize Sequelize 实例
 * @param limit 最大记录数
 * @returns 慢查询记录列表
 */
export async function getSlowQueries(sequelize: Sequelize, limit = 100): Promise<SlowQuery[]> {
  try {
    // 检查是否启用了慢查询日志
    const [logStatus] = await sequelize.query(
      `SHOW VARIABLES LIKE 'slow_query_log'`,
      { type: QueryTypes.SELECT }
    ) as any[];
    
    if (!logStatus || logStatus.Value !== 'ON') {
      console.warn('MySQL慢查询日志未启用。建议在my.cnf中配置slow_query_log=1');
    }
    
    // 获取慢查询
    const slowQueries = await sequelize.query(`
      SELECT 
        id,
        start_time AS startTime,
        query_time AS queryTime, 
        user_host AS userHost,
        SUBSTRING_INDEX(user_host, '[', 1) AS user,
        SUBSTRING_INDEX(SUBSTRING_INDEX(user_host, '[', -1), ']', 1) AS host,
        db AS schema,
        query,
        lock_time AS lockTime,
        rows_examined AS rowsExamined,
        rows_sent AS rowsSent
      FROM 
        mysql.slow_log
      ORDER BY 
        start_time DESC
      LIMIT :limit
    `, {
      replacements: { limit },
      type: QueryTypes.SELECT
    });
    
    return slowQueries as SlowQuery[];
  } catch (error) {
    console.error('获取慢查询记录失败:', error);
    
    // 尝试从慢查询日志文件读取
    try {
      return parseSlowQueryLogFile(sequelize, limit);
    } catch (fileError) {
      console.error('从文件解析慢查询日志失败:', fileError);
      return [];
    }
  }
}

/**
 * 从慢查询日志文件解析慢查询
 * @param sequelize Sequelize 实例
 * @param limit 最大记录数
 * @returns 慢查询记录列表
 */
function parseSlowQueryLogFile(sequelize: Sequelize, limit = 100): SlowQuery[] {
  // 尝试从常见的慢查询日志位置读取
  const possibleLogPaths = [
    '/var/log/mysql/mysql-slow.log',
    '/var/log/mysql-slow.log',
    '/var/lib/mysql/slow-queries.log'
  ];
  
  let logContent = '';
  
  for (const logPath of possibleLogPaths) {
    if (fs.existsSync(logPath)) {
      try {
        // 只读取文件末尾部分以提高效率
        const stats = fs.statSync(logPath);
        const fileSize = stats.size;
        const readSize = Math.min(fileSize, 1024 * 1024 * 5); // 最多读取5MB
        
        const buffer = Buffer.alloc(readSize);
        const fileDescriptor = fs.openSync(logPath, 'r');
        fs.readSync(fileDescriptor, buffer, 0, readSize, fileSize - readSize);
        fs.closeSync(fileDescriptor);
        
        logContent = buffer.toString('utf8');
        break;
      } catch (error) {
        console.error(`读取慢查询日志文件 ${logPath} 失败:`, error);
      }
    }
  }
  
  if (!logContent) {
    return [];
  }
  
  // 解析慢查询日志格式
  const slowQueries: SlowQuery[] = [];
  const queryBlocks = logContent.split(/# Time:/);
  
  for (let i = 1; i < Math.min(queryBlocks.length, limit + 1); i++) {
    try {
      const block = queryBlocks[i];
      
      // 解析时间
      const timeMatch = block.match(/^([^\n]+)/);
      const startTime = timeMatch ? new Date(timeMatch[1]) : new Date();
      
      // 解析用户
      const userMatch = block.match(/# User@Host: ([^[]+)\[([^\]]+)\]/);
      const user = userMatch ? userMatch[1].trim() : '';
      const host = userMatch ? userMatch[2].trim() : '';
      
      // 解析查询时间
      const queryTimeMatch = block.match(/# Query_time: ([0-9.]+)/);
      const queryTime = queryTimeMatch ? parseFloat(queryTimeMatch[1]) : 0;
      
      // 解析锁时间
      const lockTimeMatch = block.match(/# Lock_time: ([0-9.]+)/);
      const lockTime = lockTimeMatch ? parseFloat(lockTimeMatch[1]) : 0;
      
      // 解析行统计
      const rowsMatch = block.match(/# Rows_sent: ([0-9]+) {2}Rows_examined: ([0-9]+)/);
      const rowsSent = rowsMatch ? parseInt(rowsMatch[1]) : 0;
      const rowsExamined = rowsMatch ? parseInt(rowsMatch[2]) : 0;
      
      // 解析数据库
      const schemaMatch = block.match(/use ([^;]+);/);
      const schema = schemaMatch ? schemaMatch[1].trim() : '';
      
      // 解析查询
      const queryMatch = block.match(/;([\s\S]+)$/);
      const query = queryMatch ? queryMatch[1].trim() : '';
      
      if (query) {
        slowQueries.push({
          id: i,
          startTime,
          queryTime,
          user,
          host,
          query,
          lockTime,
          rowsExamined,
          rowsSent,
          schema
        });
      }
    } catch (error) {
      console.error('解析慢查询日志块失败:', error);
    }
  }
  
  return slowQueries;
}

/**
 * 分析慢查询并生成优化建议
 * @param sequelize Sequelize 实例
 * @param slowQueries 慢查询列表
 * @returns 优化建议列表
 */
export async function analyzeSlowQueries(sequelize: Sequelize, slowQueries: SlowQuery[]): Promise<SlowQueryRecommendation[]> {
  const recommendations: SlowQueryRecommendation[] = [];
  
  for (const query of slowQueries) {
    try {
      // 获取查询执行计划
      const queryToExplain = query.query.trim();
      if (!queryToExplain.toLowerCase().startsWith('select')) {
        continue; // 只分析SELECT查询
      }
      
      const explainResults = await sequelize.query(`EXPLAIN ${queryToExplain}`, {
        type: QueryTypes.SELECT
      });
      
      // 分析执行计划
      const patterns = detectSlowQueryPatterns(query, explainResults);
      
      // 为每个模式生成建议
      for (const pattern of patterns) {
        const recommendation = generateRecommendation(query, pattern, explainResults);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    } catch (error) {
      console.error(`分析慢查询 ID=${query.id} 失败:`, error);
    }
  }
  
  // 按优先级排序
  return recommendations.sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * 检测慢查询模式
 * @param query 慢查询
 * @param explainResults 执行计划
 * @returns 检测到的模式列表
 */
function detectSlowQueryPatterns(query: SlowQuery, explainResults: any[]): SlowQueryPattern[] {
  const patterns: Set<SlowQueryPattern> = new Set();
  
  // 检查执行计划中的每一行
  for (const row of explainResults) {
    const type = row.type || row.Type;
    const extra = row.Extra || '';
    const key = row.key || row.Key;
    
    // 检查全表扫描
    if (type === 'ALL') {
      patterns.add(SlowQueryPattern.FULL_TABLE_SCAN);
    }
    
    // 检查缺少索引
    if (type === 'ALL' || type === 'index') {
      if (!key || key === 'NULL') {
        patterns.add(SlowQueryPattern.MISSING_INDEX);
      }
    }
    
    // 检查低效连接
    if (type === 'ALL' && query.query.toLowerCase().includes('join')) {
      patterns.add(SlowQueryPattern.INEFFICIENT_JOIN);
    }
    
    // 检查临时表
    if (extra.includes('Using temporary')) {
      patterns.add(SlowQueryPattern.TEMPORARY_TABLE);
    }
    
    // 检查文件排序
    if (extra.includes('Using filesort')) {
      patterns.add(SlowQueryPattern.FILESORT);
    }
  }
  
  // 检查大结果集
  if (query.rowsExamined > 1000 && query.rowsSent < query.rowsExamined / 10) {
    patterns.add(SlowQueryPattern.LARGE_RESULT_SET);
  }
  
  // 检查复杂子查询
  if (query.query.toLowerCase().includes('(select') || query.query.toLowerCase().includes('subquery')) {
    patterns.add(SlowQueryPattern.COMPLEX_SUBQUERY);
  }
  
  // 检查锁等待
  if (query.lockTime > 1) {
    patterns.add(SlowQueryPattern.LOCK_WAIT);
  }
  
  return Array.from(patterns);
}

/**
 * 为慢查询生成优化建议
 * @param query 慢查询
 * @param pattern 慢查询模式
 * @param explainResults 执行计划
 * @returns 优化建议
 */
function generateRecommendation(
  query: SlowQuery,
  pattern: SlowQueryPattern,
  explainResults: any[]
): SlowQueryRecommendation | null {
  let recommendation = '';
  let suggestedQuery = '';
  let suggestedIndex = '';
  let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  
  switch (pattern) {
    case SlowQueryPattern.FULL_TABLE_SCAN: {
      // 查找WHERE子句中可能需要索引的字段
      const tableMatch = query.query.match(/FROM\s+`?(\w+)`?/i);
      const whereMatch = query.query.match(/WHERE\s+([^;]+)/i);
      
      if (tableMatch && whereMatch) {
        const tableName = tableMatch[1];
        const whereClause = whereMatch[1];
        
        // 简单分析WHERE子句中的条件
        const conditions = whereClause.split(/\bAND\b/i);
        const possibleIndexFields = conditions
          .map(cond => {
            const match = cond.match(/`?(\w+)`?\s*[=<>]/);
            return match ? match[1] : null;
          })
          .filter(field => field);
        
        if (possibleIndexFields.length > 0) {
          const fields = possibleIndexFields.join('`, `');
          suggestedIndex = `ALTER TABLE \`${tableName}\` ADD INDEX idx_${tableName}_${possibleIndexFields.join('_')} (\`${fields}\`);`;
          recommendation = `创建索引以避免全表扫描，推荐在表 ${tableName} 上为字段 ${fields} 创建索引`;
          priority = 'HIGH';
        } else {
          recommendation = `查询需要全表扫描，考虑添加适当的索引或重写查询`;
        }
      } else {
        recommendation = `查询需要全表扫描，考虑添加适当的索引或重写查询`;
      }
      break;
    }
      
    case SlowQueryPattern.MISSING_INDEX:
      recommendation = `查询缺少适当的索引，建议分析WHERE子句和JOIN条件中的字段，为常用字段创建索引`;
      priority = 'HIGH';
      break;
      
    case SlowQueryPattern.INEFFICIENT_JOIN:
      recommendation = `查询包含低效连接，确保JOIN条件中的字段有合适的索引，考虑重写JOIN顺序或使用子查询`;
      priority = 'HIGH';
      break;
      
    case SlowQueryPattern.LARGE_RESULT_SET:
      suggestedQuery = query.query.replace(/SELECT\s+\*/i, 'SELECT [仅选择必要的字段]')
        .replace(/LIMIT\s+\d+/i, '') + ' LIMIT 100';
      recommendation = `查询返回大量数据(${query.rowsExamined}行中的${query.rowsSent}行)，考虑只选择必要的字段并添加LIMIT子句`;
      priority = 'MEDIUM';
      break;
      
    case SlowQueryPattern.COMPLEX_SUBQUERY:
      recommendation = `查询包含复杂子查询，考虑使用JOIN替代子查询或将子查询结果存入临时表`;
      priority = 'MEDIUM';
      break;
      
    case SlowQueryPattern.TEMPORARY_TABLE:
      recommendation = `查询需要创建临时表，检查GROUP BY和ORDER BY子句，确保它们使用了索引的列`;
      priority = 'MEDIUM';
      break;
      
    case SlowQueryPattern.FILESORT: {
      const orderByMatch = query.query.match(/ORDER BY\s+([^;)]+)/i);
      if (orderByMatch) {
        const orderByFields = orderByMatch[1].split(',').map(f => f.trim().split(' ')[0]);
        recommendation = `查询需要文件排序，考虑为ORDER BY子句中的字段 (${orderByFields.join(', ')}) 创建索引`;
      } else {
        recommendation = `查询需要文件排序，考虑为ORDER BY子句中的字段创建索引`;
      }
      priority = 'MEDIUM';
      break;
    }
      
    case SlowQueryPattern.LOCK_WAIT:
      recommendation = `查询有较长的锁等待时间 (${query.lockTime}秒)，考虑优化事务逻辑或使用较低的隔离级别`;
      priority = 'HIGH';
      break;
      
    default:
      return null;
  }
  
  return {
    queryId: query.id,
    originalQuery: query.query,
    pattern,
    recommendation,
    suggestedQuery: suggestedQuery || undefined,
    suggestedIndex: suggestedIndex || undefined,
    priority
  };
}

/**
 * 获取慢查询统计信息
 * @param sequelize Sequelize 实例
 * @returns 慢查询统计
 */
export async function getSlowQueryStats(sequelize: Sequelize): Promise<{
  slowQueryCount: number;
  avgQueryTime: number;
  maxQueryTime: number;
  commonTables: { table: string; count: number }[];
  commonPatterns: { pattern: SlowQueryPattern; count: number }[];
}> {
  try {
    // 获取慢查询记录
    const slowQueries = await getSlowQueries(sequelize, 50); // 分析最近50条慢查询
    
    if (slowQueries.length === 0) {
      return {
        slowQueryCount: 0,
        avgQueryTime: 0,
        maxQueryTime: 0,
        commonTables: [],
        commonPatterns: []
      };
    }
    
    // 计算平均和最大查询时间
    const totalQueryTime = slowQueries.reduce((sum, q) => sum + q.queryTime, 0);
    const avgQueryTime = totalQueryTime / slowQueries.length;
    const maxQueryTime = Math.max(...slowQueries.map(q => q.queryTime));
    
    // 统计常见表
    const tableCounts = new Map<string, number>();
    const explainPromises = slowQueries.map(q => 
      sequelize.query(`EXPLAIN ${q.query}`, { type: QueryTypes.SELECT })
        .catch(() => []) // 忽略EXPLAIN错误
    );
    const explainResultsList = await Promise.all(explainPromises);

    explainResultsList.forEach(explainResults => {
      explainResults.forEach((row: any) => {
        if (row.table) {
          tableCounts.set(row.table, (tableCounts.get(row.table) || 0) + 1);
        }
      });
    });
    
    const commonTables = Array.from(tableCounts.entries())
      .map(([table, count]) => ({ table, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
      
    // 分析模式
    const patternCounts = new Map<SlowQueryPattern, number>();
    for (const query of slowQueries) {
      try {
        const explainResults = await sequelize.query(`EXPLAIN ${query.query}`, {
          type: QueryTypes.SELECT
        });
        const patterns = detectSlowQueryPatterns(query, explainResults);
        
        for (const pattern of patterns) {
          patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
        }
      } catch (error) {
        // 忽略无法解释的查询
      }
    }
    
    // 生成结果
    return {
      slowQueryCount: slowQueries.length,
      avgQueryTime,
      maxQueryTime,
      commonTables,
      commonPatterns: Array.from(patternCounts.entries())
        .map(([pattern, count]) => ({ pattern, count }))
        .sort((a, b) => b.count - a.count)
    };
  } catch (error) {
    console.error('获取慢查询统计信息失败:', error);
    return {
      slowQueryCount: 0,
      avgQueryTime: 0,
      maxQueryTime: 0,
      commonTables: [],
      commonPatterns: []
    };
  }
}

/**
 * 启用MySQL慢查询日志
 * @param sequelize Sequelize 实例
 * @param slowQueryTime 慢查询阈值（秒）
 * @returns 是否成功
 */
export async function enableSlowQueryLog(sequelize: Sequelize, slowQueryTime = 1): Promise<boolean> {
  try {
    await sequelize.query(`SET GLOBAL slow_query_log = 'ON';`);
    await sequelize.query(`SET GLOBAL long_query_time = ${slowQueryTime};`);
    
    // 检查是否在my.cnf中永久设置
    const [variables] = await sequelize.query(
      `SHOW VARIABLES LIKE 'log_output'`, { type: QueryTypes.SELECT }
    ) as any[];
    
    if (variables.Value === 'TABLE') {
      console.log('慢查询日志已启用，记录到mysql.slow_log表');
    } else {
      console.log('慢查询日志已启用，记录到文件');
    }
    
    return true;
  } catch (error) {
    console.error('启用慢查询日志失败:', error);
    return false;
  }
}

/**
 * 保存慢查询日志到文件
 * @param sequelize Sequelize 实例
 * @param filename 文件名
 * @returns 是否成功
 */
export async function saveSlowQueriesReport(sequelize: Sequelize, filename = 'slow-queries-report.json'): Promise<boolean> {
  try {
    const slowQueries = await getSlowQueries(sequelize, 100);
    const recommendations = await analyzeSlowQueries(sequelize, slowQueries);
    const stats = await getSlowQueryStats(sequelize);
    
    const report = {
      generatedAt: new Date().toISOString(),
      slowQueryCount: slowQueries.length,
      stats,
      queries: slowQueries.slice(0, 50), // 限制数量以减小文件大小
      recommendations
    };
    
    const reportDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const filePath = path.join(reportDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    
    console.log(`慢查询报告已保存到 ${filePath}`);
    return true;
  } catch (error) {
    console.error('保存慢查询报告失败:', error);
    return false;
  }
}

export default {
  getSlowQueries,
  analyzeSlowQueries,
  getSlowQueryStats,
  enableSlowQueryLog,
  saveSlowQueriesReport
}; 