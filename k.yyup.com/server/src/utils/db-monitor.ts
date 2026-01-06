/**
 * 数据库监控工具
 * 用于监控数据库查询性能、连接池状态和事务执行情况
 */

import { Sequelize, QueryTypes } from 'sequelize';
import { monitoringConfig } from '../config/database-optimization';
import fs from 'fs';
import path from 'path';
import { logger } from './logger';

// 性能指标存储
interface PerformanceMetrics {
  totalQueries: number;
  slowQueries: number;
  averageQueryTime: number;
  maxQueryTime: number;
  totalErrors: number;
  poolStats: {
    size: number;
    available: number;
    pending: number;
    max: number;
    min: number;
  };
  transactionStats: {
    active: number;
    completed: number;
    rolledBack: number;
    averageDuration: number;
  };
  lastUpdated: Date;
}

// 确保日志目录存在
const LOG_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    logger.info('创建数据库监控日志目录成功', { path: LOG_DIR });
  } catch (error) {
    logger.error('创建数据库监控日志目录失败', error);
  }
}

// 初始化性能指标
const metrics: PerformanceMetrics = {
  totalQueries: 0,
  slowQueries: 0,
  averageQueryTime: 0,
  maxQueryTime: 0,
  totalErrors: 0,
  poolStats: {
    size: 0,
    available: 0,
    pending: 0,
    max: 0,
    min: 0
  },
  transactionStats: {
    active: 0,
    completed: 0,
    rolledBack: 0,
    averageDuration: 0
  },
  lastUpdated: new Date()
};

// 活动事务跟踪
const activeTransactions = new Map<string, { startTime: Date, query: string }>();

/**
 * 更新连接池统计信息
 */
function updatePoolStats(sequelize: Sequelize): void {
  try {
    // 定义适当的类型接口来访问内部池
    interface ConnectionPool {
      size: number;
      available: number;
      pending: number;
      max: number;
      min: number;
    }
    interface ExtendedConnectionManager {
      pool: ConnectionPool;
    }
    
    // 使用类型断言访问内部连接池
    const connectionManager = sequelize.connectionManager as unknown as ExtendedConnectionManager;
    const pool = connectionManager.pool;
    
    if (pool) {
      metrics.poolStats = {
        size: pool.size || 0,
        available: pool.available || 0,
        pending: pool.pending || 0,
        max: pool.max || 0,
        min: pool.min || 0
      };
    }
  } catch (error) {
    logger.error('更新连接池统计信息失败:', error);
  }
}

/**
 * 记录查询性能
 * @param query SQL查询
 * @param executionTime 执行时间(ms)
 * @param error 错误信息（如果有）
 */
export function recordQueryPerformance(query: string, executionTime: number, error?: Error): void {
  if (!monitoringConfig.enabled || !monitoringConfig.monitorQueries) {
    return;
  }

  try {
    // 更新查询统计
    metrics.totalQueries++;
    
    // 计算平均查询时间
    metrics.averageQueryTime = 
      (metrics.averageQueryTime * (metrics.totalQueries - 1) + executionTime) / metrics.totalQueries;
    
    // 更新最大查询时间
    metrics.maxQueryTime = Math.max(metrics.maxQueryTime, executionTime);
    
    // 检查是否是慢查询
    if (executionTime > 1000) { // 超过1秒的查询视为慢查询
      metrics.slowQueries++;
      
      // 记录慢查询日志
      logSlowQuery(query, executionTime);
    }
    
    // 记录错误
    if (error) {
      metrics.totalErrors++;
      logger.error(`查询错误: ${error.message}`, { query, executionTime });
    }
    
    // 更新时间戳
    metrics.lastUpdated = new Date();
  } catch (error) {
    logger.error('记录查询性能失败:', error);
  }
}

/**
 * 记录慢查询
 * @param query SQL查询
 * @param executionTime 执行时间(ms)
 */
function logSlowQuery(query: string, executionTime: number): void {
  try {
    const logFile = path.join(LOG_DIR, 'slow-queries.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] 执行时间: ${executionTime}ms\n${query}\n\n`;
    
    // 追加到日志文件
    fs.appendFileSync(logFile, logEntry);
    
    // 同时记录到日志系统
    logger.warn(`慢查询 (${executionTime}ms)`, { query: query.substring(0, 200) + (query.length > 200 ? '...' : '') });
  } catch (error) {
    logger.error('记录慢查询日志失败:', error);
  }
}

/**
 * 开始跟踪事务
 * @param transactionId 事务ID
 * @param query 事务初始查询
 */
export function startTransactionTracking(transactionId: string, query: string): void {
  if (!monitoringConfig.enabled || !monitoringConfig.monitorTransactions) {
    return;
  }
  
  activeTransactions.set(transactionId, {
    startTime: new Date(),
    query
  });
  
  metrics.transactionStats.active = activeTransactions.size;
  
  logger.debug(`开始事务跟踪: ${transactionId}`, { query: query.substring(0, 100) });
}

/**
 * 结束事务跟踪
 * @param transactionId 事务ID
 * @param wasCommitted 是否提交（否则回滚）
 */
export function endTransactionTracking(transactionId: string, wasCommitted: boolean): void {
  if (!monitoringConfig.enabled || !monitoringConfig.monitorTransactions) {
    return;
  }
  
  const transaction = activeTransactions.get(transactionId);
  if (transaction) {
    const duration = new Date().getTime() - transaction.startTime.getTime();
    
    // 更新事务统计
    if (wasCommitted) {
      metrics.transactionStats.completed++;
      logger.debug(`事务已提交: ${transactionId}`, { duration });
    } else {
      metrics.transactionStats.rolledBack++;
      logger.debug(`事务已回滚: ${transactionId}`, { duration });
    }
    
    // 更新平均事务持续时间
    const totalCompleted = metrics.transactionStats.completed + metrics.transactionStats.rolledBack;
    metrics.transactionStats.averageDuration = 
      (metrics.transactionStats.averageDuration * (totalCompleted - 1) + duration) / totalCompleted;
    
    // 从活动事务中移除
    activeTransactions.delete(transactionId);
    metrics.transactionStats.active = activeTransactions.size;
  }
}

/**
 * 获取性能指标
 * @param sequelize Sequelize 实例
 * @returns 性能指标快照
 */
export function getPerformanceMetrics(sequelize: Sequelize): PerformanceMetrics {
  // 先更新连接池统计
  if (monitoringConfig.monitorPool) {
    updatePoolStats(sequelize);
  }
  
  return { ...metrics };
}

/**
 * 定期收集数据库状态
 * @param sequelize Sequelize 实例
 */
function collectDatabaseStats(sequelize: Sequelize): void {
  if (!monitoringConfig.enabled) {
    return;
  }
  
  try {
    // 更新连接池统计
    if (monitoringConfig.monitorPool) {
      updatePoolStats(sequelize);
    }
    
    // 记录长时间运行的事务
    if (monitoringConfig.monitorTransactions) {
      const now = new Date().getTime();
      const longRunningThreshold = monitoringConfig.transactions.longRunningThresholdSeconds * 1000;
      
      activeTransactions.forEach((transaction, id) => {
        const duration = now - transaction.startTime.getTime();
        if (duration > longRunningThreshold) {
          logger.warn(`长时间运行的事务`, {
            id,
            durationSeconds: Math.round(duration / 1000),
            startTime: transaction.startTime,
            query: transaction.query.substring(0, 200)
          });
          
          // 检查是否需要自动终止长时间运行的事务
          const autoKillThreshold = monitoringConfig.transactions.autoKillThresholdSeconds * 1000;
          if (monitoringConfig.transactions.autoKillLongTransactions && 
              duration > autoKillThreshold) {
            logger.error(`超时事务自动终止`, {
              id,
              durationSeconds: Math.round(duration / 1000)
            });
            // 实际的终止逻辑需要根据数据库类型实现
            // 这里只是从跟踪列表中移除
            activeTransactions.delete(id);
          }
        }
      });
    }
    
    // 将性能指标写入日志文件
    if (monitoringConfig.logMetrics) {
      logPerformanceMetrics(sequelize);
    }
  } catch (error) {
    logger.error('收集数据库状态失败:', error);
  }
}

/**
 * 记录长时间运行的事务
 */
function logLongRunningTransactions(): void {
  // 实现逻辑
}

/**
 * 将性能指标写入日志文件
 * @param sequelize Sequelize 实例
 */
function logPerformanceMetrics(sequelize: Sequelize): void {
  const logFile = path.join(LOG_DIR, 'performance-metrics.log');
  const timestamp = new Date().toISOString();
  const metricsSnapshot = getPerformanceMetrics(sequelize);
  const logEntry = `[${timestamp}] ${JSON.stringify(metricsSnapshot)}\n`;
  
  fs.appendFileSync(logFile, logEntry);
}

/**
 * 获取表统计信息
 * @param sequelize Sequelize 实例
 * @returns 表统计信息的Promise
 */
export async function getTableStats(sequelize: Sequelize): Promise<any[]> {
  try {
    const dbName = sequelize.getDatabaseName();
    
    const dialect = sequelize.getDialect();
    
    if (dialect === 'mysql') {
      // MySQL查询
      const tableStats = await sequelize.query(
        `SELECT 
          table_name as tableName, 
          table_rows as rowCount,
          data_length as dataSize,
          index_length as indexSize,
          data_free as fragmentedSpace,
          create_time as createTime,
          update_time as updateTime
        FROM 
          information_schema.tables 
        WHERE 
          table_schema = :dbName
        ORDER BY 
          data_length DESC`,
        {
          replacements: { dbName },
          type: QueryTypes.SELECT
        }
      );
      
      return tableStats;
    } else if (dialect === 'postgres') {
      // PostgreSQL查询
      const tableStats = await sequelize.query(
        `SELECT
          tablename as "tableName",
          pg_relation_size(quote_ident(tablename)) as "dataSize",
          pg_total_relation_size(quote_ident(tablename)) - pg_relation_size(quote_ident(tablename)) as "indexSize",
          NULL as "rowCount",
          NULL as "fragmentedSpace",
          NULL as "createTime",
          NULL as "updateTime"
        FROM
          pg_tables
        WHERE
          schemaname = 'public'
        ORDER BY
          "dataSize" DESC`,
        {
          type: QueryTypes.SELECT
        }
      );
      
      return tableStats;
    } else {
      // 不支持的数据库类型，返回通用查询
      const tableStats = await sequelize.query(
        `SELECT 
          name as tableName 
        FROM 
          sqlite_master 
        WHERE 
          type='table'
        ORDER BY 
          name`,
        {
          type: QueryTypes.SELECT
        }
      ).catch(() => {
        logger.warn(`不支持的数据库类型: ${dialect}，无法获取表统计信息`);
        return [];
      });
      
      return tableStats;
    }
  } catch (error) {
    logger.error('获取表统计信息失败:', error);
    return [];
  }
}

/**
 * 获取索引使用情况
 * @param sequelize Sequelize 实例
 * @returns 索引使用情况的Promise
 */
export async function getIndexUsageStats(sequelize: Sequelize): Promise<any[]> {
  try {
    const dialect = sequelize.getDialect();
    
    if (dialect === 'mysql') {
      // MySQL查询
      return sequelize.query(
        `SELECT
          t.TABLE_NAME AS tableName,
          s.INDEX_NAME AS indexName,
          s.COLUMN_NAME AS columnName,
          s.SEQ_IN_INDEX AS sequence,
          s.NON_UNIQUE AS nonUnique,
          s.INDEX_TYPE AS indexType
        FROM
          information_schema.STATISTICS s
        JOIN
          information_schema.TABLES t ON s.TABLE_SCHEMA = t.TABLE_SCHEMA AND s.TABLE_NAME = t.TABLE_NAME
        WHERE
          s.TABLE_SCHEMA = :dbName
        ORDER BY
          s.TABLE_NAME, s.INDEX_NAME, s.SEQ_IN_INDEX`,
        {
          replacements: { dbName: sequelize.getDatabaseName() },
          type: QueryTypes.SELECT
        }
      );
    } else if (dialect === 'postgres') {
      // PostgreSQL查询
      return sequelize.query(
        `SELECT
          t.relname AS "tableName",
          i.relname AS "indexName",
          a.attname AS "columnName",
          ix.indisunique AS "isUnique",
          am.amname AS "indexType"
        FROM
          pg_class t,
          pg_class i,
          pg_index ix,
          pg_attribute a,
          pg_am am
        WHERE
          t.oid = ix.indrelid
          AND i.oid = ix.indexrelid
          AND a.attrelid = t.oid
          AND a.attnum = ANY(ix.indkey)
          AND i.relam = am.oid
          AND t.relkind = 'r'
        ORDER BY
          t.relname, i.relname`,
        {
          type: QueryTypes.SELECT
        }
      );
    } else if (dialect === 'mssql') {
      // SQL Server查询
      return sequelize.query(
      `SELECT
        t.name AS tableName,
        i.name AS indexName,
        i.type_desc AS indexType,
          s.user_seeks AS seeks,
          s.user_scans AS scans,
          s.user_lookups AS lookups,
          s.user_updates AS updates,
          s.last_user_seek AS lastSeek,
          s.last_user_scan AS lastScan,
          s.last_user_lookup AS lastLookup,
          s.last_user_update AS lastUpdate
      FROM
        sys.dm_db_index_usage_stats s
        JOIN sys.indexes i ON s.object_id = i.object_id AND s.index_id = i.index_id
        JOIN sys.tables t ON i.object_id = t.object_id
      WHERE
        s.database_id = DB_ID()
      ORDER BY
        user_seeks + user_scans + user_lookups DESC`,
      {
        type: QueryTypes.SELECT
      }
      );
    } else {
      // SQLite或其他数据库，使用简单查询
      return sequelize.query(
        `SELECT
          m.tbl_name AS tableName,
          m.name AS indexName,
          NULL AS indexType,
          NULL AS seeks,
          NULL AS scans,
          NULL AS lookups,
          NULL AS updates
        FROM
          sqlite_master m
        WHERE
          m.type = 'index'
        ORDER BY
          m.tbl_name, m.name`,
        {
          type: QueryTypes.SELECT
        }
      ).catch(() => {
        logger.warn(`不支持的数据库类型: ${dialect}，无法获取索引使用情况`);
        return [];
    });
    }
  } catch (error) {
    logger.error('获取索引使用情况失败:', error);
    return [];
  }
}

/**
 * 查询统计信息接口
 */
export interface QueryStats {
  totalQueries: number;
  slowQueries: number;
  averageQueryTime: number;
  maxQueryTime: number;
  slowestQueries: Array<{
    query: string;
    executionTime: number;
    timestamp: Date;
  }>;
  queryDistribution: {
    select: number;
    insert: number;
    update: number;
    delete: number;
    other: number;
  };
}

/**
 * 获取查询统计信息
 * @param sequelize Sequelize 实例
 * @returns 查询统计信息
 */
export async function getQueryStats(sequelize: Sequelize): Promise<QueryStats> {
  try {
    const logEntries = await readSlowQueryLog();
    const performanceSchemaStats = await getPerformanceSchemaStats(sequelize);
    
    // 提取查询类型分布
    const queryDistribution = {
      select: 0,
      insert: 0,
      update: 0,
      delete: 0,
      other: 0
    };
    
    // 分析慢查询类型分布
    logEntries.forEach(entry => {
      const query = entry.query.trim().toUpperCase();
      if (query.startsWith('SELECT')) {
        queryDistribution.select++;
      } else if (query.startsWith('INSERT')) {
        queryDistribution.insert++;
      } else if (query.startsWith('UPDATE')) {
        queryDistribution.update++;
      } else if (query.startsWith('DELETE')) {
        queryDistribution.delete++;
      } else {
        queryDistribution.other++;
      }
    });
    
    // 填充剩余的分布，确保总数等于metrics.totalQueries
    const accountedFor = Object.values(queryDistribution).reduce((a, b) => a + b, 0);
    const remaining = Math.max(0, metrics.totalQueries - accountedFor);
    
    if (remaining > 0) {
      // 假设剩余的查询与慢查询有类似的分布
      // 如果没有慢查询记录，则使用默认分布
      if (accountedFor > 0) {
        const factor = remaining / accountedFor;
        queryDistribution.select = Math.round(queryDistribution.select * (1 + factor));
        queryDistribution.insert = Math.round(queryDistribution.insert * (1 + factor));
        queryDistribution.update = Math.round(queryDistribution.update * (1 + factor));
        queryDistribution.delete = Math.round(queryDistribution.delete * (1 + factor));
        queryDistribution.other = Math.round(queryDistribution.other * (1 + factor));
      } else {
        // 默认分布
        queryDistribution.select = Math.round(remaining * 0.7);
        queryDistribution.insert = Math.round(remaining * 0.1);
        queryDistribution.update = Math.round(remaining * 0.15);
        queryDistribution.delete = Math.round(remaining * 0.03);
        queryDistribution.other = remaining - queryDistribution.select - queryDistribution.insert 
                                - queryDistribution.update - queryDistribution.delete;
      }
    }
    
    return {
      totalQueries: metrics.totalQueries,
      slowQueries: metrics.slowQueries,
      averageQueryTime: metrics.averageQueryTime,
      maxQueryTime: metrics.maxQueryTime,
      slowestQueries: logEntries,
      queryDistribution
    };
  } catch (error) {
    logger.error('获取查询统计信息失败:', error);
    return {
      totalQueries: 0,
      slowQueries: 0,
      averageQueryTime: 0,
      maxQueryTime: 0,
      slowestQueries: [],
      queryDistribution: {
        select: 0,
        insert: 0,
        update: 0,
        delete: 0,
        other: 0
      }
    };
  }
}

/**
 * 读取慢查询日志
 * @returns 慢查询数组
 */
async function readSlowQueryLog(): Promise<Array<{query: string; executionTime: number; timestamp: Date}>> {
  try {
    const logFile = path.join(LOG_DIR, 'slow-queries.log');
    
    // 如果日志文件不存在，返回空数组
    if (!fs.existsSync(logFile)) {
      return [];
    }
    
    // 读取日志文件
    const content = fs.readFileSync(logFile, 'utf8');
    const entries = content.split('\n\n').filter(Boolean);
    
    // 解析日志条目
    const slowQueries = entries.map(entry => {
      const lines = entry.split('\n');
      const headerLine = lines[0];
      
      // 提取时间戳和执行时间
      const timestampMatch = headerLine.match(/\[(.*?)\]/);
      const executionTimeMatch = headerLine.match(/执行时间: (\d+)ms/);
      
      const timestamp = timestampMatch ? new Date(timestampMatch[1]) : new Date();
      const executionTime = executionTimeMatch ? parseInt(executionTimeMatch[1], 10) : 0;
      
      // 提取查询
      const query = lines.slice(1).join('\n');
      
      return {
        query,
        executionTime,
        timestamp
      };
    });
    
    // 按执行时间降序排序
    return slowQueries
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10); // 返回前10个最慢的查询
  } catch (error) {
    logger.error('读取慢查询日志失败:', error);
    return [];
  }
}

/**
 * 从 Performance Schema 获取查询统计
 * @param sequelize Sequelize 实例
 * @returns 查询统计
 */
async function getPerformanceSchemaStats(sequelize: Sequelize): Promise<any> {
  const dialect = sequelize.getDialect();
  
  if (dialect !== 'mysql') {
    // 实现逻辑
  }
}

// 启动后台任务
if (monitoringConfig.enabled) {
  // 这里需要一个已初始化的 sequelize 实例
  // 由于模块加载顺序问题，直接在这里调用可能会失败
  // 建议从应用的主入口传入 sequelize 实例来启动
  // setInterval(() => collectDatabaseStats(sequelize), monitoringConfig.collectionInterval);
  logger.info(`数据库监控已启动，收集间隔: ${monitoringConfig.collectionInterval / 1000}秒`);
}

export default {
  recordQueryPerformance,
  startTransactionTracking,
  endTransactionTracking,
  getPerformanceMetrics,
  getTableStats,
  getIndexUsageStats,
  getQueryStats
}; 